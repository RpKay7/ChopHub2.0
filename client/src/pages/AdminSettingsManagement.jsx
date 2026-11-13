
import { useEffect, useState } from "react";
import "./AdminSettingsManagement.css";

const API_URL = "http://localhost:5000/api";

const initialHours = [
  { day: "Monday", open: "09:00", close: "21:00", closed: false },
  { day: "Tuesday", open: "09:00", close: "21:00", closed: false },
  { day: "Wednesday", open: "09:00", close: "21:00", closed: false },
  { day: "Thursday", open: "09:00", close: "21:00", closed: false },
  { day: "Friday", open: "09:00", close: "22:00", closed: false },
  { day: "Saturday", open: "10:00", close: "22:00", closed: false },
  { day: "Sunday", open: "10:00", close: "20:00", closed: false },
];

const initialDeliveryLGAs = [
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

const initialDelivery = {
  deliveryEnabled: true,
  pickupEnabled: true,
  estimatedDelivery: "30–60 minutes",
  deliveryLGAs: initialDeliveryLGAs,
};

const initialProfile = {
  restaurantName: "ChopHub",
  email: "hello@chophub.com",
  phone: "+234 800 000 0000",
  address: "Lagos, Nigeria",
  description:
    "Delicious meals, freshly prepared and delivered with care.",
};

const initialNotifications = {
  newOrders: true,
  orderUpdates: true,
  newEnquiries: true,
  lowAvailability: false,
};

function getStoredSession() {
  try {
    const localSession = localStorage.getItem("chophub-auth-session");

    if (localSession) {
      return JSON.parse(localSession);
    }

    const temporarySession = sessionStorage.getItem(
      "chophub-auth-session"
    );

    return temporarySession
      ? JSON.parse(temporarySession)
      : null;
  } catch (error) {
    console.error("Unable to read admin session:", error);
    return null;
  }
}

function getInitialDelivery(savedDelivery) {
  if (!savedDelivery) {
    return {
      ...initialDelivery,
      deliveryLGAs: initialDeliveryLGAs.map((lga) => ({
        ...lga,
      })),
    };
  }

  const savedLGAs = Array.isArray(savedDelivery.deliveryLGAs)
    ? savedDelivery.deliveryLGAs
    : [];

  const deliveryLGAs = initialDeliveryLGAs.map((defaultLGA) => {
    const savedLGA = savedLGAs.find(
      (item) =>
        item.name?.trim().toLowerCase() ===
        defaultLGA.name.toLowerCase()
    );

    return savedLGA
      ? {
          name: defaultLGA.name,
          fee: String(savedLGA.fee ?? defaultLGA.fee),
          enabled:
            typeof savedLGA.enabled === "boolean"
              ? savedLGA.enabled
              : true,
        }
      : { ...defaultLGA };
  });

  return {
    deliveryEnabled:
      typeof savedDelivery.deliveryEnabled === "boolean"
        ? savedDelivery.deliveryEnabled
        : initialDelivery.deliveryEnabled,

    pickupEnabled:
      typeof savedDelivery.pickupEnabled === "boolean"
        ? savedDelivery.pickupEnabled
        : initialDelivery.pickupEnabled,

    estimatedDelivery:
      savedDelivery.estimatedDelivery ??
      initialDelivery.estimatedDelivery,

    deliveryLGAs,
  };
}

function formatPrice(amount) {
  return `₦${Number(amount || 0).toLocaleString("en-NG")}`;
}

function SettingsIcon({ name, size = 18 }) {
  const icons = {
    store: <><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M3 8 5 3h14l2 5M9 21v-6h6v6M3 8a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    truck: <><path d="M3 6h12v12H3zM15 10h4l3 4v4h-7z" /><circle cx="7.5" cy="18.5" r="1.5" /><circle cx="18.5" cy="18.5" r="1.5" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" /><path d="M17 21v-8H7v8M7 3v5h8" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

function SettingsSection({ title, description, children }) {
  return (
    <section className="admin-settings-card">
      <div className="admin-settings-card-heading">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>

      <div className="admin-settings-card-content">
        {children}
      </div>
    </section>
  );
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="admin-settings-toggle-row">
      <div className="admin-settings-toggle-copy">
        <strong>{label}</strong>
        {description && <p>{description}</p>}
      </div>

      <button
        type="button"
        className={`admin-settings-switch ${checked ? "active" : ""}`}
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        aria-label={label}
      >
        <span />
      </button>
    </div>
  );
}

function AdminSettingsManagement() {
  const [profile, setProfile] = useState(initialProfile);
  const [hours, setHours] = useState(initialHours);

  const [delivery, setDelivery] = useState(() =>
    getInitialDelivery(null)
  );

  const [notifications, setNotifications] = useState(
    initialNotifications
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [savedMessage, setSavedMessage] = useState("");
  const [savedMessageType, setSavedMessageType] = useState("success");

  const [adminAccount, setAdminAccount] = useState({
    name: "ChopHub Admin",
    email: "admin@chophub.com",
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const session = getStoredSession();

        if (!session?.access_token) {
          throw new Error(
            "Your admin session could not be found. Please sign in again."
          );
        }

        setAdminAccount({
          name: session.user?.fullName || "ChopHub Admin",
          email: session.user?.email || "admin@chophub.com",
        });

        const response = await fetch(`${API_URL}/settings`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load restaurant settings."
          );
        }

        const saved = result.settings || {};

        setProfile({
          ...initialProfile,
          ...(saved.profile || {}),
        });

        const savedHours = Array.isArray(saved.hours)
          ? saved.hours
          : [];

        setHours(
          initialHours.map((defaultDay) => {
            const savedDay = savedHours.find(
              (item) => item.day === defaultDay.day
            );

            return savedDay
              ? {
                  ...defaultDay,
                  ...savedDay,
                }
              : { ...defaultDay };
          })
        );

        setDelivery(getInitialDelivery(saved.delivery));

        setNotifications({
          ...initialNotifications,
          ...(saved.notifications || {}),
        });
      } catch (error) {
        console.error("LOAD SETTINGS ERROR:", error);

        setSavedMessageType("error");
        setSavedMessage(
          error.message || "Unable to load restaurant settings."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, []);

  function clearMessage() {
    setSavedMessage("");
  }

  function updateProfile(field, value) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));

    clearMessage();
  }

  function updateDelivery(field, value) {
    setDelivery((current) => ({
      ...current,
      [field]: value,
    }));

    clearMessage();
  }

  function updateNotification(field, value) {
    setNotifications((current) => ({
      ...current,
      [field]: value,
    }));

    clearMessage();
  }

  function updateHours(index, field, value) {
    setHours((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: value }
          : item
      )
    );

    clearMessage();
  }

  function updateDeliveryLGA(index, field, value) {
    setDelivery((current) => ({
      ...current,
      deliveryLGAs: current.deliveryLGAs.map((lga, lgaIndex) =>
        lgaIndex === index
          ? { ...lga, [field]: value }
          : lga
      ),
    }));

    clearMessage();
  }

  async function handleSave() {
    if (isSaving || isLoading) return;

    if (delivery.deliveryEnabled) {
      const activeLGAs = delivery.deliveryLGAs.filter(
        (lga) => lga.enabled
      );

      if (activeLGAs.length === 0) {
        setSavedMessageType("error");
        setSavedMessage(
          "Enable at least one LGA before enabling delivery."
        );
        return;
      }
    }

    const invalidFee = delivery.deliveryLGAs.some((lga) => {
      return (
        lga.fee === "" ||
        !Number.isFinite(Number(lga.fee)) ||
        Number(lga.fee) < 0
      );
    });

    if (invalidFee) {
      setSavedMessageType("error");
      setSavedMessage(
        "Please enter a valid, non-negative delivery fee for every LGA."
      );
      return;
    }

    try {
      setIsSaving(true);
      clearMessage();

      const session = getStoredSession();

      if (!session?.access_token) {
        throw new Error(
          "Your admin session has expired. Please sign in again."
        );
      }

      const settings = {
        profile,
        hours,
        delivery: {
          ...delivery,
          deliveryLGAs: delivery.deliveryLGAs.map((lga) => ({
            name: lga.name,
            fee: String(Number(lga.fee)),
            enabled: Boolean(lga.enabled),
          })),
        },
        notifications,
      };

      const response = await fetch(`${API_URL}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(settings),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to save restaurant settings."
        );
      }

      setSavedMessageType("success");
      setSavedMessage(
        "Your settings have been saved successfully."
      );
    } catch (error) {
      console.error("SAVE SETTINGS ERROR:", error);

      setSavedMessageType("error");
      setSavedMessage(
        error.message || "Unable to save your settings. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="admin-settings-management">
      <div className="admin-settings-header">
        <div>
          <span className="admin-settings-eyebrow">
            CONFIGURATION
          </span>

          <h2>Settings</h2>

          <p>
            Manage your restaurant information, operating hours and
            preferences.
          </p>
        </div>

        <button
          type="button"
          className="admin-settings-save-button"
          onClick={handleSave}
          disabled={isLoading || isSaving}
        >
          <SettingsIcon name="save" size={16} />
          {isSaving ? "Saving..." : "Save changes"}
        </button>
      </div>

      {savedMessage && (
        <div
          className="admin-settings-save-message"
          role="status"
          data-type={savedMessageType}
        >
          <SettingsIcon
            name={savedMessageType === "success" ? "check" : "info"}
            size={17}
          />

          <span>{savedMessage}</span>
        </div>
      )}

      {isLoading ? (
        <div className="admin-settings-save-message" role="status">
          <span>Loading restaurant settings...</span>
        </div>
      ) : (
        <>
          <SettingsSection
            title="Restaurant Profile"
            description="The basic information customers see about your restaurant."
          >
            <div className="admin-settings-form-grid">
              <label className="admin-settings-field">
                Restaurant name

                <input
                  value={profile.restaurantName}
                  onChange={(event) =>
                    updateProfile("restaurantName", event.target.value)
                  }
                  placeholder="Restaurant name"
                />
              </label>

              <label className="admin-settings-field">
                Contact email

                <input
                  type="email"
                  value={profile.email}
                  onChange={(event) =>
                    updateProfile("email", event.target.value)
                  }
                  placeholder="Email address"
                />
              </label>

              <label className="admin-settings-field">
                Phone number

                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(event) =>
                    updateProfile("phone", event.target.value)
                  }
                  placeholder="Phone number"
                />
              </label>

              <label className="admin-settings-field">
                Restaurant location

                <input
                  value={profile.address}
                  onChange={(event) =>
                    updateProfile("address", event.target.value)
                  }
                  placeholder="Restaurant address"
                />
              </label>

              <label className="admin-settings-field admin-settings-full-width">
                Restaurant description

                <textarea
                  rows="3"
                  value={profile.description}
                  onChange={(event) =>
                    updateProfile("description", event.target.value)
                  }
                  placeholder="Tell customers about your restaurant"
                />
              </label>
            </div>
          </SettingsSection>

          <SettingsSection
            title="Opening Hours"
            description="Set the days and times your restaurant accepts orders."
          >
            <div className="admin-settings-hours-list">
              {hours.map((item, index) => (
                <div
                  className="admin-settings-hours-row"
                  key={item.day}
                >
                  <strong>{item.day}</strong>

                  <label className="admin-settings-time-field">
                    <span>Opening</span>

                    <input
                      type="time"
                      value={item.open}
                      disabled={item.closed}
                      onChange={(event) =>
                        updateHours(index, "open", event.target.value)
                      }
                    />
                  </label>

                  <label className="admin-settings-time-field">
                    <span>Closing</span>

                    <input
                      type="time"
                      value={item.close}
                      disabled={item.closed}
                      onChange={(event) =>
                        updateHours(index, "close", event.target.value)
                      }
                    />
                  </label>

                  <label className="admin-settings-closed-option">
                    <input
                      type="checkbox"
                      checked={item.closed}
                      onChange={(event) =>
                        updateHours(index, "closed", event.target.checked)
                      }
                    />

                    Closed
                  </label>
                </div>
              ))}
            </div>
          </SettingsSection>

          <SettingsSection
            title="Delivery & Pickup"
            description="Control fulfilment options and manage delivery availability across Lagos State."
          >
            <div className="admin-settings-toggle-list">
              <Toggle
                label="Enable delivery"
                description="Allow customers to place delivery orders within Lagos State."
                checked={delivery.deliveryEnabled}
                onChange={(value) =>
                  updateDelivery("deliveryEnabled", value)
                }
              />

              <Toggle
                label="Enable pickup"
                description="Allow customers to collect their orders."
                checked={delivery.pickupEnabled}
                onChange={(value) =>
                  updateDelivery("pickupEnabled", value)
                }
              />
            </div>

            <div className="admin-settings-divider" />

            <div className="admin-settings-form-grid">
              <label className="admin-settings-field admin-settings-full-width">
                Estimated delivery time

                <input
                  value={delivery.estimatedDelivery}
                  onChange={(event) =>
                    updateDelivery("estimatedDelivery", event.target.value)
                  }
                  placeholder="e.g. 30–60 minutes"
                />
              </label>
            </div>

            <div className="admin-settings-divider" />

            <div>
              <h4>Lagos delivery areas</h4>

              <p>
                Set a delivery fee and availability for each Local
                Government Area. Customers will select their LGA during
                checkout and enter their exact street, estate or community.
              </p>
            </div>

            <div className="admin-settings-toggle-list">
              {delivery.deliveryLGAs.map((lga, index) => (
                <div
                  className="admin-settings-hours-row"
                  key={lga.name}
                >
                  <div className="admin-settings-toggle-copy">
                    <strong>{lga.name}</strong>
                    <p>
                      {lga.enabled
                        ? "Delivery available"
                        : "Delivery unavailable"}
                    </p>
                  </div>

                  <label className="admin-settings-field">
                    Delivery fee (₦)

                    <input
                      type="number"
                      min="0"
                      value={lga.fee}
                      onChange={(event) =>
                        updateDeliveryLGA(
                          index,
                          "fee",
                          event.target.value
                        )
                      }
                      aria-label={`${lga.name} delivery fee`}
                    />
                  </label>

                  <Toggle
                    label={`Enable ${lga.name}`}
                    checked={lga.enabled}
                    onChange={(value) =>
                      updateDeliveryLGA(index, "enabled", value)
                    }
                  />
                </div>
              ))}
            </div>

            <div className="admin-settings-security-note">
              <SettingsIcon name="info" size={18} />

              <div>
                <strong>How delivery coverage works</strong>

                <p>
                  Customers can only select an LGA that is enabled here.
                  They will enter their exact delivery location in a text
                  box at checkout. Only enable areas ChopHub can genuinely
                  serve. These starter fees can be adjusted at any time.
                </p>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection
            title="Notifications"
            description="Choose which activities you want to receive notifications about."
          >
            <div className="admin-settings-toggle-list">
              <Toggle
                label="New orders"
                description="Get notified when a customer places an order."
                checked={notifications.newOrders}
                onChange={(value) =>
                  updateNotification("newOrders", value)
                }
              />

              <Toggle
                label="Order status updates"
                description="Get notified when an order status changes."
                checked={notifications.orderUpdates}
                onChange={(value) =>
                  updateNotification("orderUpdates", value)
                }
              />

              <Toggle
                label="New customer enquiries"
                description="Get notified when a customer submits an enquiry."
                checked={notifications.newEnquiries}
                onChange={(value) =>
                  updateNotification("newEnquiries", value)
                }
              />

              <Toggle
                label="Low menu availability"
                description="Get notified when a menu item is marked unavailable."
                checked={notifications.lowAvailability}
                onChange={(value) =>
                  updateNotification("lowAvailability", value)
                }
              />
            </div>
          </SettingsSection>

          <SettingsSection
            title="Admin Account"
            description="Manage the administrator account used to access ChopHub."
          >
            <div className="admin-settings-account-info">
              <div className="admin-settings-account-icon">
                <SettingsIcon name="user" size={22} />
              </div>

              <div>
                <strong>Administrator account</strong>
                <p>Account security and access settings</p>
              </div>
            </div>

            <div className="admin-settings-form-grid">
              <label className="admin-settings-field">
                Administrator name

                <input
                  value={adminAccount.name}
                  readOnly
                />
              </label>

              <label className="admin-settings-field">
                Administrator email

                <input
                  type="email"
                  value={adminAccount.email}
                  readOnly
                />
              </label>
            </div>

            <div className="admin-settings-security-note">
              <SettingsIcon name="lock" size={18} />

              <div>
                <strong>Password and security</strong>

                <p>
                  Administrator identity is managed by the ChopHub
                  authentication system, separately from restaurant
                  settings.
                </p>
              </div>
            </div>
          </SettingsSection>

          <div className="admin-settings-bottom">
            <div className="admin-settings-bottom-note">
              <SettingsIcon name="info" size={17} />

              <span>
                Restaurant settings are saved securely in the ChopHub
                database and are available across devices.
              </span>
            </div>

            <button
              type="button"
              className="admin-settings-save-button"
              onClick={handleSave}
              disabled={isSaving}
            >
              <SettingsIcon name="save" size={16} />
              {isSaving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminSettingsManagement;
