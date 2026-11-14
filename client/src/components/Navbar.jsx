
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../components/CartContext';
import { useAuth } from '../components/AuthContext';
import CartDrawer from '../components/CartDrawer';
import './Navbar.css';

const navLinks = [
  { label: 'Home', href: '#home', id: 'home' },
  { label: 'About', href: '#about', id: 'about' },
  { label: 'Experiences', href: '#experiences', id: 'experiences' },
  { label: 'Menu', href: '#menu', id: 'menu' },
  { label: 'Contact', href: '#contact', id: 'contact' },
];

function ChopHubLogo() {
  return (
    <a href="#home" className="brand-logo" aria-label="ChopHub home">
      <svg
        className="brand-mark"
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M8 36.5C8 23.8 16 13.5 26 13.5C36 13.5 44 23.8 44 36.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M15 36.5C15 28.3 19.9 21.5 26 21.5C32.1 21.5 37 28.3 37 36.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M26 8V17M21.5 12.5H30.5" stroke="#B85C45" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M7 42H45" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>

      <span className="brand-name">
        Chop<span>Hub</span>
      </span>
    </a>
  );
}

function DiningBagIcon() {
  return (
    <svg
      className="dining-bag-icon"
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="26" cy="27" r="15" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="26" cy="27" r="10.5" stroke="currentColor" strokeWidth="1.2" />

      <path
        d="M7.5 8.5C4.8 8.5 3.5 11 3.5 13.5C3.5 16 4.8 18 7.5 18C10.2 18 11.5 16 11.5 13.5C11.5 11 10.2 8.5 7.5 8.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M7.5 18V43" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

      <path
        d="M44.5 8.5C41.8 8.5 40.5 11 40.5 13.5C40.5 16 41.8 18 44.5 18C47.2 18 48.5 16 48.5 13.5C48.5 11 47.2 8.5 44.5 8.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M44.5 18V43" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CustomerAvatar({ name }) {
  const initials = (name || 'Customer')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  return (
    <span className="customer-profile-avatar" aria-hidden="true">
      {initials || 'C'}
    </span>
  );
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [cartOpen, setCartOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const profileMenuRef = useRef(null);

  const { itemCount } = useCart();
  const { user, loading, logout } = useAuth();

  const isLoggedIn = Boolean(user);
  const customerName = user?.fullName?.trim() || 'Customer';
  const customerEmail = user?.email || '';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);

      const scrollPosition = window.scrollY + 180;
      let currentSection = 'home';

      navLinks.forEach((link) => {
        const section = document.getElementById(link.id);

        if (section && section.offsetTop <= scrollPosition) {
          currentSection = link.id;
        }
      });

      setActiveSection(currentSection);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  // Close the customer profile dropdown when clicking outside or pressing Escape.
  useEffect(() => {
    if (!profileMenuOpen) return;

    const handleOutsideClick = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [profileMenuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const closeProfileMenu = () => setProfileMenuOpen(false);

  const handleLogout = () => {
    closeProfileMenu();
    logout();
    window.location.replace('/');
  };

  return (
    <header
      className={`site-header ${scrolled ? 'is-scrolled' : ''} ${
        menuOpen ? 'menu-is-open' : ''
      }`}
    >
      <div className="navbar-container">
        <ChopHubLogo />

        <nav
          className={`navbar-links ${menuOpen ? 'menu-open' : ''}`}
          id="main-navigation"
          aria-label="Main navigation"
        >
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className={`nav-link ${
                activeSection === link.id ? 'active' : ''
              }`}
              aria-current={
                activeSection === link.id ? 'location' : undefined
              }
              onClick={closeMenu}
            >
              {link.label}
            </a>
          ))}

          <a
            href="#menu"
            className="mobile-order-link"
            onClick={closeMenu}
          >
            Order a Meal
          </a>
        </nav>

        <div className="navbar-actions">
          {!loading && (
            isLoggedIn ? (
              <div
                className="customer-profile-menu"
                ref={profileMenuRef}
              >
                <button
                  type="button"
                  className={`customer-profile-trigger ${
                    profileMenuOpen ? 'active' : ''
                  }`}
                  onClick={() =>
                    setProfileMenuOpen((previous) => !previous)
                  }
                  aria-expanded={profileMenuOpen}
                  aria-haspopup="menu"
                  aria-label="Open customer profile menu"
                >
                  <CustomerAvatar name={customerName} />

                  <span className="customer-profile-name">
                    {customerName.split(/\s+/)[0]}
                  </span>

                  <svg
                    className="customer-profile-chevron"
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 7.5L10 12.5L15 7.5"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {profileMenuOpen && (
                  <div
                    className="customer-profile-dropdown"
                    role="menu"
                    aria-label="Customer account menu"
                  >
                    <div className="customer-profile-dropdown-header">
                      <CustomerAvatar name={customerName} />

                      <div>
                        <strong>{customerName}</strong>
                        <span>{customerEmail}</span>
                      </div>
                    </div>

                    <div className="customer-profile-dropdown-divider" />

                    <Link
                      to="/account"
                      state={{ activeTab: 'overview' }}
                      className="customer-profile-menu-item"
                      role="menuitem"
                      onClick={closeProfileMenu}
                    >
                      <span className="profile-menu-icon">⌂</span>
                      My Dashboard
                    </Link>

                    <Link
                      to="/account"
                      state={{ activeTab: 'orders' }}
                      className="customer-profile-menu-item"
                      role="menuitem"
                      onClick={closeProfileMenu}
                    >
                      <span className="profile-menu-icon">▤</span>
                      My Orders
                    </Link>

                    <Link
                      to="/account"
                      state={{ activeTab: 'profile' }}
                      className="customer-profile-menu-item"
                      role="menuitem"
                      onClick={closeProfileMenu}
                    >
                      <span className="profile-menu-icon">♙</span>
                      My Profile
                    </Link>

                    <Link
                      to="/account"
                      state={{ activeTab: 'settings' }}
                      className="customer-profile-menu-item"
                      role="menuitem"
                      onClick={closeProfileMenu}
                    >
                      <span className="profile-menu-icon">⚙</span>
                      Account Settings
                    </Link>

                    <div className="customer-profile-dropdown-divider" />

                    <button
                      type="button"
                      className="customer-profile-menu-item customer-profile-logout"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      <span className="profile-menu-icon">↪</span>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="nav-login-btn"
                onClick={closeMenu}
              >
                Login
              </Link>
            )
          )}

          <button
            type="button"
            className="dining-bag-button"
            aria-label={`Your dining bag, ${itemCount} items`}
            title="Your dining bag"
            onClick={() => setCartOpen(true)}
          >
            <DiningBagIcon />

            {itemCount > 0 && (
              <span className="dining-bag-count">
                {itemCount}
              </span>
            )}
          </button>

          <a href="#menu" className="nav-order-btn">
            <span>Order Now</span>
            <span className="order-arrow" aria-hidden="true">
              ↗
            </span>
          </a>

          <button
            type="button"
            className={`mobile-menu-toggle ${
              menuOpen ? 'active' : ''
            }`}
            onClick={() => setMenuOpen((previous) => !previous)}
            aria-label={
              menuOpen ? 'Close navigation menu' : 'Open navigation menu'
            }
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
          >
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
      />
    </header>
  );
}

export default Navbar;
