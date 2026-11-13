import API_BASE_URL from "../config/api.js";
import { useEffect, useState } from "react";
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

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [recoverySession, setRecoverySession] = useState("null");
  useEffect(() => {
  const hashParams = new URLSearchParams(
    window.location.hash.substring(1)
  );

  const accessToken = hashParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token");
  const type = hashParams.get("type");

  if (accessToken && refreshToken && type === "recovery") {
    setRecoverySession({
      accessToken,
      refreshToken,
    });
  } else {
    setFeedback(
      "Your password reset link is invalid or has expired. Please request another one."
    );
  }
}, []);


const handleSubmit = async (event) => {
  event.preventDefault();

  setFeedback("");
  setSubmitted(false);

  if (!recoverySession) {
    setFeedback(
      "Your password reset link is invalid or has expired. Please request another one."
    );
    return;
  }

  if (password.length < 8) {
    setFeedback("Your password must contain at least 8 characters.");
    return;
  }

  if (password !== confirmPassword) {
    setFeedback("Your passwords do not match. Please try again.");
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/auth/reset-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          accessToken: recoverySession.accessToken,
          refreshToken: recoverySession.refreshToken,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Unable to update password."
      );
    }

    setSubmitted(true);
    setFeedback("Your password has been updated successfully!");

    setRecoverySession(null);

    window.history.replaceState(
      null,
      "",
      window.location.pathname
    );
  } catch (error) {
    setFeedback(
      error.message || "Something went wrong. Please try again."
    );
  }
};


  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
    setFeedback("");
    setSubmitted(false);
  };

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
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
                A fresh
                <br />
                start begins
                <br />
                <span>here.</span>
              </h1>

              <p>
                Set a new password and get ready to enjoy
                everything ChopHub has to offer.
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
              <span className="auth-eyebrow">PASSWORD RECOVERY</span>

              <h2>
                Create a new <span>password.</span>
              </h2>

              <p>
                Choose a strong password for your ChopHub
                account and enter it again to confirm.
              </p>
            </div>

            <form className="auth-form forgot-form" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="new-password">New password</label>

                <input
                  id="new-password"
                  name="password"
                  type="password"
                  placeholder="Enter your new password"
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="confirm-password">
                  Confirm new password
                </label>

                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter your new password"
                  autoComplete="new-password"
                  minLength={8}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
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
                Update password
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

export default ResetPassword;
