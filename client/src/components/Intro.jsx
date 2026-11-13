
import { useEffect } from "react";
import "./Intro.css";

function ChopHubIntroLogo() {
  return (
    <svg
      className="intro-brand-mark"
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        className="intro-logo-stroke intro-logo-outer"
        d="M8 36.5C8 23.8 16 13.5 26 13.5C36 13.5 44 23.8 44 36.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        className="intro-logo-stroke intro-logo-inner"
        d="M15 36.5C15 28.3 19.9 21.5 26 21.5C32.1 21.5 37 28.3 37 36.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        className="intro-logo-stroke intro-logo-cross"
        d="M26 8V17M21.5 12.5H30.5"
        stroke="#B85C45"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        className="intro-logo-stroke intro-logo-base"
        d="M7 42H45"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Intro() {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div className="chophub-intro" aria-label="Welcome to ChopHub">
    <div className="intro-food-scene" />
      <div className="intro-atmosphere intro-atmosphere-one" />
      <div className="intro-atmosphere intro-atmosphere-two" />

      <div className="intro-grain" />

      <div className="intro-content">
        <div className="intro-emblem">
          <div className="intro-emblem-ring intro-emblem-ring-outer" />
          <div className="intro-emblem-ring intro-emblem-ring-inner" />

          <div className="intro-emblem-light" />

          <div className="intro-logo-wrapper">
            <ChopHubIntroLogo />
          </div>
        </div>

        <div className="intro-brand-name">
          CHOP<span>HUB</span>
        </div>

        <div className="intro-tagline">
          GOOD FOOD. GOOD MOOD.
        </div>

        <div className="intro-divider">
          <span />
          <i />
          <span />
        </div>

        <div className="intro-loading">
          <span className="intro-loading-bar" />
        </div>
      </div>

      <div className="intro-bottom">
        <span className="intro-bottom-line" />
        <span>A TABLE WORTH GATHERING AROUND</span>
        <span className="intro-bottom-line" />
      </div>
    </div>
  );
}

export default Intro;
