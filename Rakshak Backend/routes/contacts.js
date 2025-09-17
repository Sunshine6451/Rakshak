import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

// Add Emergency Contact
router.post("/", async (req, res) => {
  const { userId, name, phone_number, relation } = req.body;

  const { data, error } = await supabase
    .from("emergency_contacts")
    .insert([{ user_id: userId, name, phone_number, relation }])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true, contact: data[0] });
});

// Get Contacts for a User
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  const { data, error } = await supabase
    .from("emergency_contacts")
    .select("*")
    .eq("user_id", userId);

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

export default router;
