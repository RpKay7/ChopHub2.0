
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../components/AuthContext";
import "./OrderReview.css";

const API_URL = "http://localhost:5000/api";

function formatPrice(price) {
  return `₦${Number(price || 0).toLocaleString("en-NG")}`;
}

function OrderReview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useAuth();

  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const reviewData = useMemo(() => {
    if (location.state?.order) {
      return location.state;
    }

    try {
      const saved = sessionStorage.getItem("chophub-order-review");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, [location.state]);

  const order = reviewData?.order;
  const details = reviewData?.details;

  useEffect(() => {
    if (!order || !details) {
      navigate("/checkout", { replace: true });
    }
  }, [order, details, navigate]);

  const handlePayment = async () => {
    if (isPaying) return;

    setPaymentError("");

    if (!session?.access_token) {
      navigate("/login", {
        replace: true,
        state: { from: "/order-review" },
      });
      return;
    }

    if (!order?.id) {
      setPaymentError(
        "We couldn't identify this order. Please return to checkout and try again."
      );
      return;
    }

    try {
      setIsPaying(true);

      const response = await fetch(
        `${API_URL}/orders/${order.id}/payment`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to initialize payment. Please try again."
        );
      }

      if (!result.authorization_url) {
        throw new Error(
          "Payment was initialized, but the checkout link was not returned."
        );
      }

      window.location.assign(result.authorization_url);
    } catch (error) {
      console.error("Payment initialization error:", error);

      setPaymentError(
        error.message || "Something went wrong. Please try again."
      );

      setIsPaying(false);
    }
  };

  if (!order || !details) {
    return null;
  }

  const items = Array.isArray(details.items) ? details.items : [];
  const isDelivery = details.order_type === "delivery";

  return (
    <main className="order-review-page">
      <header className="order-review-header">
        <Link to="/" className="order-review-brand">
          <svg
            className="order-review-brand-mark"
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

        <span className="order-review-secure">
          <span className="order-review-secure-dot" />
          ORDER REVIEW
        </span>
      </header>

      <section className="order-review-intro">
        <span className="order-review-eyebrow">
          ONE LAST LOOK
        </span>

        <h1>
          Review your <span>order.</span>
        </h1>

        <p>
          Check that everything is correct before proceeding to payment.
        </p>
      </section>

      <div className="order-review-container">
        <div className="order-review-main">
          <section className="order-review-card">
            <div className="order-review-card-heading">
              <div>
                <span className="order-review-step">01</span>
                <h2>Order information</h2>
              </div>

              <span className="order-review-status">
                Awaiting payment
              </span>
            </div>

            <div className="order-review-information">
              <div>
                <span>Order number</span>
                <strong>#{order.order_number}</strong>
              </div>

              <div>
                <span>Order date</span>
                <strong>
                  {order.created_at
                    ? new Date(order.created_at).toLocaleString("en-NG", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "Just now"}
                </strong>
              </div>

              <div>
                <span>Fulfilment</span>
                <strong>
                  {isDelivery ? "Home delivery" : "Pickup"}
                </strong>
              </div>

              <div>
                <span>Payment status</span>
                <strong className="order-review-unpaid">
                  {order.payment_status || "Unpaid"}
                </strong>
              </div>
            </div>
          </section>

          <section className="order-review-card">
            <div className="order-review-card-heading">
              <div>
                <span className="order-review-step">02</span>
                <h2>Your meals</h2>
              </div>

              <span className="order-review-count">
                {items.reduce(
                  (total, item) => total + Number(item.quantity || 0),
                  0
                )} items
              </span>
            </div>

            <div className="order-review-items">
              {items.map((item, index) => (
                <article
                  className="order-review-item"
                  key={`${item.cartKey || item.dbId}-${index}`}
                >
                  <div className="order-review-item-image">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <span>CH</span>
                    )}
                  </div>

                  <div className="order-review-item-details">
                    <h3>{item.name}</h3>

                    <span>
                      Quantity: {item.quantity}
                    </span>

                    {item.size && (
                      <span>Size: {item.size}</span>
                    )}

                    {item.extras?.length > 0 && (
                      <span>
                        Extras:{" "}
                        {item.extras
                          .map((extra) => extra.name)
                          .join(", ")}
                      </span>
                    )}

                    {item.instructions && (
                      <span>
                        Special request: {item.instructions}
                      </span>
                    )}
                  </div>

                  <strong>
                    {formatPrice(item.price * item.quantity)}
                  </strong>
                </article>
              ))}
            </div>
          </section>

          <section className="order-review-card">
            <div className="order-review-card-heading">
              <div>
                <span className="order-review-step">03</span>
                <h2>
                  {isDelivery
                    ? "Delivery information"
                    : "Pickup information"}
                </h2>
              </div>
            </div>

            <div className="order-review-information">
              <div>
                <span>Customer name</span>
                <strong>{details.customer_name}</strong>
              </div>

              <div>
                <span>Phone number</span>
                <strong>{details.customer_phone}</strong>
              </div>

              {isDelivery && (
                <div className="order-review-full-width">
                  <span>Delivery address</span>
                  <strong>{details.delivery_address}</strong>
                </div>
              )}

              {!isDelivery && (
                <div className="order-review-full-width">
                  <span>Collection method</span>
                  <strong>
                    Collect your order from the restaurant.
                  </strong>
                </div>
              )}

              {details.order_notes && (
                <div className="order-review-full-width">
                  <span>Order notes</span>
                  <strong>{details.order_notes}</strong>
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="order-review-summary">
          <span className="order-review-eyebrow">
            PAYMENT SUMMARY
          </span>

          <h2>Your total</h2>

          <div className="order-review-calculation">
            <span>Meals subtotal</span>
            <strong>{formatPrice(order.subtotal)}</strong>
          </div>

          <div className="order-review-calculation">
            <span>Delivery fee</span>
            <strong>{formatPrice(order.delivery_fee)}</strong>
          </div>

          <div className="order-review-total">
            <span>Total payable</span>
            <strong>{formatPrice(order.total)}</strong>
          </div>

          <p className="order-review-payment-note">
            Your order has been saved. Payment is required before
            the restaurant can begin processing it.
          </p>

          {paymentError && (
            <p
              className="order-review-coming-soon"
              role="alert"
            >
              {paymentError}
            </p>
          )}

          <button
            type="button"
            className="order-review-pay-button"
            onClick={handlePayment}
            disabled={isPaying}
          >
            {isPaying ? "Connecting to Paystack..." : "Pay securely with Paystack"}
            {!isPaying && <span>→</span>}
          </button>

          <p className="order-review-coming-soon">
            {isPaying
              ? "Please wait while we prepare your secure checkout."
              : "You will be redirected to Paystack's secure payment page."}
          </p>

          <Link to="/#menu" className="order-review-back">
            ← Back to menu
          </Link>
        </aside>
      </div>

      <footer className="order-review-footer">
        <span>© {new Date().getFullYear()} ChopHub</span>
        <span>Built around good food and good company.</span>

        <div>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </div>
      </footer>
    </main>
  );
}

export default OrderReview;
