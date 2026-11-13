
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../components/AuthContext";
import "./OrderConfirmation.css";

const API_URL = "http://localhost:5000/api";

function formatPrice(amount) {
  return `₦${Number(amount || 0).toLocaleString("en-NG")}`;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12.5L10 17L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function OrderConfirmation() {
  const location = useLocation();
  const { session } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const searchParams = new URLSearchParams(location.search);
  const reference =
    searchParams.get("reference") || searchParams.get("trxref");

  useEffect(() => {
    let cancelled = false;

    async function verifyPayment() {
      if (!reference) {
        setError("No payment reference was found. We cannot confirm this order.");
        setLoading(false);
        return;
      }

      if (!session?.access_token) {
        setError(
          "Your login session could not be found. Please log in again to verify your payment."
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/orders/verify-payment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ reference }),
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "We could not verify your payment."
          );
        }

        const verifiedOrder = result.order;

        if (!verifiedOrder) {
          throw new Error(
            "Payment was verified, but order details were not returned."
          );
        }

        if (verifiedOrder.payment_status !== "paid") {
          throw new Error(
            "Your payment has not been confirmed yet. Please contact support if money was deducted."
          );
        }

        if (!verifiedOrder.id) {
          throw new Error(
            "Payment was verified, but the order ID was not returned."
          );
        }

        if (cancelled) return;

        const address = verifiedOrder.delivery_address;

        setOrder({
          ...verifiedOrder,

          items: (verifiedOrder.order_items || []).map((item) => ({
            ...item,
            name:
              item.name ||
              item.meal_name ||
              item.item_name ||
              item.product_name ||
              "ChopHub meal",
            image: item.image || item.image_url || "",
            price: Number(
              item.unit_price ?? item.price ?? item.item_price ?? 0
            ),
            quantity: Number(item.quantity || 1),
            size: item.size || item.selected_size || "",
            extras: item.extras || item.selected_extras || [],
          })),

          fulfillmentType: verifiedOrder.order_type,
          reference,
          subtotal: verifiedOrder.subtotal,
          deliveryFee: verifiedOrder.delivery_fee,
          total: verifiedOrder.total,
          paymentStatus: verifiedOrder.payment_status,
          paymentMethod: "Paystack",
          createdAt: verifiedOrder.created_at,

          customer: {
            name: verifiedOrder.customer_name || "",
            phone: verifiedOrder.customer_phone || "",
            email:
              verifiedOrder.customer_email ||
              session.user?.email ||
              "",
          },

          delivery:
            typeof address === "object" && address !== null
              ? address
              : {
                  address: address || "",
                },
        });
      } catch (err) {
        console.error("Payment verification error:", err);

        if (!cancelled) {
          setError(
            err.message ||
              "Something went wrong while confirming your payment."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [reference, session?.access_token, session?.user?.email]);

  if (loading) {
    return (
      <main className="order-confirmation-page">
        <div className="confirmation-empty">
          <div className="confirmation-empty-icon">...</div>

          <span className="confirmation-eyebrow">
            PAYMENT VERIFICATION
          </span>

          <h1>Confirming your payment</h1>

          <p>
            Please wait while we securely verify your payment
            with Paystack. Do not close this page.
          </p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="order-confirmation-page">
        <div className="confirmation-empty">
          <div className="confirmation-empty-icon">?</div>

          <span className="confirmation-eyebrow">
            ORDER INFORMATION
          </span>

          <h1>We couldn't confirm your order</h1>

          <p>
            {error ||
              "We couldn't retrieve your order details. Please check your account or contact our support team."}
          </p>

          <Link to="/account" className="confirmation-primary-button">
            VIEW MY ACCOUNT
            <span aria-hidden="true">↗</span>
          </Link>

          <Link to="/" className="confirmation-back-home">
            Return to homepage
          </Link>
        </div>
      </main>
    );
  }

  const items = order.items || [];
  const isPickup = order.fulfillmentType === "pickup";
  const orderNumber = order.order_number || order.id;

  const trackingUrl = `/track-order?orderId=${encodeURIComponent(
    order.id
  )}`;

  return (
    <main className="order-confirmation-page">
      <div className="confirmation-container">

        <header className="confirmation-brand">
          <Link to="/" className="confirmation-logo">
            <svg
              viewBox="0 0 52 52"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
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

            <span>
              Chop<span>Hub</span>
            </span>
          </Link>
        </header>

        <section className="confirmation-hero">
          <div className="confirmation-success-icon">
            <CheckIcon />
          </div>

          <span className="confirmation-eyebrow">
            THANK YOU FOR CHOOSING CHOPHUB
          </span>

          <h1>
            Your order has been
            <span> received.</span>
          </h1>

          <p>
            Your payment has been verified successfully.
            We've received your order and will keep you
            updated on its progress.
          </p>

          <div className="confirmation-reference">
            <span>ORDER NUMBER</span>
            <strong>{orderNumber}</strong>
          </div>

          <div className="confirmation-reference">
            <span>PAYMENT REFERENCE</span>
            <strong>{order.reference}</strong>
          </div>
        </section>

        <div className="confirmation-grid">

          <section className="confirmation-card confirmation-order-card">
            <div className="confirmation-card-heading">
              <div>
                <span className="confirmation-eyebrow">YOUR ORDER</span>
                <h2>Order summary</h2>
              </div>

              <span className="confirmation-item-count">
                {items.length} {items.length === 1 ? "ITEM" : "ITEMS"}
              </span>
            </div>

            <div className="confirmation-items">
              {items.map((item, index) => (
                <div
                  className="confirmation-item"
                  key={item.cartKey || item.id || index}
                >
                  <div className="confirmation-item-image">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <span>CH</span>
                    )}
                  </div>

                  <div className="confirmation-item-info">
                    <h3>{item.name}</h3>

                    {item.size && (
                      <span>Size: {item.size}</span>
                    )}

                    {item.extras?.length > 0 && (
                      <span>
                        Extras: {item.extras.map((extra) =>
                          typeof extra === "string"
                            ? extra
                            : extra.name
                        ).join(", ")}
                      </span>
                    )}

                    <span>Quantity: {item.quantity}</span>
                  </div>

                  <strong>
                    {formatPrice(item.price * item.quantity)}
                  </strong>
                </div>
              ))}
            </div>

            <div className="confirmation-totals">
              <div>
                <span>Subtotal</span>
                <strong>{formatPrice(order.subtotal)}</strong>
              </div>

              <div>
                <span>Delivery fee</span>
                <strong>
                  {isPickup
                    ? "₦0"
                    : order.deliveryFee != null
                      ? formatPrice(order.deliveryFee)
                      : "To be confirmed"}
                </strong>
              </div>

              <div className="confirmation-grand-total">
                <span>Total</span>
                <strong>{formatPrice(order.total)}</strong>
              </div>
            </div>
          </section>

          <aside className="confirmation-side">

            <section className="confirmation-card">
              <span className="confirmation-eyebrow">
                ORDER STATUS
              </span>

              <h2>Payment information</h2>

              <div className="confirmation-detail-row">
                <span>Payment status</span>
                <strong className="confirmation-status">
                  Paid
                </strong>
              </div>

              <div className="confirmation-detail-row">
                <span>Payment method</span>
                <strong>Paystack</strong>
              </div>

              <div className="confirmation-detail-row">
                <span>Order date</span>
                <strong>
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString(
                        "en-NG",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "Confirmed"}
                </strong>
              </div>
            </section>

            <section className="confirmation-card">
              <span className="confirmation-eyebrow">
                FULFILMENT DETAILS
              </span>

              <h2>
                {isPickup ? "Pickup information" : "Delivery information"}
              </h2>

              <div className="confirmation-detail-row">
                <span>Fulfilment type</span>
                <strong>{isPickup ? "Pickup" : "Delivery"}</strong>
              </div>

              <div className="confirmation-customer">
                <span>Customer</span>
                <strong>{order.customer?.name || "Not provided"}</strong>
                <span>{order.customer?.phone || ""}</span>
                <span>{order.customer?.email || ""}</span>
              </div>

              {!isPickup && (
                <div className="confirmation-customer">
                  <span>Delivery address</span>
                  <strong>
                    {order.delivery?.address || "Not provided"}
                  </strong>

                  {order.delivery?.area && (
                    <span>{order.delivery.area}</span>
                  )}

                  {order.delivery?.landmark && (
                    <span>
                      Landmark: {order.delivery.landmark}
                    </span>
                  )}
                </div>
              )}

              {isPickup && (
                <p className="confirmation-note">
                  Pickup instructions and collection details will
                  be provided when your order is ready.
                </p>
              )}
            </section>

            {order.estimatedTime && (
              <section className="confirmation-estimate">
                <span>ESTIMATED TIME</span>
                <strong>{order.estimatedTime}</strong>
              </section>
            )}

          </aside>
        </div>

        <section className="confirmation-bottom">
          <h2>Thank you for dining with us.</h2>
          <p>
            Good food brings us together. We look forward to
            serving you again.
          </p>

          <div className="confirmation-actions">
            <Link
              to={trackingUrl}
              className="confirmation-primary-button"
            >
              TRACK MY ORDER
              <span aria-hidden="true">↗</span>
            </Link>

            <Link
              to="/"
              className="confirmation-back-home"
            >
              BACK TO HOMEPAGE
            </Link>
          </div>
        </section>

        <footer className="confirmation-footer">
          <span>© {new Date().getFullYear()} ChopHub.</span>
          <span>Built for the love of good food.</span>
        </footer>

      </div>
    </main>
  );
}

export default OrderConfirmation;
