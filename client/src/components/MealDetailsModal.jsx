import API_BASE_URL from "../config/api.js";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";
import "./MealDetailsModal.css";

const API_URL = API_BASE_URL;
function MealDetailsModal({ item, onClose }) {
  const { addToCart } = useCart();
  const { session } = useAuth();

  const [selectedSize, setSelectedSize] = useState(
    item?.sizes?.[0] || null
  );
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState("");

  const [isFavourite, setIsFavourite] = useState(false);
  const [isFavouriteLoading, setIsFavouriteLoading] = useState(true);
  const [isFavouriteSaving, setIsFavouriteSaving] = useState(false);
  const [favouriteError, setFavouriteError] = useState("");

  // Load the customer's favourites from Supabase.
  useEffect(() => {
    let active = true;

    async function loadFavouriteStatus() {
      if (!session?.access_token || !item?.dbId) {
        setIsFavourite(false);
        setIsFavouriteLoading(false);
        return;
      }

      setIsFavouriteLoading(true);
      setFavouriteError("");

      try {
        const response = await fetch(`${API_URL}/favourites`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load favourites."
          );
        }

        const saved = (result.favourites || []).some(
          (favourite) =>
            String(favourite.menu_item_id) === String(item.dbId)
        );

        if (active) {
          setIsFavourite(saved);
        }
      } catch (error) {
        console.error("Favourite status error:", error);

        if (active) {
          setFavouriteError(error.message);
        }
      } finally {
        if (active) {
          setIsFavouriteLoading(false);
        }
      }
    }

    loadFavouriteStatus();

    return () => {
      active = false;
    };
  }, [item?.dbId, session?.access_token]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const basePrice = selectedSize
    ? selectedSize.price
    : item.price;

  const extrasTotal = selectedExtras.reduce(
    (total, extra) => total + extra.price,
    0
  );

  const unitPrice = basePrice + extrasTotal;
  const totalPrice = unitPrice * quantity;

  const formatPrice = (price) =>
    `₦${price.toLocaleString("en-NG")}`;

  // Add or remove the meal from the customer's Supabase favourites.
  const toggleFavourite = async () => {
    if (!session?.access_token) {
      setFavouriteError("Please sign in to save your favourites.");
      return;
    }

    if (!item.dbId || isFavouriteSaving || isFavouriteLoading) {
      return;
    }

    setIsFavouriteSaving(true);
    setFavouriteError("");

    try {
      const response = await fetch(
        isFavourite
          ? `${API_URL}/favourites/${item.dbId}`
          : `${API_URL}/favourites`,
        {
          method: isFavourite ? "DELETE" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          ...(isFavourite
            ? {}
            : {
                body: JSON.stringify({
                  menu_item_id: item.dbId,
                }),
              }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to update your favourites."
        );
      }

      setIsFavourite(!isFavourite);

      window.dispatchEvent(
        new Event("chophub-favourites-updated")
      );
    } catch (error) {
      console.error("Favourite update error:", error);
      setFavouriteError(error.message);
    } finally {
      setIsFavouriteSaving(false);
    }
  };

  const toggleExtra = (extra) => {
    setSelectedExtras((previous) => {
      const exists = previous.some(
        (selected) => selected.name === extra.name
      );

      return exists
        ? previous.filter(
            (selected) => selected.name !== extra.name
          )
        : [...previous, extra];
    });
  };

  const cartKey = useMemo(() => {
    const extrasKey = selectedExtras
      .map((extra) => extra.name)
      .sort()
      .join("-");

    const instructionsKey = instructions.trim().toLowerCase();

    return `${item.id}-${selectedSize?.name || "standard"}-${extrasKey}-${instructionsKey}`;
  }, [item.id, selectedSize, selectedExtras, instructions]);

  const handleAddToCart = () => {
    if (item.availability !== "available") return;

    addToCart({
      id: item.id,
      dbId: item.dbId,
      cartKey,
      name: item.name,
      image: item.image,
      price: unitPrice,
      size: selectedSize?.name || null,
      extras: selectedExtras,
      instructions: instructions.trim(),
      quantity,
    });

    onClose();
  };

  if (!item) return null;

  return createPortal(
    <div
      className="meal-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="meal-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="meal-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="meal-modal-close"
          onClick={onClose}
          aria-label="Close meal details"
        >
          ×
        </button>

        <div className="meal-modal-image">
          <img src={item.image} alt={item.name} />

          <button
            type="button"
            className={`meal-modal-favourite ${
              isFavourite ? "active" : ""
            }`}
            onClick={toggleFavourite}
            disabled={
              !session?.access_token ||
              isFavouriteLoading ||
              isFavouriteSaving ||
              !item.dbId
            }
            aria-label={
              isFavourite
                ? `Remove ${item.name} from favourites`
                : `Add ${item.name} to favourites`
            }
            aria-pressed={isFavourite}
            title={
              !session?.access_token
                ? "Sign in to save favourites"
                : isFavourite
                  ? "Remove from favourites"
                  : "Add to favourites"
            }
          >
            <svg
              viewBox="0 0 24 24"
              fill={isFavourite ? "currentColor" : "none"}
              aria-hidden="true"
            >
              <path
                d="M20.8 8.7c0 4.1-8.8 10.1-8.8 10.1S3.2 12.8 3.2 8.7A4.7 4.7 0 0 1 12 6.2a4.7 4.7 0 0 1 8.8 2.5Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <span className="meal-modal-category">
            {item.category}
          </span>
        </div>

        <div className="meal-modal-content">
          {favouriteError && (
            <p role="alert" className="meal-favourite-error">
              {favouriteError}
            </p>
          )}

          <span className="meal-modal-eyebrow">
            MADE TO YOUR TASTE
          </span>

          <h2 id="meal-modal-title">{item.name}</h2>

          <p className="meal-modal-description">
            {item.description}
          </p>

          {item.sizes?.length > 0 && (
            <section className="meal-option-section">
              <div className="meal-option-heading">
                <h3>Choose your portion</h3>
                <span>Required</span>
              </div>

              <div className="meal-size-options">
                {item.sizes.map((size) => (
                  <button
                    key={size.name}
                    type="button"
                    className={`meal-size-option ${
                      selectedSize?.name === size.name
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => setSelectedSize(size)}
                    aria-pressed={
                      selectedSize?.name === size.name
                    }
                  >
                    <span>{size.name}</span>
                    <strong>{formatPrice(size.price)}</strong>
                  </button>
                ))}
              </div>
            </section>
          )}

          {item.extras?.length > 0 && (
            <section className="meal-option-section">
              <div className="meal-option-heading">
                <h3>Make it extra special</h3>
                <span>Optional</span>
              </div>

              <div className="meal-extra-options">
                {item.extras.map((extra) => {
                  const checked = selectedExtras.some(
                    (selected) => selected.name === extra.name
                  );

                  return (
                    <label
                      className="meal-extra-option"
                      key={extra.name}
                    >
                      <span className="meal-extra-check">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleExtra(extra)}
                        />
                        <span className="custom-check" />
                        <span>{extra.name}</span>
                      </span>

                      <strong>
                        +{formatPrice(extra.price)}
                      </strong>
                    </label>
                  );
                })}
              </div>
            </section>
          )}

          <section className="meal-option-section">
            <div className="meal-option-heading">
              <h3>Special instructions</h3>
              <span>Optional</span>
            </div>

            <textarea
              value={instructions}
              onChange={(event) =>
                setInstructions(event.target.value)
              }
              placeholder="Anything you'd like us to know about your meal?"
              rows={3}
              maxLength={250}
            />

            <span className="meal-instruction-count">
              {instructions.length}/250
            </span>
          </section>

          <div className="meal-modal-footer">
            <div className="meal-quantity-control">
              <button
                type="button"
                onClick={() =>
                  setQuantity((current) =>
                    Math.max(1, current - 1)
                  )
                }
                aria-label="Decrease quantity"
              >
                −
              </button>

              <span>{quantity}</span>

              <button
                type="button"
                onClick={() =>
                  setQuantity((current) => current + 1)
                }
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="meal-add-button"
              onClick={handleAddToCart}
              disabled={item.availability !== "available"}
            >
              <span>
                {item.availability === "available"
                  ? "ADD TO ORDER"
                  : "CURRENTLY UNAVAILABLE"}
              </span>

              <strong>{formatPrice(totalPrice)}</strong>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default MealDetailsModal;
