
import { supabase } from "../config/supabase.js";

function getDateRange(period) {
  const now = new Date();
  const start = new Date(now);

  if (period === "month") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  } else if (period === "year") {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
  } else {
    const day = start.getDay();
    const daysSinceMonday = (day + 6) % 7;

    start.setDate(start.getDate() - daysSinceMonday);
    start.setHours(0, 0, 0, 0);
  }

  return {
    start: start.toISOString(),
    end: now.toISOString(),
  };
}

function formatDateLabel(date, period) {
  if (period === "year") {
    return date.toLocaleDateString("en-NG", {
      month: "short",
    });
  }

  if (period === "month") {
    return date.toLocaleDateString("en-NG", {
      day: "numeric",
    });
  }

  return date.toLocaleDateString("en-NG", {
    weekday: "short",
  });
}

function buildSalesChart(orders, period) {
  const now = new Date();
  const buckets = [];

  if (period === "year") {
    for (let i = 0; i < 12; i++) {
      buckets.push({
        label: new Date(now.getFullYear(), i, 1).toLocaleDateString(
          "en-NG",
          { month: "short" }
        ),
        revenue: 0,
        orders: 0,
      });
    }
  } else if (period === "month") {
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      buckets.push({
        label: String(i),
        revenue: 0,
        orders: 0,
      });
    }
  } else {
    const monday = new Date(now);
    const daysSinceMonday = (monday.getDay() + 6) % 7;

    monday.setDate(monday.getDate() - daysSinceMonday);
    monday.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);

      buckets.push({
        label: formatDateLabel(date, "week"),
        revenue: 0,
        orders: 0,
      });
    }
  }

  orders.forEach((order) => {
    const date = new Date(order.created_at);
    let index;

    if (period === "year") {
      index = date.getMonth();
    } else if (period === "month") {
      index = date.getDate() - 1;
    } else {
      const monday = new Date(now);
      const daysSinceMonday = (monday.getDay() + 6) % 7;

      monday.setDate(monday.getDate() - daysSinceMonday);
      monday.setHours(0, 0, 0, 0);

      const orderDate = new Date(date);
      orderDate.setHours(0, 0, 0, 0);

      index = Math.round(
        (orderDate.getTime() - monday.getTime()) /
          (1000 * 60 * 60 * 24)
      );
    }

    if (index >= 0 && index < buckets.length) {
      if (order.payment_status === "paid") {
        buckets[index].revenue += Number(order.total || 0);
      }

      buckets[index].orders += 1;
    }
  });

  return buckets;
}

// GET ADMIN OVERVIEW
export async function getAdminOverview(req, res) {
  try {
    const period = ["week", "month", "year"].includes(req.query.period)
      ? req.query.period
      : "week";

    const { start, end } = getDateRange(period);

    const [
      ordersResult,
      customersResult,
      allOrdersResult,
      orderItemsResult,
    ] = await Promise.all([
      supabase
        .from("orders")
        .select(`
          id,
          order_number,
          customer_id,
          customer_name,
          customer_phone,
          order_type,
          delivery_address,
          subtotal,
          delivery_fee,
          total,
          status,
          payment_status,
          created_at,
          order_items (
            id,
            item_name,
            unit_price,
            quantity,
            line_total
          )
        `)
        .gte("created_at", start)
        .lte("created_at", end)
        .order("created_at", { ascending: false }),

      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "customer"),

      supabase
        .from("orders")
        .select("id, total, status, payment_status"),

      supabase
        .from("order_items")
        .select("item_name, quantity, line_total"),
    ]);

    const errors = [
      ordersResult.error,
      customersResult.error,
      allOrdersResult.error,
      orderItemsResult.error,
    ].filter(Boolean);

    if (errors.length > 0) {
      console.error("Admin overview query error:", errors);

      return res.status(500).json({
        success: false,
        message: "Unable to load dashboard information.",
      });
    }

    const orders = ordersResult.data || [];
    const allOrders = allOrdersResult.data || [];
    const orderItems = orderItemsResult.data || [];

    const paidOrders = allOrders.filter(
      (order) => order.payment_status === "paid"
    );

    const totalRevenue = paidOrders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );

    const pendingOrders = allOrders.filter(
      (order) => order.status === "pending"
    ).length;

    const popularMealsMap = new Map();

    orderItems.forEach((item) => {
      const name = item.item_name || "Unknown meal";

      if (!popularMealsMap.has(name)) {
        popularMealsMap.set(name, {
          name,
          quantity: 0,
          revenue: 0,
        });
      }

      const meal = popularMealsMap.get(name);

      meal.quantity += Number(item.quantity || 0);
      meal.revenue += Number(item.line_total || 0);
    });

    const popularMeals = Array.from(popularMealsMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const salesChart = buildSalesChart(orders, period);

    return res.status(200).json({
      success: true,
      period,
      stats: {
        totalRevenue,
        totalOrders: allOrders.length,
        totalCustomers: customersResult.count || 0,
        pendingOrders,
      },
      salesChart,
      popularMeals,
      recentOrders: orders.slice(0, 5),
    });
  } catch (error) {
    console.error("Admin overview error:", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while loading the dashboard.",
    });
  }
}

// GET ALL ADMIN ORDERS
export async function getAdminOrders(req, res) {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        customer_id,
        customer_name,
        customer_phone,
        order_type,
        delivery_address,
        order_notes,
        subtotal,
        delivery_fee,
        total,
        status,
        payment_status,
        created_at,
        updated_at,
        order_items (
          id,
          menu_item_id,
          item_name,
          unit_price,
          quantity,
          line_total
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Admin orders query error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to retrieve orders.",
      });
    }

    return res.status(200).json({
      success: true,
      count: data.length,
      orders: data,
    });
  } catch (error) {
    console.error("Get admin orders error:", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while retrieving orders.",
    });
  }
}

// CREATE AN ORDER STATUS NOTIFICATION
async function createOrderStatusNotification(order, newStatus) {
  if (!order.customer_id) {
    return;
  }

  const notificationMessages = {
    pending: {
      title: "Order received",
      message: `Your ChopHub order #${order.order_number} has been received.`,
    },

    confirmed: {
      title: "Order confirmed",
      message: `Your ChopHub order #${order.order_number} has been confirmed.`,
    },

    preparing: {
      title: "Your order is being prepared",
      message: `Your ChopHub order #${order.order_number} is now being prepared.`,
    },

    ready_for_pickup: {
      title: "Your order is ready for pickup",
      message: `Your ChopHub order #${order.order_number} is ready for collection.`,
    },

    out_for_delivery: {
      title: "Your order is on its way",
      message: `Your ChopHub order #${order.order_number} is out for delivery.`,
    },

    completed: {
      title: "Order completed",
      message: `Your ChopHub order #${order.order_number} has been completed. Thank you for ordering with us!`,
    },

    cancelled: {
      title: "Order cancelled",
      message: `Your ChopHub order #${order.order_number} has been cancelled.`,
    },
  };

  const notification = notificationMessages[newStatus];

  if (!notification) {
    return;
  }

  // Check whether this customer has enabled order notifications.
  const {
    data: preferences,
    error: preferencesError,
  } = await supabase
    .from("customer_notification_preferences")
    .select("order_updates")
    .eq("customer_id", order.customer_id)
    .maybeSingle();

  if (preferencesError) {
    console.error(
      "Order notification preference lookup error:",
      preferencesError
    );

    return;
  }

  // Customers without a saved preference receive notifications by default.
  if (preferences && preferences.order_updates === false) {
    return;
  }

  const { error: notificationError } = await supabase
    .from("notifications")
    .insert({
      user_id: order.customer_id,
      order_id: order.id,
      title: notification.title,
      message: notification.message,
      type: "order",
      is_read: false,
    });

  if (notificationError) {
    console.error(
      "Order status notification creation error:",
      notificationError
    );
  }
}

// UPDATE ORDER STATUS
export async function updateAdminOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status || typeof status !== "string") {
      return res.status(400).json({
        success: false,
        message: "A valid order ID and status are required.",
      });
    }

    const normalizedStatus = status
      .trim()
      .toLowerCase()
      .replaceAll(" ", "_")
      .replaceAll("-", "_");

    const allowedStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "ready_for_pickup",
      "out_for_delivery",
      "completed",
      "cancelled",
    ];

    if (!allowedStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status.",
      });
    }

    // Retrieve the order before changing its status.
    const {
      data: existingOrder,
      error: lookupError,
    } = await supabase
      .from("orders")
      .select("id, order_number, customer_id, order_type, status")
      .eq("id", id)
      .maybeSingle();

    if (lookupError) {
      console.error("Admin order lookup error:", lookupError);

      return res.status(500).json({
        success: false,
        message: "Unable to verify the order details.",
      });
    }

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const orderType = String(existingOrder.order_type || "")
      .trim()
      .toLowerCase();

    const deliveryStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "out_for_delivery",
      "completed",
      "cancelled",
    ];

    const pickupStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "ready_for_pickup",
      "completed",
      "cancelled",
    ];

    let permittedStatuses;

    if (orderType === "delivery") {
      permittedStatuses = deliveryStatuses;
    } else if (orderType === "pickup") {
      permittedStatuses = pickupStatuses;
    } else {
      return res.status(400).json({
        success: false,
        message: "This order has an invalid fulfilment type.",
      });
    }

    if (!permittedStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message:
          orderType === "delivery"
            ? "Invalid status for a delivery order. Ready for pickup is not permitted."
            : "Invalid status for a pickup order. Out for delivery is not permitted.",
      });
    }

    // Only update the order after all validations have passed.
    const { data, error } = await supabase
      .from("orders")
      .update({
        status: normalizedStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(`
        id,
        order_number,
        customer_name,
        customer_phone,
        order_type,
        total,
        status,
        payment_status,
        updated_at
      `)
      .maybeSingle();

    if (error) {
      console.error("Admin order status update error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to update order status.",
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // Create a notification only when the status actually changes.
    if (existingOrder.status !== normalizedStatus) {
      try {
        await createOrderStatusNotification(
          existingOrder,
          normalizedStatus
        );
      } catch (notificationError) {
        // A notification failure must not undo a successful order update.
        console.error(
          "Unexpected order notification error:",
          notificationError
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      order: data,
    });
  } catch (error) {
    console.error("Update admin order status error:", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while updating the order.",
    });
  }
}

// GET ALL ADMIN CUSTOMERS
export async function getAdminCustomers(req, res) {
  try {
    const [profilesResult, ordersResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, phone, role, created_at")
        .eq("role", "customer")
        .order("created_at", { ascending: false }),

      supabase
        .from("orders")
        .select("customer_id, total, payment_status, created_at"),
    ]);

    if (profilesResult.error || ordersResult.error) {
      console.error(
        "Admin customers query error:",
        profilesResult.error || ordersResult.error
      );

      return res.status(500).json({
        success: false,
        message: "Unable to retrieve customer records.",
      });
    }

    const authUsers = [];
    let page = 1;
    const perPage = 1000;

    while (true) {
      const { data, error } = await supabase.auth.admin.listUsers({
        page,
        perPage,
      });

      if (error) {
        console.error("Admin auth users query error:", error);

        return res.status(500).json({
          success: false,
          message: "Unable to retrieve customer account information.",
        });
      }

      const users = data.users || [];
      authUsers.push(...users);

      if (users.length < perPage) break;

      page += 1;
    }

    const authUsersMap = new Map(
      authUsers.map((user) => [user.id, user])
    );

    const ordersMap = new Map();

    (ordersResult.data || []).forEach((order) => {
      if (!order.customer_id) return;

      if (!ordersMap.has(order.customer_id)) {
        ordersMap.set(order.customer_id, {
          orders: 0,
          totalSpent: 0,
          lastOrder: null,
        });
      }

      const customerOrders = ordersMap.get(order.customer_id);

      customerOrders.orders += 1;

      if (order.payment_status === "paid") {
        customerOrders.totalSpent += Number(order.total || 0);
      }

      if (
        !customerOrders.lastOrder ||
        new Date(order.created_at) >
          new Date(customerOrders.lastOrder)
      ) {
        customerOrders.lastOrder = order.created_at;
      }
    });

    const customers = (profilesResult.data || []).map((profile) => {
      const authUser = authUsersMap.get(profile.id);

      const customerOrders = ordersMap.get(profile.id) || {
        orders: 0,
        totalSpent: 0,
        lastOrder: null,
      };

      const bannedUntil = authUser?.banned_until;

      const isSuspended =
        bannedUntil &&
        new Date(bannedUntil).getTime() > Date.now();

      return {
        id: `CUS-${profile.id.slice(0, 8).toUpperCase()}`,
        databaseId: profile.id,
        name: profile.full_name || "Unnamed customer",
        email: authUser?.email || "Not available",
        phone: profile.phone || "Not provided",
        orders: customerOrders.orders,
        totalSpent: customerOrders.totalSpent,
        joined: profile.created_at,
        status: isSuspended ? "Suspended" : "Active",
        lastOrder: customerOrders.lastOrder,
      };
    });

    return res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error("Get admin customers error:", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while retrieving customers.",
    });
  }
}

// UPDATE CUSTOMER ACCOUNT STATUS
export async function updateAdminCustomerStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !["Active", "Suspended"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "A valid customer ID and status are required.",
      });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("id", id)
      .eq("role", "customer")
      .maybeSingle();

    if (profileError) {
      console.error("Customer profile lookup error:", profileError);

      return res.status(500).json({
        success: false,
        message: "Unable to verify customer account.",
      });
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Customer account not found.",
      });
    }

    const { data, error } = await supabase.auth.admin.updateUserById(
      id,
      {
        ban_duration:
          status === "Suspended" ? "876000h" : "none",
      }
    );

    if (error) {
      console.error("Customer status update error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to update customer account status.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Customer account ${status.toLowerCase()} successfully.`,
      customer: {
        id,
        name: profile.full_name || "Unnamed customer",
        status,
        banned_until: data.user?.banned_until || null,
      },
    });
  } catch (error) {
    console.error("Update admin customer status error:", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while updating the customer.",
    });
  }
}
