import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

// Import routes
import profiles from "./routes/profiles.js";
import devices from "./routes/devices.js";
import contactsRouter from "./routes/contacts.js";
import alertsRouter from "./routes/alerts.js";
import ping from "./routes/ping.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Default route
app.get("/", (req, res) => {
  res.send("🚀 Rakshak Backend is running...");
});

// Routes
app.use("/profiles", profiles);
app.use("/devices", devices);
app.use("/contacts", contactsRouter);
app.use("/alerts", alertsRouter);
app.use("/ping",ping);

// Start server
app.listen(PORT, () => {
  console.log(`✅ Rakshak Backend running at http://localhost:${PORT}`);
});
