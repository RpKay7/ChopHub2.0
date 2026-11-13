
import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import "./OrderTracking.css";

const API_URL = "http://localhost:5000/api";

// Fictional ChopHub location for this portfolio project.
const CHOPHUB_LOCATION = "Allen Avenue, Ikeja, Lagos, Nigeria";

function ChopHubLogo() {
  return (
    <Link to="/" className="tracking-brand" aria-label="ChopHub home">
      <svg
        className="tracking-brand-mark"
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 36.5C8 23.8 16 13.5 26 13.5C36 13.5 44 23.8 44 36.5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M15 36.5C15 28.3 19.9 21.5 26 21.5C32.1 21.5 37 28.3 37 36.5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M26 8V17M21.5 12.5H30.5"
          stroke="#B85C45"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M7 42H45"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>

      <span className="tracking-brand-name">
        Chop<span>Hub</span>
      </span>
    </Link>
  );
}

function TrackingIcon({ type }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  const paths = {
    received: (
      <>
        <path d="M5 12.5L12 6l7 6.5" />
        <path d="M7.5 11v7h9v-7" />
        <path d="M10 18v-4h4v4" />
      </>
    ),
    confirmed: (
      <>
        <path d="M5 12.5l4.5 4.5L19 7" />
        <circle cx="12" cy="12" r="9" />
      </>
    ),
    preparing: (
      <>
        <path d="M4 12h16" />
        <path d="M6 12a6 6 0 0112 0" />
        <path d="M8 5l1 2M16 5l-1 2M12 3v3" />
        <path d="M5 15h14l-1 5H6l-1-5z" />
      </>
    ),
    delivery: (
      <>
        <path d="M3 7h11v11H3z" />
        <path d="M14 11h4l3 3v4h-7z" />
        <circle cx="7.5" cy="19" r="1.5" />
        <circle cx="17.5" cy="19" r="1.5" />
      </>
    ),
    pickup: (
      <>
        <path d="M4 9h16l-1.5 11h-13L4 9z" />
        <path d="M8 9a4 4 0 018 0" />
        <path d="M9 14h6" />
      </>
    ),
    completed: (
      <>
        <path d="M5 12l4 4L19 6" />
        <circle cx="12" cy="12" r="9" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
      {paths[type] || paths.received}
    </svg>
  );
}

function formatPrice(amount) {
  return `₦${Number(amount || 0).toLocaleString("en-NG")}`;
}

function formatDate(dateValue) {
  if (!dateValue) return "Date unavailable";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatStatus(status) {
  const labels = {
    pending: "Order received",
    confirmed: "Confirmed",
    preparing: "Preparing",
    ready_for_pickup: "Ready for pickup",
    out_for_delivery: "Out for delivery",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return labels[status] || String(status || "Unknown").replaceAll("_", " ");
}

function getAddressText(address) {
  if (!address) return "";

  if (typeof address === "string") {
    try {
      const parsed = JSON.parse(address);

      if (parsed && typeof parsed === "object") {
        return [
          parsed.address,
          parsed.street,
          parsed.area,
          parsed.city,
          parsed.state,
          parsed.landmark,
        ]
          .filter(Boolean)
          .join(", ");
      }
    } catch {
      return address;
    }

    return address;
  }

  if (typeof address === "object") {
    return [
      address.address,
      address.street,
      address.area,
      address.city,
      address.state,
      address.landmark,
    ]
      .filter(Boolean)
      .join(", ");
  }

  return String(address);
}

function getItemDescription(item) {
  const details = [];

  if (item.selected_size) {
    details.push(
      typeof item.selected_size === "object"
        ? item.selected_size.name || item.selected_size.label
        : item.selected_size
    );
  }

  if (Array.isArray(item.selected_extras)) {
    item.selected_extras.forEach((extra) => {
      details.push(
        typeof extra === "object"
          ? extra.name || extra.label
          : extra
      );
    });
  }

  if (item.special_instructions) {
    details.push(`Note: ${item.special_instructions}`);
  }

  return details.filter(Boolean).join(" · ");
}

function getTrackingSteps(isPickup) {
  return [
    {
      id: "pending",
      title: "Order received",
      description: "Your order has been received successfully.",
      icon: "received",
    },
    {
      id: "confirmed",
      title: "Order confirmed",
      description: "ChopHub has confirmed your order.",
      icon: "confirmed",
    },
    {
      id: "preparing",
      title: "Preparing your meal",
      description: "Our kitchen is preparing your food fresh.",
      icon: "preparing",
    },
    {
      id: isPickup ? "ready_for_pickup" : "out_for_delivery",
      title: isPickup ? "Ready for pickup" : "Out for delivery",
      description: isPickup
        ? "Your order is ready. You can come and collect it."
        : "Your order has left the restaurant and is on its way.",
      icon: isPickup ? "pickup" : "delivery",
    },
    {
      id: "completed",
      title: "Order completed",
      description: isPickup
        ? "Your order has been collected. Enjoy your meal!"
        : "Your order has been delivered. Enjoy your meal!",
      icon: "completed",
    },
  ];
}

function OrderProgress({ status, isPickup }) {
  const steps = getTrackingSteps(isPickup);
  const activeIndex = steps.findIndex((step) => step.id === status);

  return (
    <div className="tracking-progress">
      {steps.map((step, index) => {
        const isCompleted =
          status === "completed" || index < activeIndex;
        const isActive = index === activeIndex && status !== "completed";

        return (
          <div
            className={`tracking-step ${
              isCompleted ? "is-completed" : ""
            } ${isActive ? "is-active" : ""}`}
            key={step.id}
          >
            <div className="tracking-step-indicator">
              <div className="tracking-step-icon">
                {isCompleted && !isActive ? (
                  <span className="tracking-check">✓</span>
                ) : (
                  <TrackingIcon type={step.icon} />
                )}
              </div>

              {index !== steps.length - 1 && (
                <div className="tracking-step-line" />
              )}
            </div>

            <div className="tracking-step-content">
              <div className="tracking-step-heading">
                <h3>{step.title}</h3>

                {isActive && (
                  <span className="tracking-current-label">
                    CURRENT STATUS
                  </span>
                )}
              </div>

              <p>{step.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OrderTracking() {
  const { session } = useAuth();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchOrder = useCallback(
    async (isManualRefresh = false) => {
      if (!session?.access_token) {
        setError("Your session has expired. Please log in again.");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (!orderId) {
        setError("No order was selected. Open tracking from your order history.");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await fetch(`${API_URL}/orders`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to retrieve your orders."
          );
        }

        const orders = Array.isArray(data.orders) ? data.orders : [];
        const matchingOrder = orders.find(
          (item) => String(item.id) === String(orderId)
        );

        if (!matchingOrder) {
          setOrder(null);
          throw new Error(
            "We couldn't find this order in your account. Please check your order history."
          );
        }

        setOrder(matchingOrder);
        setLastUpdated(new Date());
        setError("");
      } catch (fetchError) {
        setError(
          fetchError.message || "Something went wrong while loading your order."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [session?.access_token, orderId]
  );

  useEffect(() => {
    fetchOrder();

    const intervalId = window.setInterval(() => {
      fetchOrder(true);
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [fetchOrder]);

  const isPickup = order?.order_type === "pickup";
  const status = order?.status;
  const isCancelled = status === "cancelled";
  const deliveryAddress = getAddressText(order?.delivery_address);
  console.log("Saved delivery address:", order?.delivery_address);

 
const mapDestination = isPickup
  ? CHOPHUB_LOCATION
  : deliveryAddress
    ? `${deliveryAddress}, Nigeria`
    : CHOPHUB_LOCATION;

const mapEmbedUrl = isPickup
  ? `https://maps.google.com/maps?output=embed&q=${encodeURIComponent(
      CHOPHUB_LOCATION
    )}&z=16`
  : `https://maps.google.com/maps?output=embed&saddr=${encodeURIComponent(
      CHOPHUB_LOCATION
    )}&daddr=${encodeURIComponent(
      mapDestination
    )}&z=14`;

const mapDirectionsUrl = isPickup
  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      CHOPHUB_LOCATION
    )}`
  : `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      CHOPHUB_LOCATION
    )}&destination=${encodeURIComponent(
      mapDestination
    )}`;


  if (loading) {
    return (
      <main className="order-tracking-page">
        <header className="tracking-header">
          <div className="tracking-header-inner">
            <ChopHubLogo />
            <Link to="/account" className="tracking-back-link">
              <span aria-hidden="true">←</span>
              My account
            </Link>
          </div>
        </header>

        <div className="tracking-container">
          <div className="tracking-state-card">
            <div className="tracking-loader" />
            <h2>Loading your order...</h2>
            <p>Please wait while we retrieve your order details.</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="order-tracking-page">
        <header className="tracking-header">
          <div className="tracking-header-inner">
            <ChopHubLogo />
            <Link to="/account" className="tracking-back-link">
              <span aria-hidden="true">←</span>
              My account
            </Link>
          </div>
        </header>

        <div className="tracking-container">
          <div className="tracking-state-card tracking-error-state">
            <span className="tracking-state-icon">!</span>
            <h2>We couldn't load this order.</h2>
            <p>{error || "The requested order could not be found."}</p>

            <div className="tracking-state-actions">
              <button
                type="button"
                className="tracking-primary-button"
                onClick={() => fetchOrder(true)}
                disabled={refreshing}
              >
                {refreshing ? "Trying again..." : "Try again"}
              </button>

              <Link to="/account" className="tracking-secondary-button">
                Go to my orders
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const items = Array.isArray(order.order_items)
    ? order.order_items
    : [];

  const orderNumber = order.order_number || order.id;
  const paymentStatus = String(
    order.payment_status || "unpaid"
  ).toLowerCase();

  return (
    <main className="order-tracking-page">
      <header className="tracking-header">
        <div className="tracking-header-inner">
          <ChopHubLogo />

          <Link to="/account" className="tracking-back-link">
            <span aria-hidden="true">←</span>
            My orders
          </Link>
        </div>
      </header>

      <div className="tracking-container">
        <div className="tracking-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/account">My Account</Link>
          <span>/</span>
          <span>Order Tracking</span>
        </div>

        <section className="tracking-page-heading">
          <span className="tracking-eyebrow">YOUR CHOPHUB ORDER</span>
          <h1>Track your order.</h1>
          <p>
            Follow your order's progress and see the latest updates
            from the ChopHub team.
          </p>
        </section>

        <div className="tracking-live-notice">
          <span className="tracking-notice-icon">i</span>
          <div>
            <strong>Order updates are enabled</strong>
            <p>
              This page checks for status changes automatically every
              15 seconds. You can also refresh it manually.
              {lastUpdated &&
                ` Last checked at ${lastUpdated.toLocaleTimeString(
                  "en-NG",
                  {
                    hour: "numeric",
                    minute: "2-digit",
                  }
                )}.`}
            </p>
          </div>

          <button
            type="button"
            className="tracking-refresh-button"
            onClick={() => fetchOrder(true)}
            disabled={refreshing}
            aria-label="Refresh order status"
          >
            <span className={refreshing ? "is-spinning" : ""}>↻</span>
            {refreshing ? "Refreshing" : "Refresh"}
          </button>
        </div>

        <div className="tracking-layout">
          <section className="tracking-main-card">
            <div className="tracking-order-top">
              <div>
                <span className="tracking-card-eyebrow">
                  ORDER NUMBER
                </span>
                <h2>{orderNumber}</h2>
                <p>Placed {formatDate(order.created_at)}</p>
              </div>

              <span
                className={`tracking-status-badge ${
                  isCancelled ? "is-cancelled" : ""
                }`}
              >
                <span />
                {formatStatus(status)}
              </span>
            </div>

            <div className="tracking-divider" />

            {isCancelled ? (
              <div className="tracking-cancelled-panel">
                <span className="tracking-cancelled-icon">×</span>
                <div>
                  <h3>This order has been cancelled</h3>
                  <p>
                    This order will no longer move through the preparation
                    or fulfilment stages. If you need help, please contact
                    the ChopHub team.
                  </p>
                </div>
              </div>
            ) : (
              <div className="tracking-estimate">
                <div className="tracking-estimate-icon">
                  <span aria-hidden="true">
                    {isPickup ? "⌖" : "◷"}
                  </span>
                </div>

                <div>
                  <span>
                    {isPickup
                      ? "FULFILMENT METHOD"
                      : "DELIVERY PROGRESS"}
                  </span>
                  <h3>
                     {isPickup
                      ? status === "ready_for_pickup"
                        ? "Ready for collection"
                        : "Restaurant pickup"
                      : status === "out_for_delivery"
                        ? "On its way"
                        : "Being prepared"}
                  </h3>
                  <p>
                    {isPickup
                      ? "We'll update this page when your order is ready for collection."
                      : "We'll update this page as your order moves through preparation and delivery."}
                  </p>
                </div>
              </div>
            )}

            <div className="tracking-divider" />

            <div className="tracking-timeline-heading">
              <div>
                <span className="tracking-card-eyebrow">
                  ORDER PROGRESS
                </span>
                <h2>Here's where things stand.</h2>
              </div>
            </div>

            {isCancelled ? (
              <p className="tracking-cancelled-caption">
                Tracking progress stopped because this order was cancelled.
              </p>
            ) : (
              <OrderProgress status={status} isPickup={isPickup} />
            )}

            <div className="tracking-help">
              <div>
                <h3>Need a little help?</h3>
                <p>
                  Have a question about your order? Get in touch
                  with the ChopHub team.
                </p>
              </div>

              <Link to="/#contact" className="tracking-help-link">
                Contact us <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </section>

          <aside className="tracking-sidebar">
            <section className="tracking-side-card">
              <div className="tracking-side-heading">
                <h2>Order summary</h2>
                <span>
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="tracking-food-list">
                {items.map((item) => (
                  <div className="tracking-food-item" key={item.id}>
                    <div className="tracking-food-quantity">
                      {item.quantity}×
                    </div>

                    <div className="tracking-food-info">
                      <h3>{item.item_name}</h3>
                      <p>
                        {getItemDescription(item) ||
                          `Unit price: ${formatPrice(item.unit_price)}`}
                      </p>
                    </div>

                    <strong>
                      {formatPrice(
                        item.line_total ??
                          Number(item.unit_price || 0) *
                            Number(item.quantity || 0)
                      )}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="tracking-divider" />

              <div className="tracking-price-row">
                <span>Subtotal</span>
                <strong>{formatPrice(order.subtotal)}</strong>
              </div>

              {order.order_type === "delivery" && (
                <div className="tracking-price-row">
                  <span>Delivery fee</span>
                  <strong>{formatPrice(order.delivery_fee)}</strong>
                </div>
              )}

              <div className="tracking-divider" />

              <div className="tracking-total-row">
                <span>Total</span>
                <strong>{formatPrice(order.total)}</strong>
              </div>

              <div className="tracking-payment-row">
                <span>Payment</span>
                <span
                  className={`tracking-payment-status ${
                    paymentStatus === "paid" ? "is-paid" : "is-unpaid"
                  }`}
                >
                  {paymentStatus === "paid" ? "Paid" : paymentStatus}
                </span>
              </div>
            </section>

            <section className="tracking-side-card">
              <div className="tracking-side-heading">
                <h2>
                  {isPickup ? "Pickup details" : "Delivery details"}
                </h2>
              </div>

              <div className="tracking-detail-block">
                <span>FULFILMENT METHOD</span>
                <strong>{isPickup ? "Restaurant pickup" : "Home delivery"}</strong>
              </div>

              <div className="tracking-detail-block">
                <span>CUSTOMER</span>
                <strong>{order.customer_name || "Customer"}</strong>
                {order.customer_phone && <p>{order.customer_phone}</p>}
              </div>

              {isPickup ? (
                <div className="tracking-detail-block">
                  <span>PICKUP LOCATION</span>
                  <strong>ChopHub — Ikeja</strong>
                  <p>{CHOPHUB_LOCATION}</p>
                </div>
              ) : (
                <div className="tracking-detail-block">
                  <span>DELIVERY ADDRESS</span>
                  <strong>{deliveryAddress || "Address not available"}</strong>
                </div>
              )}

              {order.order_notes && (
                <div className="tracking-detail-block">
                  <span>ORDER NOTES</span>
                  <p>{order.order_notes}</p>
                </div>
              )}
            </section>

            <section className="tracking-side-card tracking-map-card">
              <div className="tracking-side-heading">
                <h2>{isPickup ? "Pickup location" : "Delivery route"}</h2>
                <span>Map</span>
              </div>

              <div className="tracking-map-frame">
                <iframe
                  title={
                    isPickup
                      ? "ChopHub pickup location map"
                      : "ChopHub delivery route map"
                  }
                  src={mapEmbedUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>

              <p className="tracking-map-caption">
                {isPickup
                  ? "This is the simulated ChopHub pickup location for this project."
                  : "Route from the simulated ChopHub restaurant location to your delivery address. This is not live driver tracking."}
              </p>

              <a
                href={mapDirectionsUrl}
                target="_blank"
                rel="noreferrer"
                className="tracking-map-link"
              >
                {isPickup ? "Open pickup location" : "Open route in Google Maps"}
                <span aria-hidden="true">↗</span>
              </a>
            </section>

            <div className="tracking-sidebar-note">
              <span aria-hidden="true">✦</span>
              <p>
                Freshly prepared. Thoughtfully served.
                Thanks for choosing ChopHub.
              </p>
            </div>
          </aside>
        </div>

        <footer className="tracking-footer">
          <span>© {new Date().getFullYear()} ChopHub.</span>
          <span>Made with care, served with flavour.</span>
          <Link to="/">Return home</Link>
        </footer>
      </div>
    </main>
  );
}

export default OrderTracking;
