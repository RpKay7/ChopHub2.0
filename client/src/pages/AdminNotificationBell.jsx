
import { useEffect, useRef, useState } from "react";
import { useNotifications } from "../components/NotificationContext";
import "./AdminNotificationBell.css";

function formatNotificationDate(dateValue) {
  if (!dateValue) return "Just now";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "Just now";

  return date.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getNotificationIcon(type) {
  const normalized = String(type || "general").toLowerCase();

  if (normalized.includes("enquir")) return "✉";
  if (normalized.includes("order")) return "▤";
  if (normalized.includes("menu") || normalized.includes("meal")) return "♨";
  if (normalized.includes("promotion")) return "✦";
  if (normalized.includes("security") || normalized.includes("account")) return "⌑";

  return "●";
}

export default function AdminNotificationBell() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleNotificationClick(notification) {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
  }

  return (
    <div className="admin-notification-wrapper" ref={panelRef}>
      <button
        type="button"
        className={`admin-notification-trigger ${
          isOpen ? "is-open" : ""
        }`}
        onClick={() => setIsOpen((previous) => !previous)}
        aria-label={`Notifications. ${unreadCount} unread`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>

        {unreadCount > 0 && (
          <span className="admin-notification-count">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <section
          className="admin-notification-panel"
          role="dialog"
          aria-label="Admin notifications"
        >
          <div className="admin-notification-heading">
            <div>
              <span>WORKSPACE UPDATES</span>
              <h2>Notifications</h2>
              <p>
                {unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                  : "You're all caught up."}
              </p>
            </div>

            <button
              type="button"
              className="admin-notification-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close notifications"
            >
              ×
            </button>
          </div>

          {notifications.length > 0 && (
            <div className="admin-notification-actions">
              <button
                type="button"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                Mark all as read
              </button>

              <button
                type="button"
                onClick={clearNotifications}
              >
                Clear all
              </button>
            </div>
          )}

          <div className="admin-notification-list">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <article
                  className={`admin-notification-item ${
                    notification.read ? "is-read" : "is-unread"
                  }`}
                  key={notification.id}
                >
                  <button
                    type="button"
                    className="admin-notification-main"
                    onClick={() =>
                      handleNotificationClick(notification)
                    }
                  >
                    <span className="admin-notification-icon">
                      {getNotificationIcon(notification.type)}
                    </span>

                    <span className="admin-notification-copy">
                      <strong>{notification.title}</strong>
                      <span>{notification.message}</span>
                      <small>
                        {formatNotificationDate(notification.createdAt)}
                      </small>
                    </span>

                    {!notification.read && (
                      <span className="admin-notification-unread-dot" />
                    )}
                  </button>

                  <button
                    type="button"
                    className="admin-notification-delete"
                    onClick={() =>
                      removeNotification(notification.id)
                    }
                    aria-label={`Delete notification: ${notification.title}`}
                    title="Delete notification"
                  >
                    ×
                  </button>
                </article>
              ))
            ) : (
              <div className="admin-notification-empty">
                <span>♧</span>
                <strong>No notifications yet</strong>
                <p>
                  New enquiries and other important workspace
                  updates will appear here.
                </p>
              </div>
            )}
          </div>

          <div className="admin-notification-footer">
            <span>ChopHub workspace updates</span>
            <span>Refreshes automatically</span>
          </div>
        </section>
      )}
    </div>
  );
}
