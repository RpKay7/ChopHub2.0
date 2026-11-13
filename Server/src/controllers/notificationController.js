
import { supabase } from "../config/supabase.js";

// GET ALL NOTIFICATIONS FOR THE AUTHENTICATED CUSTOMER
export async function getNotifications(req, res) {
  try {
    const customerId = req.user.id;

    const { data, error } = await supabase
      .from("notifications")
      .select(`
        id,
        order_id,
        title,
        message,
        type,
        is_read,
        created_at
      `)
      .eq("user_id", customerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Notifications retrieval error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to retrieve notifications.",
      });
    }

    return res.status(200).json({
      success: true,
      notifications: data || [],
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while retrieving notifications.",
    });
  }
}

// MARK A SINGLE NOTIFICATION AS READ
export async function markNotificationAsRead(req, res) {
  try {
    const customerId = req.user.id;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "A notification ID is required.",
      });
    }

    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .eq("user_id", customerId)
      .select("id, is_read")
      .maybeSingle();

    if (error) {
      console.error("Mark notification as read error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to update notification.",
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      notification: data,
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred.",
    });
  }
}

// MARK ALL CUSTOMER NOTIFICATIONS AS READ
export async function markAllNotificationsAsRead(req, res) {
  try {
    const customerId = req.user.id;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", customerId)
      .eq("is_read", false);

    if (error) {
      console.error("Mark all notifications as read error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to update notifications.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred.",
    });
  }
}

// DELETE A SINGLE CUSTOMER NOTIFICATION
export async function deleteNotification(req, res) {
  try {
    const customerId = req.user.id;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "A notification ID is required.",
      });
    }

    const { data, error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id)
      .eq("user_id", customerId)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("Delete notification error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to delete notification.",
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully.",
    });
  } catch (error) {
    console.error("Delete notification error:", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred.",
    });
  }
}

// CLEAR ALL NOTIFICATIONS FOR THE AUTHENTICATED CUSTOMER
export async function clearNotifications(req, res) {
  try {
    const customerId = req.user.id;

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", customerId);

    if (error) {
      console.error("Clear notifications error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to clear notifications.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "All notifications cleared successfully.",
    });
  } catch (error) {
    console.error("Clear notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred.",
    });
  }
}
