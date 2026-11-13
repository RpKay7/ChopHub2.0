
import { useEffect, useState } from "react";
import "./ReviewsSection.css";

const reviews = [
  {
    quote:
      "The food was absolutely delicious. Everything tasted fresh, and the atmosphere made the whole experience even better. I'll definitely be coming back.",
    name: "Amara O.",
    detail: "A memorable dining experience",
  },
  {
    quote:
      "From the presentation to the service, everything felt thoughtful. It's the kind of place you want to bring your friends and family.",
    name: "Daniel K.",
    detail: "A lovely evening out",
  },
  {
    quote:
      "I loved every bit of the experience. The food was worth the wait, the setting was beautiful, and the service made us feel welcome.",
    name: "Tomi A.",
    detail: "A guest's favourite experience",
  },
];

function ReviewsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState("next");

  const goToReview = (index) => {
    setDirection(index > activeIndex ? "next" : "previous");
    setActiveIndex(index);
  };

  const nextReview = () => {
    setDirection("next");
    setActiveIndex((current) => (current + 1) % reviews.length);
  };

  const previousReview = () => {
    setDirection("previous");
    setActiveIndex(
      (current) => (current - 1 + reviews.length) % reviews.length
    );
  };

  useEffect(() => {
    const interval = setInterval(nextReview, 5500);

    return () => clearInterval(interval);
  }, []);

  const review = reviews[activeIndex];

  return (
    <section className="reviews-section" id="reviews">
      <div className="reviews-container">
        <div className="reviews-heading">
          <span className="reviews-eyebrow">KIND WORDS</span>

          <h2>
            The experience,
            <br />
            <span>in their words.</span>
          </h2>

          <p>
            Every great meal leaves a memory. Here's what our guests
            have to say about their ChopHub experience.
          </p>

          <span className="reviews-demo-label">
            DEMO TESTIMONIALS
          </span>
        </div>

        <div className="reviews-showcase">
          <div className="reviews-quote-mark" aria-hidden="true">
            “
          </div>

          <div
            className={`review-content review-${direction}`}
            key={activeIndex}
            aria-live="polite"
          >
            <blockquote>
              "{review.quote}"
            </blockquote>

            <div className="review-author">
              <div className="review-author-line" />

              <div>
                <h3>{review.name}</h3>
                <p>{review.detail}</p>
              </div>
            </div>
          </div>

          <div className="reviews-controls">
            <div className="reviews-pagination">
              <span>
                {String(activeIndex + 1).padStart(2, "0")}
              </span>
              <span className="reviews-pagination-divider">/</span>
              <span>{String(reviews.length).padStart(2, "0")}</span>
            </div>

            <div className="reviews-navigation">
              <button
                type="button"
                onClick={previousReview}
                aria-label="Previous review"
              >
                &#8592;
              </button>

              <button
                type="button"
                onClick={nextReview}
                aria-label="Next review"
              >
                &#8594;
              </button>
            </div>
          </div>

          <div className="reviews-dots">
            {reviews.map((item, index) => (
              <button
                key={item.name}
                type="button"
                className={activeIndex === index ? "active" : ""}
                onClick={() => goToReview(index)}
                aria-label={`Go to review ${index + 1}`}
                aria-current={activeIndex === index ? "true" : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ReviewsSection;
