import express from "express";
import { supabase } from "../SupabaseClient.js";
import fetch from "node-fetch";

const router = express.Router();

// Send SMS via Fast2SMS
async function sendSMSFast2SMS(numbers, message) {
  try {
    const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        authorization: process.env.FAST2SMS_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        route: "q",
        message,
        language: "english",
        flash: "0",
        numbers: numbers.join(","),
      }),
    });

    const data = await res.json();
    console.log("Fast2SMS Response:", data);
    return data;
  } catch (err) {
    console.error("Fast2SMS Error:", err.message);
    return null;
  }
}

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

  // Send SMS
  const numbers = contacts.map((c) => c.phone_number);
  const message = `🚨 SOS Alert! Your contact is in danger.\nLocation: https://maps.google.com/?q=${latitude},${longitude}`;

  let smsResponse = null;
  if (numbers.length > 0) {
    smsResponse = await sendSMSFast2SMS(numbers, message);
  }

  res.json({
    success: true,
    alert: alertData[0],
    smsSent: numbers.length,
    smsResponse,
  });
});
// GET /alerts/test - Send test SMS
router.get("/test", async (req, res) => {
  const testNumber = req.query.number; // Pass ?number=yourPhone
  if (!testNumber) {
    return res.status(400).json({ error: "Please provide a phone number ?number=" });
  }

  const message = "🚨 Test Alert from Rakshak Women Safety Band. Stay Safe! ⚡";

  const smsResponse = await sendSMSFast2SMS([testNumber], message);

  res.json({
    success: true,
    message: "Test SMS sent",
    smsResponse,
  });
});

export default router;
