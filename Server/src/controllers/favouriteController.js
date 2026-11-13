import { createClient } from "@supabase/supabase-js";

// Create a Supabase client using the authenticated customer's token.
function createCustomerSupabaseClient(accessToken) {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );
}

// Get the authenticated customer's Supabase client.
function getCustomerClient(req) {
  const authHeader = req.headers.authorization;

  const accessToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!accessToken) {
    return null;
  }

  return createCustomerSupabaseClient(accessToken);
}

// GET CUSTOMER FAVOURITES
export async function getCustomerFavourites(req, res) {
  try {
    const customerSupabase = getCustomerClient(req);

    if (!customerSupabase) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const { data, error } = await customerSupabase
      .from("customer_favourites")
      .select(`
        id,
        menu_item_id,
        created_at,
        menu_items (
          id,
          slug,
          name,
          description,
          price,
          image_url,
          is_available,
          is_featured,
          sizes,
          extras
        )
      `)
      .eq("customer_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      favourites: data || [],
    });
  } catch (error) {
    console.error("Get favourites error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve your favourites.",
    });
  }
}

// ADD CUSTOMER FAVOURITE
export async function addCustomerFavourite(req, res) {
  try {
    const { menu_item_id } = req.body;

    if (
      typeof menu_item_id !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(menu_item_id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid menu item.",
      });
    }

    const customerSupabase = getCustomerClient(req);

    if (!customerSupabase) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const { data, error } = await customerSupabase
      .from("customer_favourites")
      .insert({
        customer_id: req.user.id,
        menu_item_id,
      })
      .select(`
        id,
        menu_item_id,
        created_at,
        menu_items (
          id,
          slug,
          name,
          description,
          price,
          image_url,
          is_available,
          is_featured,
          sizes,
          extras
        )
      `)
      .single();

    if (error) {
      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          message: "This meal is already in your favourites.",
        });
      }

      if (error.code === "23503") {
        return res.status(404).json({
          success: false,
          message: "Menu item not found.",
        });
      }

      throw error;
    }

    return res.status(201).json({
      success: true,
      message: "Meal added to favourites.",
      favourite: data,
    });
  } catch (error) {
    console.error("Add favourite error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add this meal to favourites.",
    });
  }
}

// REMOVE CUSTOMER FAVOURITE
export async function removeCustomerFavourite(req, res) {
  try {
    const { menuItemId } = req.params;

    const customerSupabase = getCustomerClient(req);

    if (!customerSupabase) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const { data, error } = await customerSupabase
      .from("customer_favourites")
      .delete()
      .eq("customer_id", req.user.id)
      .eq("menu_item_id", menuItemId)
      .select("id")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Favourite not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Meal removed from favourites.",
    });
  } catch (error) {
    console.error("Remove favourite error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to remove this meal from favourites.",
    });
  }
}