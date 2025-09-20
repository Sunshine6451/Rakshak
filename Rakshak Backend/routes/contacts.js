

const express = require("express");
const router = express.Router();
const { supabase } = require("../SupabaseClient"); 

// ✅ Get all contacts for a user
router.get("/:userId", async (req, res) => {
  console.log("Incoming request:", req.method, req.originalUrl, req.body);
  const { userId } = req.params;
  const { data, error } = await supabase
    .from("emergency_contacts")
    .select("*")
    .eq("user_id", userId);

  if (error) return res.json({ success: false, error: error.message });
  res.json(data);
});

// ✅ Add a new contact
router.post("/", async (req, res) => {
  console.log("Incoming request:", req.method, req.originalUrl, req.body);

  const { userId, name, relation, phone_number } = req.body;
  const { data, error } = await supabase
    .from("emergency_contacts")
    .insert([{ user_id: userId, name, relation, phone_number }])
    .select()
    .single();

  if (error) return res.json({ success: false, error: error.message });
  res.json({ success: true, contact: data });
});

// ✅ Update a contact
router.put("/:id", async (req, res) => {
    console.log("Incoming request:", req.method, req.originalUrl, req.body);
  
  const { id } = req.params;
  const { name, relation, phone_number } = req.body;

  const { data, error } = await supabase
    .from("emergency_contacts")
    .update({ name, relation, phone_number })
    .eq("id", id)
    .select()
    .single();

  if (error) return res.json({ success: false, error: error.message });
  res.json({ success: true, contact: data });
});

// ✅ Delete a contact
router.delete("/:id", async (req, res) => {
  console.log("Incoming request:", req.method, req.originalUrl, req.body);

  const { id } = req.params;
  const { error } = await supabase
    .from("emergency_contacts")
    .delete()
    .eq("id", id);

  if (error) return res.json({ success: false, error: error.message });
  res.json({ success: true });
});

export default router;
