
import { supabase } from "../config/supabase.js";

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function getUniqueSlug(name, excludeId = null) {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    let query = supabase
      .from("menu_items")
      .select("id")
      .eq("slug", slug);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) throw error;

    if (!data) return slug;

    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }
}

async function getCategoryId(categoryName) {
  const { data, error } = await supabase
    .from("categories")
    .select("id")
    .eq("name", categoryName)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    throw new Error(`Category "${categoryName}" does not exist.`);
  }

  return data.id;
}

function validateMenuItem(body) {
  const { name, category, description, price, image } = body;

  if (
    !name?.trim() ||
    !category?.trim() ||
    !description?.trim() ||
    !image?.trim()
  ) {
    return "Please provide the name, category, description and image.";
  }

  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return "Please provide a valid price greater than zero.";
  }

  return null;
}

/*
 * Send a notification to customers who have enabled the
 * relevant notification preference.
 *
 * Customers without a preference record receive notifications
 * by default, matching the database defaults.
 *
 * Notification failures do not interrupt menu operations.
 */
async function notifyCustomers({
  preferenceField,
  title,
  message,
  type,
  relatedId,
}) {
  try {
    const { data: customers, error: customersError } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "customer");

    if (customersError) {
      console.error(
        "Customer lookup for menu notification failed:",
        customersError.message
      );
      return;
    }

    if (!customers?.length) return;

    const customerIds = customers.map((customer) => customer.id);

    const { data: preferences, error: preferencesError } = await supabase
      .from("customer_notification_preferences")
      .select(`customer_id, ${preferenceField}`)
      .in("customer_id", customerIds);

    if (preferencesError) {
      console.error(
        "Customer notification preferences lookup failed:",
        preferencesError.message
      );
      return;
    }

    const preferenceMap = new Map(
      (preferences || []).map((preference) => [
        preference.customer_id,
        preference[preferenceField],
      ])
    );

    const notifications = customerIds
      .filter((customerId) => {
        // Missing preference records use the default enabled state.
        return preferenceMap.get(customerId) !== false;
      })
      .map((customerId) => ({
        user_id: customerId,
        title,
        message,
        type,
        is_read: false,
        related_type: "menu_item",
        related_id: relatedId,
      }));

    if (!notifications.length) return;

    const { error: insertError } = await supabase
      .from("notifications")
      .insert(notifications);

    if (insertError) {
      console.error(
        "Menu notification insertion failed:",
        insertError.message
      );
    }
  } catch (error) {
    console.error("Menu notification error:", error);
  }
}

// GET ALL MENU ITEMS
export async function getMenuItems(req, res) {
  try {
    const { data, error } = await supabase
      .from("menu_items")
      .select(`
        id,
        slug,
        name,
        description,
        price,
        image_url,
        is_available,
        is_featured,
        sizes,
        extras,
        categories (
          id,
          name
        )
      `)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Menu retrieval error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to retrieve menu items.",
      });
    }

    const menuItems = (data || []).map((item) => ({
      ...item,
      category: item.categories?.name || null,
    }));

    return res.status(200).json({
      success: true,
      count: menuItems.length,
      menuItems,
    });
  } catch (error) {
    console.error("Get menu items error:", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while retrieving the menu.",
    });
  }
}

// GET MENU CATEGORIES
export async function getMenuCategories(req, res) {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, description, image_url")
      .order("name", { ascending: true });

    if (error) {
      console.error("Category retrieval error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to retrieve menu categories.",
      });
    }

    return res.status(200).json({
      success: true,
      count: data.length,
      categories: data,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while retrieving categories.",
    });
  }
}

// CREATE MENU ITEM
export async function createMenuItem(req, res) {
  try {
    const validationError = validateMenuItem(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const {
      name,
      category,
      description,
      price,
      image,
      popular = false,
      availability = "available",
      sizes = [],
      extras = [],
    } = req.body;

    const categoryId = await getCategoryId(category);
    const slug = await getUniqueSlug(name);

    const { data, error } = await supabase
      .from("menu_items")
      .insert({
        category_id: categoryId,
        slug,
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        image_url: image.trim(),
        is_available: availability === "available",
        is_featured: Boolean(popular),
        sizes: Array.isArray(sizes) ? sizes : [],
        extras: Array.isArray(extras) ? extras : [],
      })
      .select(`
        id,
        slug,
        name,
        description,
        price,
        image_url,
        is_available,
        is_featured,
        sizes,
        extras,
        categories (
          id,
          name
        )
      `)
      .single();

    if (error) throw error;

    // Notify customers about the newly added meal.
    await notifyCustomers({
      preferenceField: "menu_updates",
      title: "New meal added",
      message: `${data.name} has been added to the ChopHub menu. Check it out!`,
      type: "menu",
      relatedId: data.id,
    });

    return res.status(201).json({
      success: true,
      message: "Menu item created successfully.",
      menuItem: {
        ...data,
        category: data.categories?.name || null,
      },
    });
  } catch (error) {
    console.error("Create menu item error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to create menu item.",
    });
  }
}

// UPDATE MENU ITEM
export async function updateMenuItem(req, res) {
  try {
    const validationError = validateMenuItem(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const { id } = req.params;

    const {
      name,
      category,
      description,
      price,
      image,
      popular = false,
      availability = "available",
      sizes = [],
      extras = [],
    } = req.body;

    // Retrieve the previous values so we can detect actual changes.
    const { data: oldItem, error: oldItemError } = await supabase
      .from("menu_items")
      .select(`
        id,
        name,
        description,
        price,
        image_url,
        category_id,
        is_available,
        is_featured,
        sizes,
        extras
      `)
      .eq("id", id)
      .maybeSingle();

    if (oldItemError) throw oldItemError;

    if (!oldItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found.",
      });
    }

    const categoryId = await getCategoryId(category);
    const slug = await getUniqueSlug(name, id);

    const updatedValues = {
      category_id: categoryId,
      slug,
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      image_url: image.trim(),
      is_available: availability === "available",
      is_featured: Boolean(popular),
      sizes: Array.isArray(sizes) ? sizes : [],
      extras: Array.isArray(extras) ? extras : [],
    };

    const { data, error } = await supabase
      .from("menu_items")
      .update({
        ...updatedValues,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(`
        id,
        slug,
        name,
        description,
        price,
        image_url,
        is_available,
        is_featured,
        sizes,
        extras,
        categories (
          id,
          name
        )
      `)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found.",
      });
    }

    // Detect price changes separately from other menu changes.
    const priceChanged = Number(oldItem.price) !== Number(data.price);

    if (priceChanged) {
      const direction =
        Number(data.price) > Number(oldItem.price)
          ? "increased"
          : "reduced";

      await notifyCustomers({
        preferenceField: "price_changes",
        title: "Meal price changed",
        message: `The price of ${data.name} has been ${direction} from ₦${Number(
          oldItem.price
        ).toLocaleString("en-NG")} to ₦${Number(data.price).toLocaleString(
          "en-NG"
        )}.`,
        type: "price",
        relatedId: data.id,
      });
    }

    // Detect availability and other meaningful menu changes.
    const menuDetailsChanged =
      oldItem.name !== data.name ||
      oldItem.description !== data.description ||
      oldItem.image_url !== data.image_url ||
      oldItem.category_id !== categoryId ||
      oldItem.is_featured !== data.is_featured ||
      JSON.stringify(oldItem.sizes || []) !==
        JSON.stringify(data.sizes || []) ||
      JSON.stringify(oldItem.extras || []) !==
        JSON.stringify(data.extras || []);

    const availabilityChanged =
      oldItem.is_available !== data.is_available;

    if (availabilityChanged || menuDetailsChanged) {
      let message;

      if (availabilityChanged && !data.is_available) {
        message = `${data.name} is currently unavailable on the ChopHub menu.`;
      } else if (availabilityChanged && data.is_available) {
        message = `${data.name} is available again on the ChopHub menu.`;
      } else {
        message = `There has been an update to ${data.name} on the ChopHub menu. Check out the latest details.`;
      }

      await notifyCustomers({
        preferenceField: "menu_updates",
        title: availabilityChanged
          ? "Meal availability changed"
          : "Menu item updated",
        message,
        type: "menu",
        relatedId: data.id,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Menu item updated successfully.",
      menuItem: {
        ...data,
        category: data.categories?.name || null,
      },
    });
  } catch (error) {
    console.error("Update menu item error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to update menu item.",
    });
  }
}

// DELETE MENU ITEM
export async function deleteMenuItem(req, res) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", id)
      .select("id, name")
      .maybeSingle();

    if (error) {
      console.error("Delete menu item error:", error);

      if (error.code === "23503") {
        return res.status(409).json({
          success: false,
          message:
            "This menu item is linked to existing orders and cannot be deleted.",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Unable to delete menu item.",
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found.",
      });
    }

    // Notify customers after the meal has been successfully deleted.
    await notifyCustomers({
      preferenceField: "menu_updates",
      title: "Meal removed from menu",
      message: `${data.name} has been removed from the ChopHub menu.`,
      type: "menu",
      relatedId: data.id,
    });

    return res.status(200).json({
      success: true,
      message: `${data.name} was deleted successfully.`,
    });
  } catch (error) {
    console.error("Delete menu item error:", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while deleting the menu item.",
    });
  }
}
