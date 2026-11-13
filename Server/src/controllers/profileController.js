import { supabase } from "../config/supabase.js";

export async function updateProfile(req, res) {
  try {
    const { full_name, phone } = req.body;

    if (
      typeof full_name !== "string" ||
      !full_name.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide your full name.",
      });
    }

    if (
      phone !== undefined &&
      typeof phone !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid phone number.",
      });
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .update({
        full_name: full_name.trim(),
        phone: phone?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", req.user.id)
      .select("id, full_name, phone, role")
      .single();

    if (error) {
      console.error("Profile update error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to update your profile.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Your profile has been updated successfully.",
      profile,
    });
  } catch (error) {
    console.error("Profile update error:", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred.",
    });
  }
}