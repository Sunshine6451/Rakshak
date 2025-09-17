let map, marker;
const BACKEND_URL = "http://localhost:5000/"; // replace with deployed backend

/* ====================
   Google Map
==================== */
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
      const locText = document.getElementById("location");
      if (locText) locText.innerText = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
      initMap(lat, lon);
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

function addContactTag(number) {
  const tag = document.createElement("div");
  tag.className = "tag";
  tag.innerHTML = `${number} <button onclick="removeContact(this, '${number}')">x</button>`;
  contactTags.appendChild(tag);
}

async function loadContacts() {
  if (!contactTags) return;
  try {
    const res = await fetch(`${BACKEND_URL}/getContacts/${USER_ID}`);
    const contacts = await res.json();
    contacts.forEach(c => addContactTag(c.phone));
  } catch (err) {
    console.error("Failed to load contacts:", err);
  }
}
loadContacts();

async function addContactToBackend(number) {
  try {
    const res = await fetch(`${BACKEND_URL}/addContact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Family", phone: number, userId: USER_ID }),
    });
    return await res.json();
  } catch (err) {
    console.error(err);
  }
}

if (addContactBtn) {
  addContactBtn.addEventListener("click", async () => {
    const number = contactInput.value.trim();
    if (number) {
      const result = await addContactToBackend(number);
      if (result && result.success) {
        addContactTag(number);
        contactInput.value = "";
      } else {
        alert("Failed to add contact!");
      }
    }
  });
}

async function removeContact(btn, number) {
  btn.parentElement.remove();
  try {
    await fetch(`${BACKEND_URL}/removeContact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: number, userId: USER_ID }),
    });
  } catch (err) {
    console.error(err);
  }
}

/* ====================
   SOS Section
==================== */
async function sendSOS() {
  if (!navigator.geolocation) return alert("❌ Geolocation not supported!");
  navigator.geolocation.getCurrentPosition(async pos => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    try {
      const res = await fetch(`${BACKEND_URL}/sendSOS`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: USER_ID, lat, lon }),
      });
      const data = await res.json();
      alert(data.success ? "🚨 SOS Sent!" : "❌ Failed to send SOS!");
    } catch (err) {
      console.error(err);
      alert("❌ Error sending SOS!");
    }
  });
}

const sosBtn = document.getElementById("sosBtn");
if (sosBtn) sosBtn.addEventListener("click", sendSOS);

/* ====================
   Dark Mode
==================== */
const toggleMode = document.getElementById("toggleMode") || document.getElementById("darkModeToggle");
if (toggleMode) {
  toggleMode.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    toggleMode.innerText = document.body.classList.contains("dark-mode") ? "☀️ Light Mode" : "🌙 Dark Mode";
  });
}

/* ====================
   Band Connection (Web Bluetooth)
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
      sendSOS(); // Trigger SOS on band connect
    } catch (err) {
      bandStatus.innerText = "❌ Connection failed";
      console.error(err);
    }
  });
}
