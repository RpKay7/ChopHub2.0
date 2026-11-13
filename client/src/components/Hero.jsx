
import { useEffect, useState } from 'react';
import './Hero.css';

const heroSlides = [
  {
    image: '/images/menu/party-jollof.jpg',
    alt: 'Nigerian party jollof rice',
    eyebrow: 'THE TASTE OF NIGERIA',
    title: 'A taste of home.',
    highlight: 'Made unforgettable.',
    description:
      'From rich Nigerian party jollof to beautifully prepared favourites, discover food made for memorable moments.',
    caption: 'THE NIGERIAN CLASSIC',
  },
  {
    image: '/images/menu/beef-suya.jpg',
    alt: 'Nigerian beef suya with spices',
    eyebrow: 'BOLD FLAVOURS. REAL CHARACTER.',
    title: 'A little spice.',
    highlight: 'A lot of flavour.',
    description:
      'Discover the irresistible taste of well-seasoned grills and Nigerian favourites prepared to make every bite count.',
    caption: 'GRILLED TO PERFECTION',
  },
  {
    image: '/images/menu/moi-moi.jpg',
    alt: 'Traditional Nigerian moi moi',
    eyebrow: 'ROOTED IN OUR CULTURE',
    title: 'Tradition on',
    highlight: 'every plate.',
    description:
      'Celebrating the dishes we grew up loving, with thoughtful presentation and the flavours that bring us together.',
    caption: 'A NIGERIAN FAVOURITE',
  },
  {
    image: '/images/menu/english-breakfast.jpg',
    alt: 'A beautifully prepared English breakfast',
    eyebrow: 'MAKE EVERY MOMENT DELICIOUS',
    title: 'Start with',
    highlight: 'something special.',
    description:
      'From relaxed breakfast moments to satisfying meals, there is always something delicious waiting to be discovered.',
    caption: 'A BEAUTIFUL WAY TO BEGIN',
  },
];

function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);

  // Automatic carousel: changes slides every 6.5 seconds.
  // It does not pause when the visitor hovers or focuses on the hero.
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 6500);

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index) => {
    setActiveSlide(index);
  };

  const goToPrevious = () => {
    setActiveSlide((current) =>
      current === 0 ? heroSlides.length - 1 : current - 1
    );
  };

  const goToNext = () => {
    setActiveSlide((current) => (current + 1) % heroSlides.length);
  };

  const currentSlide = heroSlides[activeSlide];

  return (
    <section
      className="hero-section"
      id="home"
      aria-label="ChopHub restaurant introduction"
    >
      {/* Background image carousel */}
      <div className="hero-slides">
        {heroSlides.map((slide, index) => (
          <div
            className={`hero-slide ${
              activeSlide === index ? 'active' : ''
            }`}
            key={slide.image}
            aria-hidden={activeSlide !== index}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className="hero-background-image"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>

      {/* Cinematic image overlay */}
      <div className="hero-overlay"></div>

      {/* Main hero content */}
      <div className="hero-container">
        <div className="hero-content" key={activeSlide}>
          <div className="hero-eyebrow">
            <span className="eyebrow-line"></span>
            <span>{currentSlide.eyebrow}</span>
          </div>

          <h1>
            {currentSlide.title}
            <br />
            <span>{currentSlide.highlight}</span>
          </h1>

          <p className="hero-description">
            {currentSlide.description}
          </p>

          <div className="hero-actions">
            <a href="#menu" className="hero-primary-btn">
              Explore Our Menu
              <span aria-hidden="true">↗</span>
            </a>

            <a href="#about" className="hero-secondary-link">
              Discover Our Story
              <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className="hero-note">
            <span className="hero-note-icon">✦</span>
            <span>GOOD FOOD. GOOD COMPANY. GREAT MEMORIES.</span>
          </div>
        </div>
      </div>

      {/* Bottom caption and carousel controls */}
      <div className="hero-bottom">
        <div className="hero-image-caption">
          <span className="caption-line"></span>
          <span>{currentSlide.caption}</span>
        </div>

        <div className="hero-carousel-controls">
          <button
            type="button"
            className="hero-arrow"
            onClick={goToPrevious}
            aria-label="Previous slide"
          >
            ←
          </button>

          <div className="hero-indicators" aria-label="Choose a slide">
            {heroSlides.map((slide, index) => (
              <button
                type="button"
                key={slide.image}
                className={`hero-indicator ${
                  activeSlide === index ? 'active' : ''
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={activeSlide === index ? 'true' : undefined}
              />
            ))}
          </div>

          <button
            type="button"
            className="hero-arrow"
            onClick={goToNext}
            aria-label="Next slide"
          >
            →
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll-indicator">
        <span>SCROLL TO EXPLORE</span>
        <span className="scroll-line"></span>
      </div>
    </section>
  );
}

export default Hero;
