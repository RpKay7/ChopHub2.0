
import { useState } from "react";
import { Link } from "react-router-dom";
import "./ForgotPassword.css";

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

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    setFeedback("");
    setSubmitted(false);

    if (!email.trim()) {
      setFeedback("Please enter your email address.");
      return;
    }

    setSubmitted(true);
    setFeedback(
      "Your email address has been accepted. Password reset emails will be enabled when we connect authentication."
    );
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    setFeedback("");
    setSubmitted(false);
  };

  return (
    <main className="auth-page forgot-page">
      <div className="auth-background-glow auth-background-glow-one" />
      <div className="auth-background-glow auth-background-glow-two" />

      <header className="auth-header">
        <ChopHubLogo />

        <Link to="/" className="auth-back-home">
          <span aria-hidden="true">←</span>
          Back to home
        </Link>
      </header>

      <section className="forgot-layout">
        <div className="forgot-visual">
          <div className="forgot-visual-image">
            <div className="forgot-visual-overlay" />

            <div className="forgot-visual-content">
              <span className="auth-eyebrow">A SEAT IS ALWAYS WAITING</span>

              <h1>
                Good food
                <br />
                brings us
                <br />
                <span>together.</span>
              </h1>

              <p>
                Your next great meal is never too far away.
                Let's get you back to ChopHub.
              </p>

              <div className="auth-visual-line">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        </div>

        <div className="forgot-form-side">
          <div className="forgot-form-container">
            <div className="forgot-icon">
              <svg
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <rect
                  x="12"
                  y="27"
                  width="40"
                  height="29"
                  rx="5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M21 27V19C21 12.9 25.9 8 32 8C38.1 8 43 12.9 43 19V27"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <circle cx="32" cy="40" r="3" fill="#B85C45" />
                <path
                  d="M32 43V47"
                  stroke="#B85C45"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="auth-form-heading">
              <span className="auth-eyebrow">ACCOUNT RECOVERY</span>

              <h2>
                Forgot your <span>password?</span>
              </h2>

              <p>
                It happens. Enter the email address associated
                with your account and we'll help you get back in.
              </p>
            </div>

            <form className="auth-form forgot-form" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="forgot-email">Email address</label>

                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                />
              </div>

              {feedback && (
                <div
                  className={`forgot-feedback ${
                    submitted ? "forgot-feedback-success" : ""
                  }`}
                  role="status"
                  aria-live="polite"
                >
                  {feedback}
                </div>
              )}

              <button type="submit" className="auth-submit-button">
                Send reset link
                <span aria-hidden="true">→</span>
              </button>
            </form>

            <Link to="/login" className="forgot-return-link">
              <span aria-hidden="true">←</span>
              Back to sign in
            </Link>

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

export default ForgotPassword;
