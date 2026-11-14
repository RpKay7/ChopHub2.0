import { useMemo, useState } from "react";
import { menuCategories } from "../data/menu";
import { useMenu } from "./MenuContext";
import MealDetailsModal from "./MealDetailsModal";
import "./MenuSection.css";

function MenuCardImage({ item, priority = false }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(!item.image);

  return (
    <div
      className={`menu-card-image ${
        imageLoaded ? "image-loaded" : "image-loading"
      } ${imageFailed ? "image-missing" : ""}`}
    >
      {!imageFailed && item.image && (
        <img
          src={item.image}
          alt={item.name}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageFailed(true);
            setImageLoaded(false);
          }}
        />
      )}

      {item.popular && (
        <span className="menu-card-badge">★ Popular</span>
      )}

      {item.availability !== "available" && (
        <span className="menu-unavailable-badge">
          {item.availability === "sold-out"
            ? "Sold out"
            : "Temporarily unavailable"}
        </span>
      )}
    </div>
  );
}

function MenuSection() {
  const { items: menuItems } = useMenu();

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopular, setShowPopular] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        activeCategory === "All" ||
        item.category === activeCategory;

      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        item.name.toLowerCase().includes(search) ||
        (item.description || "").toLowerCase().includes(search) ||
        (item.category || "").toLowerCase().includes(search);

      const matchesPopular = !showPopular || item.popular;

      return (
        matchesCategory &&
        matchesSearch &&
        matchesPopular
      );
    });
  }, [menuItems, activeCategory, searchTerm, showPopular]);

  const formatPrice = (price) =>
    `₦${Number(price).toLocaleString("en-NG")}`;

  const openMealDetails = (item) => {
    setSelectedMeal(item);
  };

  return (
    <section className="menu-section section" id="menu">
      <div className="container">
        <div className="menu-heading">
          <div className="section-heading">
            <span className="section-eyebrow">
              DISCOVER OUR MENU
            </span>

            <h2 className="section-title">
              Good food. <span>Great moments.</span>
            </h2>

            <p className="section-description">
              From the rich flavours of Nigerian cuisine to
              contemporary favourites, discover something
              delicious for every mood and occasion.
            </p>
          </div>

          <div className="menu-heading-note">
            <span className="menu-note-icon">✳</span>
            <p>
              Thoughtfully prepared.
              <br />
              Beautifully served.
            </p>
          </div>
        </div>

        <div className="menu-toolbar">
          <div className="menu-search">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <path
                d="m16 16 4 4"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>

            <input
              type="search"
              placeholder="Search dishes, drinks..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              aria-label="Search the menu"
            />

            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <button
            className={`popular-filter ${
              showPopular ? "active" : ""
            }`}
            onClick={() => setShowPopular(!showPopular)}
            aria-pressed={showPopular}
          >
            <span>★</span>
            Popular choices
          </button>
        </div>

        <div
          className="menu-categories"
          role="group"
          aria-label="Filter menu by category"
        >
          {menuCategories.map((category) => (
            <button
              key={category}
              className={`category-button ${
                activeCategory === category ? "active" : ""
              }`}
              onClick={() => setActiveCategory(category)}
              aria-pressed={activeCategory === category}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="menu-results-heading">
          <div>
            <span className="menu-results-label">
              OUR SELECTION
            </span>

            <h3>
              {activeCategory === "All"
                ? "Explore the menu"
                : activeCategory}
            </h3>
          </div>

          <span className="menu-result-count">
            {filteredItems.length}{" "}
            {filteredItems.length === 1 ? "item" : "items"}
          </span>
        </div>

        {filteredItems.length > 0 ? (
          <div className="menu-grid">
            {filteredItems.map((item, index) => (
              <article
                className="menu-card menu-card-clickable"
                key={item.id}
                onClick={() => openMealDetails(item)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {
                    event.preventDefault();
                    openMealDetails(item);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`View details for ${item.name}`}
              >
                <MenuCardImage
                  key={`${item.id}-${item.image || "no-image"}`}
                  item={item}
                  priority={index === 0}
                />

                <div className="menu-card-content">
                  <span className="menu-card-category">
                    {item.category}
                  </span>

                  <h4>{item.name}</h4>

                  <p className="menu-card-description">
                    {item.description}
                  </p>

                  <div className="menu-card-bottom">
                    <div className="menu-card-price">
                      <span>From</span>
                      <strong>{formatPrice(item.price)}</strong>
                    </div>

                    <span className="menu-card-arrow">
                      →
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="menu-empty-state">
            <span>⌕</span>
            <h3>No dishes found</h3>
            <p>
              We couldn't find anything matching your search.
              Try another dish or explore a different category.
            </p>

            <button
              className="btn btn-primary"
              onClick={() => {
                setSearchTerm("");
                setActiveCategory("All");
                setShowPopular(false);
              }}
            >
              View full menu
            </button>
          </div>
        )}

        <div className="menu-bottom-note">
          <span>CHOPHUB</span>
          <p>
            A little something for every appetite.
          </p>
        </div>
      </div>

      {selectedMeal && (
        <MealDetailsModal
          item={selectedMeal}
          onClose={() => setSelectedMeal(null)}
        />
      )}
    </section>
  );
}

export default MenuSection;
