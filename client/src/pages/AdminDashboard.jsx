
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import "./AdminDashboard.css";
import AdminMenuManagement from "./AdminMenuManagement";
import AdminCustomersManagement from "./AdminCustomersManagement";
import AdminEnquiriesManagement from "./AdminEnquiriesManagement";
import AdminSettingsManagement from "./AdminSettingsManagement";
import AdminNotificationBell from "./AdminNotificationBell";

function AdminLogo() {
  return (
    <Link to="/" className="admin-brand">
      <svg
        className="admin-brand-mark"
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M8 36.5C8 23.8 16 13.5 26 13.5C36 13.5 44 23.8 44 36.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M15 36.5C15 28.3 19.9 21.5 26 21.5C32.1 21.5 37 28.3 37 36.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M26 8V17M21.5 12.5H30.5" stroke="#B85C45" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M7 42H45" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>

      <span className="admin-brand-name">
        Chop<span>Hub</span>
      </span>
    </Link>
  );
}

function AdminIcon({ type }) {
  const icons = {
    overview: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    orders: (
      <>
        <path d="M6 3h12l3 3v15H3V6l3-3z" />
        <path d="M8 3v5h8V3M7 13h10M7 17h7" />
      </>
    ),
    menu: (
      <>
        <path d="M4 4h16M4 10h16M4 16h16M4 22h16" />
      </>
    ),
    customers: (
      <>
        <circle cx="9" cy="8" r="4" />
        <path d="M2 21v-2a7 7 0 0114 0v2M16 4a4 4 0 010 8M18 14a6 6 0 014 5v2" />
      </>
    ),
    enquiries: (
      <>
        <path d="M4 5h16v12H8l-4 4V5z" />
        <path d="M8 9h8M8 13h5" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1-1.7 1.7-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5v.2h-2.4v-.2a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.9.3l-.1.1L8 17l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H6.7v-2.4h.2a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.9L8 8.6l1.7-1.7.1.1a1.7 1.7 0 001.9.3 1.7 1.7 0 001-1.5v-.2h2.4v.2a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1 1.7 1.7-.1.1a1.7 1.7 0 00-.3 1.9 1.7 1.7 0 001.5 1h.2V14h-.2a1.7 1.7 0 00-1.5 1z" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[type] || icons.overview}
    </svg>
  );
}

function StatIcon({ type }) {
  const icons = {
    revenue: (
      <path d="M12 2v20M17 6H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    ),
    orders: (
      <>
        <path d="M4 5h16v16H4zM8 5V3h8v2M8 10h8M8 14h5" />
      </>
    ),
    customers: (
      <>
        <circle cx="9" cy="8" r="4" />
        <path d="M2 21v-2a7 7 0 0114 0v2M16 4a4 4 0 010 8M18 14a6 6 0 014 5v2" />
      </>
    ),
    pending: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[type]}
    </svg>
  );
}

const navigation = [
  { id: "overview", label: "Overview", icon: "overview" },
  { id: "orders", label: "Orders", icon: "orders" },
  { id: "menu", label: "Menu Management", icon: "menu" },
  { id: "customers", label: "Customers", icon: "customers" },
  { id: "enquiries", label: "Enquiries", icon: "enquiries" },
  { id: "settings", label: "Settings", icon: "settings" },
];

const orderStatuses = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Ready for pickup",
  "Out for delivery",
  "Completed",
  "Cancelled",
];

const deliveryOrderStatuses = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Out for delivery",
  "Completed",
  "Cancelled",
];

const pickupOrderStatuses = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Ready for pickup",
  "Completed",
  "Cancelled",
];

function getOrderStatuses(orderType) {
  return orderType === "Pickup"
    ? pickupOrderStatuses
    : deliveryOrderStatuses;
}

function formatPrice(amount) {
  return `₦${Number(amount || 0).toLocaleString("en-NG")}`;
}

function formatDate(dateValue) {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getStatusLabel(status) {
  const normalized = String(status || "pending")
    .toLowerCase()
    .replaceAll("_", " ")
    .replaceAll("-", " ");

  const labels = {
    pending: "Pending",
    confirmed: "Confirmed",
    preparing: "Preparing",
    ready: "Ready for pickup",
    "ready for pickup": "Ready for pickup",
    "out for delivery": "Out for delivery",
    completed: "Completed",
    cancelled: "Cancelled",
    unpaid: "Unpaid",
    paid: "Paid",
    refunded: "Refunded",
    failed: "Failed",
  };

  return labels[normalized] ||
    normalized.replace(/\b\w/g, (character) => character.toUpperCase());
}

function getStatusClass(status) {
  return String(status || "pending")
    .toLowerCase()
    .replaceAll("_", "-")
    .replaceAll(" ", "-");
}

function mapApiOrder(order) {
  const orderItems = order.order_items || order.items || [];

  const mappedItems = orderItems.map((item) => ({
    name: item.item_name || item.name || "Menu item",
    quantity: Number(item.quantity || 1),
    price: Number(item.unit_price || item.price || 0),
    options: item.options || [],
  }));

  const itemCount = mappedItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const orderNumber = order.order_number || order.id || "Unknown";

  return {
    databaseId: order.id,
    id: String(orderNumber).startsWith("CH-")
      ? String(orderNumber)
      : `CH-${orderNumber}`,
    databaseId: order.id,
    customer: order.customer_name || "Customer",
    email: order.customer_email || "Not available",
    phone: order.customer_phone || "Not available",
    date: formatDate(order.created_at),
    items: `${itemCount} item${itemCount === 1 ? "" : "s"}`,
    orderItems: mappedItems,
    type:
      String(order.order_type || "").toLowerCase() === "pickup"
        ? "Pickup"
        : "Delivery",
    total: Number(order.total || 0),
    status: getStatusLabel(order.status),
    paymentMethod: order.payment_method || "Not available",
    paymentStatus: getStatusLabel(order.payment_status || "unpaid"),
    deliveryAddress: order.delivery_address || "Not provided",
    landmark: order.landmark || "Not provided",
    pickupTime: order.pickup_time || "Not specified",
    instructions: order.order_notes || "No special instructions.",
  };
}

function SalesChart({ data = [] }) {
  const chartData = data.map((item, index) => ({
    label:
      item.label ||
      item.day ||
      item.date ||
      item.period ||
      `Period ${index + 1}`,
    revenue: Number(
      item.revenue ??
      item.totalRevenue ??
      item.sales ??
      item.value ??
      0
    ),
  }));

  const maxValue = Math.max(
    ...chartData.map((item) => item.revenue),
    1
  );

  const axisMaximum = Math.ceil(maxValue / 4) * 4 || 4;

  return (
    <div className="admin-chart">
      <div className="admin-chart-y-axis">
        {[4, 3, 2, 1, 0].map((number) => (
          <span key={number}>
            {formatPrice((axisMaximum * number) / 4)}
          </span>
        ))}
      </div>

      <div className="admin-chart-content">
        <div className="admin-chart-grid">
          {[0, 1, 2, 3, 4].map((line) => (
            <span key={line} />
          ))}
        </div>

        <div className="admin-chart-bars">
          {chartData.map((item, index) => (
            <div className="admin-chart-column" key={`${item.label}-${index}`}>
              <div
                className="admin-chart-bar"
                style={{
                  height: `${(item.revenue / maxValue) * 100}%`,
                  minHeight: item.revenue > 0 ? "4px" : "0",
                }}
                title={`${item.label}: ${formatPrice(item.revenue)}`}
              />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OrdersManagement({
  orders,
  onStatusChange,
  loading,
  error,
  onRetry,
  updatingOrderId,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [typeFilter, setTypeFilter] = useState("All types");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(search) ||
        order.customer.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "All statuses" ||
        order.status === statusFilter;

      const matchesType =
        typeFilter === "All types" ||
        order.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [orders, searchTerm, statusFilter, typeFilter]);

  const pendingCount = orders.filter(
    (order) => order.status === "Pending"
  ).length;

  const activeCount = orders.filter(
    (order) =>
      !["Completed", "Cancelled"].includes(order.status)
  ).length;

  const completedCount = orders.filter(
    (order) => order.status === "Completed"
  ).length;

  return (
    <div className="admin-content admin-order-management">
      <div className="admin-welcome">
        <div>
          <span className="admin-welcome-eyebrow">
            ORDER OPERATIONS
          </span>
          <h2>Manage your orders.</h2>
          <p>
            Review customer orders and keep fulfilment moving.
          </p>
        </div>

        <div className="admin-date">
          <span>DATABASE ORDERS</span>
          <strong>{orders.length} loaded</strong>
        </div>
      </div>

      <div className="admin-order-summary">
        <article>
          <span>Orders loaded</span>
          <strong>{orders.length}</strong>
        </article>

        <article>
          <span>Active orders</span>
          <strong>{activeCount}</strong>
        </article>

        <article>
          <span>Pending orders</span>
          <strong>{pendingCount}</strong>
        </article>

        <article>
          <span>Completed orders</span>
          <strong>{completedCount}</strong>
        </article>
      </div>

      <section className="admin-panel admin-manage-orders-panel">
        <div className="admin-panel-heading admin-orders-heading">
          <div>
            <span className="admin-panel-eyebrow">
              ORDER DIRECTORY
            </span>
            <h2>All orders</h2>
            <p>
              Every order retrieved from the ChopHub database.
            </p>
          </div>

          <span className="admin-results-count">
            {filteredOrders.length} of {orders.length} orders
          </span>
        </div>

        {error && (
          <div className="admin-status-feedback" role="alert">
            {error}
            <button type="button" onClick={onRetry}>
              Retry
            </button>
          </div>
        )}

        <div className="admin-order-toolbar">
          <div className="admin-order-search">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m16 16 4 4" />
            </svg>

            <input
              type="search"
              placeholder="Search order ID or customer..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Search orders"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter orders by status"
          >
            <option>All statuses</option>
            {orderStatuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            aria-label="Filter orders by fulfilment type"
          >
            <option>All types</option>
            <option>Delivery</option>
            <option>Pickup</option>
          </select>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-orders-table admin-manage-orders-table">
            <thead>
              <tr>
                <th>ORDER ID</th>
                <th>CUSTOMER</th>
                <th>DATE</th>
                <th>ITEMS</th>
                <th>TYPE</th>
                <th>TOTAL</th>
                <th>STATUS</th>
                <th>UPDATE STATUS</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="admin-orders-empty">
                    <strong>Loading database orders...</strong>
                    <span>Please wait while we retrieve all orders.</span>
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.databaseId}>
                    <td className="admin-order-id">
                      <button
                        type="button"
                        className="order-id-button"
                        onClick={() => setSelectedOrder(order)}
                      >
                        {order.id}
                      </button>
                    </td>
                    <td>{order.customer}</td>
                    <td>{order.date}</td>
                    <td>{order.items}</td>
                    <td>{order.type}</td>
                    <td className="admin-order-total">
                      {formatPrice(order.total)}
                    </td>
                    <td>
                      <span
                        className={`admin-order-status ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <select
                        className="admin-status-select"
                        value={order.status}
                        disabled={updatingOrderId === order.databaseId}
                        onChange={(event) =>
                          onStatusChange(
                            order.databaseId,
                            event.target.value
                          )
                        }
                        aria-label={`Update status for ${order.id}`}
                      >
                        {getOrderStatuses(order.type).map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="admin-orders-empty">
                    <strong>
                      {orders.length === 0
                        ? "No orders recorded yet."
                        : "No matching orders found."}
                    </strong>
                    <span>
                      {orders.length === 0
                        ? "Customer orders will appear here when they place their first order."
                        : "Try another search term or change your filters."}
                    </span>

                    {orders.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm("");
                          setStatusFilter("All statuses");
                          setTypeFilter("All types");
                        }}
                      >
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-orders-note">
          <span>ⓘ</span>
          Order status changes are saved directly to the ChopHub database.
        </div>
      </section>

      {selectedOrder && (
        <div
          className="order-details-overlay"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="order-details-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="order-details-header">
              <div>
                <span className="admin-panel-eyebrow">ORDER DETAILS</span>
                <h2>{selectedOrder.id}</h2>
                <p>{selectedOrder.date}</p>
              </div>

              <button
                type="button"
                className="order-details-close"
                onClick={() => setSelectedOrder(null)}
                aria-label="Close order details"
              >
                ×
              </button>
            </div>

            <div className="order-details-content">
              <section className="order-details-section">
                <h3>Customer information</h3>
                <p><strong>Name:</strong> {selectedOrder.customer}</p>
                <p><strong>Email:</strong> {selectedOrder.email}</p>
                <p><strong>Phone:</strong> {selectedOrder.phone}</p>
              </section>

              <section className="order-details-section">
                <h3>Ordered items</h3>

                {selectedOrder.orderItems.map((item, index) => (
                  <div className="order-detail-item" key={index}>
                    <div>
                      <strong>{item.name}</strong>
                      <p>Quantity: {item.quantity}</p>
                      {item.options.length > 0 && (
                        <p>{item.options.join(" · ")}</p>
                      )}
                    </div>

                    <strong>
                      {formatPrice(item.price * item.quantity)}
                    </strong>
                  </div>
                ))}

                <div className="order-details-total">
                  <span>Order total</span>
                  <strong>{formatPrice(selectedOrder.total)}</strong>
                </div>
              </section>

              <section className="order-details-section">
                <h3>Fulfilment details</h3>
                <p><strong>Order type:</strong> {selectedOrder.type}</p>

                {selectedOrder.type === "Delivery" ? (
                  <>
                    <p><strong>Address:</strong> {selectedOrder.deliveryAddress}</p>
                    <p><strong>Landmark:</strong> {selectedOrder.landmark}</p>
                  </>
                ) : (
                  <p><strong>Pickup time:</strong> {selectedOrder.pickupTime}</p>
                )}
              </section>

              <section className="order-details-section">
                <h3>Payment information</h3>
                <p><strong>Method:</strong> {selectedOrder.paymentMethod}</p>
                <p><strong>Payment status:</strong> {selectedOrder.paymentStatus}</p>
              </section>

              <section className="order-details-section">
                <h3>Special instructions</h3>
                <p>{selectedOrder.instructions}</p>
              </section>

              <section className="order-details-section">
                <h3>Update order status</h3>

                <select
                  value={selectedOrder.status}
                  disabled={updatingOrderId === selectedOrder.databaseId}
                  onChange={async (event) => {
                    const newStatus = event.target.value;
                    const updated = await onStatusChange(
                      selectedOrder.databaseId,
                      newStatus
                    );

                    if (updated) {
                      setSelectedOrder((previous) => ({
                        ...previous,
                        status: newStatus,
                      }));
                    }
                  }}
                >
                  {getOrderStatuses(selectedOrder.type).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminDashboard() {
  const { logout, session } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.replace("/");
  };

  const [activeSection, setActiveSection] = useState("overview");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [period, setPeriod] = useState("This week");
  const [orders, setOrders] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");

  const [overviewData, setOverviewData] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState("");

  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const activeLabel =
    navigation.find((item) => item.id === activeSection)?.label ||
    "Overview";

  const handleNavigation = (id) => {
    setActiveSection(id);
    setMobileSidebarOpen(false);
    setStatusMessage("");
  };

  useEffect(() => {
    async function fetchOverview() {
      if (!session?.access_token) {
        setOverviewError(
          "Your admin session is unavailable. Please log in again."
        );
        return;
      }

      setOverviewLoading(true);
      setOverviewError("");

      try {
        const periodValue =
          period === "This month"
            ? "month"
            : period === "This year"
            ? "year"
            : "week";

        const response = await fetch(
          `http://localhost:5000/api/admin/overview?period=${periodValue}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load dashboard data."
          );
        }

        setOverviewData(result);

        const latestOrders = (result.recentOrders || []).map(mapApiOrder);
        setOrders(latestOrders);
      } catch (error) {
        setOverviewError(
          error.message || "Unable to connect to the server."
        );
      } finally {
        setOverviewLoading(false);
      }
    }

    fetchOverview();
  }, [session?.access_token, period]);

  async function fetchAllOrders() {
    if (!session?.access_token) {
      setOrdersError("Your admin session is unavailable. Please log in again.");
      return;
    }

    setOrdersLoading(true);
    setOrdersError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/orders",
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to retrieve orders.");
      }

      setOrders((result.orders || []).map(mapApiOrder));
    } catch (error) {
      setOrdersError(error.message || "Unable to load orders.");
    } finally {
      setOrdersLoading(false);
    }
  }

  useEffect(() => {
    if (activeSection === "orders") {
      fetchAllOrders();
    }
  }, [activeSection, session?.access_token]);

  async function handleStatusChange(orderId, newStatus) {
    if (!session?.access_token) {
      setStatusMessage("Your admin session has expired. Please log in again.");
      return false;
    }

    setUpdatingOrderId(orderId);
    setStatusMessage("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update order status.");
      }

      const savedStatus = getStatusLabel(result.order.status);

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order.databaseId === orderId
            ? { ...order, status: savedStatus }
            : order
        )
      );

      setStatusMessage(`Order status saved as ${savedStatus}.`);

      return true;
    } catch (error) {
      setStatusMessage(error.message || "Unable to update order status.");
      return false;
    } finally {
      setUpdatingOrderId(null);
    }
  }

  const stats = [
    {
      label: "Total Revenue",
      value: formatPrice(overviewData?.stats?.totalRevenue),
      icon: "revenue",
    },
    {
      label: "Total Orders",
      value: overviewData?.stats?.totalOrders ?? 0,
      icon: "orders",
    },
    {
      label: "Total Customers",
      value: overviewData?.stats?.totalCustomers ?? 0,
      icon: "customers",
    },
    {
      label: "Pending Orders",
      value: overviewData?.stats?.pendingOrders ?? 0,
      icon: "pending",
    },
  ];

  const popularMeals = overviewData?.popularMeals || [];
  const salesData = overviewData?.salesChart || [];

  const reportingPeriodLabel =
    period === "This week"
      ? "This week"
      : period === "This month"
      ? "This month"
      : "This year";

  return (
    <main className="admin-dashboard">
      <aside
        className={`admin-sidebar ${
          mobileSidebarOpen ? "is-open" : ""
        }`}
      >
        <div className="admin-sidebar-top">
          <AdminLogo />

          <button
            type="button"
            className="admin-mobile-close"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close navigation"
          >
            ×
          </button>
        </div>

        <div className="admin-sidebar-label">WORKSPACE</div>

        <nav className="admin-navigation">
          {navigation.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`admin-nav-item ${
                activeSection === item.id ? "active" : ""
              }`}
              onClick={() => handleNavigation(item.id)}
            >
              <AdminIcon type={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-support-card">
            <span className="admin-support-symbol">✦</span>
            <h3>Need assistance?</h3>
            <p>Get help managing your ChopHub workspace.</p>
            <Link to="/#contact">Contact support ↗</Link>
          </div>

          <Link to="/" className="admin-back-website">
            <span>←</span>
            Back to website
          </Link>
        </div>
      </aside>

      {mobileSidebarOpen && (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <section className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-menu-toggle"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open navigation"
            >
              ☰
            </button>

            <div>
              <span className="admin-topbar-eyebrow">
                CHOPHUB MANAGEMENT
              </span>
              <h1>{activeLabel}</h1>
            </div>
          </div>

          <div className="admin-topbar-right">
            <span className="admin-demo-indicator">
              <span />
              LIVE DATA
            </span>
            
            <AdminNotificationBell />
            <button
              type="button"
              className="admin-logout-button"
              onClick={handleLogout}
            >
              Sign out
            </button>

            <div className="admin-profile">
              <div className="admin-avatar">A</div>
              <div className="admin-profile-info">
                <strong>Administrator</strong>
                <span>Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        {statusMessage && (
          <div className="admin-status-feedback" role="status">
            <span>✓</span>
            {statusMessage}
            <button
              type="button"
              onClick={() => setStatusMessage("")}
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        {activeSection === "overview" ? (
          <div className="admin-content">
            <div className="admin-welcome">
              <div>
                <span className="admin-welcome-eyebrow">
                  YOUR RESTAURANT AT A GLANCE
                </span>
                <h2>Good afternoon, Admin.</h2>
                <p>
                  Here's what's happening with ChopHub.
                </p>
              </div>

              <div className="admin-date">
                <span>REPORTING PERIOD</span>
                <strong>{reportingPeriodLabel}</strong>
              </div>
            </div>

            {overviewError && (
              <div className="admin-status-feedback" role="alert">
                {overviewError}
              </div>
            )}

            <div className="admin-stats-grid">
              {stats.map((stat) => (
                <article className="admin-stat-card" key={stat.label}>
                  <div className="admin-stat-top">
                    <span>{stat.label}</span>
                    <div className={`admin-stat-icon ${stat.icon}`}>
                      <StatIcon type={stat.icon} />
                    </div>
                  </div>

                  <h3>
                    {overviewLoading && !overviewData
                      ? "..."
                      : stat.value}
                  </h3>

                  <div className="admin-stat-bottom">
                    <span className="admin-stat-change neutral">
                      Live database data
                    </span>
                    <span>All recorded orders</span>
                  </div>
                </article>
              ))}
            </div>

            <div className="admin-analytics-grid">
              <section className="admin-panel admin-sales-panel">
                <div className="admin-panel-heading">
                  <div>
                    <span className="admin-panel-eyebrow">
                      REVENUE OVERVIEW
                    </span>
                    <h2>Sales performance</h2>
                    <p>Track your restaurant's sales activity.</p>
                  </div>

                  <select
                    value={period}
                    onChange={(event) => setPeriod(event.target.value)}
                    aria-label="Sales reporting period"
                  >
                    <option>This week</option>
                    <option>This month</option>
                    <option>This year</option>
                  </select>
                </div>

                <div className="admin-sales-summary">
                  <strong>
                    {formatPrice(
                      salesData.reduce(
                        (total, item) =>
                          total +
                          Number(
                            item.revenue ??
                            item.totalRevenue ??
                            item.sales ??
                            item.value ??
                            0
                          ),
                        0
                      )
                    )}
                  </strong>
                  <span>
                    Revenue recorded for {reportingPeriodLabel.toLowerCase()}
                  </span>
                </div>

                {overviewLoading && !overviewData ? (
                  <p>Loading sales data...</p>
                ) : salesData.length > 0 ? (
                  <SalesChart data={salesData} />
                ) : (
                  <div className="admin-orders-empty">
                    <strong>No sales data yet.</strong>
                    <span>
                      Sales activity will appear here when paid orders are
                      recorded.
                    </span>
                  </div>
                )}

                <p className="admin-chart-disclaimer">
                  Figures are retrieved from the ChopHub database.
                </p>
              </section>

              <section className="admin-panel admin-popular-panel">
                <div className="admin-panel-heading">
                  <div>
                    <span className="admin-panel-eyebrow">
                      MENU PERFORMANCE
                    </span>
                    <h2>Popular meals</h2>
                    <p>Your best-performing menu items.</p>
                  </div>
                </div>

                <div className="admin-popular-list">
                  {popularMeals.length > 0 ? (
                    popularMeals.map((meal, index) => {
                      const mealName =
                        meal.name ||
                        meal.item_name ||
                        meal.itemName ||
                        "Menu item";

                      const mealCategory =
                        meal.category || "Menu item";

                      const mealOrders = Number(
                        meal.orders ??
                        meal.quantity ??
                        meal.total_quantity ??
                        0
                      );

                      const mealRevenue = Number(
                        meal.revenue ??
                        meal.total_revenue ??
                        0
                      );

                      const mealImage =
                        meal.image ||
                        meal.image_url ||
                        meal.imageUrl;

                      return (
                        <div
                          className="admin-popular-item"
                          key={`${mealName}-${index}`}
                        >
                          <span className="admin-popular-rank">
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          {mealImage ? (
                            <img src={mealImage} alt={mealName} />
                          ) : (
                            <div className="admin-popular-image-placeholder">
                              <span>🍽</span>
                            </div>
                          )}

                          <div className="admin-popular-info">
                            <h3>{mealName}</h3>
                            <span>{mealCategory}</span>
                            <p>{mealOrders} orders</p>
                          </div>

                          <strong>{formatPrice(mealRevenue)}</strong>
                        </div>
                      );
                    })
                  ) : (
                    <div className="admin-orders-empty">
                      <strong>No popular meals yet.</strong>
                      <span>
                        Menu performance will appear after customers place
                        orders.
                      </span>
                    </div>
                  )}
                </div>
              </section>
            </div>

            <section className="admin-panel admin-orders-panel">
              <div className="admin-panel-heading admin-orders-heading">
                <div>
                  <span className="admin-panel-eyebrow">
                    RECENT ACTIVITY
                  </span>
                  <h2>Recent orders</h2>
                  <p>Keep an eye on your latest customer orders.</p>
                </div>

                <button
                  type="button"
                  className="admin-view-all"
                  onClick={() => handleNavigation("orders")}
                >
                  View all orders <span>↗</span>
                </button>
              </div>

              <div className="admin-table-wrapper">
                <table className="admin-orders-table">
                  <thead>
                    <tr>
                      <th>ORDER ID</th>
                      <th>CUSTOMER</th>
                      <th>DATE</th>
                      <th>ITEMS</th>
                      <th>TYPE</th>
                      <th>TOTAL</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.length > 0 ? (
                      orders.slice(0, 5).map((order) => (
                        <tr key={order.databaseId}>
                          <td className="admin-order-id">{order.id}</td>
                          <td>{order.customer}</td>
                          <td>{order.date}</td>
                          <td>{order.items}</td>
                          <td>{order.type}</td>
                          <td className="admin-order-total">
                            {formatPrice(order.total)}
                          </td>
                          <td>
                            <span
                              className={`admin-order-status ${getStatusClass(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="admin-orders-empty">
                          <strong>No orders recorded yet.</strong>
                          <span>
                            Customer orders will appear here once they are
                            placed.
                          </span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <footer className="admin-footer">
              <span>
                © {new Date().getFullYear()} ChopHub Management
              </span>
              <span>Admin workspace · Connected to database</span>
            </footer>
          </div>
        ) : activeSection === "orders" ? (
          <OrdersManagement
            orders={orders}
            onStatusChange={handleStatusChange}
            loading={ordersLoading}
            error={ordersError}
            onRetry={fetchAllOrders}
            updatingOrderId={updatingOrderId}
          />
        ) : activeSection === "menu" ? (
          <AdminMenuManagement />
        ) : activeSection === "customers" ? (
          <AdminCustomersManagement />
        ) : activeSection === "enquiries" ? (
          <AdminEnquiriesManagement />
        ) : activeSection === "settings" ? (
          <AdminSettingsManagement />
        ) : (
          <div className="admin-section-placeholder">
            <div className="admin-placeholder-icon">
              <AdminIcon type={activeSection} />
            </div>
            <span className="admin-panel-eyebrow">
              CHOPHUB MANAGEMENT
            </span>
            <h2>{activeLabel}</h2>
            <p>
              This section is part of the admin dashboard.
              We'll build its management tools next.
            </p>
            <button
              type="button"
              onClick={() => handleNavigation("overview")}
            >
              Return to overview
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminDashboard;
