
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "../config/supabase.js";

// Create a Supabase client using the authenticated customer's token.
function createCustomerSupabaseClient(accessToken) {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );
}

// Make a request to Paystack using the backend secret key.
async function paystackRequest(endpoint, options = {}) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Paystack secret key is not configured.");
  }

  const response = await fetch(
    `https://api.paystack.co${endpoint}`,
    {
      ...options,
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    }
  );

  const result = await response.json();

  if (!response.ok || !result.status) {
    throw new Error(
      result.message || "Paystack request failed."
    );
  }

  return result.data;
}

// Create a new order for the authenticated customer.
export async function createCustomerOrder(req, res) {
  try {
    const {
      customer_name,
      customer_phone,
      order_type,
      delivery_address,
      order_notes,
      items,
      delivery_fee,
    } = req.body;

    if (
      typeof customer_name !== "string" ||
      customer_name.trim().length < 2 ||
      typeof customer_phone !== "string" ||
      !customer_phone.trim() ||
      !["delivery", "pickup"].includes(order_type) ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide your details and at least one order item.",
      });
    }

    if (
      order_type === "delivery" &&
      (
        typeof delivery_address !== "string" ||
        delivery_address.trim().length < 5
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid delivery address.",
      });
    }

    if (
      order_notes !== undefined &&
      order_notes !== null &&
      (
        typeof order_notes !== "string" ||
        order_notes.trim().length > 1000
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Order notes cannot exceed 1000 characters.",
      });
    }

    const parsedDeliveryFee = Number(delivery_fee);

    if (
      !Number.isFinite(parsedDeliveryFee) ||
      parsedDeliveryFee < 0 ||
      (order_type === "pickup" && parsedDeliveryFee !== 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery fee.",
      });
    }

    const validatedItems = [];

    for (const item of items) {
      const menuItemId = item?.dbId;
      const quantity = Number(item?.quantity);

      const uuidPattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      if (
        typeof menuItemId !== "string" ||
        !uuidPattern.test(menuItemId) ||
        !Number.isSafeInteger(quantity) ||
        quantity < 1 ||
        quantity > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "One or more cart items are invalid. Please refresh your cart.",
        });
      }

      let selectedSize = null;

      if (item.size !== undefined && item.size !== null) {
        if (
          typeof item.size !== "string" ||
          !item.size.trim()
        ) {
          return res.status(400).json({
            success: false,
            message: "One or more selected meal sizes are invalid.",
          });
        }

        selectedSize = item.size.trim();
      }

      const extras = item.extras ?? [];

      if (!Array.isArray(extras)) {
        return res.status(400).json({
          success: false,
          message: "One or more selected meal extras are invalid.",
        });
      }

      const selectedExtras = [];

      for (const extra of extras) {
        if (
          !extra ||
          typeof extra.name !== "string" ||
          !extra.name.trim()
        ) {
          return res.status(400).json({
            success: false,
            message: "One or more selected meal extras are invalid.",
          });
        }

        selectedExtras.push({
          name: extra.name.trim(),
        });
      }

      const specialInstructions = item.instructions ?? "";

      if (
        typeof specialInstructions !== "string" ||
        specialInstructions.trim().length > 500
      ) {
        return res.status(400).json({
          success: false,
          message: "Meal instructions cannot exceed 500 characters.",
        });
      }

      validatedItems.push({
        menu_item_id: menuItemId,
        quantity,
        selected_size: selectedSize,
        selected_extras: selectedExtras,
        special_instructions:
          specialInstructions.trim() || null,
      });
    }

    const authHeader = req.headers.authorization;

    const accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please sign in again.",
      });
    }

    const customerSupabase =
      createCustomerSupabaseClient(accessToken);

    const { data, error } = await customerSupabase.rpc(
      "create_customer_order",
      {
        p_customer_id: req.user.id,
        p_customer_name: customer_name.trim(),
        p_customer_phone: customer_phone.trim(),
        p_order_type: order_type,
        p_delivery_address:
          order_type === "delivery"
            ? delivery_address.trim()
            : null,
        p_order_notes:
          typeof order_notes === "string"
            ? order_notes.trim() || null
            : null,
        p_items: validatedItems,
        p_delivery_fee: parsedDeliveryFee,
      }
    );

    if (error) {
      console.error("Order creation error:", error.message);

      return res.status(400).json({
        success: false,
        message: error.message.includes("not authorized")
          ? "Your session is not authorized to place this order."
          : "Unable to place your order. Please check your cart and try again.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Your order has been placed successfully!",
      order: data,
    });
  } catch (error) {
    console.error("Create customer order error:", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while placing your order.",
    });
  }
}

// Retrieve orders belonging to the authenticated customer.
export async function getCustomerOrders(req, res) {
  try {
    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
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
        order_items (
          id,
          menu_item_id,
          item_name,
          unit_price,
          quantity,
          line_total,
          selected_size,
          selected_extras,
          special_instructions
        )
      `)
      .eq("customer_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Order retrieval error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to retrieve your orders.",
      });
    }

    return res.status(200).json({
      success: true,
      orders: orders || [],
    });
  } catch (error) {
    console.error("Customer orders error:", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred.",
    });
  }
}

// Initialize Paystack payment for an existing customer order.
export async function initializeOrderPayment(req, res) {
  try {
    const { orderId } = req.params;

    if (
      typeof orderId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order reference.",
      });
    }

    const email = req.user.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Your account does not have an email address for payment.",
      });
    }

    // Retrieve the order using the admin client.
    // The customer ID check prevents paying for another customer's order.
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, order_number, customer_id, total, payment_status")
      .eq("id", orderId)
      .eq("customer_id", req.user.id)
      .maybeSingle();

    if (orderError) {
      console.error("Payment order lookup error:", orderError.message);

      return res.status(500).json({
        success: false,
        message: "Unable to retrieve your order.",
      });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (String(order.payment_status).toLowerCase() === "paid") {
      return res.status(409).json({
        success: false,
        message: "This order has already been paid for.",
      });
    }

    // Convert the database total to kobo.
    const amountNaira = Number(order.total);
    const amountKobo = Math.round(amountNaira * 100);

    if (
      !Number.isFinite(amountNaira) ||
      amountNaira <= 0 ||
      !Number.isSafeInteger(amountKobo) ||
      Math.abs(amountNaira * 100 - amountKobo) > 0.000001
    ) {
      return res.status(400).json({
        success: false,
        message: "The order has an invalid payment amount.",
      });
    }

    // Generate a unique Paystack-compatible reference.
    const reference = `CH${crypto.randomUUID().replace(/-/g, "")}`;

    // Save the payment attempt before contacting Paystack.
    const { data: payment, error: insertError } = await supabase
      .from("payment_transactions")
      .insert({
        order_id: order.id,
        customer_id: req.user.id,
        reference,
        amount_kobo: amountKobo,
        currency: "NGN",
        status: "initialized",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Payment record creation error:", insertError.message);

      return res.status(500).json({
        success: false,
        message: "Unable to prepare your payment. Please try again.",
      });
    }

    const clientUrl = (
      process.env.CLIENT_URL || "http://localhost:5173"
    ).replace(/\/$/, "");

    const paystackData = await paystackRequest(
      "/transaction/initialize",
      {
        method: "POST",
        body: JSON.stringify({
          email,
          amount: String(amountKobo),
          currency: "NGN",
          reference,
          callback_url: `${clientUrl}/order-confirmation`,
          metadata: {
            order_id: order.id,
            order_number: order.order_number,
            customer_id: req.user.id,
          },
        }),
      }
    );

    // Save the Paystack checkout information.
    const { error: updateError } = await supabase
      .from("payment_transactions")
      .update({
        authorization_url: paystackData.authorization_url,
        access_code: paystackData.access_code,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    if (updateError) {
      console.error("Payment update error:", updateError.message);

      return res.status(500).json({
        success: false,
        message: "Payment was initialized but could not be saved. Please contact support.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment initialized successfully.",
      authorization_url: paystackData.authorization_url,
      reference: paystackData.reference,
    });
  } catch (error) {
    console.error("Payment initialization error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to initialize payment. Please try again.",
    });
  }
}

// Verify a Paystack transaction and update the order.
export async function verifyOrderPayment(req, res) {
  try {
    const { reference } = req.body;

    if (
      typeof reference !== "string" ||
      !/^[a-zA-Z0-9.=-]+$/.test(reference)
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid payment reference is required.",
      });
    }

    // Find the payment attempt belonging to this customer.
    const { data: payment, error: paymentError } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("reference", reference)
      .eq("customer_id", req.user.id)
      .maybeSingle();

    if (paymentError) {
      console.error("Payment lookup error:", paymentError.message);

      return res.status(500).json({
        success: false,
        message: "Unable to retrieve payment information.",
      });
    }

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment reference not found.",
      });
    }

    // Verify directly with Paystack.
    const paystackData = await paystackRequest(
      `/transaction/verify/${encodeURIComponent(reference)}`,
      { method: "GET" }
    );

    // Confirm all critical transaction details.
    const isSuccessful =
      paystackData.status === "success" &&
      paystackData.reference === payment.reference &&
      Number(paystackData.amount) === Number(payment.amount_kobo) &&
      paystackData.currency === payment.currency;

    if (!isSuccessful) {
      const newStatus =
        paystackData.status === "success"
          ? "amount_mismatch"
          : paystackData.status || "failed";

      await supabase
        .from("payment_transactions")
        .update({
          status: newStatus,
          gateway_response: paystackData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

      return res.status(400).json({
        success: false,
        message: "Payment could not be verified. Your order has not been marked as paid.",
      });
    }

    // Record the verified successful transaction.
    const { error: transactionUpdateError } = await supabase
      .from("payment_transactions")
      .update({
        status: "success",
        paystack_transaction_id: paystackData.id,
        gateway_response: paystackData,
        paid_at: paystackData.paid_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    if (transactionUpdateError) {
      console.error(
        "Payment transaction update error:",
        transactionUpdateError.message
      );

      return res.status(500).json({
        success: false,
        message: "Payment was verified but could not be recorded. Please contact support.",
      });
    }

    // Update the customer's order only after Paystack verification.
    const { data: order, error: orderUpdateError } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
      })
      .eq("id", payment.order_id)
      .eq("customer_id", req.user.id)
      .select(`
        id,
        order_number,
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
        order_items (
          id,
          item_name,
          unit_price,
          quantity,
          line_total,
          selected_size,
          selected_extras,
          special_instructions
        )
      `)
      .single();

    if (orderUpdateError || !order) {
      console.error(
        "Order payment update error:",
        orderUpdateError?.message
      );

      return res.status(500).json({
        success: false,
        message: "Payment was verified. Please contact support if your order is not updated.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully.",
      order,
      reference,
      payment_status: "paid",
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify payment. Please try again.",
    });
  }
}
