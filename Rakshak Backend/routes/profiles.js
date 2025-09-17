import express from "express";
import { supabase } from "../SupabaseClient.js";

const router = express.Router();

// Create / Update Profile
router.post("/", async (req, res) => {
  const { id, full_name, phone_number } = req.body;

  const { data, error } = await supabase
    .from("profiles")
    .upsert([{ id, full_name, phone_number }]) // upsert = insert or update
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true, profile: data[0] });
});

// Get Profile
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

export default router;
