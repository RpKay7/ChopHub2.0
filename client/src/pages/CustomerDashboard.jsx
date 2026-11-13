
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { useAuth } from "../components/AuthContext";
import { useMenu } from "../components/MenuContext";
import { useNotifications } from "../components/NotificationContext";
import MealDetailsModal from "../components/MealDetailsModal";
import "./CustomerDashboard.css";

const API_URL = "http://localhost:5000/api";

function formatNotificationDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getDeviceName(userAgent = "") {
  const browser = /Edg\//.test(userAgent)
    ? "Microsoft Edge"
    : /Chrome\//.test(userAgent)
      ? "Google Chrome"
      : /Firefox\//.test(userAgent)
        ? "Mozilla Firefox"
        : /Safari\//.test(userAgent) && !/Chrome\//.test(userAgent)
          ? "Safari"
          : "Unknown browser";

  const operatingSystem = /Windows/.test(userAgent)
    ? "Windows"
    : /Mac OS X/.test(userAgent)
      ? "macOS"
      : /Android/.test(userAgent)
        ? "Android"
        : /iPhone|iPad/.test(userAgent)
          ? "iOS"
          : /Linux/.test(userAgent)
            ? "Linux"
            : "Unknown device";

  return `${browser} · ${operatingSystem}`;
}

function formatOrderDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatOrderPrice(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "Price unavailable";
  }

  return `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatOrderStatus(status) {
  const labels = {
    pending: "Pending",
    confirmed: "Confirmed",
    preparing: "Preparing",
    ready: "Ready for collection",
    out_for_delivery: "Out for delivery",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return labels[status] || status || "Unknown";
}

function formatPaymentStatus(status) {
  const labels = {
    unpaid: "Unpaid",
    pending: "Pending",
    paid: "Paid",
    failed: "Failed",
    refunded: "Refunded",
  };

  return labels[status] || status || "Unknown";
}

function formatOrderType(type) {
  return type === "delivery" ? "Delivery" : "Pickup";
}

function getNotificationTypeLabel(type) {
  const labels = {
    order: "ORDER UPDATE",
    payment: "PAYMENT",
    account: "ACCOUNT UPDATE",
    promotion: "PROMOTION",
    menu: "MENU UPDATE",
    price: "PRICE CHANGE",
    general: "CHOPHUB UPDATE",
  };

  return labels[type] || "CHOPHUB UPDATE";
}

function DashboardIcon({ type }) {
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
        <path d="M4 5.5h16v15H4z" />
        <path d="M8 5.5V3h8v2.5M8 11h8M8 15h5" />
      </>
    ),
    profile: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 2.9-.2-.1a1.7 1.7 0 0 0-1.8-.1 1.7 1.7 0 0 0-.9 1.5v.2h-3.4v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.1l-.2.1-1.7-2.9.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H6v-3.4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.2L9 4.7l.2.1a1.7 1.7 0 0 0 1.8.1 1.7 1.7 0 0 0 .9-1.5v-.2h3.4v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.1l.2-.1 1.7 2.9-.1.2a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1h.2V14h-.2a1.7 1.7 0 0 0-1.7 1Z" />
      </>
    ),
    notifications: (
      <>
        <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    favourites: (
      <path d="M20.8 8.8c0 5.2-8.8 11-8.8 11s-8.8-5.8-8.8-11A4.8 4.8 0 0 1 12 6.2a4.8 4.8 0 0 1 8.8 2.6Z" />
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[type]}
    </svg>
  );
}

function ChopHubDashboardLogo() {
  return (
    <Link to="/" className="dashboard-brand" aria-label="ChopHub home">
      <svg
        className="dashboard-brand-mark"
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

      <span className="dashboard-brand-name">
        Chop<span>Hub</span>
      </span>
    </Link>
  );
}

function EmptyState({ icon, title, description, action, onAction }) {
  return (
    <div className="dashboard-empty-state">
      <div className="dashboard-empty-icon">
        <DashboardIcon type={icon} />
      </div>

      <h3>{title}</h3>
      <p>{description}</p>

      {action && (
        <button
          type="button"
          className="dashboard-gold-button"
          onClick={onAction}
        >
          {action}
          <span aria-hidden="true">↗</span>
        </button>
      )}
    </div>
  );
}

function OrderCard({ order, showItems = false }) {
  const statusKey = String(order.status || "")
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/\s+/g, "-");

  const statusClass =
    statusKey === "out-for-delivery"
      ? "delivery"
      : [
          "pending",
          "confirmed",
          "preparing",
          "ready",
          "delivery",
          "completed",
          "cancelled",
        ].includes(statusKey)
        ? statusKey
        : "default";

  const paymentKey = String(order.payment_status || "").toLowerCase();

  const paymentClass = ["paid", "pending", "failed"].includes(paymentKey)
    ? paymentKey
    : "default";

  const items = order.order_items || [];

  const trackingUrl = order.id
    ? `/track-order?orderId=${encodeURIComponent(order.id)}`
    : null;

  return (
    <article
      className={`dashboard-order-card ${showItems ? "detailed" : "compact"}`}
    >
      <div className="dashboard-order-card-top">
        <div className="dashboard-order-reference">
          <span className="dashboard-order-label">ORDER REFERENCE</span>
          <h3>Order #{order.order_number}</h3>
        </div>

        <span className={`dashboard-order-status ${statusClass}`}>
          <span className="dashboard-order-status-dot" />
          {formatOrderStatus(order.status)}
        </span>
      </div>

      <div className="dashboard-order-meta">
        <span>
          <span className="dashboard-order-meta-icon">◷</span>
          {formatOrderDate(order.created_at)}
        </span>

        <span>
          <span className="dashboard-order-meta-icon">⌖</span>
          {formatOrderType(order.order_type)}
        </span>

        {order.order_type === "delivery" && order.delivery_address && (
          <span className="dashboard-order-address">
            <span className="dashboard-order-meta-icon">⌂</span>
            {order.delivery_address}
          </span>
        )}
      </div>

      {!showItems && (
        <div className="dashboard-order-card-bottom">
          <div className="dashboard-order-item-count">
            <span>{items.length}</span>

            <div>
              <strong>
                {items.length === 1 ? "Meal selection" : "Meal selections"}
              </strong>
              <small>Included in this order</small>
            </div>
          </div>

          <div className="dashboard-order-total">
            <span>ORDER TOTAL</span>
            <strong>{formatOrderPrice(order.total)}</strong>
          </div>
        </div>
      )}

      {showItems && (
        <>
          <div className="dashboard-order-items">
            <div className="dashboard-order-items-heading">
              <span>ORDER ITEMS</span>
              <span>{items.length} item(s)</span>
            </div>

            {items.length > 0 ? (
              items.map((item) => (
                <div className="dashboard-order-item" key={item.id}>
                  <div className="dashboard-order-item-details">
                    <strong>{item.item_name}</strong>
                    <span>Quantity: {item.quantity}</span>
                  </div>

                  <span className="dashboard-order-item-price">
                    {formatOrderPrice(item.line_total)}
                  </span>
                </div>
              ))
            ) : (
              <p className="dashboard-order-unavailable">
                Meal details are unavailable for this order.
              </p>
            )}
          </div>

          <div className="dashboard-order-card-bottom">
            <div className="dashboard-order-payment">
              <span>PAYMENT STATUS</span>

              <strong className={`dashboard-order-payment-status ${paymentClass}`}>
                {formatPaymentStatus(order.payment_status)}
              </strong>
            </div>

            <div className="dashboard-order-total">
              <span>ORDER TOTAL</span>
              <strong>{formatOrderPrice(order.total)}</strong>
            </div>
          </div>
        </>
      )}

      {trackingUrl && (
        <div className="dashboard-order-tracking-action">
          <Link
            to={trackingUrl}
            className="dashboard-text-button"
          >
            Track this order
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      )}
    </article>
  );
}

function CustomerDashboard() {
  const { user, session, logout, updateProfile } = useAuth();
  const { items: menuItems } = useMenu();
  const location = useLocation();

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState("overview");
  const [settingsPage, setSettingsPage] = useState("main");

  useEffect(() => {
    const requestedTab = location.state?.activeTab;

    const allowedTabs = [
      "overview",
      "orders",
      "profile",
      "settings",
    ];

    if (allowedTabs.includes(requestedTab)) {
      setActiveTab(requestedTab);

      if (requestedTab === "settings") {
        setSettingsPage("main");
      }
    }
  }, [location.state]);

  const [selectedMeal, setSelectedMeal] = useState(null);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);

  const notificationMenuRef = useRef(null);

  const [profile, setProfile] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [profileMessage, setProfileMessage] = useState("");

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  // Favourites are retrieved from Supabase.
  const [favourites, setFavourites] = useState([]);
  const [favouritesLoading, setFavouritesLoading] = useState(true);
  const [favouritesError, setFavouritesError] = useState("");
  const [removingFavouriteId, setRemovingFavouriteId] = useState(null);

  // Notification preferences are retrieved from Supabase.
  const [notificationSettings, setNotificationSettings] = useState({
    orderUpdates: true,
    promotions: true,
    accountUpdates: true,
    menuUpdates: true,
    priceChanges: true,
  });

  const [notificationSettingsLoading, setNotificationSettingsLoading] =
    useState(true);

  const [notificationSettingsSaving, setNotificationSettingsSaving] =
    useState(false);

  const [settingsMessage, setSettingsMessage] = useState("");

  // Password change state.
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordFeedback, setPasswordFeedback] = useState({
    type: "",
    message: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Active sessions state.
  const [activeSessions, setActiveSessions] = useState([]);
  const [activeSessionsLoading, setActiveSessionsLoading] =
    useState(false);
  const [activeSessionsError, setActiveSessionsError] = useState("");
  const [revokingSessionId, setRevokingSessionId] = useState(null);

  // Permanent account deletion state.
  const [deleteAccountPassword, setDeleteAccountPassword] = useState("");
  const [deleteAccountConfirmation, setDeleteAccountConfirmation] = useState("");
  const [deleteAccountFeedback, setDeleteAccountFeedback] = useState({
    type: "",
    message: "",
  });
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Retrieve active sessions when the customer opens account settings.
  useEffect(() => {
    let active = true;

    async function loadActiveSessions() {
      if (
        activeTab !== "settings" ||
        settingsPage !== "active-sessions" ||
        !session?.access_token
      ) {
        return;
      }

      setActiveSessionsLoading(true);
      setActiveSessionsError("");

      try {
        const response = await fetch(`${API_URL}/auth/sessions`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to retrieve active sessions."
          );
        }

        if (active) {
          setActiveSessions(
            Array.isArray(result.sessions) ? result.sessions : []
          );
        }
      } catch (error) {
        console.error("Active sessions retrieval error:", error);

        if (active) {
          setActiveSessionsError(
            error.message || "Unable to load active sessions."
          );
        }
      } finally {
        if (active) {
          setActiveSessionsLoading(false);
        }
      }
    }

    loadActiveSessions();

    return () => {
      active = false;
    };
  }, [session?.access_token, activeTab, settingsPage]);

  // Keep profile information synchronized with the authenticated user.
  useEffect(() => {
    if (!user) return;

    setProfile({
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
    });
  }, [user]);

  // Retrieve the authenticated customer's orders.
  useEffect(() => {
    let active = true;

    async function loadOrders() {
      if (!session?.access_token) {
        setOrders([]);
        setOrdersError("");
        setOrdersLoading(false);
        return;
      }

      setOrdersLoading(true);
      setOrdersError("");

      try {
        const response = await fetch(`${API_URL}/orders`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to retrieve your orders."
          );
        }

        if (active) {
          setOrders(
            Array.isArray(result.orders) ? result.orders : []
          );
        }
      } catch (error) {
        console.error("Order retrieval error:", error);

        if (active) {
          setOrdersError(
            error.message || "Unable to load your orders."
          );
        }
      } finally {
        if (active) {
          setOrdersLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      active = false;
    };
  }, [session?.access_token]);

  // Retrieve favourites from the authenticated customer's Supabase account.
  useEffect(() => {
    let active = true;

    async function loadFavourites() {
      if (!session?.access_token) {
        setFavourites([]);
        setFavouritesError("");
        setFavouritesLoading(false);
        return;
      }

      setFavouritesLoading(true);
      setFavouritesError("");

      try {
        const response = await fetch(`${API_URL}/favourites`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to retrieve your favourites."
          );
        }

        const formattedFavourites = (
          Array.isArray(result.favourites) ? result.favourites : []
        )
          .filter((favourite) => favourite.menu_items)
          .map((favourite) => {
            const meal = favourite.menu_items;

            return {
              id: favourite.menu_item_id,
              menu_item_id: favourite.menu_item_id,
              favourite_id: favourite.id,
              created_at: favourite.created_at,
              slug: meal.slug,
              name: meal.name,
              title: meal.name,
              image: meal.image_url,
              description: meal.description,
              price: meal.price,
              is_available: meal.is_available,
            };
          });

        if (active) {
          setFavourites(formattedFavourites);
        }
      } catch (error) {
        console.error("Favourite retrieval error:", error);

        if (active) {
          setFavouritesError(
            error.message || "Unable to load your favourites."
          );
        }
      } finally {
        if (active) {
          setFavouritesLoading(false);
        }
      }
    }

    const handleFavouritesUpdated = () => {
      loadFavourites();
    };

    loadFavourites();

    window.addEventListener(
      "chophub-favourites-updated",
      handleFavouritesUpdated
    );

    return () => {
      active = false;

      window.removeEventListener(
        "chophub-favourites-updated",
        handleFavouritesUpdated
      );
    };
  }, [session?.access_token]);

  // Retrieve all five notification preferences.
  useEffect(() => {
    let active = true;

    async function loadNotificationPreferences() {
      if (!session?.access_token) {
        setNotificationSettings({
          orderUpdates: true,
          promotions: true,
          accountUpdates: true,
          menuUpdates: true,
          priceChanges: true,
        });

        setNotificationSettingsLoading(false);
        return;
      }

      setNotificationSettingsLoading(true);
      setSettingsMessage("");

      try {
        const response = await fetch(
          `${API_URL}/notification-preferences`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success || !result.preferences) {
          throw new Error(
            result.message || "Unable to retrieve notification preferences."
          );
        }

        if (active) {
          setNotificationSettings({
            orderUpdates: result.preferences.order_updates ?? true,
            promotions: result.preferences.promotions ?? true,
            accountUpdates: result.preferences.account_updates ?? true,
            menuUpdates: result.preferences.menu_updates ?? true,
            priceChanges: result.preferences.price_changes ?? true,
          });
        }
      } catch (error) {
        console.error("Notification preferences retrieval error:", error);

        if (active) {
          setSettingsMessage(
            error.message || "Unable to load notification preferences."
          );
        }
      } finally {
        if (active) {
          setNotificationSettingsLoading(false);
        }
      }
    }

    loadNotificationPreferences();

    return () => {
      active = false;
    };
  }, [session?.access_token]);

  // Close the notification dropdown when clicking outside or pressing Escape.
  useEffect(() => {
    if (!notificationMenuOpen) return;

    const handleOutsideClick = (event) => {
      if (
        notificationMenuRef.current &&
        !notificationMenuRef.current.contains(event.target)
      ) {
        setNotificationMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setNotificationMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [notificationMenuOpen]);

  const navigation = [
    { id: "overview", label: "Overview" },
    { id: "orders", label: "My Orders" },
    { id: "profile", label: "My Profile" },
    { id: "settings", label: "Account Settings" },
    { id: "notifications", label: "Notifications" },
    { id: "favourites", label: "My Favourites" },
  ];

  const activeLabel =
    activeTab === "settings" && settingsPage === "password-security"
      ? "Password and security"
      : activeTab === "settings" && settingsPage === "active-sessions"
        ? "Active sessions"
        : activeTab === "settings" && settingsPage === "delete-account"
          ? "Delete account"
          : navigation.find((item) => item.id === activeTab)?.label ||
            "Overview";

  const recentNotifications = notifications.slice(0, 4);

  const activeOrders = orders.filter((order) =>
    [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "out_for_delivery",
    ].includes(order.status)
  );

  const recentOrders = orders.slice(0, 3);

  const handleNavigate = (tab) => {
    setActiveTab(tab);

    if (tab === "settings") {
      setSettingsPage("main");
    }
  };

  const handleLogout = () => {
    logout();
    window.location.replace("/");
  };

  const handleExplore = () => {
    window.location.href = "/#menu";
  };

  const handleOpenNotifications = () => {
    setNotificationMenuOpen(false);
    setActiveTab("notifications");
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    handleOpenNotifications();
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfile((current) => ({
      ...current,
      [name]: value,
    }));

    setProfileMessage("");
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();

    if (!profile.fullName.trim()) {
      setProfileMessage("Please enter your full name.");
      return;
    }

    setProfileMessage("Saving your changes...");

    const result = await updateProfile({
      fullName: profile.fullName,
      phone: profile.phone,
    });

    if (!result.success) {
      setProfileMessage(result.message);
      return;
    }

    setProfile({
      fullName: result.user.fullName,
      email: result.user.email,
      phone: result.user.phone,
    });

    setProfileMessage("Your profile has been updated successfully.");
  };

  // Sign out a selected device from the customer's account.
  const handleRevokeSession = async (sessionId) => {
    const confirmed = window.confirm(
      "Are you sure you want to sign out this device?"
    );

    if (!confirmed) return;

    if (!session?.access_token) {
      setActiveSessionsError("Your session has expired. Please sign in again.");
      return;
    }

    setRevokingSessionId(sessionId);
    setActiveSessionsError("");

    try {
      const response = await fetch(
        `${API_URL}/auth/sessions/${sessionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to sign out this device."
        );
      }

      setActiveSessions((previousSessions) =>
        previousSessions.filter(
          (item) => item.session_id !== sessionId
        )
      );
    } catch (error) {
      console.error("Revoke session error:", error);
      setActiveSessionsError(
        error.message || "Unable to sign out this device."
      );
    } finally {
      setRevokingSessionId(null);
    }
  };

  // Permanently delete the authenticated customer's account.
  const handleDeleteAccount = async (event) => {
    event.preventDefault();

    setDeleteAccountFeedback({ type: "", message: "" });

    if (!session?.access_token) {
      setDeleteAccountFeedback({
        type: "error",
        message: "Your session has expired. Please sign in again.",
      });
      return;
    }

    if (!deleteAccountPassword) {
      setDeleteAccountFeedback({
        type: "error",
        message: "Enter your current password to continue.",
      });
      return;
    }

    if (deleteAccountConfirmation !== "DELETE MY ACCOUNT") {
      setDeleteAccountFeedback({
        type: "error",
        message: "Type DELETE MY ACCOUNT exactly to confirm.",
      });
      return;
    }

    const confirmed = window.confirm(
      "This action is permanent. Your account will be deleted and cannot be restored. Continue?"
    );

    if (!confirmed) return;

    setDeletingAccount(true);

    try {
      // This calls the existing account deletion endpoint.
      const response = await fetch(`${API_URL}/auth/account`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          current_password: deleteAccountPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.accountDeleted) {
          logout();
          window.alert(
            result.message ||
              "Your login account was deleted, but some associated records need attention."
          );
          window.location.replace("/");
          return;
        }

        throw new Error(
          result.message || "Unable to delete your account. Please try again."
        );
      }

      logout();
      window.alert(
        result.message || "Your ChopHub account has been permanently deleted."
      );
      window.location.replace("/");
    } catch (error) {
      console.error("Account deletion error:", error);
      setDeleteAccountFeedback({
        type: "error",
        message:
          error.message || "Unable to delete your account. Please try again.",
      });
    } finally {
      setDeletingAccount(false);
    }
  };

  // Change the authenticated customer's password.
  const handleChangePassword = async (event) => {
    event.preventDefault();

    setPasswordFeedback({
      type: "",
      message: "",
    });

    if (!session?.access_token) {
      setPasswordFeedback({
        type: "error",
        message: "Your session has expired. Please sign in again.",
      });
      return;
    }

    if (currentPassword.length === 0) {
      setPasswordFeedback({
        type: "error",
        message: "Please enter your current password.",
      });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordFeedback({
        type: "error",
        message: "Your new password must be at least 8 characters long.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({
        type: "error",
        message: "Your new passwords do not match.",
      });
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordFeedback({
        type: "error",
        message:
          "Your new password must be different from your current password.",
      });
      return;
    }

    try {
      setChangingPassword(true);

      const response = await fetch(
        `${API_URL}/auth/change-password`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to change your password."
        );
      }

      setPasswordFeedback({
        type: "success",
        message:
          result.message || "Your password has been changed successfully.",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Password change error:", error);

      setPasswordFeedback({
        type: "error",
        message:
          error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  // Save all five notification preferences.
  const handleNotificationChange = async (setting) => {
    if (!session?.access_token || notificationSettingsSaving) {
      return;
    }

    const previousSettings = notificationSettings;

    const updatedSettings = {
      ...previousSettings,
      [setting]: !previousSettings[setting],
    };

    setNotificationSettings(updatedSettings);
    setNotificationSettingsSaving(true);
    setSettingsMessage("Saving your notification preferences...");

    try {
      const response = await fetch(
        `${API_URL}/notification-preferences`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            order_updates: updatedSettings.orderUpdates,
            promotions: updatedSettings.promotions,
            account_updates: updatedSettings.accountUpdates,
            menu_updates: updatedSettings.menuUpdates,
            price_changes: updatedSettings.priceChanges,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success || !result.preferences) {
        throw new Error(
          result.message || "Unable to save notification preferences."
        );
      }

      setNotificationSettings({
        orderUpdates: result.preferences.order_updates,
        promotions: result.preferences.promotions,
        accountUpdates: result.preferences.account_updates,
        menuUpdates: result.preferences.menu_updates,
        priceChanges: result.preferences.price_changes,
      });

      setSettingsMessage("Notification preferences saved successfully.");
    } catch (error) {
      console.error("Notification preferences update error:", error);

      setNotificationSettings(previousSettings);

      setSettingsMessage(
        error.message || "Unable to save notification preferences."
      );
    } finally {
      setNotificationSettingsSaving(false);
    }
  };

  // Remove a favourite from Supabase.
  const handleRemoveFavourite = async (menuItemId) => {
    if (!session?.access_token || removingFavouriteId) {
      return;
    }

    setRemovingFavouriteId(menuItemId);
    setFavouritesError("");

    try {
      const response = await fetch(
        `${API_URL}/favourites/${menuItemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to remove this favourite."
        );
      }

      setFavourites((current) =>
        current.filter(
          (item) =>
            String(item.menu_item_id) !== String(menuItemId)
        )
      );

      window.dispatchEvent(
        new Event("chophub-favourites-updated")
      );
    } catch (error) {
      console.error("Remove favourite error:", error);

      setFavouritesError(
        error.message || "Unable to remove this favourite."
      );
    } finally {
      setRemovingFavouriteId(null);
    }
  };

  const handleOrderFavourite = (favourite) => {
    const originalMeal = menuItems.find(
      (menuItem) =>
        String(menuItem.dbId) === String(favourite.menu_item_id)
    );

    if (!originalMeal || originalMeal.availability !== "available") {
      return;
    }

    setSelectedMeal(originalMeal);
  };

  const getFavouriteName = (item) =>
    item.name || item.title || "Saved meal";

  const getFavouritePrice = (item) => {
    const price = Number(item.price);

    return Number.isFinite(price)
      ? `₦${price.toLocaleString("en-NG")}`
      : "Price unavailable";
  };

  return (
    <main className="customer-dashboard">
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <ChopHubDashboardLogo />

          <div className="dashboard-header-actions">
            <Link to="/" className="dashboard-home-link">
              Back to website
              <span aria-hidden="true">↗</span>
            </Link>

            <div
              className="dashboard-notification-menu"
              ref={notificationMenuRef}
            >
              <button
                type="button"
                className={`dashboard-notification-bell ${
                  notificationMenuOpen ? "active" : ""
                }`}
                aria-label={
                  unreadCount > 0
                    ? `Notifications, ${unreadCount} unread`
                    : "Notifications"
                }
                aria-expanded={notificationMenuOpen}
                aria-haspopup="dialog"
                onClick={() =>
                  setNotificationMenuOpen((previous) => !previous)
                }
              >
                <DashboardIcon type="notifications" />

                {unreadCount > 0 && (
                  <span className="dashboard-notification-count">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationMenuOpen && (
                <div
                  className="dashboard-notification-dropdown"
                  role="dialog"
                  aria-label="Recent notifications"
                >
                  <div className="dashboard-notification-dropdown-heading">
                    <div>
                      <span className="dashboard-eyebrow">
                        YOUR UPDATES
                      </span>
                      <h3>Notifications</h3>
                    </div>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllAsRead}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {recentNotifications.length === 0 ? (
                    <div className="dashboard-notification-dropdown-empty">
                      <DashboardIcon type="notifications" />
                      <p>You're all caught up.</p>
                      <span>New updates will appear here.</span>
                    </div>
                  ) : (
                    <div className="dashboard-notification-preview-list">
                      {recentNotifications.map((notification) => (
                        <button
                          type="button"
                          key={notification.id}
                          className={`dashboard-notification-preview ${
                            !notification.read ? "unread" : ""
                          }`}
                          onClick={() =>
                            handleNotificationClick(notification)
                          }
                        >
                          <span className="dashboard-notification-preview-indicator" />

                          <span className="dashboard-notification-preview-content">
                            <strong>{notification.title}</strong>
                            <span>{notification.message}</span>
                            <small>
                              {formatNotificationDate(
                                notification.createdAt
                              )}
                            </small>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    className="dashboard-notification-view-all"
                    onClick={handleOpenNotifications}
                  >
                    View all notifications
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              className="dashboard-login-link"
              onClick={handleLogout}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <div className="dashboard-sidebar-heading">
            <span className="dashboard-eyebrow">YOUR ACCOUNT</span>
            <h2>My Dashboard</h2>
          </div>

          <nav className="dashboard-navigation" aria-label="Account navigation">
            {navigation.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`dashboard-nav-item ${
                  activeTab === item.id ? "active" : ""
                }`}
                onClick={() => handleNavigate(item.id)}
                aria-current={activeTab === item.id ? "page" : undefined}
              >
                <DashboardIcon type={item.id} />
                <span>{item.label}</span>

                {item.id === "notifications" && unreadCount > 0 && (
                  <span className="dashboard-sidebar-notification-count">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}

                {activeTab === item.id && (
                  <span className="dashboard-nav-indicator" />
                )}
              </button>
            ))}
          </nav>

          <div className="dashboard-sidebar-bottom">
            <div className="dashboard-help-card">
              <span>NEED A HAND?</span>
              <p>Have a question about your order?</p>
              <Link to="/#contact">
                Contact us <span aria-hidden="true">↗</span>
              </Link>
            </div>

            <Link to="/" className="dashboard-back-home">
              <span aria-hidden="true">←</span>
              Back to ChopHub
            </Link>
          </div>
        </aside>

        <section className="dashboard-main">
          <div className="dashboard-mobile-navigation">
            {navigation.map((item) => (
              <button
                type="button"
                key={item.id}
                className={activeTab === item.id ? "active" : ""}
                onClick={() => handleNavigate(item.id)}
              >
                {item.label}

                {item.id === "notifications" && unreadCount > 0 && (
                  <span className="dashboard-mobile-notification-count">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="dashboard-page-heading">
            <div>
              <span className="dashboard-eyebrow">CUSTOMER ACCOUNT</span>
              <h1>{activeLabel}</h1>
              <p>Manage your ChopHub experience from one place.</p>
            </div>

            <div className="dashboard-avatar" aria-label="Customer profile">
              <DashboardIcon type="profile" />
            </div>
          </div>

          <div className="dashboard-connection-notice">
            <span className="dashboard-notice-icon">i</span>
            <p>
              Your ChopHub account and order history are connected.
              Your latest orders will appear here whenever you place them.
            </p>
          </div>

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div className="dashboard-content">
              <div className="dashboard-welcome">
                <div>
                  <span className="dashboard-eyebrow">WELCOME TO CHOPHUB</span>
                  <h2>
                    {user?.fullName
                      ? `Welcome back, ${user.fullName.trim().split(/\s+/)[0]}.`
                      : "Your next great meal starts here."}
                  </h2>
                  <p>
                    Discover delicious meals and keep track of your
                    ChopHub experience, all in one place.
                  </p>
                </div>

                <div className="dashboard-welcome-decoration">
                  <span>CH</span>
                </div>
              </div>

              <div className="dashboard-stats">
                <article className="dashboard-stat-card">
                  <span className="dashboard-stat-icon">01</span>
                  <span className="dashboard-stat-label">TOTAL ORDERS</span>
                  <strong>
                    {ordersLoading ? "—" : ordersError ? "—" : orders.length}
                  </strong>
                  <small>Your order history</small>
                </article>

                <article className="dashboard-stat-card">
                  <span className="dashboard-stat-icon">02</span>
                  <span className="dashboard-stat-label">ACTIVE ORDERS</span>
                  <strong>
                    {ordersLoading || ordersError
                      ? "—"
                      : activeOrders.length}
                  </strong>
                  <small>Orders in progress</small>
                </article>

                <article className="dashboard-stat-card">
                  <span className="dashboard-stat-icon">03</span>
                  <span className="dashboard-stat-label">FAVOURITES</span>
                  <strong>
                    {favouritesLoading ? "—" : favourites.length}
                  </strong>
                  <small>Your saved meals</small>
                </article>
              </div>

              <section className="dashboard-panel">
                <div className="dashboard-panel-heading">
                  <div>
                    <span className="dashboard-eyebrow">YOUR ACTIVITY</span>
                    <h2>Recent orders</h2>
                  </div>

                  <button
                    type="button"
                    className="dashboard-text-button"
                    onClick={() => setActiveTab("orders")}
                  >
                    View all <span aria-hidden="true">→</span>
                  </button>
                </div>

                {ordersLoading ? (
                  <p className="dashboard-feedback">
                    Loading your recent orders...
                  </p>
                ) : ordersError ? (
                  <p className="dashboard-feedback" role="alert">
                    {ordersError}
                  </p>
                ) : recentOrders.length === 0 ? (
                  <EmptyState
                    icon="orders"
                    title="No orders yet"
                    description="Your food adventures will appear here once you place your first order with ChopHub."
                    action="EXPLORE THE MENU"
                    onAction={handleExplore}
                  />
                ) : (
                  <div className="dashboard-order-list">
                    {recentOrders.map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>
                )}
              </section>

              <section className="dashboard-discover">
                <div>
                  <span className="dashboard-eyebrow">
                    SOMETHING DELICIOUS AWAITS
                  </span>
                  <h2>Have you explored our menu?</h2>
                  <p>
                    Find your next favourite meal and make it part
                    of your ChopHub experience.
                  </p>
                </div>

                <button
                  type="button"
                  className="dashboard-gold-button"
                  onClick={handleExplore}
                >
                  EXPLORE MENU
                  <span aria-hidden="true">↗</span>
                </button>
              </section>
            </div>
          )}

          {/* MY ORDERS */}
          {activeTab === "orders" && (
            <div className="dashboard-content">
              <section className="dashboard-panel">
                <div className="dashboard-panel-heading">
                  <div>
                    <span className="dashboard-eyebrow">ORDER HISTORY</span>
                    <h2>All your orders</h2>
                    <p>
                      Review your purchases and follow the progress
                      of your orders.
                    </p>
                  </div>
                </div>

                {ordersLoading ? (
                  <p className="dashboard-feedback">
                    Loading your order history...
                  </p>
                ) : ordersError ? (
                  <div>
                    <p className="dashboard-feedback" role="alert">
                      {ordersError}
                    </p>

                    <button
                      type="button"
                      className="dashboard-text-button"
                      onClick={() => window.location.reload()}
                    >
                      Try again
                    </button>
                  </div>
                ) : orders.length === 0 ? (
                  <EmptyState
                    icon="orders"
                    title="No orders yet"
                    description="Once you complete an order, its details and status will appear here."
                    action="EXPLORE THE MENU"
                    onAction={handleExplore}
                  />
                ) : (
                  <div className="dashboard-order-list">
                    {orders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        showItems
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* MY PROFILE */}
          {activeTab === "profile" && (
            <div className="dashboard-content">
              <section className="dashboard-panel">
                <div className="dashboard-panel-heading">
                  <div>
                    <span className="dashboard-eyebrow">
                      PERSONAL INFORMATION
                    </span>
                    <h2>Your profile</h2>
                    <p>
                      Add or update the personal information associated
                      with your ChopHub account.
                    </p>
                  </div>
                </div>

                <form
                  className="dashboard-profile-form"
                  onSubmit={handleProfileSave}
                >
                  <div className="dashboard-profile-card">
                    <div className="dashboard-profile-avatar">
                      <DashboardIcon type="profile" />
                    </div>

                    <div>
                      <h3>
                        {profile.fullName || "Your customer profile"}
                      </h3>
                      <p>
                        Your profile information helps us identify
                        your orders and contact you when necessary.
                      </p>
                    </div>
                  </div>

                  <div className="dashboard-form-grid">
                    <label className="dashboard-form-field">
                      <span>FULL NAME</span>
                      <input
                        type="text"
                        name="fullName"
                        value={profile.fullName}
                        onChange={handleProfileChange}
                        placeholder="Enter your full name"
                        autoComplete="name"
                        required
                      />
                    </label>

                    <label className="dashboard-form-field">
                      <span>EMAIL ADDRESS</span>
                      <input
                        type="email"
                        name="email"
                        value={profile.email}
                        onChange={handleProfileChange}
                        placeholder="Enter your email address"
                        autoComplete="email"
                        required
                        readOnly
                      />
                    </label>

                    <label className="dashboard-form-field">
                      <span>PHONE NUMBER</span>
                      <input
                        type="tel"
                        name="phone"
                        value={profile.phone}
                        onChange={handleProfileChange}
                        placeholder="Enter your phone number"
                        autoComplete="tel"
                      />
                    </label>
                  </div>

                  {profileMessage && (
                    <p className="dashboard-feedback" role="status">
                      {profileMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="dashboard-gold-button"
                  >
                    SAVE CHANGES
                    <span aria-hidden="true">→</span>
                  </button>
                </form>
              </section>
            </div>
          )}

          {/* ACCOUNT SETTINGS */}
          {activeTab === "settings" && (
            <div className="dashboard-content">
              {settingsPage === "main" && (
                <>
                  <section className="dashboard-panel">
                    <div className="dashboard-panel-heading">
                      <div>
                        <span className="dashboard-eyebrow">
                          ACCOUNT PREFERENCES
                        </span>
                        <h2>Account settings</h2>
                        <p>
                          Manage your security, account preferences and
                          important account information.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="dashboard-setting-item dashboard-setting-button"
                      onClick={() =>
                        setSettingsPage("password-security")
                      }
                    >
                      <div>
                        <h3>Password and security</h3>
                        <p>
                          Manage your password and keep your account secure.
                        </p>
                      </div>

                      <span
                        className="dashboard-setting-action"
                        aria-hidden="true"
                      >
                        →
                      </span>
                    </button>

                    <button
                      type="button"
                      className="dashboard-setting-item dashboard-setting-button"
                      onClick={() => setSettingsPage("active-sessions")}
                    >
                      <div>
                        <h3>Active sessions</h3>
                        <p>
                          Review devices signed into your account and
                          sign out of other sessions.
                        </p>
                      </div>

                      <span className="dashboard-setting-action" aria-hidden="true">
                        →
                      </span>
                    </button>

                    <div className="dashboard-setting-item">
                      <div>
                        <h3>Account information</h3>
                        <p>
                          Update your name, email address and phone number.
                        </p>
                      </div>

                      <button
                        type="button"
                        className="dashboard-text-button"
                        onClick={() => setActiveTab("profile")}
                      >
                        Edit profile <span aria-hidden="true">→</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      className="dashboard-setting-item dashboard-setting-button"
                      onClick={() => {
                        setDeleteAccountPassword("");
                        setDeleteAccountConfirmation("");
                        setDeleteAccountFeedback({ type: "", message: "" });
                        setSettingsPage("delete-account");
                      }}
                    >
                      <div>
                        <h3>Delete account</h3>
                        <p>
                          Permanently delete your ChopHub account and personal information.
                        </p>
                      </div>

                      <span className="dashboard-setting-action" aria-hidden="true">
                        →
                      </span>
                    </button>

                    <div className="dashboard-setting-item">
                      <div>
                        <h3>Privacy and terms</h3>
                        <p>
                          Read about how ChopHub handles your information
                          and account activity.
                        </p>
                      </div>

                      <div className="dashboard-legal-links">
                        <Link to="/privacy">Privacy</Link>
                        <Link to="/terms">Terms</Link>
                      </div>
                    </div>
                  </section>

                  <section className="dashboard-panel dashboard-preferences-panel">
                    <div className="dashboard-panel-heading">
                      <div>
                        <span className="dashboard-eyebrow">
                          YOUR PREFERENCES
                        </span>
                        <h2>Notification preferences</h2>
                        <p>
                          Choose the types of updates you would like
                          ChopHub to send you.
                        </p>
                      </div>
                    </div>

                    {notificationSettingsLoading && (
                      <p className="dashboard-feedback">
                        Loading your notification preferences...
                      </p>
                    )}

                    <div className="dashboard-preference-row">
                      <div>
                        <h3>Order updates</h3>
                        <p>Updates about order confirmation and fulfilment.</p>
                      </div>

                      <input
                        type="checkbox"
                        checked={notificationSettings.orderUpdates}
                        onChange={() =>
                          handleNotificationChange("orderUpdates")
                        }
                        aria-label="Enable order updates"
                        disabled={
                          notificationSettingsLoading ||
                          notificationSettingsSaving
                        }
                      />
                    </div>

                    <div className="dashboard-preference-row">
                      <div>
                        <h3>Promotions and offers</h3>
                        <p>
                          News about discounts, special offers and promotions.
                        </p>
                      </div>

                      <input
                        type="checkbox"
                        checked={notificationSettings.promotions}
                        onChange={() =>
                          handleNotificationChange("promotions")
                        }
                        aria-label="Enable promotions and offers"
                        disabled={
                          notificationSettingsLoading ||
                          notificationSettingsSaving
                        }
                      />
                    </div>

                    <div className="dashboard-preference-row">
                      <div>
                        <h3>Menu updates</h3>
                        <p>
                          Be notified when new meals are added, meals become
                          unavailable or are removed from the menu.
                        </p>
                      </div>

                      <input
                        type="checkbox"
                        checked={notificationSettings.menuUpdates}
                        onChange={() =>
                          handleNotificationChange("menuUpdates")
                        }
                        aria-label="Enable menu updates"
                        disabled={
                          notificationSettingsLoading ||
                          notificationSettingsSaving
                        }
                      />
                    </div>

                    <div className="dashboard-preference-row">
                      <div>
                        <h3>Price changes</h3>
                        <p>
                          Get notified when the prices of meals change.
                        </p>
                      </div>

                      <input
                        type="checkbox"
                        checked={notificationSettings.priceChanges}
                        onChange={() =>
                          handleNotificationChange("priceChanges")
                        }
                        aria-label="Enable price change notifications"
                        disabled={
                          notificationSettingsLoading ||
                          notificationSettingsSaving
                        }
                      />
                    </div>

                    <div className="dashboard-preference-row">
                      <div>
                        <h3>Account updates</h3>
                        <p>
                          Important information about your account.
                        </p>
                      </div>

                      <input
                        type="checkbox"
                        checked={notificationSettings.accountUpdates}
                        onChange={() =>
                          handleNotificationChange("accountUpdates")
                        }
                        aria-label="Enable account updates"
                        disabled={
                          notificationSettingsLoading ||
                          notificationSettingsSaving
                        }
                      />
                    </div>

                    {settingsMessage && (
                      <p className="dashboard-feedback" role="status">
                        {settingsMessage}
                      </p>
                    )}
                  </section>
                </>
              )}

              {/* PASSWORD AND SECURITY SUBPAGE */}
              {settingsPage === "password-security" && (
                <section className="dashboard-panel">
                  <button
                    type="button"
                    className="dashboard-text-button dashboard-settings-back"
                    onClick={() => {
                      setSettingsPage("main");
                      setPasswordFeedback({
                        type: "",
                        message: "",
                      });
                    }}
                  >
                    <span aria-hidden="true">←</span>
                    Back to account settings
                  </button>

                  <div className="dashboard-panel-heading">
                    <div>
                      <span className="dashboard-eyebrow">
                        ACCOUNT SECURITY
                      </span>
                      <h2>Password and security</h2>
                      <p>
                        Keep your ChopHub account secure by using a
                        strong password that only you know.
                      </p>
                    </div>
                  </div>

                  <div className="dashboard-setting-item">
                    <div>
                      <h3>Change password</h3>
                      <p>
                        Enter your current password and choose a new one.
                      </p>
                    </div>
                  </div>

                  <form
                    className="dashboard-password-form"
                    onSubmit={handleChangePassword}
                  >
                    <div className="dashboard-password-field">
                      <label htmlFor="current-password">
                        CURRENT PASSWORD
                      </label>
                      <input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(event) => {
                          setCurrentPassword(event.target.value);
                          setPasswordFeedback({
                            type: "",
                            message: "",
                          });
                        }}
                        placeholder="Enter your current password"
                        autoComplete="current-password"
                        required
                      />
                    </div>

                    <div className="dashboard-password-field">
                      <label htmlFor="new-password">
                        NEW PASSWORD
                      </label>
                      <input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(event) => {
                          setNewPassword(event.target.value);
                          setPasswordFeedback({
                            type: "",
                            message: "",
                          });
                        }}
                        placeholder="Enter your new password"
                        autoComplete="new-password"
                        minLength={8}
                        required
                      />
                    </div>

                    <div className="dashboard-password-field">
                      <label htmlFor="confirm-password">
                        CONFIRM NEW PASSWORD
                      </label>
                      <input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => {
                          setConfirmPassword(event.target.value);
                          setPasswordFeedback({
                            type: "",
                            message: "",
                          });
                        }}
                        placeholder="Enter your new password again"
                        autoComplete="new-password"
                        minLength={8}
                        required
                      />
                    </div>

                    <p className="dashboard-password-hint">
                      Your new password must contain at least 8 characters.
                    </p>

                    {passwordFeedback.message && (
                      <p
                        className={`dashboard-password-feedback ${passwordFeedback.type}`}
                        role={
                          passwordFeedback.type === "error"
                            ? "alert"
                            : "status"
                        }
                      >
                        {passwordFeedback.message}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="dashboard-gold-button dashboard-password-submit"
                      disabled={changingPassword}
                    >
                      {changingPassword
                        ? "UPDATING PASSWORD..."
                        : "CHANGE PASSWORD"}

                      {!changingPassword && (
                        <span aria-hidden="true">→</span>
                      )}
                    </button>
                  </form>
                </section>
              )}

              {/* ACTIVE SESSIONS SUBPAGE */}
              {settingsPage === "active-sessions" && (
                <section className="dashboard-panel">
                  <button
                    type="button"
                    className="dashboard-text-button dashboard-settings-back"
                    onClick={() => setSettingsPage("main")}
                  >
                    <span aria-hidden="true">←</span>
                    Back to account settings
                  </button>

                  <div className="dashboard-panel-heading">
                    <div>
                      <span className="dashboard-eyebrow">
                        ACCOUNT SECURITY
                      </span>
                      <h2>Active sessions</h2>
                      <p>
                        Review the devices currently signed into your
                        ChopHub account.
                      </p>
                    </div>
                  </div>

                  {activeSessionsError && (
                    <p className="dashboard-feedback" role="alert">
                      {activeSessionsError}
                    </p>
                  )}

                  {activeSessionsLoading ? (
                    <p className="dashboard-feedback">
                      Loading your active sessions...
                    </p>
                  ) : activeSessions.length === 0 ? (
                    <p className="dashboard-feedback">
                      No active sessions were found.
                    </p>
                  ) : (
                    <div className="dashboard-session-list">
                      {activeSessions.map((item) => (
                        <article
                          className="dashboard-setting-item"
                          key={item.session_id}
                        >
                          <div>
                            <h3>{getDeviceName(item.device_name)}</h3>
                            <p>
                              Signed in: {formatNotificationDate(item.created_at)}
                            </p>
                            <p>
                              Last active: {formatNotificationDate(item.last_active_at)}
                            </p>
                          </div>

                          <div className="dashboard-session-actions">
                            <span className="dashboard-setting-status">
                              {item.is_current ? "This device" : "Active"}
                            </span>

                            {!item.is_current && (
                              <button
                                type="button"
                                className="dashboard-session-revoke"
                                onClick={() => handleRevokeSession(item.session_id)}
                                disabled={revokingSessionId === item.session_id}
                              >
                                {revokingSessionId === item.session_id
                                  ? "Signing out..."
                                  : "Sign out"}
                              </button>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* DELETE ACCOUNT SUBPAGE */}
              {settingsPage === "delete-account" && (
                <section className="dashboard-panel">
                  <button
                    type="button"
                    className="dashboard-text-button dashboard-settings-back"
                    onClick={() => {
                      setSettingsPage("main");
                      setDeleteAccountPassword("");
                      setDeleteAccountConfirmation("");
                      setDeleteAccountFeedback({ type: "", message: "" });
                    }}
                    disabled={deletingAccount}
                  >
                    <span aria-hidden="true">←</span>
                    Back to account settings
                  </button>

                  <div className="dashboard-panel-heading">
                    <div>
                      <span className="dashboard-eyebrow">ACCOUNT MANAGEMENT</span>
                      <h2>Delete your account</h2>
                      <p>
                        This permanently removes your ChopHub login and personal account information.
                      </p>
                    </div>
                  </div>

                  <div className="dashboard-setting-item">
                    <div>
                      <h3>What will be deleted</h3>
                      <p>
                        Your profile, saved favourites, notification preferences, active sessions and account reviews will be removed.
                      </p>
                    </div>
                  </div>

                  <div className="dashboard-setting-item">
                    <div>
                      <h3>What will be retained</h3>
                      <p>
                        Order and payment records will be retained for business records. Personal details in orders and enquiries will be anonymized. Existing order items and payment records will remain.
                      </p>
                    </div>
                  </div>

                  <form
                    className="dashboard-password-form"
                    onSubmit={handleDeleteAccount}
                  >
                    <div className="dashboard-password-field">
                      <label htmlFor="delete-account-password">
                        CURRENT PASSWORD
                      </label>
                      <input
                        id="delete-account-password"
                        type="password"
                        value={deleteAccountPassword}
                        onChange={(event) => {
                          setDeleteAccountPassword(event.target.value);
                          setDeleteAccountFeedback({ type: "", message: "" });
                        }}
                        placeholder="Enter your current password"
                        autoComplete="current-password"
                        required
                        disabled={deletingAccount}
                      />
                    </div>

                    <div className="dashboard-password-field">
                      <label htmlFor="delete-account-confirmation">
                        TYPE DELETE MY ACCOUNT TO CONFIRM
                      </label>
                      <input
                        id="delete-account-confirmation"
                        type="text"
                        value={deleteAccountConfirmation}
                        onChange={(event) => {
                          setDeleteAccountConfirmation(event.target.value);
                          setDeleteAccountFeedback({ type: "", message: "" });
                        }}
                        placeholder="DELETE MY ACCOUNT"
                        autoComplete="off"
                        required
                        disabled={deletingAccount}
                      />
                    </div>

                    {deleteAccountFeedback.message && (
                      <p
                        className={`dashboard-password-feedback ${deleteAccountFeedback.type}`}
                        role={deleteAccountFeedback.type === "error" ? "alert" : "status"}
                      >
                        {deleteAccountFeedback.message}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="dashboard-session-revoke"
                      disabled={deletingAccount}
                    >
                      {deletingAccount
                        ? "DELETING ACCOUNT..."
                        : "PERMANENTLY DELETE ACCOUNT"}
                    </button>
                  </form>
                </section>
              )}
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="dashboard-content">
              <section className="dashboard-panel">
                <div className="dashboard-panel-heading">
                  <div>
                    <span className="dashboard-eyebrow">
                      STAY IN THE LOOP
                    </span>
                    <h2>Your notifications</h2>
                    <p>
                      Important updates about your orders and
                      ChopHub account will appear here.
                    </p>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      className="dashboard-text-button"
                      onClick={markAllAsRead}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <EmptyState
                    icon="notifications"
                    title="You're all caught up"
                    description="You don't have any notifications yet. When there are updates about your orders or account, you'll find them here."
                  />
                ) : (
                  <div className="dashboard-notification-list">
                    {notifications.map((notification) => (
                      <article
                        key={notification.id}
                        className={`dashboard-notification-card ${
                          !notification.read ? "unread" : ""
                        }`}
                      >
                        <div className="dashboard-notification-card-icon">
                          <DashboardIcon type="notifications" />
                        </div>

                        <div className="dashboard-notification-card-content">
                          <div className="dashboard-notification-card-meta">
                            <span>
                              {getNotificationTypeLabel(notification.type)}
                            </span>

                            <time dateTime={notification.createdAt}>
                              {formatNotificationDate(
                                notification.createdAt
                              )}
                            </time>
                          </div>

                          <h3>{notification.title}</h3>
                          <p>{notification.message}</p>

                          <div className="dashboard-notification-card-actions">
                            {!notification.read && (
                              <button
                                type="button"
                                onClick={() =>
                                  markAsRead(notification.id)
                                }
                              >
                                Mark as read
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                removeNotification(notification.id)
                              }
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        {!notification.read && (
                          <span
                            className="dashboard-notification-unread-dot"
                            aria-label="Unread"
                          />
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="dashboard-panel dashboard-preferences-panel">
                <div className="dashboard-panel-heading">
                  <div>
                    <span className="dashboard-eyebrow">
                      CONTROL YOUR UPDATES
                    </span>
                    <h2>Notification preferences</h2>
                    <p>
                      Choose which types of updates you want to receive.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="dashboard-text-button"
                    onClick={() => handleNavigate("settings")}
                  >
                    Manage preferences <span aria-hidden="true">→</span>
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* MY FAVOURITES */}
          {activeTab === "favourites" && (
            <div className="dashboard-content">
              <section className="dashboard-panel">
                <div className="dashboard-panel-heading">
                  <div>
                    <span className="dashboard-eyebrow">
                      YOUR PERSONAL COLLECTION
                    </span>
                    <h2>My favourite meals</h2>
                    <p>
                      Keep the meals you love close by so you can
                      find them again easily.
                    </p>
                  </div>

                  <span className="dashboard-favourite-count">
                    {favourites.length} saved
                  </span>
                </div>

                {favouritesLoading ? (
                  <p className="dashboard-feedback">
                    Loading your saved meals...
                  </p>
                ) : favouritesError ? (
                  <div>
                    <p className="dashboard-feedback" role="alert">
                      {favouritesError}
                    </p>
                  </div>
                ) : favourites.length === 0 ? (
                  <EmptyState
                    icon="favourites"
                    title="No favourites saved yet"
                    description="When you save meals from the menu, they'll appear here for easy access."
                    action="EXPLORE THE MENU"
                    onAction={handleExplore}
                  />
                ) : (
                  <>
                    {favouritesError && (
                      <p className="dashboard-feedback" role="alert">
                        {favouritesError}
                      </p>
                    )}

                    <div className="dashboard-favourites-grid">
                      {favourites.map((item) => {
                        const currentMeal = menuItems.find(
                          (menuItem) =>
                            String(menuItem.dbId) ===
                            String(item.menu_item_id)
                        );

                        const isAvailable =
                          currentMeal?.availability === "available";

                        const availabilityLabel = !currentMeal
                          ? "No longer on menu"
                          : currentMeal.availability === "unavailable"
                            ? "Unavailable"
                            : !isAvailable
                              ? "Temporarily unavailable"
                              : "";

                        return (
                          <article
                            className="dashboard-favourite-card"
                            key={item.menu_item_id}
                          >
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={getFavouriteName(item)}
                              />
                            ) : (
                              <div className="dashboard-favourite-image-placeholder">
                                <DashboardIcon type="favourites" />
                              </div>
                            )}

                            <div className="dashboard-favourite-info">
                              <h3>{getFavouriteName(item)}</h3>

                              {availabilityLabel && (
                                <span
                                  className="dashboard-setting-status"
                                  role="status"
                                >
                                  {availabilityLabel}
                                </span>
                              )}

                              <strong>{getFavouritePrice(item)}</strong>

                              <div className="dashboard-favourite-actions">
                                <button
                                  type="button"
                                  className="dashboard-gold-button"
                                  onClick={() =>
                                    handleOrderFavourite(item)
                                  }
                                  disabled={!isAvailable}
                                >
                                  {isAvailable ? "Order Now" : "Unavailable"}
                                  <span aria-hidden="true">→</span>
                                </button>

                                <Link to="/#menu">
                                  View menu
                                </Link>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveFavourite(item.menu_item_id)
                                  }
                                  disabled={
                                    removingFavouriteId === item.menu_item_id
                                  }
                                >
                                  {removingFavouriteId === item.menu_item_id
                                    ? "Removing..."
                                    : "Remove"}
                                </button>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </>
                )}
              </section>
            </div>
          )}
        </section>
      </div>

      {selectedMeal && (
        <MealDetailsModal
          item={selectedMeal}
          onClose={() => setSelectedMeal(null)}
        />
      )}
    </main>
  );
}

export default CustomerDashboard;
