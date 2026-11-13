import { Link } from "react-router-dom";
import "./NotFound.css";

function ChopHubLogo() {
  return (
    <Link to="/" className="brand-logo" aria-label="ChopHub home">
      <svg
        className="brand-mark"
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

      <span className="brand-name">
        Chop<span>Hub</span>
      </span>
    </Link>
  );
}

function NotFound() {
  return (
    <main className="not-found-page">
      <header className="not-found-header">
        <ChopHubLogo />

        <Link to="/" className="not-found-home-link">
          Back to home
          <span aria-hidden="true">↗</span>
        </Link>
      </header>

      <section className="not-found-content">
        <div className="not-found-copy">
          <span className="not-found-eyebrow">
            <span className="not-found-eyebrow-line" />
            A LITTLE DETOUR
          </span>

          <h1>
            Well, this is
            <br />
            <span>awkward.</span>
          </h1>

          <div className="not-found-number">404</div>

          <p className="not-found-description">
            Looks like this page isn't on our menu. It may have moved,
            disappeared, or never existed in the first place.
          </p>

          <div className="not-found-actions">
            <Link to="/" className="not-found-primary-button">
              Back to homepage
              <span aria-hidden="true">→</span>
            </Link>

            <Link to="/#menu" className="not-found-secondary-button">
              Explore our menu
            </Link>
          </div>

          <div className="not-found-bottom-note">
            <span className="not-found-note-dot" />
            There's always something good waiting at ChopHub.
          </div>
        </div>

        <div className="not-found-visual">
          <div className="not-found-image-frame">
            <img
              src="/images/menu/party-jollof.jpg"
              alt="A delicious plate of Nigerian party jollof rice"
            />

            <div className="not-found-image-overlay" />

            <div className="not-found-image-caption">
              <span>GOOD FOOD. GOOD COMPANY.</span>
              <p>Let's get you back to the table.</p>
            </div>
          </div>

          <div className="not-found-floating-number" aria-hidden="true">
            404
          </div>

          <div className="not-found-decoration" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>

      <footer className="not-found-footer">
        <span>© {new Date().getFullYear()} ChopHub</span>
        <span>Built around good food and good company.</span>
      </footer>
    </main>
  );
}

export default NotFound;