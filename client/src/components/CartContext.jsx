
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'chophub-cart';

function getInitialCart() {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);

    if (!savedCart) return [];

    const parsedCart = JSON.parse(savedCart);

    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(getInitialCart);

  useEffect(() => {
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cartItems)
      );
    } catch {
      // Cart remains available in memory if storage is unavailable.
    }
  }, [cartItems]);

  const addToCart = (item) => {
    if (!item || !item.id || !item.name || item.price <= 0) {
      return;
    }

    const cartKey = item.cartKey;

    setCartItems((previousItems) => {
      const existingItem = previousItems.find(
        (cartItem) => cartItem.cartKey === cartKey
      );

      if (existingItem) {
        return previousItems.map((cartItem) =>
          cartItem.cartKey === cartKey
            ? {
                ...cartItem,
                quantity: cartItem.quantity + (item.quantity || 1),
              }
            : cartItem
        );
      }

      return [
        ...previousItems,
        {
          ...item,
          quantity: item.quantity || 1,
        },
      ];
    });
  };

  const updateQuantity = (cartKey, quantity) => {
    if (quantity < 1) {
      removeFromCart(cartKey);
      return;
    }

    setCartItems((previousItems) =>
      previousItems.map((item) =>
        item.cartKey === cartKey
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (cartKey) => {
    setCartItems((previousItems) =>
      previousItems.filter(
        (item) => item.cartKey !== cartKey
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const itemCount = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + item.quantity,
        0
      ),
    [cartItems]
  );

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
    [cartItems]
  );

  const value = {
    cartItems,
    itemCount,
    subtotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      'useCart must be used inside a CartProvider'
    );
  }

  return context;
}
