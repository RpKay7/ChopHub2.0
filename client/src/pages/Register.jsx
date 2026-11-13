
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import "./Register.css";

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

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback("");

    if (isSubmitting) return;

    const formData = new FormData(event.currentTarget);

    const fullName = formData.get("fullName");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (password !== confirmPassword) {
      setFeedback("Your passwords do not match. Please check and try again.");
      return;
    }

    if (!acceptedTerms) {
      setFeedback("Please accept the Terms and Conditions to continue.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await register({
        fullName,
        email,
        phone,
        password,
      });

      if (!result.success) {
        setFeedback(result.message);
        return;
      }

      if (result.requiresEmailConfirmation) {
        setFeedback(
          result.message ||
          "Account created! Please check your email to confirm your account before signing in."
        );

        return;
      }

      navigate("/account", { replace: true });
    } catch (error) {
      console.error("Registration submission error:", error);

      setFeedback("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page register-page">
      <div className="auth-background-glow auth-background-glow-one" />
      <div className="auth-background-glow auth-background-glow-two" />

      <header className="auth-header">
        <ChopHubLogo />

        <Link to="/" className="auth-back-home">
          <span aria-hidden="true">←</span>
          Back to home
        </Link>
      </header>

      <section className="register-layout">
        <div className="register-visual">
          <div className="register-visual-image">
            <div className="register-visual-overlay" />

            <div className="register-visual-content">
              <span className="auth-eyebrow">
                THERE'S A SEAT FOR YOU
              </span>

              <h1>
                Good food.
                <br />
                Great moments.
                <br />
                <span>One table.</span>
              </h1>

              <p>
                Create your ChopHub account and make every meal
                something worth looking forward to.
              </p>

              <div className="auth-visual-line">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        </div>

        <div className="register-form-side">
          <div className="register-form-container">
            <div className="auth-form-heading">
              <span className="auth-eyebrow">JOIN THE TABLE</span>

              <h2>
                Create your <span>account.</span>
              </h2>

              <p>
                A few details and you'll be ready to get started.
              </p>
            </div>

            <form className="auth-form register-form" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="register-name">Full name</label>

                <input
                  id="register-name"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  autoComplete="name"
                  minLength={2}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="register-email">Email address</label>

                <input
                  id="register-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="register-phone">Phone number</label>

                <input
                  id="register-phone"
                  name="phone"
                  type="tel"
                  placeholder="e.g. 08012345678"
                  autoComplete="tel"
                  minLength={7}
                  maxLength={20}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="register-password">Password</label>

                <div className="auth-password-wrap">
                  <input
                    id="register-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    autoComplete="new-password"
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

                <span className="register-field-hint">
                  Use at least 8 characters.
                </span>
              </div>

              <div className="auth-field">
                <label htmlFor="register-confirm-password">
                  Confirm password
                </label>

                <div className="auth-password-wrap">
                  <input
                    id="register-confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Enter your password again"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword((previous) => !previous)
                    }
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
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

              <label className="auth-remember register-terms">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => setAcceptedTerms(event.target.checked)}
                />

                <span className="auth-custom-checkbox" />

                <span>
                  I agree to the{" "}
                  <Link to="/terms" onClick={(event) => event.stopPropagation()}>
                    Terms and Conditions
                  </Link>
                  {" "}and{" "}
                  <Link
                    to="/privacy"
                    onClick={(event) => event.stopPropagation()}
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
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
                {isSubmitting ? "Creating account..." : "Create account"}
                {!isSubmitting && <span aria-hidden="true">→</span>}
              </button>
            </form>

            <div className="auth-switch">
              Already have an account?
              <Link to="/login">Sign in</Link>
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

export default Register;
