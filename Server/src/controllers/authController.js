
import { supabase } from "../config/supabase.js";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Create an isolated Supabase Auth client for each request.
function createAuthClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}

// Hash an access token before storing it.
function hashAccessToken(accessToken) {
  return crypto
    .createHash("sha256")
    .update(accessToken)
    .digest("hex");
}

// Register a customer's login session in the database.
async function createCustomerSession(req, userId, accessToken) {
  const userAgent =
    req.headers["user-agent"] || "Unknown device";

  const deviceName =
    userAgent.length > 250
      ? userAgent.substring(0, 250)
      : userAgent;

  const ipAddress =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.ip ||
    null;

  const accessTokenHash = hashAccessToken(accessToken);

  const { data, error } = await supabase
    .from("customer_sessions")
    .insert({
      customer_id: userId,
      device_name: deviceName,
      ip_address: ipAddress,
      access_token_hash: accessTokenHash,
    })
    .select(
      "session_id, device_name, created_at, last_active_at"
    )
    .single();

  if (error) {
    console.error("Session registration error:", error);
    throw error;
  }

  return data;
}

// CUSTOMER REGISTRATION
export async function register(req, res) {
  try {
    const { full_name, email, password, phone } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    const supabaseAuth = createAuthClient();

    const { data, error } = await supabaseAuth.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: full_name.trim(),
          phone: phone?.trim() || null,
        },
      },
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    let sessionRecord = null;

    // Register a session if Supabase immediately authenticates
    // the customer after registration.
    if (data.session?.access_token && data.user?.id) {
      try {
        sessionRecord = await createCustomerSession(
          req,
          data.user.id,
          data.session.access_token
        );
      } catch (sessionError) {
        console.error(
          "Registration session creation failed:",
          sessionError
        );

        return res.status(500).json({
          success: false,
          message:
            "Your account was created, but we couldn't register your session. Please try logging in.",
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: data.session
        ? "Registration successful!"
        : "Registration successful. Please check your email to verify your account.",
      user: data.user,
      session: data.session,
      sessionRecord,
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "An error occurred during registration.",
    });
  }
}

// CUSTOMER LOGIN
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const supabaseAuth = createAuthClient();

    const { data, error } =
      await supabaseAuth.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

    if (error) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    // Retrieve the customer's latest profile.
    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("id, full_name, phone, role")
        .eq("id", data.user.id)
        .single();

    if (profileError || !profile) {
      console.error(
        "Login profile lookup error:",
        profileError
      );

      return res.status(500).json({
        success: false,
        message: "Unable to retrieve your customer profile.",
      });
    }

    // Register this login session.
    const sessionRecord = await createCustomerSession(
      req,
      data.user.id,
      data.session.access_token
    );

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: profile.full_name,
        phone: profile.phone || "",
        role: profile.role,
      },
      session: data.session,
      sessionRecord,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "An error occurred during login.",
    });
  }
}

// REFRESH AN EXPIRED CUSTOMER ACCESS TOKEN
export async function refreshCustomerSession(req, res) {
  try {
    const { access_token, refresh_token } = req.body;

    if (!access_token || !refresh_token) {
      return res.status(400).json({
        success: false,
        message: "Access token and refresh token are required.",
      });
    }

    // Locate the existing registered ChopHub session using
    // the hash of the customer's previous access token.
    const oldTokenHash = hashAccessToken(access_token);

    const { data: existingSession, error: sessionError } =
      await supabase
        .from("customer_sessions")
        .select("id, customer_id, session_id, is_revoked")
        .eq("access_token_hash", oldTokenHash)
        .maybeSingle();

    if (sessionError) {
      console.error("Refresh session lookup error:", sessionError);

      return res.status(500).json({
        success: false,
        message: "Unable to verify your registered session.",
      });
    }

    if (!existingSession || existingSession.is_revoked) {
      return res.status(401).json({
        success: false,
        message: "This session is invalid or has been signed out.",
      });
    }

    // Ask Supabase to renew the session.
    const authClient = createAuthClient();

    const { data, error } = await authClient.auth.refreshSession({
      refresh_token,
    });

    if (error || !data.session || !data.user) {
      console.error("Supabase token refresh error:", error);

      return res.status(401).json({
        success: false,
        message: "Your session has expired. Please log in again.",
      });
    }

    // Ensure the refreshed token belongs to the same customer.
    if (data.user.id !== existingSession.customer_id) {
      return res.status(401).json({
        success: false,
        message: "Session verification failed.",
      });
    }

    // Store the hash of the newly issued access token.
    const newTokenHash = hashAccessToken(
      data.session.access_token
    );

    const { error: updateError } = await supabase
      .from("customer_sessions")
      .update({
        access_token_hash: newTokenHash,
        last_active_at: new Date().toISOString(),
      })
      .eq("id", existingSession.id)
      .eq("customer_id", data.user.id)
      .eq("is_revoked", false);

    if (updateError) {
      console.error("Refresh token hash update error:", updateError);

      return res.status(500).json({
        success: false,
        message: "Unable to update your registered session.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Session refreshed successfully.",
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        expires_in: data.session.expires_in,
        token_type: data.session.token_type,
      },
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      sessionRecord: {
        session_id: existingSession.session_id,
      },
    });
  } catch (error) {
    console.error("Customer session refresh error:", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while refreshing your session.",
    });
  }
}

// PASSWORD RECOVERY
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    const supabaseAuth = createAuthClient();

    const { error } =
      await supabaseAuth.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${process.env.CLIENT_URL}/reset-password`,
        }
      );

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "If an account exists, a password recovery email will be sent.",
    });
  } catch (error) {
    console.error("Password recovery error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process password recovery.",
    });
  }
}

// GET CURRENTLY AUTHENTICATED CUSTOMER
export async function getCurrentUser(req, res) {
  try {
    return res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        full_name: req.profile.full_name,
        phone: req.profile.phone || "",
        role: req.profile.role,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve your account details.",
    });
  }
}

// RESET PASSWORD
export async function resetPassword(req, res) {
  try {
    const { password, accessToken, refreshToken } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    if (!accessToken || !refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Recovery session is missing or invalid.",
      });
    }

    const authClient = createAuthClient();

    const { error: sessionError } =
      await authClient.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

    if (sessionError) {
      return res.status(401).json({
        success: false,
        message:
          "Your recovery session is invalid or expired. Request a new reset link.",
      });
    }

    const { error: updateError } =
      await authClient.auth.updateUser({
        password,
      });

    if (updateError) {
      return res.status(400).json({
        success: false,
        message: updateError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Your password has been updated successfully.",
    });
  } catch (error) {
    console.error("Password reset error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update password.",
    });
  }
}

// CHANGE PASSWORD
export async function changePassword(req, res) {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message:
          "Current password and new password are required.",
      });
    }

    if (new_password.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 8 characters long.",
      });
    }

    if (current_password === new_password) {
      return res.status(400).json({
        success: false,
        message:
          "Your new password must be different from your current password.",
      });
    }

    const authClient = createAuthClient();

    const { error: signInError } =
      await authClient.auth.signInWithPassword({
        email: req.user.email,
        password: current_password,
      });

    if (signInError) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    const { error: updateError } =
      await authClient.auth.updateUser({
        password: new_password,
      });

    if (updateError) {
      return res.status(400).json({
        success: false,
        message: updateError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message:
        "An unexpected error occurred while changing your password.",
    });
  }
}

// GET ACTIVE CUSTOMER SESSIONS
export async function getActiveSessions(req, res) {
  try {
    const { data: sessions, error } = await supabase
      .from("customer_sessions")
      .select(
        "id, session_id, device_name, last_active_at, created_at, is_revoked"
      )
      .eq("customer_id", req.user.id)
      .eq("is_revoked", false)
      .order("last_active_at", { ascending: false });

    if (error) {
      console.error("Fetch active sessions error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to retrieve active sessions.",
      });
    }

    const activeSessions = sessions.map((session) => ({
      ...session,
      is_current:
        session.session_id === req.sessionRecord?.session_id,
    }));

    return res.status(200).json({
      success: true,
      sessions: activeSessions,
    });
  } catch (error) {
    console.error("Active sessions error:", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred.",
    });
  }
}

// REVOKE AN ACTIVE CUSTOMER SESSION
export async function revokeActiveSession(req, res) {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "A session ID is required.",
      });
    }

    // Prevent customers from signing out the device they are using.
    if (sessionId === req.sessionRecord?.session_id) {
      return res.status(400).json({
        success: false,
        message: "You cannot sign out your current device here.",
      });
    }

    // Make sure the selected session belongs to this customer.
    const { data: targetSession, error: fetchError } = await supabase
      .from("customer_sessions")
      .select("id, session_id")
      .eq("customer_id", req.user.id)
      .eq("session_id", sessionId)
      .eq("is_revoked", false)
      .maybeSingle();

    if (fetchError) {
      console.error("Find session to revoke error:", fetchError);

      return res.status(500).json({
        success: false,
        message: "Unable to locate the selected session.",
      });
    }

    if (!targetSession) {
      return res.status(404).json({
        success: false,
        message: "Session not found or already signed out.",
      });
    }

    // Mark the selected session as revoked.
    const { error: revokeError } = await supabase
      .from("customer_sessions")
      .update({ is_revoked: true })
      .eq("id", targetSession.id);

    if (revokeError) {
      console.error("Revoke session error:", revokeError);

      return res.status(500).json({
        success: false,
        message: "Unable to sign out this device.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Device signed out successfully.",
    });
  } catch (error) {
    console.error("Revoke active session error:", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred.",
    });
  }
}

// PERMANENTLY DELETE CUSTOMER ACCOUNT
export async function deleteAccount(req, res) {
  try {
    const { current_password } = req.body;

    if (!current_password) {
      return res.status(400).json({
        success: false,
        message: "Your current password is required.",
      });
    }

    if (!req.user?.email || !req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unable to verify your account.",
      });
    }

    // Verify the customer's current password.
    const authClient = createAuthClient();

    const { error: passwordError } =
      await authClient.auth.signInWithPassword({
        email: req.user.email,
        password: current_password,
      });

    if (passwordError) {
      return res.status(401).json({
        success: false,
        message: "Your current password is incorrect.",
      });
    }

    // Permanently delete the Supabase Auth account.
    const { error: deleteAuthError } =
      await supabase.auth.admin.deleteUser(req.user.id);

    if (deleteAuthError) {
      console.error(
        "Auth account deletion error:",
        deleteAuthError
      );

      return res.status(500).json({
        success: false,
        message: "Unable to delete your account. Please try again.",
      });
    }

    // Anonymize customer records and delete the profile.
    const { error: cleanupError } = await supabase.rpc(
      "delete_customer_account_data",
      {
        p_customer_id: req.user.id,
      }
    );

    if (cleanupError) {
      console.error(
        "Account data cleanup error:",
        cleanupError
      );

      return res.status(500).json({
        success: false,
        accountDeleted: true,
        message:
          "Your login account was deleted, but some associated records could not be cleaned up. Please contact support.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Your ChopHub account has been permanently deleted.",
    });
  } catch (error) {
    console.error("Delete account error:", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while deleting your account.",
    });
  }
}
