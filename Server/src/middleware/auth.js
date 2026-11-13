
import crypto from "crypto";
import { supabase } from "../config/supabase.js";

// Verify that a request comes from an authenticated user
// and a registered, non-revoked ChopHub session.
export async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token is missing.",
      });
    }

    // Verify the token with Supabase Auth.
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired access token.",
      });
    }

    // Hash the supplied access token.
    const accessTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find the corresponding ChopHub session.
    const {
      data: session,
      error: sessionError,
    } = await supabase
      .from("customer_sessions")
      .select("id, session_id, is_revoked")
      .eq("customer_id", user.id)
      .eq("access_token_hash", accessTokenHash)
      .maybeSingle();

    if (sessionError) {
      console.error(
        "Session verification error:",
        sessionError.message
      );

      return res.status(500).json({
        success: false,
        message: "Unable to verify your login session.",
      });
    }

    if (!session) {
      return res.status(401).json({
        success: false,
        message:
          "This session is not registered. Please log in again.",
      });
    }

    if (session.is_revoked) {
      return res.status(401).json({
        success: false,
        message:
          "This session has been signed out. Please log in again.",
      });
    }

    // Update the session's last activity.
    const { error: activityError } = await supabase
      .from("customer_sessions")
      .update({
        last_active_at: new Date().toISOString(),
      })
      .eq("id", session.id);

    if (activityError) {
      console.error(
        "Session activity update error:",
        activityError.message
      );
    }

    // Retrieve the user's profile and role.
    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("id, full_name, phone, role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error(
        "Profile lookup error:",
        profileError.message
      );

      return res.status(500).json({
        success: false,
        message: "Unable to verify user profile.",
      });
    }

    if (!profile) {
      return res.status(403).json({
        success: false,
        message: "User profile not found.",
      });
    }

    // Attach authenticated information to the request.
    req.user = user;
    req.profile = profile;
    req.sessionRecord = session;

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    return res.status(500).json({
      success: false,
      message: "An authentication error occurred.",
    });
  }
}

// Authenticate a user when a token is provided,
// but allow guests to continue without authentication.
export async function optionalAuthenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;

  // No authorization header: continue as a guest.
  if (!authHeader) {
    return next();
  }

  // A supplied authorization header must be valid.
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Invalid authorization header.",
    });
  }

  // Reuse the full authentication and session verification logic.
  return authenticateUser(req, res, next);
}

// Restrict certain routes to administrators.
export function requireAdmin(req, res, next) {
  if (!req.user || !req.profile) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (req.profile.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Administrator access required.",
    });
  }

  next();
}
