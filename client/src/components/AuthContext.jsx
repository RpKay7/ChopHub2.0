
import API_BASE_URL from "../config/api.js";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

const AuthContext = createContext(null);

const API_URL = API_BASE_URL;
const SESSION_KEY = "chophub-auth-session";

function getInitialSession() {
  try {
    const persistentSession = localStorage.getItem(SESSION_KEY);

    if (persistentSession) {
      return {
        ...JSON.parse(persistentSession),
        rememberMe: true,
      };
    }

    const temporarySession = sessionStorage.getItem(SESSION_KEY);

    return temporarySession
      ? {
          ...JSON.parse(temporarySession),
          rememberMe: false,
        }
      : null;
  } catch (error) {
    console.error("Could not restore session:", error);
    return null;
  }
}

function formatUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    fullName:
      user.full_name ||
      user.fullName ||
      user.user_metadata?.full_name ||
      "Customer",
    email: user.email,
    phone:
      user.phone ||
      user.user_metadata?.phone ||
      "",
    role: user.role || "customer",
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(getInitialSession);

  const [user, setUser] = useState(() =>
    formatUser(getInitialSession()?.user)
  );

  const [loading, setLoading] = useState(true);
  const refreshPromiseRef = useRef(null);

  // Save the complete Supabase session.
  const saveSession = (
    authSession,
    authUser,
    rememberMe = true
  ) => {
    const sessionData = {
      access_token: authSession.access_token,
      refresh_token: authSession.refresh_token,
      expires_at: authSession.expires_at || null,
      expires_in: authSession.expires_in || null,
      token_type: authSession.token_type || "bearer",
      session_id: authSession.session_id || null,
      user: formatUser(authUser),
    };

    setSession({
      ...sessionData,
      rememberMe,
    });

    setUser(sessionData.user);

    try {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);

      const storage = rememberMe ? localStorage : sessionStorage;

      storage.setItem(
        SESSION_KEY,
        JSON.stringify(sessionData)
      );
    } catch (error) {
      console.error("Could not save session:", error);
    }

    return sessionData.user;
  };

  const clearSession = () => {
    setSession(null);
    setUser(null);

    try {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.error("Could not clear session:", error);
    }
  };

  // Renew an existing Supabase session.
  const refreshAuthSession = useCallback(
    async (sessionToRefresh = session) => {
      if (refreshPromiseRef.current) {
        return refreshPromiseRef.current;
      }

      if (
        !sessionToRefresh?.refresh_token ||
        !sessionToRefresh?.access_token
      ) {
        return {
          success: false,
          message: "Your login session is missing.",
        };
      }

      const refreshPromise = (async () => {
        try {
          const response = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              access_token: sessionToRefresh.access_token,
              refresh_token: sessionToRefresh.refresh_token,
            }),
          });

          const result = await response.json();

          if (
            !response.ok ||
            !result.success ||
            !result.session?.access_token ||
            !result.session?.refresh_token
          ) {
            throw new Error(
              result.message || "Session renewal failed."
            );
          }

          const rememberMe =
            sessionToRefresh.rememberMe !== false;

          const refreshedUser = {
            ...(sessionToRefresh.user || user || {}),
            ...(result.user || {}),
          };

          const sessionId =
            result.sessionRecord?.session_id ||
            sessionToRefresh.session_id ||
            null;

          const savedUser = saveSession(
            {
              ...result.session,
              session_id: sessionId,
            },
            refreshedUser,
            rememberMe
          );

          return {
            success: true,
            session: {
              ...result.session,
              session_id: sessionId,
              user: savedUser,
              rememberMe,
            },
          };
        } catch (error) {
          console.error("Session refresh failed:", error);

          return {
            success: false,
            message: error.message,
          };
        }
      })();

      refreshPromiseRef.current = refreshPromise;

      try {
        return await refreshPromise;
      } finally {
        refreshPromiseRef.current = null;
      }
    },
    [session, user]
  );

  // Verify and restore an existing login.
  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const storedSession = getInitialSession();

      if (
        !storedSession?.access_token ||
        !storedSession?.refresh_token
      ) {
        if (active) {
          clearSession();
          setLoading(false);
        }
        return;
      }

      try {
        let accessToken = storedSession.access_token;

        let response = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        let result = await response.json();

        if (response.status === 401) {
          const refreshResult = await refreshAuthSession(
            storedSession
          );

          if (!refreshResult.success) {
            throw new Error(
              refreshResult.message || "Your session has expired."
            );
          }

          accessToken =
            refreshResult.session.access_token;

          response = await fetch(`${API_URL}/auth/me`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          result = await response.json();
        }

        if (!response.ok || !result.success || !result.user) {
          throw new Error(
            result.message || "Your session could not be restored."
          );
        }

        if (active) {
          const currentSession =
            getInitialSession() || storedSession;

          saveSession(
            {
              ...currentSession,
              access_token: accessToken,
            },
            result.user,
            storedSession.rememberMe !== false
          );
        }
      } catch (error) {
        console.error("Session restoration failed:", error);

        if (active) {
          clearSession();
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  // Automatically renew the token shortly before expiration.
  useEffect(() => {
    if (!session?.access_token || !session?.refresh_token) {
      return;
    }

    if (!session.expires_at) {
      return;
    }

    const expirationTime = session.expires_at * 1000;
    const renewalDelay = Math.max(
      expirationTime - Date.now() - 60000,
      5000
    );

    const timer = setTimeout(async () => {
      const result = await refreshAuthSession(session);

      if (!result.success) {
        console.error(
          "Automatic session renewal failed:",
          result.message
        );
      }
    }, renewalDelay);

    return () => clearTimeout(timer);
  }, [
    session?.access_token,
    session?.refresh_token,
    session?.expires_at,
    refreshAuthSession,
  ]);

  // Register a new customer.
  const register = async (accountDetails) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: accountDetails.fullName.trim(),
          email: accountDetails.email.trim().toLowerCase(),
          phone: accountDetails.phone.trim(),
          password: accountDetails.password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        return {
          success: false,
          message: result.message || "Registration failed.",
        };
      }

      // Do not create a login session before email verification.
      return {
        success: true,
        user: formatUser(result.user),
        email: result.email || accountDetails.email.trim().toLowerCase(),
        requiresEmailConfirmation: true,
        message:
          result.message ||
          "Please check your email for your verification code.",
      };
    } catch (error) {
      console.error("Registration error:", error);

      return {
        success: false,
        message: "Unable to connect to ChopHub. Please try again.",
      };
    }
  };

  // Verify a customer's six-digit email code.
  const verifyEmail = async (email, token) => {
    try {
      const response = await fetch(`${API_URL}/auth/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          token: String(token).trim(),
        }),
      });

      const result = await response.json();

      if (
        !response.ok ||
        !result.success ||
        !result.session?.access_token
      ) {
        return {
          success: false,
          message:
            result.message || "Email verification failed.",
        };
      }

      // Save the customer session only after successful verification.
      const sessionUser = saveSession(
        {
          ...result.session,
          session_id:
            result.sessionRecord?.session_id || null,
        },
        result.user,
        true
      );

      return {
        success: true,
        user: sessionUser,
        message:
          result.message || "Email verified successfully!",
      };
    } catch (error) {
      console.error("Email verification error:", error);

      return {
        success: false,
        message: "Unable to connect to ChopHub. Please try again.",
      };
    }
  };

  // Request a new six-digit email verification code.
  const resendVerificationCode = async (email) => {
    try {
      const response = await fetch(
        `${API_URL}/auth/resend-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        return {
          success: false,
          message:
            result.message ||
            "Unable to resend your verification code.",
        };
      }

      return {
        success: true,
        message:
          result.message ||
          "A new verification code has been sent.",
      };
    } catch (error) {
      console.error("Resend verification code error:", error);

      return {
        success: false,
        message: "Unable to connect to ChopHub. Please try again.",
      };
    }
  };

  // Request a password recovery email.
  const forgotPassword = async (email) => {
    try {
      const response = await fetch(
        `${API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        return {
          success: false,
          message:
            result.message ||
            "Unable to process your password recovery request.",
        };
      }

      return {
        success: true,
        message:
          result.message ||
          "If an account exists, a password recovery email will be sent.",
      };
    } catch (error) {
      console.error("Forgot password error:", error);

      return {
        success: false,
        message: "Unable to connect to ChopHub. Please try again.",
      };
    }
  };

  // Log in through the backend.
  const login = async (
    emailAddress,
    password,
    rememberMe = true
  ) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailAddress.trim().toLowerCase(),
          password,
        }),
      });

      const result = await response.json();

      if (
        !response.ok ||
        !result.success ||
        !result.session?.access_token
      ) {
        return {
          success: false,
          message: result.message || "Login failed.",
        };
      }

      const sessionUser = saveSession(
        {
          ...result.session,
          session_id:
            result.sessionRecord?.session_id || null,
        },
        result.user,
        rememberMe
      );

      return {
        success: true,
        user: sessionUser,
      };
    } catch (error) {
      console.error("Login error:", error);

      return {
        success: false,
        message: "Unable to connect to ChopHub. Please try again.",
      };
    }
  };

  // Update the customer's profile.
  const updateProfile = async (profileDetails) => {
    if (!session?.access_token) {
      return {
        success: false,
        message: "Please sign in again to update your profile.",
      };
    }

    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          full_name: profileDetails.fullName.trim(),
          phone: profileDetails.phone.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success || !result.profile) {
        return {
          success: false,
          message:
            result.message || "Unable to update your profile.",
        };
      }

      const updatedUser = {
        ...user,
        fullName: result.profile.full_name,
        phone: result.profile.phone || "",
      };

      saveSession(
        session,
        {
          ...updatedUser,
          full_name: updatedUser.fullName,
        },
        session.rememberMe
      );

      return {
        success: true,
        user: updatedUser,
        message: result.message,
      };
    } catch (error) {
      console.error("Profile update error:", error);

      return {
        success: false,
        message: "Unable to connect to ChopHub. Please try again.",
      };
    }
  };

  // Log out the current customer.
  const logout = () => {
    clearSession();
  };

  const value = {
    user,
    accounts: [],
    session,
    loading,
    isAuthenticated: Boolean(user),
    register,
    verifyEmail,
    resendVerificationCode,
    forgotPassword,
    login,
    updateProfile,
    logout,
    refreshAuthSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider"
    );
  }

  return context;
}
