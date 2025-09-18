console.log("✅ Alerts router loaded");
console.log("Twilio Config:", {
  sid: process.env.TWILIO_ACCOUNT_SID,
  token: process.env.TWILIO_AUTH_TOKEN ? "✅ Loaded" : "❌ Missing",
  service: process.env.TWILIO_MESSAGING_SERVICE_SID,
});
import express from "express";
import { supabase } from "../SupabaseClient.js";
import twilio from "twilio";

const router = express.Router();

// Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// POST /alerts - Trigger SOS
router.post("/", async (req, res) => {
  const { userId, latitude, longitude } = req.body;

  // Save alert in Supabase
  const { data: alertData, error: alertError } = await supabase
    .from("sos_alerts")
    .insert([{ user_id: userId, latitude, longitude }])
    .select();

  if (alertError) {
    console.error("Insert SOS Error:", alertError.message);
    return res.status(400).json({ error: alertError.message });
  }

  // Fetch emergency contacts
  const { data: contacts, error: contactsError } = await supabase
    .from("emergency_contacts")
    .select("phone_number, name")
    .eq("user_id", userId);

  if (contactsError) {
    console.error("Contacts Fetch Error:", contactsError.message);
    return res.status(400).json({ error: contactsError.message });
  }

  // Send SMS via Twilio Messaging Service
  const numbers = contacts.map(c => c.phone_number);
  const message = `🚨 SOS Alert! Your contact is in danger.\nLocation: https://maps.google.com/?q=${latitude},${longitude}`;

  let smsResults = [];
  for (const number of numbers) {
    try {
      const msg = await client.messages.create({
        body: message,
        to: testNumber,
        messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID || undefined,
        from: process.env.TWILIO_PHONE || undefined,  // fallback if service SID fails
      });
      smsResults.push({ to: number, status: msg.status });
    } catch (err) {
      console.error(`SMS Error to ${number}:`, err.message);
      smsResults.push({ to: number, error: err.message });
    }
  }

  res.json({
    success: true,
    alert: alertData[0],
    smsResults,
  });
});
// GET /alerts/test-twilio?number=+919510416133
router.get("/test-twilio", async (req, res) => {
  const testNumber = req.query.number;
  if (!testNumber) {
    return res.status(400).json({ error: "Provide ?number=+91xxxxxxxxxx" });
  }

  const message = "🚨 Test SMS from Rakshak Safety Band (via Twilio). Stay Safe!";

  try {
    const msg = await client.messages.create({
      body: message,
      to: testNumber,
      messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID || undefined,
      from: process.env.TWILIO_PHONE || undefined, // fallback for trial
    });

    res.json({
      success: true,
      message: "Test SMS sent via Twilio",
      sid: msg.sid,
      status: msg.status,
      to: testNumber,
    });
  } catch (err) {
    console.error("Twilio Test Error:", err.message);

    // Custom error for trial account restriction
    if (err.message.includes("unverified")) {
      return res.status(403).json({
        error: "Trial account restriction: You can only send SMS to verified numbers in Twilio Console.",
        details: err.message,
      });
    }

    res.status(500).json({ error: err.message });
  }
});
export default router;
