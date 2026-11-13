
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../components/CartContext";
import { useAuth } from "../components/AuthContext";
import "./Checkout.css";

const API_URL = "http://localhost:5000/api";
const SETTINGS_KEY = "chophub-admin-settings";
const REVIEW_STORAGE_KEY = "chophub-order-review";

const DEFAULT_DELIVERY_LGAS = [
  { name: "Agege", fee: "1500", enabled: true },
  { name: "Ajeromi-Ifelodun", fee: "2500", enabled: true },
  { name: "Alimosho", fee: "2000", enabled: true },
  { name: "Amuwo-Odofin", fee: "2500", enabled: true },
  { name: "Apapa", fee: "2500", enabled: true },
  { name: "Badagry", fee: "5000", enabled: true },
  { name: "Epe", fee: "5000", enabled: true },
  { name: "Eti-Osa", fee: "3500", enabled: true },
  { name: "Ibeju-Lekki", fee: "5000", enabled: true },
  { name: "Ifako-Ijaiye", fee: "1500", enabled: true },
  { name: "Ikeja", fee: "1500", enabled: true },
  { name: "Ikorodu", fee: "3500", enabled: true },
  { name: "Kosofe", fee: "2000", enabled: true },
  { name: "Lagos Island", fee: "3500", enabled: true },
  { name: "Lagos Mainland", fee: "2000", enabled: true },
  { name: "Mushin", fee: "1500", enabled: true },
  { name: "Ojo", fee: "3500", enabled: true },
  { name: "Oshodi-Isolo", fee: "1500", enabled: true },
  { name: "Shomolu", fee: "2000", enabled: true },
  { name: "Surulere", fee: "1500", enabled: true },
];

const DEFAULT_SETTINGS = {
  deliveryEnabled: true,
  pickupEnabled: true,
  estimatedDelivery: "30–60 minutes",
  deliveryLGAs: DEFAULT_DELIVERY_LGAS,
};

function getRestaurantSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);

    if (!saved) return DEFAULT_SETTINGS;

    const parsed = JSON.parse(saved);
    const delivery = parsed?.delivery ?? {};

    return {
      deliveryEnabled:
        typeof delivery.deliveryEnabled === "boolean"
          ? delivery.deliveryEnabled
          : DEFAULT_SETTINGS.deliveryEnabled,

      pickupEnabled:
        typeof delivery.pickupEnabled === "boolean"
          ? delivery.pickupEnabled
          : DEFAULT_SETTINGS.pickupEnabled,

      estimatedDelivery:
        delivery.estimatedDelivery ||
        DEFAULT_SETTINGS.estimatedDelivery,

      deliveryLGAs: Array.isArray(delivery.deliveryLGAs)
        ? delivery.deliveryLGAs
        : DEFAULT_SETTINGS.deliveryLGAs,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function ChopHubLogo() {
  return (
    <Link to="/" className="checkout-brand" aria-label="ChopHub home">
      <svg
        className="checkout-brand-mark"
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

      <span className="checkout-brand-name">
        Chop<span>Hub</span>
      </span>
    </Link>
  );
}

function formatPrice(price) {
  return `₦${Number(price || 0).toLocaleString("en-NG")}`;
}

function isValidNigerianPhone(phone) {
  const digits = phone.replace(/\D/g, "");

  return (
    /^0[789][01]\d{8}$/.test(digits) ||
    /^234[789][01]\d{8}$/.test(digits)
  );
}

function isLagosState(state) {
  const normalized = state
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\s+state$/, "");

  return normalized === "lagos";
}

function Checkout() {
  const navigate = useNavigate();

  const { cartItems } = useCart();
  const { user, session } = useAuth();

  const [fulfilment, setFulfilment] = useState("delivery");

  const [customer, setCustomer] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    state: "",
    address: "",
    area: "",
    landmark: "",
    instructions: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("error");

  useEffect(() => {
    if (!user) return;

    setCustomer((previous) => ({
      ...previous,
      fullName: user.fullName || previous.fullName,
      email: user.email || previous.email,
      phone: user.phone || previous.phone,
    }));
  }, [user]);

  const settings = useMemo(
    () => getRestaurantSettings(),
    []
  );

  const cartItemList = Array.isArray(cartItems)
    ? cartItems
    : [];

  const isCartEmpty = cartItemList.length === 0;

  const validCartItems = useMemo(
    () =>
      cartItemList.filter((item) => {
        return (
          item &&
          typeof item.cartKey === "string" &&
          item.cartKey.length > 0 &&
          typeof item.name === "string" &&
          item.name.trim().length > 0 &&
          Number.isFinite(Number(item.price)) &&
          Number(item.price) > 0 &&
          Number.isInteger(Number(item.quantity)) &&
          Number(item.quantity) > 0
        );
      }),
    [cartItemList]
  );

  const hasInvalidCartItems =
    validCartItems.length !== cartItemList.length;

  const subtotal = useMemo(
    () =>
      validCartItems.reduce(
        (total, item) =>
          total + Number(item.price) * Number(item.quantity),
        0
      ),
    [validCartItems]
  );

  const safeItemCount = useMemo(
    () =>
      validCartItems.reduce(
        (total, item) => total + Number(item.quantity),
        0
      ),
    [validCartItems]
  );

  const isLagos = isLagosState(customer.state);

  const deliveryLGAs = Array.isArray(settings.deliveryLGAs)
    ? settings.deliveryLGAs
    : [];

  const availableLGAs = deliveryLGAs.filter(
    (lga) =>
      lga &&
      typeof lga.name === "string" &&
      lga.name.trim() &&
      lga.enabled === true &&
      Number.isFinite(Number(lga.fee)) &&
      Number(lga.fee) >= 0
  );

  const selectedLGA = availableLGAs.find(
    (lga) =>
      lga.name.trim().toLowerCase() ===
      customer.area.trim().toLowerCase()
  );

  const deliveryFee =
    fulfilment === "delivery" && selectedLGA
      ? Number(selectedLGA.fee)
      : 0;

  const orderTotal = subtotal + deliveryFee;

  const handleCustomerChange = (event) => {
    const { name, value } = event.target;

    setCustomer((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "state"
        ? { area: "", address: "", landmark: "" }
        : {}),
    }));

    setFeedback("");
  };

  const handleFulfilmentChange = (value) => {
    setFulfilment(value);
    setFeedback("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting || createdOrder) return;

    setFeedback("");
    setFeedbackType("error");

    if (!user) {
      setFeedback("Please sign in before continuing with your order.");
      return;
    }

    if (!session?.access_token) {
      setFeedback(
        "Your login session is missing or expired. Please sign in again."
      );
      return;
    }

    if (isCartEmpty) {
      setFeedback(
        "Your cart is empty. Please add meals before continuing."
      );
      return;
    }

    if (hasInvalidCartItems || validCartItems.length === 0) {
      setFeedback(
        "Some items in your cart have invalid details. Please review your cart."
      );
      return;
    }

    if (
      fulfilment === "delivery" &&
      !settings.deliveryEnabled
    ) {
      setFeedback(
        "Delivery is currently unavailable. Please select pickup."
      );
      return;
    }

    if (
      fulfilment === "pickup" &&
      !settings.pickupEnabled
    ) {
      setFeedback(
        "Pickup is currently unavailable. Please select delivery."
      );
      return;
    }

    const fullName = customer.fullName.trim();
    const email = customer.email.trim();
    const phone = customer.phone.trim();

    if (fullName.length < 2) {
      setFeedback("Please enter your full name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFeedback("Please enter a valid email address.");
      return;
    }

    if (!isValidNigerianPhone(phone)) {
      setFeedback(
        "Please enter a valid Nigerian phone number, such as 08012345678 or +2348012345678."
      );
      return;
    }

    if (fulfilment === "delivery") {
      if (!customer.state.trim()) {
        setFeedback("Please enter your delivery state.");
        return;
      }

      if (!isLagos) {
        setFeedback(
          "Sorry, ChopHub currently delivers within Lagos State only. Please enter a Lagos delivery address or choose pickup."
        );
        return;
      }

      if (!customer.area.trim()) {
        setFeedback("Please select your Local Government Area.");
        return;
      }

      if (!selectedLGA) {
        setFeedback(
          "Sorry, delivery is not currently available in this LGA. Please select another available LGA or choose pickup."
        );
        return;
      }

      if (customer.address.trim().length < 5) {
        setFeedback(
          "Please enter your exact delivery location, including your street, estate or community."
        );
        return;
      }
    }

    const itemsHaveDatabaseIds = validCartItems.every(
      (item) =>
        typeof item.dbId === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          item.dbId
        )
    );

    if (!itemsHaveDatabaseIds) {
      setFeedback(
        "One or more meals are missing their database details. Please remove those meals and add them again from the menu."
      );
      return;
    }

    const deliveryAddress =
      fulfilment === "delivery"
        ? [
            customer.address.trim(),
            customer.area.trim(),
            customer.state.trim(),
            customer.landmark.trim()
              ? `Near ${customer.landmark.trim()}`
              : "",
          ]
            .filter(Boolean)
            .join(", ")
        : null;

    const payload = {
      customer_name: fullName,
      customer_phone: phone,
      order_type: fulfilment,
      delivery_address: deliveryAddress,
      order_notes: customer.instructions.trim() || null,
      delivery_fee: fulfilment === "delivery" ? deliveryFee : 0,
      items: validCartItems.map((item) => ({
        dbId: item.dbId,
        quantity: Number(item.quantity),
        size: item.size || null,
        extras: Array.isArray(item.extras)
          ? item.extras.map((extra) => ({
              name: extra.name,
            }))
          : [],
        instructions: item.instructions || "",
      })),
    };

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success || !result.order) {
        throw new Error(
          result.message ||
            "We couldn't create your order. Please try again."
        );
      }

      const reviewDetails = {
        customer_name: fullName,
        customer_email: email,
        customer_phone: phone,
        order_type: fulfilment,
        delivery_address: deliveryAddress,
        order_notes: customer.instructions.trim() || null,

        items: validCartItems.map((item) => ({
          cartKey: item.cartKey,
          dbId: item.dbId,
          name: item.name,
          image: item.image || "",
          price: Number(item.price),
          quantity: Number(item.quantity),
          size: item.size || null,
          extras: Array.isArray(item.extras)
            ? item.extras.map((extra) => ({
                name: extra.name,
                price: Number(extra.price || 0),
              }))
            : [],
          instructions: item.instructions || "",
        })),
      };

      const reviewData = {
        order: result.order,
        details: reviewDetails,
      };

      // Keep the review available if the customer refreshes the page.
      sessionStorage.setItem(
        REVIEW_STORAGE_KEY,
        JSON.stringify(reviewData)
      );

      setCreatedOrder(result.order);

      // Move directly to the review page after successful order creation.
      navigate("/order-review", {
        replace: false,
        state: reviewData,
      });
    } catch (error) {
      console.error("Checkout order creation error:", error);

      setFeedbackType("error");
      setFeedback(
        error.message ||
          "Something went wrong while creating your order. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCartEmpty) {
    return (
      <main className="checkout-page">
        <header className="checkout-header">
          <ChopHubLogo />

          <Link to="/" className="checkout-back-link">
            ← Back to menu
          </Link>
        </header>

        <section className="checkout-empty">
          <span className="checkout-eyebrow">YOUR ORDER</span>

          <h1>Your table is still waiting.</h1>

          <p>
            There are no meals in your order yet.
            Explore the menu and find something delicious.
          </p>

          <Link to="/#menu" className="checkout-primary-button">
            Explore the menu →
          </Link>
        </section>

        <footer className="checkout-footer">
          © {new Date().getFullYear()} ChopHub
        </footer>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <header className="checkout-header">
        <ChopHubLogo />

        <div className="checkout-header-right">
          <span className="checkout-secure-label">
            <span className="checkout-secure-dot" />
            ORDER CHECKOUT
          </span>

          <Link to="/#menu" className="checkout-back-link">
            Continue exploring
          </Link>
        </div>
      </header>

      <section className="checkout-intro">
        <span className="checkout-eyebrow">
          ALMOST AT THE TABLE
        </span>

        <h1>
          Complete your <span>order.</span>
        </h1>

        <p>
          A few details, and we'll have everything ready for you.
        </p>
      </section>

      <form
        className="checkout-layout"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="checkout-main">
          <section className="checkout-section">
            <div className="checkout-section-heading">
              <span className="checkout-step-number">01</span>

              <div>
                <h2>How would you like your order?</h2>
                <p>Choose delivery or pickup.</p>
              </div>
            </div>

            <div className="checkout-fulfilment-options">
              <button
                type="button"
                className={`checkout-fulfilment-card ${
                  fulfilment === "delivery" ? "active" : ""
                }`}
                onClick={() => handleFulfilmentChange("delivery")}
                aria-pressed={fulfilment === "delivery"}
                disabled={
                  !settings.deliveryEnabled ||
                  isSubmitting ||
                  Boolean(createdOrder)
                }
              >
                <span className="checkout-option-icon">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M3 6h11v12H3zM14 10h4l3 4v4h-7z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="7.5"
                      cy="18"
                      r="2"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <circle
                      cx="17.5"
                      cy="18"
                      r="2"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                  </svg>
                </span>

                <span className="checkout-option-copy">
                  <strong>Delivery</strong>
                  <small>
                    {settings.deliveryEnabled
                      ? "Lagos State only"
                      : "Currently unavailable"}
                  </small>
                </span>

                <span className="checkout-radio" />
              </button>

              <button
                type="button"
                className={`checkout-fulfilment-card ${
                  fulfilment === "pickup" ? "active" : ""
                }`}
                onClick={() => handleFulfilmentChange("pickup")}
                aria-pressed={fulfilment === "pickup"}
                disabled={
                  !settings.pickupEnabled ||
                  isSubmitting ||
                  Boolean(createdOrder)
                }
              >
                <span className="checkout-option-icon">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M3 10h18l-1.5 10h-15L3 10Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5 10l2-6h10l2 6M9 14v2M15 14v2"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>

                <span className="checkout-option-copy">
                  <strong>Pickup</strong>
                  <small>
                    {settings.pickupEnabled
                      ? "I'll collect my order"
                      : "Currently unavailable"}
                  </small>
                </span>

                <span className="checkout-radio" />
              </button>
            </div>

            {!settings.deliveryEnabled && !settings.pickupEnabled && (
              <p className="checkout-feedback" role="alert">
                Online ordering is currently unavailable.
              </p>
            )}
          </section>

          <section className="checkout-section">
            <div className="checkout-section-heading">
              <span className="checkout-step-number">02</span>

              <div>
                <h2>Your details</h2>
                <p>Tell us who we're preparing this order for.</p>
              </div>
            </div>

            <div className="checkout-fields-grid">
              <div className="checkout-field checkout-field-full">
                <label htmlFor="checkout-name">Full name</label>

                <input
                  id="checkout-name"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  autoComplete="name"
                  value={customer.fullName}
                  onChange={handleCustomerChange}
                  required
                  disabled={Boolean(createdOrder)}
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="checkout-email">Email address</label>

                <input
                  id="checkout-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={customer.email}
                  onChange={handleCustomerChange}
                  required
                  disabled={Boolean(createdOrder)}
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="checkout-phone">Phone number</label>

                <input
                  id="checkout-phone"
                  name="phone"
                  type="tel"
                  placeholder="e.g. 08012345678"
                  autoComplete="tel"
                  value={customer.phone}
                  onChange={handleCustomerChange}
                  required
                  disabled={Boolean(createdOrder)}
                />
              </div>
            </div>
          </section>

          {fulfilment === "delivery" && (
            <section className="checkout-section">
              <div className="checkout-section-heading">
                <span className="checkout-step-number">03</span>

                <div>
                  <h2>Where should we deliver?</h2>
                  <p>
                    ChopHub currently delivers within Lagos State only.
                  </p>
                </div>
              </div>

              <div className="checkout-fields-grid">
                <div className="checkout-field checkout-field-full">
                  <label htmlFor="checkout-state">State</label>

                  <input
                    id="checkout-state"
                    name="state"
                    type="text"
                    placeholder="Enter your state (e.g. Lagos State)"
                    autoComplete="address-level1"
                    value={customer.state}
                    onChange={handleCustomerChange}
                    required
                    disabled={Boolean(createdOrder)}
                  />

                  {customer.state.trim() && !isLagos && (
                    <p className="checkout-feedback" role="alert">
                      Sorry, ChopHub currently delivers within Lagos
                      State only. Delivery to other states is not
                      available yet.
                    </p>
                  )}
                </div>

                {isLagos && (
                  <>
                    <div className="checkout-field checkout-field-full">
                      <label htmlFor="checkout-area">
                        Local Government Area (LGA)
                      </label>

                      <select
                        id="checkout-area"
                        name="area"
                        value={customer.area}
                        onChange={handleCustomerChange}
                        required
                        disabled={Boolean(createdOrder)}
                      >
                        <option value="">
                          Select your LGA
                        </option>

                        {availableLGAs.map((lga) => (
                          <option
                            key={lga.name}
                            value={lga.name}
                          >
                            {lga.name}
                          </option>
                        ))}
                      </select>

                      {availableLGAs.length === 0 && (
                        <p className="checkout-feedback" role="alert">
                          Delivery is not currently available in any
                          LGA. Please contact the restaurant or choose
                          pickup.
                        </p>
                      )}
                    </div>

                    <div className="checkout-field checkout-field-full">
                      <label htmlFor="checkout-address">
                        Exact delivery location
                      </label>

                      <textarea
                        id="checkout-address"
                        name="address"
                        rows="3"
                        placeholder="Enter your exact location: street, estate, community, house number or nearby description."
                        autoComplete="street-address"
                        value={customer.address}
                        onChange={handleCustomerChange}
                        required
                        disabled={Boolean(createdOrder)}
                      />

                      <small>
                        For example: 12 Example Street, Agric, Ikorodu,
                        near the roundabout.
                      </small>
                    </div>

                    <div className="checkout-field checkout-field-full">
                      <label htmlFor="checkout-landmark">
                        Additional landmark
                        <span className="checkout-optional">
                          Optional
                        </span>
                      </label>

                      <input
                        id="checkout-landmark"
                        name="landmark"
                        type="text"
                        placeholder="A nearby landmark to help the rider find you"
                        value={customer.landmark}
                        onChange={handleCustomerChange}
                        disabled={Boolean(createdOrder)}
                      />
                    </div>
                  </>
                )}
              </div>
            </section>
          )}

          <section className="checkout-section">
            <div className="checkout-section-heading">
              <span className="checkout-step-number">
                {fulfilment === "delivery" ? "04" : "03"}
              </span>

              <div>
                <h2>Anything else we should know?</h2>
                <p>Optional notes for your order.</p>
              </div>
            </div>

            <div className="checkout-field">
              <label htmlFor="checkout-instructions">
                Special instructions
                <span className="checkout-optional">Optional</span>
              </label>

              <textarea
                id="checkout-instructions"
                name="instructions"
                rows="4"
                maxLength={250}
                placeholder="Any special requests or useful directions..."
                value={customer.instructions}
                onChange={handleCustomerChange}
                disabled={Boolean(createdOrder)}
              />
            </div>
          </section>
        </div>

        <aside className="checkout-summary">
          <div className="checkout-summary-heading">
            <div>
              <span className="checkout-eyebrow">YOUR SELECTION</span>
              <h2>Order summary</h2>
            </div>

            <span className="checkout-item-count">
              {safeItemCount} {safeItemCount === 1 ? "item" : "items"}
            </span>
          </div>

          <div className="checkout-summary-items">
            {validCartItems.map((item) => (
              <article
                className="checkout-summary-item"
                key={item.cartKey}
              >
                <div className="checkout-summary-image">
                  <img src={item.image} alt={item.name} />
                  <span>{item.quantity}</span>
                </div>

                <div className="checkout-summary-details">
                  <h3>{item.name}</h3>

                  {item.size && (
                    <span className="checkout-summary-option">
                      {item.size}
                    </span>
                  )}

                  {item.extras?.length > 0 && (
                    <span className="checkout-summary-option">
                      {item.extras
                        .map((extra) => extra.name)
                        .join(", ")}
                    </span>
                  )}

                  {item.instructions && (
                    <span className="checkout-summary-option">
                      Special request added
                    </span>
                  )}
                </div>

                <strong>
                  {formatPrice(
                    Number(item.price) * Number(item.quantity)
                  )}
                </strong>
              </article>
            ))}
          </div>

          <div className="checkout-summary-calculations">
            <div className="checkout-calculation-row">
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>

            {fulfilment === "delivery" && (
              <div className="checkout-calculation-row">
                <span>Delivery fee</span>

                <strong>
                  {selectedLGA
                    ? formatPrice(deliveryFee)
                    : "Select an LGA"}
                </strong>
              </div>
            )}
          </div>

          <div className="checkout-total-row">
            <span>Order total</span>
            <strong>{formatPrice(orderTotal)}</strong>
          </div>

          <p className="checkout-total-note">
            {fulfilment === "delivery"
              ? selectedLGA
                ? `Delivery to ${selectedLGA.name}, Lagos State.`
                : "Select an available Lagos LGA to calculate your delivery fee."
              : "Your pickup order has no delivery charge."}
          </p>

          <button
            type="submit"
            className="checkout-place-order-button"
            disabled={
              isSubmitting ||
              hasInvalidCartItems ||
              (!settings.deliveryEnabled && !settings.pickupEnabled)
            }
          >
            {isSubmitting
              ? "Creating your order..."
              : "Continue to order review"}

            {!isSubmitting && (
              <span aria-hidden="true">→</span>
            )}
          </button>

          {feedback && (
            <p
              className="checkout-feedback"
              role="status"
              aria-live="polite"
              data-type={feedbackType}
            >
              {feedback}
            </p>
          )}

          <div className="checkout-payment-note">
            <span aria-hidden="true">⌑</span>

            <p>
              Review your order on the next step, then complete
              your secure payment with Paystack.
            </p>
          </div>

          <Link to="/#menu" className="checkout-edit-cart">
            ← Continue browsing the menu
          </Link>
        </aside>
      </form>

      <footer className="checkout-footer">
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

export default Checkout;
