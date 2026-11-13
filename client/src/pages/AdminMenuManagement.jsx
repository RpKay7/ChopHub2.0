import API_BASE_URL from "../config/api.js";

import { useMemo, useState } from "react";
import { menuCategories } from "../data/menu";
import { useMenu } from "../components/MenuContext";
import { useAuth } from "../components/AuthContext";

const API_URL = `${API_BASE_URL}/menu`;
function formatPrice(amount) {
  return `₦${Number(amount).toLocaleString("en-NG")}`;
}

const emptyForm = {
  name: "",
  category: "Nigerian Classics",
  description: "",
  price: "",
  image: "",
  popular: false,
};

function AdminMenuManagement() {
  const { items, refreshMenu } = useMenu();
  const { session } = useAuth();

  const accessToken = session?.access_token;

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const filteredItems = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search);

      const matchesCategory =
        categoryFilter === "All" ||
        item.category === categoryFilter;

      const matchesAvailability =
        availabilityFilter === "All" ||
        item.availability === availabilityFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesCategory &&
        matchesAvailability
      );
    });
  }, [items, searchTerm, categoryFilter, availabilityFilter]);

  const availableCount = items.filter(
    (item) => item.availability === "available"
  ).length;

  const unavailableCount = items.filter(
    (item) => item.availability !== "available"
  ).length;

  const popularCount = items.filter(
    (item) => item.popular
  ).length;

  const getAuthHeaders = () => {
    if (!accessToken) {
      throw new Error(
        "Your login session is missing. Please sign in again."
      );
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };
  };

  const sendMenuRequest = async (url, method, body = null) => {
    const options = {
      method,
      headers: getAuthHeaders(),
    };

    if (body !== null) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    let result;

    try {
      result = await response.json();
    } catch {
      throw new Error("The server returned an invalid response.");
    }

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "The menu operation could not be completed."
      );
    }

    return result;
  };

  const getMenuPayload = (item) => ({
    name: item.name,
    category: item.category,
    description: item.description,
    price: Number(item.price),
    image: item.image,
    popular: Boolean(item.popular),
    availability: item.availability || "available",
    sizes: Array.isArray(item.sizes) ? item.sizes : [],
    extras: Array.isArray(item.extras) ? item.extras : [],
  });

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
    setFeedback("");
  };

  const openEditModal = (item) => {
    setEditingId(item.id);

    setForm({
      name: item.name,
      category: item.category,
      description: item.description,
      price: String(item.price),
      image: item.image,
      popular: item.popular,
    });

    setModalOpen(true);
    setFeedback("");
  };

  const closeModal = () => {
    if (isSaving) return;

    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSaving) return;

    const price = Number(form.price);

    if (
      !form.name.trim() ||
      !form.description.trim() ||
      !form.category.trim()
    ) {
      setFeedback("Please complete all required fields.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setFeedback("Enter a valid price greater than zero.");
      return;
    }

    if (!form.image.trim()) {
      setFeedback("Please provide an image path.");
      return;
    }

    setIsSaving(true);
    setFeedback("");

    try {
      let result;

      if (editingId) {
        const existingItem = items.find(
          (item) => item.id === editingId
        );

        if (!existingItem?.dbId) {
          throw new Error("This menu item could not be found in the database.");
        }

        const updatedItem = {
          ...existingItem,
          name: form.name.trim(),
          category: form.category,
          description: form.description.trim(),
          price,
          image: form.image.trim(),
          popular: form.popular,
        };

        result = await sendMenuRequest(
          `${API_URL}/${existingItem.dbId}`,
          "PUT",
          getMenuPayload(updatedItem)
        );
      } else {
        const newItem = {
          name: form.name.trim(),
          category: form.category,
          description: form.description.trim(),
          price,
          image: form.image.trim(),
          popular: form.popular,
          availability: "available",
          sizes: [],
          extras: [],
        };

        result = await sendMenuRequest(
          API_URL,
          "POST",
          getMenuPayload(newItem)
        );
      }

      await refreshMenu();

      setModalOpen(false);
      setEditingId(null);
      setForm(emptyForm);

      setFeedback(
        result.message ||
          (editingId
            ? "Menu item updated successfully."
            : "New menu item added successfully.")
      );
    } catch (error) {
      console.error("Menu save error:", error);
      setFeedback(error.message || "Unable to save menu item.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAvailability = async (item) => {
    if (!item.dbId) {
      setFeedback("This menu item has no database ID.");
      return;
    }

    try {
      const updatedItem = {
        ...item,
        availability:
          item.availability === "available"
            ? "unavailable"
            : "available",
      };

      const result = await sendMenuRequest(
        `${API_URL}/${item.dbId}`,
        "PUT",
        getMenuPayload(updatedItem)
      );

      await refreshMenu();

      setFeedback(
        result.message ||
          `${item.name} availability updated successfully.`
      );
    } catch (error) {
      console.error("Availability update error:", error);
      setFeedback(error.message || "Unable to update availability.");
    }
  };

  const togglePopular = async (item) => {
    if (!item.dbId) {
      setFeedback("This menu item has no database ID.");
      return;
    }

    try {
      const updatedItem = {
        ...item,
        popular: !item.popular,
      };

      const result = await sendMenuRequest(
        `${API_URL}/${item.dbId}`,
        "PUT",
        getMenuPayload(updatedItem)
      );

      await refreshMenu();

      setFeedback(
        result.message ||
          `${item.name} popularity status updated.`
      );
    } catch (error) {
      console.error("Popular status update error:", error);
      setFeedback(error.message || "Unable to update popular status.");
    }
  };

  const handleDeleteItem = async (item) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${item.name}"?`
    );

    if (!confirmed) return;

    if (!item.dbId) {
      setFeedback("This menu item has no database ID.");
      return;
    }

    try {
      const result = await sendMenuRequest(
        `${API_URL}/${item.dbId}`,
        "DELETE"
      );

      await refreshMenu();

      setFeedback(
        result.message || `${item.name} was deleted successfully.`
      );
    } catch (error) {
      console.error("Menu deletion error:", error);
      setFeedback(error.message || "Unable to delete menu item.");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("All");
    setAvailabilityFilter("All");
  };

  return (
    <div className="admin-content admin-menu-management">
      <div className="admin-welcome">
        <div>
          <span className="admin-welcome-eyebrow">
            MENU OPERATIONS
          </span>
          <h2>Manage your menu.</h2>
          <p>
            Add meals, update details and control availability.
          </p>
        </div>

        <button
          type="button"
          className="admin-add-menu-button"
          onClick={openAddModal}
        >
          <span>＋</span>
          Add new meal
        </button>
      </div>

      <div className="admin-menu-summary">
        <article>
          <span>Total menu items</span>
          <strong>{items.length}</strong>
        </article>

        <article>
          <span>Available</span>
          <strong>{availableCount}</strong>
        </article>

        <article>
          <span>Unavailable</span>
          <strong>{unavailableCount}</strong>
        </article>

        <article>
          <span>Popular items</span>
          <strong>{popularCount}</strong>
        </article>
      </div>

      {feedback && (
        <div className="admin-menu-feedback" role="status">
          <span>✓</span>
          {feedback}
          <button
            type="button"
            onClick={() => setFeedback("")}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      <section className="admin-panel admin-menu-panel">
        <div className="admin-panel-heading admin-menu-heading">
          <div>
            <span className="admin-panel-eyebrow">
              MENU DIRECTORY
            </span>
            <h2>All menu items</h2>
            <p>
              Manage the meals and drinks available on ChopHub.
            </p>
          </div>

          <span className="admin-menu-result-count">
            {filteredItems.length} of {items.length} items
          </span>
        </div>

        <div className="admin-menu-toolbar">
          <div className="admin-menu-search">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m16 16 4 4" />
            </svg>

            <input
              type="search"
              placeholder="Search meals or descriptions..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              aria-label="Search menu items"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value)
            }
            aria-label="Filter by category"
          >
            <option>All</option>
            {menuCategories
              .filter((category) => category !== "All")
              .map((category) => (
                <option key={category}>{category}</option>
              ))}
          </select>

          <select
            value={availabilityFilter}
            onChange={(event) =>
              setAvailabilityFilter(event.target.value)
            }
            aria-label="Filter by availability"
          >
            <option>All</option>
            <option>Available</option>
            <option>Unavailable</option>
          </select>
        </div>

        <div className="admin-menu-grid">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <article
                className="admin-menu-card"
                key={item.id}
              >
                <div className="admin-menu-card-image">
                  <img
                    src={item.image}
                    alt={item.name}
                    onError={(event) => {
                      event.currentTarget.style.opacity = "0.2";
                    }}
                  />

                  <span
                    className={`admin-menu-availability ${
                      item.availability
                    }`}
                  >
                    {item.availability === "available"
                      ? "Available"
                      : "Unavailable"}
                  </span>

                  {item.popular && (
                    <span className="admin-menu-popular-badge">
                      ★ Popular
                    </span>
                  )}
                </div>

                <div className="admin-menu-card-body">
                  <span className="admin-menu-category">
                    {item.category}
                  </span>

                  <h3>{item.name}</h3>

                  <p>{item.description}</p>

                  <div className="admin-menu-card-price">
                    <span>From</span>
                    <strong>{formatPrice(item.price)}</strong>
                  </div>

                  <div className="admin-menu-card-actions">
                    <button
                      type="button"
                      className="admin-menu-edit"
                      onClick={() => openEditModal(item)}
                    >
                      Edit item
                    </button>

                    <button
                      type="button"
                      className="admin-menu-more"
                      onClick={() => toggleAvailability(item)}
                      title={
                        item.availability === "available"
                          ? "Mark unavailable"
                          : "Mark available"
                      }
                    >
                      {item.availability === "available"
                        ? "Disable"
                        : "Enable"}
                    </button>
                  </div>

                  <div className="admin-menu-secondary-actions">
                    <button
                      type="button"
                      onClick={() => togglePopular(item)}
                    >
                      {item.popular
                        ? "Remove from popular"
                        : "Mark as popular"}
                    </button>

                    <button
                      type="button"
                      className="admin-menu-delete"
                      onClick={() => handleDeleteItem(item)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="admin-menu-empty">
              <span>⌕</span>
              <h3>No menu items found</h3>
              <p>
                Try a different search or adjust your filters.
              </p>
              <button type="button" onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          )}
        </div>

        <div className="admin-menu-demo-note">
          <span>ⓘ</span>
          Admin menu changes are saved to the ChopHub database
          and reflected in the customer-facing menu.
        </div>
      </section>

      {modalOpen && (
        <div
          className="admin-menu-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !isSaving
            ) {
              closeModal();
            }
          }}
        >
          <section
            className="admin-menu-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-menu-modal-title"
          >
            <div className="admin-menu-modal-header">
              <div>
                <span className="admin-panel-eyebrow">
                  MENU EDITOR
                </span>
                <h2 id="admin-menu-modal-title">
                  {editingId ? "Edit menu item" : "Add a new meal"}
                </h2>
                <p>
                  Enter the information for this menu item.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close form"
                disabled={isSaving}
              >
                ×
              </button>
            </div>

            <form
              className="admin-menu-form"
              onSubmit={handleSubmit}
            >
              <label>
                Meal name
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Nigerian Party Jollof Rice"
                  required
                />
              </label>

              <label>
                Category
                <select
                  name="category"
                  value={form.category}
                  onChange={handleInputChange}
                  required
                >
                  {menuCategories
                    .filter((category) => category !== "All")
                    .map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                </select>
              </label>

              <label>
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  placeholder="Describe the meal..."
                  rows="4"
                  required
                />
              </label>

              <div className="admin-menu-form-row">
                <label>
                  Base price (₦)
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleInputChange}
                    placeholder="4500"
                    min="1"
                    step="1"
                    required
                  />
                </label>

                <label>
                  Image path
                  <input
                    type="text"
                    name="image"
                    value={form.image}
                    onChange={handleInputChange}
                    placeholder="/images/menu/meal.jpg"
                    required
                  />
                </label>
              </div>

              <label className="admin-menu-popular-check">
                <input
                  type="checkbox"
                  name="popular"
                  checked={form.popular}
                  onChange={handleInputChange}
                />
                <span>Feature this as a popular item</span>
              </label>

              <div className="admin-menu-form-actions">
                <button
                  type="button"
                  className="admin-menu-cancel"
                  onClick={closeModal}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-menu-save"
                  disabled={isSaving}
                >
                  {isSaving
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Add menu item"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default AdminMenuManagement;
