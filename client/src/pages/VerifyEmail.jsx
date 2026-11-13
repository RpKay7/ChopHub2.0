
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import "./VerifyEmail.css";

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

function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { verifyEmail, resendVerificationCode } = useAuth();

  const email = searchParams.get("email") || "";

  const [token, setToken] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback("");

    if (isSubmitting) return;

    if (!email) {
      setFeedback("Email address is missing. Please register again.");
      return;
    }

    if (!/^\d{8}$/.test(token)) {
      setFeedback("Please enter the eight-digit verification code.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await verifyEmail(email, token);

      if (!result.success) {
        setFeedback(result.message);
        return;
      }

      navigate("/account", { replace: true });
    } catch (error) {
      console.error("Email verification submission error:", error);
      setFeedback("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (isResending || !email) return;

    setFeedback("");
    setIsResending(true);

    try {
      const result = await resendVerificationCode(email);
      setFeedback(result.message);
    } catch (error) {
      console.error("Resend verification code submission error:", error);
      setFeedback("Something went wrong. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="auth-page verify-email-page">
      <div className="auth-background-glow auth-background-glow-one" />
      <div className="auth-background-glow auth-background-glow-two" />

      <header className="auth-header">
        <ChopHubLogo />

        <Link to="/" className="auth-back-home">
          <span aria-hidden="true">←</span>
          Back to home
        </Link>
      </header>

      <section className="verify-email-layout">
        <div className="verify-email-card">
          <div className="verify-email-icon" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none">
              <rect
                x="8"
                y="15"
                width="48"
                height="34"
                rx="7"
                stroke="currentColor"
                strokeWidth="2.5"
              />
              <path
                d="M10 20L32 36L54 20"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="49" cy="45" r="9" fill="#B85C45" />
              <path
                d="M45 45L48 48L53 42"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="auth-form-heading">
            <span className="auth-eyebrow">ONE LAST STEP</span>

            <h2>
              Verify your <span>email.</span>
            </h2>

            <p>
              We've sent an eight-digit verification code to:
            </p>

            <strong className="verify-email-address">
              {email || "No email address provided"}
            </strong>
          </div>

          <form
            className="auth-form verify-email-form"
            onSubmit={handleSubmit}
          >
            <div className="auth-field">
              <label htmlFor="verification-code">
                Eight-digit verification code
              </label>

              <input
                id="verification-code"
                name="token"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="00000000"
                maxLength={8}
                value={token}
                onChange={(event) => {
                  setToken(
                    event.target.value.replace(/\D/g, "").slice(0, 8)
                  );
                  setFeedback("");
                }}
                className="verify-code-input"
                required
              />
            </div>

            {feedback && (
              <p className="auth-feedback" role="alert">
                {feedback}
              </p>
            )}

            <button
              type="submit"
              className="auth-submit-button"
              disabled={isSubmitting || token.length !== 8 || !email}
            >
              {isSubmitting ? "Verifying..." : "Verify email"}
              {!isSubmitting && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <div className="verify-email-resend">
            <p>Didn't receive the code?</p>

            <button
              type="button"
              onClick={handleResendCode}
              disabled={isResending || !email}
            >
              {isResending ? "Sending new code..." : "Resend verification code"}
            </button>
          </div>

          <p className="verify-email-note">
            Check your inbox and spam folder if you can't find the email.
          </p>

          <div className="verify-email-links">
            <Link to="/register">Use a different email</Link>
            <span>·</span>
            <Link to="/login">Back to sign in</Link>
          </div>

          <div className="auth-form-footer">
            <span>CHOPHUB</span>
            <span>BUILT AROUND GOOD FOOD.</span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default VerifyEmail;
