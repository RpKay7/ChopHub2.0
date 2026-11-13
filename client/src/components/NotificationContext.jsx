import API_BASE_URL from "../config/api.js";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

const API_URL = API_BASE_URL;
export function NotificationProvider({ children }) {
  const { user, session, refreshAuthSession } = useAuth();

  const userId = user?.id || null;
  const accessToken = session?.access_token || null;

  const [notifications, setNotifications] = useState([]);

  // Make an authenticated request.
  // If the access token has expired, refresh it and retry once.
  const authenticatedRequest = useCallback(
    async (url, options = {}) => {
      if (!session?.access_token) {
        throw new Error("You are not signed in.");
      }

      const makeRequest = (token) =>
        fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
          },
        });

      let response = await makeRequest(session.access_token);

      // Attempt token renewal if the server rejects the access token.
      if (response.status === 401 && refreshAuthSession) {
        const refreshResult = await refreshAuthSession(session);

        if (!refreshResult?.success || !refreshResult.session?.access_token) {
          throw new Error(
            refreshResult?.message ||
              "Your session could not be renewed. Please log in again."
          );
        }

        // Retry the original request with the renewed access token.
        response = await makeRequest(
          refreshResult.session.access_token
        );
      }

      return response;
    },
    [session, refreshAuthSession]
  );

  // Safely read API responses.
  const readResponse = async (response) => {
    let result = {};

    try {
      result = await response.json();
    } catch {
      // Leave result empty if the response has no JSON body.
    }

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "The request could not be completed."
      );
    }

    return result;
  };

  // Fetch notifications belonging to the currently signed-in customer.
  const fetchNotifications = useCallback(async () => {
    if (!userId || !accessToken) {
      setNotifications([]);
      return;
    }

    try {
      const response = await authenticatedRequest(
        `${API_URL}/notifications`
      );

      const result = await readResponse(response);

      const formattedNotifications = (
        result.notifications || []
      ).map((notification) => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type || "general",
        read: notification.is_read,
        createdAt: notification.created_at,
        relatedId: notification.order_id || null,
      }));

      setNotifications(formattedNotifications);
    } catch (error) {
      console.error("Could not fetch notifications:", error);
    }
  }, [userId, accessToken, authenticatedRequest]);

  // Load notifications after login and refresh them every 15 seconds.
  useEffect(() => {
    if (!userId || !accessToken) {
      setNotifications([]);
      return;
    }

    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 15000);

    return () => clearInterval(interval);
  }, [userId, accessToken, fetchNotifications]);

  // Mark one notification as read.
  const markAsRead = async (notificationId) => {
    if (!accessToken) return;

    try {
      const response = await authenticatedRequest(
        `${API_URL}/notifications/${notificationId}/read`,
        { method: "PATCH" }
      );

      await readResponse(response);

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Could not mark notification as read:", error);
    }
  };

  // Mark every notification as read.
  const markAllAsRead = async () => {
    if (!accessToken) return;

    try {
      const response = await authenticatedRequest(
        `${API_URL}/notifications/read-all`,
        { method: "PATCH" }
      );

      await readResponse(response);

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
    } catch (error) {
      console.error("Could not mark all notifications as read:", error);
    }
  };

  // Delete one notification.
  const removeNotification = async (notificationId) => {
    if (!accessToken) return;

    try {
      const response = await authenticatedRequest(
        `${API_URL}/notifications/${notificationId}`,
        { method: "DELETE" }
      );

      await readResponse(response);

      setNotifications((previous) =>
        previous.filter(
          (notification) => notification.id !== notificationId
        )
      );
    } catch (error) {
      console.error("Could not delete notification:", error);
    }
  };

  // Delete all notifications belonging to the current customer.
  const clearNotifications = async () => {
    if (!accessToken) return;

    try {
      const response = await authenticatedRequest(
        `${API_URL}/notifications`,
        { method: "DELETE" }
      );

      await readResponse(response);

      setNotifications([]);
    } catch (error) {
      console.error("Could not clear notifications:", error);
    }
  };

  // Retained for compatibility with existing components.
  // This creates a local notification only.
  const addNotification = (notification) => {
    if (!userId) return null;

    const newNotification = {
      id: `local-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      title: notification.title,
      message: notification.message,
      type: notification.type || "general",
      read: false,
      createdAt: new Date().toISOString(),
      relatedId: notification.relatedId || null,
    };

    setNotifications((previous) => [
      newNotification,
      ...previous,
    ]);

    return newNotification;
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used inside a NotificationProvider"
    );
  }

  return context;
}
