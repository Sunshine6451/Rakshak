import express from "express";
import { supabase } from "../SupabaseClient.js";

const router = express.Router();

// Add Emergency Contact
router.post("/", async (req, res) => {
  const { userId, name, phone_number, relation } = req.body;

  const { data, error } = await supabase
    .from("emergency_contacts")
    .insert([{ 
      user_id: userId, 
      name, 
      phone_number, 
      relation 
    }]) // ✅ no id
    .select();

    console.error("Insert Contact Error:", error.message);
  return res.status(400).json({ error: error.message });
}
);

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
router.delete("/:userId/:contactId", async (req, res) => {
  const { userId, contactId } = req.params;
  const { error } = await supabase
    .from("emergency_contacts")
    .delete()
    .eq("user_id", userId)
    .eq("id", contactId);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

export default router;
