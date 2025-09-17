import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

// Trigger SOS Alert
router.post("/", async (req, res) => {
  const { userId, latitude, longitude } = req.body;

  const { data, error } = await supabase
    .from("sos_alerts")
    .insert([{ user_id: userId, latitude, longitude }])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true, alert: data[0] });
});

// Get Alerts for a User
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  const { data, error } = await supabase
    .from("sos_alerts")
    .select("*")
    .eq("user_id", userId)
    .order("triggered_at", { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

export default router;
