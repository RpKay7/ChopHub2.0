
import { Link } from "react-router-dom";
import "./LegalPage.css";

function Terms() {
  return (
    <main className="legal-page">
      <header className="legal-header">
        <Link to="/" className="legal-brand">
          Chop<span>Hub</span>
        </Link>

        <Link to="/register" className="legal-back-link">
          Back to registration <span>→</span>
        </Link>
      </header>

      <section className="legal-hero">
        <span className="legal-eyebrow">THE IMPORTANT DETAILS</span>
        <h1>Terms & <span>Conditions.</span></h1>
        <p>
          A few ground rules to help make every ChopHub experience
          clear, fair and enjoyable.
        </p>
        <span className="legal-updated">Last updated: November 2026</span>
      </section>

      <div className="legal-content">
        <aside className="legal-sidebar">
          <span>ON THIS PAGE</span>
          <a href="#acceptance">Acceptance</a>
          <a href="#eligibility">Eligibility</a>
          <a href="#accounts">Your account</a>
          <a href="#orders">Orders and payments</a>
          <a href="#conduct">User conduct</a>
          <a href="#content">Content and listings</a>
          <a href="#availability">Availability</a>
          <a href="#liability">Liability</a>
          <a href="#changes">Changes to these terms</a>
          <a href="#contact">Contact</a>
        </aside>

        <article className="legal-article">
          <div className="legal-intro">
            <p>
              Welcome to ChopHub. These Terms and Conditions explain
              the rules that apply when you access or use our website
              and services.
            </p>
            <p>
              By using ChopHub, you agree to these terms. Please read
              them carefully before creating an account or placing
              an order.
            </p>
          </div>

          <section id="acceptance" className="legal-section">
            <h2>01. Acceptance of terms</h2>
            <p>
              By accessing or using ChopHub, you confirm that you
              have read, understood and agree to these Terms and
              Conditions and our Privacy Policy.
            </p>
            <p>
              If you do not agree with these terms, please do not
              use the website.
            </p>
          </section>

          <section id="eligibility" className="legal-section">
            <h2>02. Eligibility</h2>
            <p>
              You must be legally capable of entering into an
              agreement to use ChopHub. If you are below the age
              of 18, you should use the platform with the involvement
              and permission of a parent or legal guardian.
            </p>
          </section>

          <section id="accounts" className="legal-section">
            <h2>03. Your account</h2>
            <p>
              Some ChopHub features, including placing orders,
              may require you to create an account.
            </p>
            <ul>
              <li>Provide accurate and current registration information.</li>
              <li>Keep your login credentials private and secure.</li>
              <li>Do not impersonate another person or create misleading accounts.</li>
              <li>Notify us if you believe someone has accessed your account without permission.</li>
              <li>You are responsible for activity carried out through your account, subject to applicable law.</li>
            </ul>
            <p>
              We reserve the right to restrict or suspend accounts
              involved in fraudulent, abusive or prohibited activity.
            </p>
          </section>

          <section id="orders" className="legal-section">
            <h2>04. Orders and payments</h2>
            <p>
              ChopHub is designed to help customers discover meals
              and submit food orders for delivery or pickup.
            </p>
            <ul>
              <li>Review your order carefully before submitting it.</li>
              <li>Provide accurate contact and delivery information.</li>
              <li>Order prices, meal options and availability may change.</li>
              <li>An order request is not necessarily a confirmed order until the restaurant confirms it.</li>
            </ul>
            <p>
              Payment features may be introduced in a future version
              of ChopHub. Where payment processing is enabled, the
              applicable payment terms and provider requirements
              will also apply.
            </p>
            <p>
              Until those features are implemented, no online payment
              functionality should be assumed to be available.
            </p>
          </section>

          <section id="conduct" className="legal-section">
            <h2>05. Acceptable user conduct</h2>
            <p>
              You agree not to:
            </p>
            <ul>
              <li>Use ChopHub for unlawful, fraudulent or deceptive activities.</li>
              <li>Submit false orders or deliberately misleading information.</li>
              <li>Harass, threaten or abuse other users.</li>
              <li>Attempt to interfere with the website's operation or security.</li>
              <li>Upload malicious files or content that infringes another person's rights.</li>
              <li>Use the platform to distribute spam or unsolicited promotional material.</li>
            </ul>
          </section>

          <section id="content" className="legal-section">
            <h2>06. Content and listings</h2>
            <p>
              Users may be able to submit information, reviews,
              photographs and other content through ChopHub.
            </p>
            <p>
              You remain responsible for content you submit and
              must have the necessary rights or permission to use it.
              You must not upload content that is unlawful,
              misleading, abusive or infringes another person's
              intellectual property.
            </p>
            <p>
              By submitting content, you grant ChopHub permission
              to display and use it as necessary to operate and
              improve the platform, subject to our Privacy Policy
              and applicable law.
            </p>
          </section>

          <section id="availability" className="legal-section">
            <h2>07. Website availability</h2>
            <p>
              We aim to keep ChopHub accessible and functioning
              properly. However, we cannot guarantee uninterrupted
              access or that every feature will always be available.
            </p>
            <p>
              Features may be updated, temporarily unavailable,
              modified or discontinued as the platform develops.
            </p>
          </section>

          <section id="liability" className="legal-section">
            <h2>08. Limitation of liability</h2>
            <p>
              To the extent permitted by applicable law, ChopHub
              is not responsible for losses arising from temporary
              website interruptions, inaccurate information supplied
              by users, or actions taken by independent third-party
              providers.
            </p>
            <p>
              Nothing in these terms excludes or limits liability
              where such exclusion or limitation is not permitted
              by law.
            </p>
          </section>

          <section id="changes" className="legal-section">
            <h2>09. Changes to these terms</h2>
            <p>
              We may update these Terms and Conditions as ChopHub
              develops or as legal and operational requirements
              change.
            </p>
            <p>
              Updated terms will be published on this page with
              a revised update date. Continued use of the platform
              after changes take effect means you accept the updated
              terms, where permitted by law.
            </p>
          </section>

          <section id="contact" className="legal-section">
            <h2>10. Contact</h2>
            <p>
              If you have questions about these Terms and Conditions,
              please use the contact options provided on our website.
            </p>
            <Link to="/#contact" className="legal-contact-link">
              Contact ChopHub <span>→</span>
            </Link>
          </section>

          <div className="legal-bottom">
            <p>Thank you for being part of the ChopHub community.</p>
            <Link to="/privacy">Read our Privacy Policy →</Link>
          </div>
        </article>
      </div>

      <footer className="legal-footer">
        <Link to="/" className="legal-brand">
          Chop<span>Hub</span>
        </Link>
        <p>Built around good food.</p>
        <span>© 2026 ChopHub. All rights reserved.</span>
      </footer>
    </main>
  );
}

export default Terms;
