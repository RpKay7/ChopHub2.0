
import { supabase } from "../config/supabase.js";

// Get restaurant settings.
export const getSettings = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("restaurant_settings")
      .select("settings, updated_at")
      .eq("id", "default")
      .maybeSingle();

    if (error) {
      console.error("GET SETTINGS ERROR:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve restaurant settings.",
      });
    }

    return res.status(200).json({
      success: true,
      settings: data?.settings || {},
      updatedAt: data?.updated_at || null,
    });
  } catch (error) {
    console.error("GET SETTINGS SERVER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred.",
    });
  }
};

// Save restaurant settings.
export const updateSettings = async (req, res) => {
  try {
    const settings = req.body;

    if (
      !settings ||
      typeof settings !== "object" ||
      Array.isArray(settings)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid settings data.",
      });
    }

    const { data, error } = await supabase
      .from("restaurant_settings")
      .upsert(
        {
          id: "default",
          settings,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )
      .select("settings, updated_at")
      .single();

    if (error) {
      console.error("UPDATE SETTINGS ERROR:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to save restaurant settings.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Restaurant settings saved successfully.",
      settings: data.settings,
      updatedAt: data.updated_at,
    });
  } catch (error) {
    console.error("UPDATE SETTINGS SERVER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred.",
    });
  }
};
