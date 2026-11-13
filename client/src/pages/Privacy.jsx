
import { Link } from "react-router-dom";
import "./LegalPage.css";

function Privacy() {
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
        <span className="legal-eyebrow">YOUR PRIVACY MATTERS</span>
        <h1>Privacy <span>Policy.</span></h1>
        <p>
          Here's how information may be collected, used and
          protected when you use ChopHub.
        </p>
        <span className="legal-updated">Last updated: November 2026</span>
      </section>

      <div className="legal-content">
        <aside className="legal-sidebar">
          <span>ON THIS PAGE</span>
          <a href="#introduction">Introduction</a>
          <a href="#information">Information we collect</a>
          <a href="#usage">How we use information</a>
          <a href="#sharing">Information sharing</a>
          <a href="#cookies">Cookies and technology</a>
          <a href="#security">Data security</a>
          <a href="#retention">Data retention</a>
          <a href="#rights">Your privacy rights</a>
          <a href="#children">Children's privacy</a>
          <a href="#changes">Policy updates</a>
          <a href="#contact">Contact</a>
        </aside>

        <article className="legal-article">
          <div className="legal-intro">
            <p>
              At ChopHub, we understand that your personal
              information matters. This Privacy Policy explains
              what information we may collect, why we need it
              and how it may be handled.
            </p>
            <p>
              This policy is intended to describe the planned
              operation of ChopHub. Actual collection and processing
              practices will depend on the features implemented
              when the platform launches.
            </p>
          </div>

          <section id="introduction" className="legal-section">
            <h2>01. Introduction</h2>
            <p>
              This Privacy Policy applies to people who visit,
              register for or interact with ChopHub.
            </p>
            <p>
              By using the platform, you acknowledge this policy.
              Where consent is required by law, we will request it
              before carrying out the relevant processing.
            </p>
          </section>

          <section id="information" className="legal-section">
            <h2>02. Information we may collect</h2>
            <p>
              Depending on the features you use, ChopHub may collect
              the following categories of information:
            </p>

            <h3>Account information</h3>
            <ul>
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number, where provided</li>
              <li>Account credentials and authentication information</li>
            </ul>

            <h3>Order information</h3>
            <ul>
              <li>Meals and quantities selected</li>
              <li>Delivery or pickup preferences</li>
              <li>Delivery details and order instructions</li>
              <li>Order history and status</li>
            </ul>

            <h3>Technical information</h3>
            <ul>
              <li>Browser and device information</li>
              <li>IP address and approximate location where necessary</li>
              <li>Website usage and interaction information</li>
              <li>Diagnostic and error information</li>
            </ul>

            <p>
              We will only request information that is relevant
              to providing and improving the services you use.
            </p>
          </section>

          <section id="usage" className="legal-section">
            <h2>03. How we use information</h2>
            <p>
              Information collected through ChopHub may be used to:
            </p>
            <ul>
              <li>Create and manage customer accounts.</li>
              <li>Process and manage food orders.</li>
              <li>Contact customers about their orders or enquiries.</li>
              <li>Provide customer support.</li>
              <li>Maintain website security and prevent misuse.</li>
              <li>Improve website functionality and user experience.</li>
              <li>Meet applicable legal and regulatory obligations.</li>
            </ul>
            <p>
              We will not use your personal information for
              unrelated purposes without an appropriate legal
              basis or your consent where required.
            </p>
          </section>

          <section id="sharing" className="legal-section">
            <h2>04. How information may be shared</h2>
            <p>
              ChopHub does not intend to sell your personal
              information.
            </p>
            <p>
              Information may be shared when necessary with:
            </p>
            <ul>
              <li>
                Restaurant personnel who need relevant order
                information to prepare or fulfil an order.
              </li>
              <li>
                Technology and hosting providers that support
                the operation of the website.
              </li>
              <li>
                Payment service providers if online payments
                are introduced.
              </li>
              <li>
                Relevant authorities where disclosure is required
                by applicable law.
              </li>
            </ul>
            <p>
              We aim to limit shared information to what is
              reasonably necessary for the relevant purpose.
            </p>
          </section>

          <section id="cookies" className="legal-section">
            <h2>05. Cookies and similar technologies</h2>
            <p>
              ChopHub may use cookies or similar technologies
              to support essential website functions, remember
              preferences and understand how visitors use the
              platform.
            </p>
            <p>
              Where non-essential cookies are used, we will
              provide appropriate information and choices
              as required by applicable law.
            </p>
          </section>

          <section id="security" className="legal-section">
            <h2>06. Data security</h2>
            <p>
              We intend to use appropriate technical and
              organisational measures to protect personal
              information against unauthorised access,
              alteration, disclosure or loss.
            </p>
            <p>
              No website or electronic storage system can
              guarantee absolute security. Users should also
              protect their passwords and avoid sharing
              account credentials.
            </p>
          </section>

          <section id="retention" className="legal-section">
            <h2>07. How long we retain information</h2>
            <p>
              Personal information will be retained only for
              as long as reasonably necessary for the purpose
              for which it was collected, including legal,
              security and operational requirements.
            </p>
            <p>
              When information is no longer needed, we intend
              to delete it or anonymise it where appropriate,
              subject to applicable legal obligations.
            </p>
          </section>

          <section id="rights" className="legal-section">
            <h2>08. Your privacy rights</h2>
            <p>
              Depending on applicable data protection law,
              you may have the right to:
            </p>
            <ul>
              <li>Request access to your personal information.</li>
              <li>Request correction of inaccurate information.</li>
              <li>Request deletion of personal information where applicable.</li>
              <li>Object to or request restriction of certain processing.</li>
              <li>Withdraw consent where processing relies on consent.</li>
              <li>Request a copy of certain information in a usable format.</li>
            </ul>
            <p>
              You can contact us through the website to make
              a privacy-related enquiry or request.
            </p>
          </section>

          <section id="children" className="legal-section">
            <h2>09. Children's privacy</h2>
            <p>
              ChopHub is not designed to knowingly collect
              personal information from children in circumstances
              where parental consent is required. Where such
              information is identified, appropriate steps will
              be taken in accordance with applicable law.
            </p>
          </section>

          <section id="changes" className="legal-section">
            <h2>10. Changes to this policy</h2>
            <p>
              We may update this Privacy Policy as our services,
              technology or legal obligations change.
            </p>
            <p>
              Any updated version will be published on this page
              with a revised update date.
            </p>
          </section>

          <section id="contact" className="legal-section">
            <h2>11. Contact us</h2>
            <p>
              For questions about this Privacy Policy or how
              your information may be handled, please use the
              contact options available on our website.
            </p>
            <Link to="/#contact" className="legal-contact-link">
              Contact ChopHub <span>→</span>
            </Link>
          </section>

          <div className="legal-bottom">
            <p>Your information deserves care and respect.</p>
            <Link to="/terms">Read our Terms & Conditions →</Link>
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

export default Privacy;
