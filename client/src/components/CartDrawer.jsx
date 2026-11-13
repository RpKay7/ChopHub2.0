
import { useEffect } from 'react';
import {createPortal} from 'react-dom'
import { useCart } from './CartContext';
import { useNavigate } from "react-router-dom";
import './CartDrawer.css';

function EmptyTableIcon() {
  return (
    <svg
      className="empty-table-icon"
      viewBox="0 0 80 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M40 83V45"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M40 58C25 48 19 34 22 18C34 25 42 39 40 58Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M40 49C40 31 49 17 63 11C65 27 56 43 40 49Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M40 83H31M40 83H49"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CartDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const {
    cartItems,
    itemCount,
    subtotal,
    updateQuantity,
    removeFromCart,
  } = useCart();

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const formatPrice = (price) =>
    `₦${Number(price).toLocaleString('en-NG')}`;

  if (!isOpen) return null;

  return createPortal(
    (
      <div
        className="cart-backdrop"
        onClick={onClose}
    >
      <aside
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        aria-hidden="false"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="cart-drawer-header">
          <div className="cart-heading-copy">
            <span className="cart-eyebrow">YOUR ORDER</span>
            <h2 id="cart-title">
              {cartItems.length === 0
                ? 'The Table Awaits'
                : 'A Seat at the Table'}
            </h2>
          </div>

          <button
            type="button"
            className="cart-close-button"
            onClick={onClose}
            aria-label="Close your order"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="cart-drawer-content">
          {cartItems.length === 0 ? (
            <div className="cart-empty-state">
              <EmptyTableIcon />

              <h3>YOUR TABLE IS BARE</h3>

              <p>
                Add something delicious from the menu.
              </p>

              <button
                type="button"
                className="cart-empty-menu-link"
                onClick={() => {
                  onClose();
                  document.getElementById('menu')?.scrollIntoView({
                    behavior: 'smooth',
                  });
                }}
              >
                EXPLORE THE MENU
                <span aria-hidden="true">↗</span>
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <article
                  className="cart-item"
                  key={item.cartKey}
                >
                  <div className="cart-item-image">
                    <img
                      src={item.image}
                      alt={item.name}
                    />
                  </div>

                  <div className="cart-item-details">
                    <div className="cart-item-heading">
                      <div>
                        <h3>{item.name}</h3>

                        {item.size && (
                          <span className="cart-item-option">
                            {item.size}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        className="cart-remove-button"
                        onClick={() => removeFromCart(item.cartKey)}
                        aria-label={`Remove ${item.name}`}
                      >
                        ×
                      </button>
                    </div>

                    <div className="cart-item-bottom">
                      <div className="cart-quantity-control">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.cartKey,
                              item.quantity - 1
                            )
                          }
                          aria-label={`Decrease ${item.name} quantity`}
                        >
                          −
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.cartKey,
                              item.quantity + 1
                            )
                          }
                          aria-label={`Increase ${item.name} quantity`}
                        >
                          +
                        </button>
                      </div>

                      <strong>
                        {formatPrice(item.price * item.quantity)}
                      </strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <footer className="cart-drawer-footer">
          <div className="cart-subtotal-row">
            <span>SUBTOTAL</span>
            <strong>
              {cartItems.length > 0 ? formatPrice(subtotal) : '₦0'}
            </strong>
          </div>

          <button
            type="button"
            className="cart-checkout-button"
            disabled={cartItems.length === 0}
            onClick={() => {
            navigate("/checkout");
            }}
          >
            PROCEED TO CHECKOUT
            <span aria-hidden="true">↗</span>
          </button>

          {cartItems.length > 0 && (
            <button
              type="button"
              className="cart-continue-button"
              onClick={onClose}
            >
              Continue exploring the menu
            </button>
          )}
        </footer>
      </aside>
    </div>
  ),
  document.body
  );
}

export default CartDrawer;
