import './DiningEnquiries.css';

function DiningEnquiries() {
  return (
    <section className="dining-enquiries-section" id="dining-enquiries">
      <div className="dining-enquiries-container">
        <div className="dining-enquiries-image">
          <img
            src="/images/menu/dining-enquiries.jpg"
            alt="Elegant restaurant dining table prepared for a special occasion"
            loading="lazy"
          />
        </div>

        <div className="dining-enquiries-overlay"></div>

        <div className="dining-enquiries-content">
          <span className="dining-enquiries-eyebrow">
            <span></span>
            MORE THAN JUST A MEAL
          </span>

          <h2>
            Make room for
            <br />
            <span>something special.</span>
          </h2>

          <p>
            Whether it's a relaxed meal, a gathering with friends or a
            moment worth celebrating, let good food be part of the occasion.
          </p>

          <div className="dining-enquiries-actions">
            <a href="#contact" className="dining-enquiries-primary">
              Make an Enquiry
              <span aria-hidden="true">↗</span>
            </a>

            <a href="#menu" className="dining-enquiries-secondary">
              Explore Our Menu
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <div className="dining-enquiries-bottom">
          <span>CHOPHUB</span>
          <span>GOOD FOOD. MEANINGFUL MOMENTS.</span>
        </div>
      </div>
    </section>
  );
}

export default DiningEnquiries;