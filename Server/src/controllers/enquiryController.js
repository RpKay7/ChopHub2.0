
import { supabase } from "../config/supabase.js";

// Convert database status to the admin dashboard format.
function formatStatus(status) {
  const statusMap = {
    pending: "New",
    new: "New",
    "in progress": "In Progress",
    resolved: "Resolved",
  };

  return statusMap[String(status || "").toLowerCase()] || "New";
}

// Convert database records into the format expected by the frontend.
function formatEnquiry(enquiry) {
  const createdAt = new Date(enquiry.created_at);

  return {
    id: enquiry.id,
    customerId: enquiry.customer_id,
    name: enquiry.full_name,
    email: enquiry.email,
    phone: enquiry.phone || "Not provided",
    type: enquiry.enquiry_type,
    subject: enquiry.enquiry_type,
    preferredDate: enquiry.preferred_date,
    preferredTime: enquiry.preferred_time,
    guestCount: enquiry.guest_count,
    message: enquiry.message || "",
    date: createdAt.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
    time: createdAt.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
    status: formatStatus(enquiry.status),
    createdAt: enquiry.created_at,
  };
}

// Notify all administrators when a new enquiry is submitted.
async function notifyAdminsOfNewEnquiry(enquiry) {
  try {
    const { data: admins, error: adminError } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "admin");

    if (adminError) throw adminError;

    if (!admins || admins.length === 0) {
      console.warn(
        "NEW ENQUIRY NOTIFICATION: No administrator accounts found."
      );
      return;
    }

    const notifications = admins.map((admin) => ({
      user_id: admin.id,
      title: "New customer enquiry",
      message: `${enquiry.full_name} submitted a new ${enquiry.enquiry_type} enquiry.`,
      type: "enquiry",
      is_read: false,
    }));

    const { error: notificationError } = await supabase
      .from("notifications")
      .insert(notifications);

    if (notificationError) throw notificationError;

    console.log(
      `NEW ENQUIRY NOTIFICATION: ${admins.length} administrator(s) notified.`
    );
  } catch (error) {
    console.error("ADMIN ENQUIRY NOTIFICATION ERROR:", error);
  }
}

// Notify a registered customer when an administrator changes their enquiry status.
async function notifyCustomerOfEnquiryStatus(enquiry, newStatus) {
  try {
    // Guest enquiries do not have an account to receive in-app notifications.
    if (!enquiry.customer_id) return;

    const notificationMessages = {
      pending: {
        title: "Enquiry reopened",
        message: "Your enquiry has been reopened and is awaiting attention.",
      },
      "in progress": {
        title: "Enquiry being handled",
        message: "Our team has started handling your enquiry.",
      },
      resolved: {
        title: "Enquiry resolved",
        message: "Your enquiry has been marked as resolved. Thank you for contacting ChopHub.",
      },
    };

    const notification = notificationMessages[newStatus];

    if (!notification) return;

    const { error } = await supabase.from("notifications").insert({
      user_id: enquiry.customer_id,
      title: notification.title,
      message: notification.message,
      type: "enquiry",
      is_read: false,
    });

    if (error) throw error;

    console.log(
      `CUSTOMER ENQUIRY NOTIFICATION: Customer ${enquiry.customer_id} notified.`
    );
  } catch (error) {
    // Notification failure must not prevent the status update.
    console.error("CUSTOMER ENQUIRY NOTIFICATION ERROR:", error);
  }
}

// Submit a new customer enquiry.
export async function createEnquiry(req, res) {
  try {
    const {
      full_name,
      email,
      phone,
      enquiry_type,
      preferred_date,
      preferred_time,
      guest_count,
      message,
    } = req.body;

    if (
      !full_name?.trim() ||
      !email?.trim() ||
      !enquiry_type?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email and enquiry type are required.",
      });
    }

    if (message && typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Message must be valid text.",
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    const { data, error } = await supabase
      .from("enquiries")
      .insert({
        customer_id: req.user?.id || null,
        full_name: full_name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        enquiry_type: enquiry_type.trim(),
        preferred_date: preferred_date || null,
        preferred_time: preferred_time || null,
        guest_count: guest_count ? Number(guest_count) : null,
        message: message?.trim() || null,
      })
      .select("*")
      .single();

    if (error) throw error;

    // Notify administrators after the enquiry has been saved.
    await notifyAdminsOfNewEnquiry(data);

    return res.status(201).json({
      success: true,
      message: "Your enquiry has been submitted successfully.",
      enquiry: formatEnquiry(data),
    });
  } catch (error) {
    console.error("CREATE ENQUIRY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit your enquiry.",
    });
  }
}

// Retrieve all enquiries for the admin dashboard.
export async function getAdminEnquiries(req, res) {
  try {
    const { data, error } = await supabase
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      enquiries: (data || []).map(formatEnquiry),
    });
  } catch (error) {
    console.error("GET ADMIN ENQUIRIES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load enquiries.",
    });
  }
}

// Update an enquiry's status.
export async function updateEnquiryStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const statusMap = {
      New: "pending",
      "In Progress": "in progress",
      Resolved: "resolved",
    };

    if (!statusMap[status]) {
      return res.status(400).json({
        success: false,
        message: "Invalid enquiry status.",
      });
    }

    // Retrieve the existing enquiry before updating it.
    const { data: existingEnquiry, error: fetchError } = await supabase
      .from("enquiries")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    const nextStatus = statusMap[status];
    const previousStatus = String(existingEnquiry.status || "").toLowerCase();

    // Save the new status.
    const { data, error } = await supabase
      .from("enquiries")
      .update({ status: nextStatus })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    // Only notify the customer when the status actually changes.
    if (previousStatus !== nextStatus) {
      await notifyCustomerOfEnquiryStatus(data, nextStatus);
    }

    return res.status(200).json({
      success: true,
      message: "Enquiry status updated successfully.",
      enquiry: formatEnquiry(data),
    });
  } catch (error) {
    console.error("UPDATE ENQUIRY STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update enquiry status.",
    });
  }
}

// Delete an enquiry.
export async function deleteEnquiry(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("enquiries")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: "Enquiry deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE ENQUIRY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete enquiry.",
    });
  }
}
