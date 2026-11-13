import API_BASE_URL from "../config/api.js";
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { menuItems as fallbackMenuItems } from "../data/menu";

const MenuContext = createContext(null);

const MENU_STORAGE_KEY = "chophub-menu-items";
const API_URL = `${API_BASE_URL}/menu`;
function getInitialMenuItems() {
  try {
    const savedItems = localStorage.getItem(MENU_STORAGE_KEY);

    if (savedItems !== null) {
      const parsedItems = JSON.parse(savedItems);

      if (Array.isArray(parsedItems)) {
        return parsedItems;
      }
    }
  } catch (error) {
    console.error("Could not load saved menu items:", error);
  }

  return fallbackMenuItems.map((item) => ({ ...item }));
}

// Convert Supabase menu records into the format
// already used by the ChopHub frontend.
function formatMenuItem(item) {
  return {
    ...item,

    // Keep the original frontend-friendly identifier.
    id: item.slug || item.id,

    // Preserve the actual Supabase UUID for orders.
    dbId: item.id,

    slug: item.slug,

    name: item.name,
    description: item.description,
    price: Number(item.price),

    image: item.image_url,

    category: item.category || item.categories?.name || null,

    availability: item.is_available
      ? "available"
      : "unavailable",

    popular: Boolean(item.is_featured),

    sizes: Array.isArray(item.sizes)
      ? item.sizes
      : [],

    extras: Array.isArray(item.extras)
      ? item.extras
      : [],
  };
}

export function MenuProvider({ children }) {
  const [items, setItems] = useState(getInitialMenuItems);

  const [isLoading, setIsLoading] = useState(true);
  const [menuError, setMenuError] = useState("");

  // Retrieve the latest menu from Supabase.
  const refreshMenu = async () => {
    setIsLoading(true);
    setMenuError("");

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(
          `Menu request failed with status ${response.status}.`
        );
      }

      const result = await response.json();

      if (!result.success || !Array.isArray(result.menuItems)) {
        throw new Error("Invalid menu response from the server.");
      }

      const formattedItems = result.menuItems.map(formatMenuItem);

      setItems(formattedItems);

      return formattedItems;
    } catch (error) {
      console.error("Could not retrieve menu from Supabase:", error);

      setMenuError(
        "Unable to load the latest menu. Showing previously saved menu data."
      );

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Load the database menu when the provider mounts.
  useEffect(() => {
    refreshMenu();
  }, []);

  // Keep a local cache for fallback purposes.
  useEffect(() => {
    try {
      localStorage.setItem(
        MENU_STORAGE_KEY,
        JSON.stringify(items)
      );
    } catch (error) {
      console.error("Could not save menu items:", error);
    }
  }, [items]);

  const addMenuItem = (newItem) => {
    setItems((previousItems) => [
      ...previousItems,
      newItem,
    ]);
  };

  const updateMenuItem = (updatedItem) => {
    setItems((previousItems) =>
      previousItems.map((item) =>
        item.id === updatedItem.id
          ? updatedItem
          : item
      )
    );
  };

  const deleteMenuItem = (itemId) => {
    setItems((previousItems) =>
      previousItems.filter((item) => item.id !== itemId)
    );
  };

  const value = {
    items,
    setItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    refreshMenu,
    isLoading,
    menuError,
  };

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);

  if (!context) {
    throw new Error(
      "useMenu must be used inside a MenuProvider"
    );
  }

  return context;
}