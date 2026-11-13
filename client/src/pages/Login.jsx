
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import "./Login.css";

function ChopHubLogo() {
  return (
    <Link to="/" className="auth-brand" aria-label="ChopHub home">
      <svg
        className="auth-brand-mark"
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 36.5C8 23.8 16 13.5 26 13.5C36 13.5 44 23.8 44 36.5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M15 36.5C15 28.3 19.9 21.5 26 21.5C32.1 21.5 37 28.3 37 36.5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M26 8V17M21.5 12.5H30.5"
          stroke="#B85C45"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M7 42H45"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>

      <span className="auth-brand-name">
        Chop<span>Hub</span>
      </span>
    </Link>
  );
}

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback("");

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);

      const email = formData.get("email");
      const password = formData.get("password");

      const result = await login(email, password, rememberMe);

      if (!result.success) {
        setFeedback(result.message);
        return;
      }

      const destination =
        result.user?.role === "admin"
          ? "/admin"
          : location.state?.from?.pathname || "/";

      navigate(destination, { replace: true });
    } catch (error) {
      console.error("Login submission error:", error);
      setFeedback("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-background-glow auth-background-glow-one" />
      <div className="auth-background-glow auth-background-glow-two" />

      <header className="auth-header">
        <ChopHubLogo />

        <Link to="/" className="auth-back-home">
          <span aria-hidden="true">←</span>
          Back to home
        </Link>
      </header>

      <section className="auth-layout">
        <div className="auth-visual">
          <div className="auth-visual-image">
            <div className="auth-visual-overlay" />

            <div className="auth-visual-content">
              <span className="auth-eyebrow">
                GOOD FOOD. GOOD COMPANY.
              </span>

              <h1>
                Your table
                <br />
                is waiting.
              </h1>

              <p>
                Sign in and pick up where your cravings left off.
                Something delicious is never too far away.
              </p>

              <div className="auth-visual-line">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form-side">
          <div className="auth-form-container">
            <div className="auth-form-heading">
              <span className="auth-eyebrow">WELCOME BACK</span>

              <h2>Good to see you <span>again.</span></h2>

              <p>
                Sign in to your ChopHub account to continue.
              </p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="login-email">Email address</label>

                <input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="auth-field">
                <div className="auth-label-row">
                  <label htmlFor="login-password">Password</label>

                  <Link to="/forgot-password" className="auth-text-link">
                    Forgot password?
                  </Link>
                </div>

                <div className="auth-password-wrap">
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    minLength={8}
                    required
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword((previous) => !previous)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                          d="M3 3L21 21M10.6 10.7A2 2 0 0013.4 13.5"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                        />
                        <path
                          d="M9.9 5.2A10.8 10.8 0 0112 5c5.2 0 8.7 4.7 9.5 6-.3.5-1.2 1.8-2.7 3"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                        />
                        <path
                          d="M6.2 6.3C3.9 7.8 2.7 9.8 2.5 11c.8 1.3 4.3 6 9.5 6 1 0 2-.2 2.9-.5"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                          d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinejoin="round"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="2.5"
                          stroke="currentColor"
                          strokeWidth="1.7"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <label className="auth-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <span className="auth-custom-checkbox" />
                <span>Remember me</span>
              </label>

              {feedback && (
                <p className="auth-feedback" role="alert">
                  {feedback}
                </p>
              )}

              <button
                type="submit"
                className="auth-submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
                {!isSubmitting && <span aria-hidden="true">→</span>}
              </button>
            </form>

            <div className="auth-switch">
              Don't have an account?
              <Link to="/register">Create an account</Link>
            </div>

            <div className="auth-form-footer">
              <span>CHOPHUB</span>
              <span>BUILT AROUND GOOD FOOD.</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Login;
