import express from "express";
import { supabase } from "../SupabaseClient.js";

const router = express.Router();

// Register Device
router.post("/", async (req, res) => {
  const { userId, device_id } = req.body;

  const { data, error } = await supabase
    .from("devices")
    .insert([{ 
      user_id: userId, 
      device_id 
    }]) // ✅ no id
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true, device: data[0] });
});

// Get Devices for a user
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  const { data, error } = await supabase
    .from("devices")
    .select("*")
    .eq("user_id", userId);

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

export default router;
