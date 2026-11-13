
import { useState } from 'react';
import './Footer.css';

function FooterLogo() {
  return (
    <a href="#home" className="footer-logo" aria-label="ChopHub home">
      <svg
        className="footer-logo-mark"
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

      <span className="footer-logo-name">
        Chop<span>Hub</span>
      </span>
    </a>
  );
}

function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (event) => {
    event.preventDefault();
    setSubscribed(true);
    setEmail('');
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="site-footer">

      {/* MAIN FOOTER */}
      <div className="footer-main">
        <div className="footer-container">

          {/* BRAND COLUMN */}
          <div className="footer-brand-column">
            <FooterLogo />

            <p className="footer-brand-description">
              Celebrating the flavours we love, the moments we share
              and the joy that good food brings to every table.
            </p>

            <span className="footer-brand-tagline">
              BUILT AROUND GOOD FOOD.
            </span>

            <div className="footer-social-area">
              <span className="footer-social-label">FOLLOW OUR JOURNEY</span>

              <p className="footer-social-note">
                Our social profiles are coming soon.
              </p>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="footer-column">
            <h3>Explore</h3>

            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#about">Our Story</a></li>
              <li><a href="#experiences">Experiences</a></li>
              <li><a href="#menu">Our Menu</a></li>
              <li><a href="#dining-enquiries">Dining & Enquiries</a></li>
              <li><a href="#contact">Contact Us</a></li>
            </ul>
          </div>

          {/* MENU LINKS */}
          <div className="footer-column">
            <h3>Discover</h3>

            <ul>
              <li><a href="#menu">Nigerian Classics</a></li>
              <li><a href="#menu">Breakfast & Brunch</a></li>
              <li><a href="#menu">Soups & Swallow</a></li>
              <li><a href="#menu">Grills & Specials</a></li>
              <li><a href="#menu">Desserts</a></li>
              <li><a href="#menu">Drinks & Cocktails</a></li>
            </ul>
          </div>

          {/* CONTACT COLUMN */}
          <div className="footer-column footer-contact-column">
            <h3>Get in Touch</h3>

            <p className="footer-contact-description">
              Have something on your mind? We'd love to hear from you.
            </p>

            <a href="tel:07068414697" className="footer-contact-link">
              <span className="footer-contact-icon">↗</span>
              Call Us
            </a>

            <a
              href="https://wa.me/2347068414697"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-contact-link"
            >
              <span className="footer-contact-icon">↗</span>
              WhatsApp
            </a>

            <a href="#contact" className="footer-contact-link">
              <span className="footer-contact-icon">↗</span>
              Send an Enquiry
            </a>
          </div>

        </div>
      </div>

      {/* NEWSLETTER AREA */}
      <div className="footer-newsletter">
        <div className="footer-container footer-newsletter-inner">

          <div className="footer-newsletter-copy">
            <span>STAY IN THE LOOP</span>
            <h3>A little something delicious.</h3>
            <p>
              Be among the first to hear about new menu additions
              and updates from ChopHub.
            </p>
          </div>

          <div className="footer-newsletter-form-area">
            {subscribed ? (
              <div className="footer-newsletter-success" role="status">
                <span>✓</span>
                <p>
                  Thank you for your interest! Newsletter sign-up
                  is currently a demo feature.
                </p>
              </div>
            ) : (
              <form
                className="footer-newsletter-form"
                onSubmit={handleNewsletterSubmit}
              >
                <label htmlFor="footer-newsletter-email">
                  Email address
                </label>

                <div className="footer-newsletter-input-wrap">
                  <input
                    type="email"
                    id="footer-newsletter-email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />

                  <button type="submit" aria-label="Subscribe to newsletter">
                    Subscribe
                    <span>↗</span>
                  </button>
                </div>

                <p className="footer-newsletter-note">
                  Demo subscription form. Your email is not stored or sent.
                </p>
              </form>
            )}
          </div>

        </div>
      </div>

      {/* FOOTER BOTTOM */}
      <div className="footer-bottom">
        <div className="footer-container footer-bottom-inner">

          <p className="footer-copyright">
            © {new Date().getFullYear()} ChopHub. All rights reserved.
          </p>

          <p className="footer-bottom-motto">
            BUILT FOR GOOD FOOD. MADE FOR GOOD MOMENTS.
          </p>

          <button
            type="button"
            className="footer-back-to-top"
            onClick={scrollToTop}
          >
            Back to top
            <span>↑</span>
          </button>

        </div>
      </div>

    </footer>
  );
}

export default Footer;
