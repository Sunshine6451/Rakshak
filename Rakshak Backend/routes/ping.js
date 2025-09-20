import express from "express";
import { supabase } from "../SupabaseClient.js";

const router = express.Router();

router.get("/", async (req, res) => {
  console.log("Incoming request:", req.method, req.originalUrl, req.body);
  try {
    // Try fetching from profiles just to test DB connection
    const { data, error } = await supabase.from("profiles").select("id").limit(1);

    if (error) {
      return res.status(500).json({ success: false, message: "❌ Supabase error", error: error.message });
    }

    res.json({ success: true, message: "✅ Supabase connected", sample: data });
  } catch (err) {
    res.status(500).json({ success: false, message: "❌ Server error", error: err.message });
  }
});

export default router;
