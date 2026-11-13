
import { supabase } from "../config/supabase.js";

const PREFERENCE_FIELDS = `
  order_updates,
  promotions,
  account_updates,
  menu_updates,
  price_changes
`;

// Retrieve the authenticated customer's notification preferences.
export async function getNotificationPreferences(req, res) {
  try {
    const customerId = req.user.id;

    let { data: preferences, error } = await supabase
      .from("customer_notification_preferences")
      .select(PREFERENCE_FIELDS)
      .eq("customer_id", customerId)
      .maybeSingle();

    if (error) {
      console.error("Notification preferences lookup error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to retrieve notification preferences.",
      });
    }

    // Create default preferences if this is the customer's first visit.
    if (!preferences) {
      const { data: newPreferences, error: insertError } = await supabase
        .from("customer_notification_preferences")
        .insert({
          customer_id: customerId,
          order_updates: true,
          promotions: true,
          account_updates: true,
          menu_updates: true,
          price_changes: true,
        })
        .select(PREFERENCE_FIELDS)
        .single();

      if (insertError) {
        console.error(
          "Notification preferences creation error:",
          insertError.message
        );

        return res.status(500).json({
          success: false,
          message: "Unable to create notification preferences.",
        });
      }

      preferences = newPreferences;
    }

    return res.status(200).json({
      success: true,
      preferences,
    });
  } catch (error) {
    console.error("Get notification preferences error:", error);

    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving notification preferences.",
    });
  }
}

// Update the authenticated customer's notification preferences.
export async function updateNotificationPreferences(req, res) {
  try {
    const customerId = req.user.id;

    const {
      order_updates,
      promotions,
      account_updates,
      menu_updates,
      price_changes,
    } = req.body;

    // The original three settings remain required for backward compatibility.
    if (
      typeof order_updates !== "boolean" ||
      typeof promotions !== "boolean" ||
      typeof account_updates !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "The required notification preferences must be true or false.",
      });
    }

    // The two new settings are optional until the frontend is updated.
    if (
      (menu_updates !== undefined &&
        typeof menu_updates !== "boolean") ||
      (price_changes !== undefined &&
        typeof price_changes !== "boolean")
    ) {
      return res.status(400).json({
        success: false,
        message: "Menu and price notification preferences must be true or false.",
      });
    }

    const preferencesToSave = {
      customer_id: customerId,
      order_updates,
      promotions,
      account_updates,
      updated_at: new Date().toISOString(),
    };

    // Only include the new fields when the client sends them.
    // This prevents older frontend requests from resetting saved choices.
    if (menu_updates !== undefined) {
      preferencesToSave.menu_updates = menu_updates;
    }

    if (price_changes !== undefined) {
      preferencesToSave.price_changes = price_changes;
    }

    const { data: preferences, error } = await supabase
      .from("customer_notification_preferences")
      .upsert(preferencesToSave, {
        onConflict: "customer_id",
      })
      .select(PREFERENCE_FIELDS)
      .single();

    if (error) {
      console.error("Notification preferences update error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to save notification preferences.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification preferences saved successfully.",
      preferences,
    });
  } catch (error) {
    console.error("Update notification preferences error:", error);

    return res.status(500).json({
      success: false,
      message: "An error occurred while saving notification preferences.",
    });
  }
}
