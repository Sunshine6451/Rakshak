const BACKEND_URL = "http://localhost:5000"; // your backend
const USER_ID = "b64a186f-440d-4f1a-bdb9-7097d089b00f"; // real UUID

/* ====================
   Google Map & Location
==================== */
let map, marker;
function initMap(lat, lon) {
  const location = { lat, lng: lon };
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: location,
  });
  marker = new google.maps.Marker({ position: location, map, title: "You are here" });
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      document.getElementById("location").innerText = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
      initMap(lat, lon);
      window.currentLat = lat;
      window.currentLon = lon;
    });
  }
}
getLocation();

/* ====================
   Contacts Section
==================== */
const contactTags = document.getElementById("contact-tags");
const contactInput = document.getElementById("contactInput");
const addContactBtn = document.getElementById("addContactBtn");

// Load contacts from backend
async function loadContacts() {
  const res = await fetch(`${BACKEND_URL}/contacts/${USER_ID}`);
  const contacts = await res.json();
  contactTags.innerHTML = "";
  contacts.forEach(c => addContactTag(c.id, c.name, c.phone_number, c.relation));
}

function addContactTag(id, name, number, relation) {
  const tag = document.createElement("div");
  tag.className = "tag";
  tag.innerHTML = `${name} (${relation}) - ${number}`;
  contactTags.appendChild(tag);
}

// Add new contact
async function addContactToBackend(number) {
  const res = await fetch(`${BACKEND_URL}/contacts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: USER_ID,
      name: "Family", // static for now
      phone_number: number,
      relation: "Family"
    }),
  });
  return await res.json();
}

if (addContactBtn) {
  addContactBtn.addEventListener("click", async () => {
    const number = contactInput.value.trim();
    if (!number) return;
    const result = await addContactToBackend(number);
    if (result.success) {
        addContactTag(result.contact.id, result.contact.name, result.contact.phone_number, result.contact.relation);
    contactInput.value = "";
    } else {
      alert("❌ Failed to add contact: " + (result.error || JSON.stringify(result)));
    }
  });
}

loadContacts();

/* ====================
   SOS Section
==================== */
async function sendSOS() {
  if (!navigator.geolocation) return alert("❌ Geolocation not supported!");
  navigator.geolocation.getCurrentPosition(async pos => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    const res = await fetch(`${BACKEND_URL}/alerts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: USER_ID, latitude: lat, longitude: lon }),
    });
    const data = await res.json();
    alert(data.success ? "🚨 SOS Sent!" : "❌ Failed to send SOS!");
  });
}

const sosBtn = document.getElementById("sosBtn");
if (sosBtn) sosBtn.addEventListener("click", sendSOS);

/* ====================
   Dark Mode Toggle
==================== */
const toggleMode = document.getElementById("toggleMode");
if (toggleMode) {
  toggleMode.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    toggleMode.innerText = document.body.classList.contains("dark-mode")
      ? "☀️ Light Mode"
      : "🌙 Dark Mode";
  });
}

/* ====================
   Band Connection
==================== */
const connectBandBtn = document.getElementById("connectBandBtn");
const bandStatus = document.getElementById("bandStatus");

if (connectBandBtn) {
  connectBandBtn.addEventListener("click", async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["battery_service"],
      });
      bandStatus.innerText = `Status: Connected to ${device.name}`;
      device.addEventListener("gattserverdisconnected", () => {
        bandStatus.innerText = "Status: Disconnected";
      });
      sendSOS(); // trigger SOS on band connect
    } catch (err) {
      bandStatus.innerText = "❌ Connection failed";
      console.error(err);
    }
  });
}
