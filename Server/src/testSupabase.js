
import dotenv from "dotenv";
import { supabase } from "./config/supabase.js";

dotenv.config();

async function testSupabase() {
  console.log("Testing Supabase connection...");

  const { error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1,
  });

  if (error) {
    console.error("Supabase connection failed:", error.message);
    process.exitCode = 1;
    return;
  }

  console.log("Supabase connection successful!");
  console.log("ChopHub is connected to its Supabase project.");
}

testSupabase();
