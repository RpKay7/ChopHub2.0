
import API_BASE_URL from "../config/api.js";

import { useState } from 'react';
import { useAuth } from './AuthContext';
import './ContactSection.css';

const API_URL = `${API_BASE_URL}/enquiries`;
const phoneNumber = '07068414697';
const whatsappNumber = '2347068414697';

const initialFormData = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
};

function ContactSection() {
  const { user, session } = useAuth();

  const [formData, setFormData] = useState(initialFormData);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (submitted) setSubmitted(false);
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitted(false);
    setErrorMessage('');

    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      // Attach the authenticated customer's token when logged in.
      if (user) {
        if (
          !session?.access_token ||
          session.user?.id !== user.id
        ) {
          throw new Error(
            'Your login session is not valid. Please sign out and sign in again before submitting.'
          );
        }

        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          full_name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          enquiry_type: formData.subject,
          message: formData.message.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Unable to submit your enquiry.'
        );
      }

      setSubmitted(true);
      setFormData(initialFormData);
    } catch (error) {
      console.error('CONTACT ENQUIRY ERROR:', error);

      setErrorMessage(
        error.message ||
        'Unable to send your message. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="contact-section section" id="contact">
      <div className="container">

        <div className="contact-heading">
          <span className="section-eyebrow">LET'S CONNECT</span>

          <h2 className="section-title">
            We'd love to <span>hear from you.</span>
          </h2>

          <p className="section-description">
            Have a question, an idea or something special in mind?
            Send us a message. We'd love to hear what you're thinking.
          </p>
        </div>

        <div className="contact-layout">

          <div className="contact-information">

            <span className="contact-side-eyebrow">
              GET IN TOUCH
            </span>

            <h3>
              Every great conversation
              <span> starts somewhere.</span>
            </h3>

            <p className="contact-intro">
              Whether you're exploring our menu, making a dining enquiry
              or simply want to say hello, we're always happy to hear from you.
            </p>

            <div className="contact-information-divider"></div>

            <div className="contact-detail">
              <span className="contact-detail-number">01</span>
              <div>
                <h4>General Enquiries</h4>
                <p>Questions, feedback and everything in between.</p>
              </div>
            </div>

            <div className="contact-detail">
              <span className="contact-detail-number">02</span>
              <div>
                <h4>Dining Enquiries</h4>
                <p>Tell us about a meal, gathering or occasion you're planning.</p>
              </div>
            </div>

            <div className="contact-detail">
              <span className="contact-detail-number">03</span>
              <div>
                <h4>Share Your Thoughts</h4>
                <p>We welcome suggestions that help us make ChopHub better.</p>
              </div>
            </div>

            <div className="contact-information-divider"></div>

            <div className="contact-hours">
              <div className="contact-hours-heading">
                <span className="contact-hours-icon">◷</span>
                <h4>Opening Hours</h4>
              </div>

              <div className="contact-hours-row">
                <span>Monday – Thursday</span>
                <span>10:00 AM – 10:00 PM</span>
              </div>

              <div className="contact-hours-row">
                <span>Friday – Saturday</span>
                <span>10:00 AM – 11:00 PM</span>
              </div>

              <div className="contact-hours-row">
                <span>Sunday</span>
                <span>12:00 PM – 9:00 PM</span>
              </div>

              <p className="contact-hours-note">
                Sample opening hours for this portfolio demo.
              </p>
            </div>

            <div className="contact-direct-actions">

              <a
                href={`tel:${phoneNumber}`}
                className="contact-call-button"
                aria-label="Call ChopHub"
              >
                <span>Call Us</span>
              </a>

              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                  'Hello ChopHub! I would like to make an enquiry.'
                )}`}
                className="contact-whatsapp-button"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with ChopHub on WhatsApp"
              >
                <span>WhatsApp</span>
              </a>

            </div>

            <div className="contact-signature">
              <span className="contact-signature-line"></span>
              <span>GOOD FOOD. OPEN CONVERSATIONS.</span>
            </div>

          </div>

          <div className="contact-form-wrapper">

            <div className="contact-form-heading">
              <span>YOUR MESSAGE</span>
              <h3>Send us a note.</h3>
              <p>
                Fill in the details below and tell us how we can help.
              </p>
            </div>

            {submitted && (
              <div className="contact-success" role="status">
                <div>
                  <strong>Message received!</strong>
                  <p>
                    Your enquiry has been submitted successfully.
                    Our team can now review it.
                  </p>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="contact-error" role="alert">
                {errorMessage}
              </div>
            )}

            <form className="contact-form" onSubmit={handleSubmit}>

              <div className="contact-form-row">

                <div className="contact-field">
                  <label htmlFor="contact-name">Your Name</label>
                  <input
                    type="text"
                    id="contact-name"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="contact-field">
                  <label htmlFor="contact-email">Email Address</label>
                  <input
                    type="email"
                    id="contact-email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

              </div>

              <div className="contact-field">
                <label htmlFor="contact-phone">
                  Phone Number <span>(Optional)</span>
                </label>
                <input
                  type="tel"
                  id="contact-phone"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="contact-field">
                <label htmlFor="contact-subject">Enquiry Type</label>

                <select
                  id="contact-subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Select an enquiry type
                  </option>
                  <option value="Food & Delivery">Menu and food enquiries</option>
                  <option value="Catering">Catering enquiries</option>
                  <option value="Events & Reservations">Dining and reservations</option>
                  <option value="General">General enquiries</option>
                  <option value="Feedback">Feedback</option>
                </select>
              </div>

              <div className="contact-field">
                <label htmlFor="contact-message">Your Message</label>

                <textarea
                  id="contact-message"
                  name="message"
                  placeholder="Tell us a little more..."
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="contact-submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Your Message'}
              </button>

              <p className="contact-form-note">
                We'd love to hear from you. Name, email, enquiry type and
                message are required.
              </p>

            </form>
          </div>

        </div>
      </div>
    </section>
  );
}

export default ContactSection;
