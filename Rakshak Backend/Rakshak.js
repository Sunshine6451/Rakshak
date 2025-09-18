const BACKEND_URL = "http://localhost:5000"; // backend
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
     
      const locationEl = document.getElementById("location");
      if (locationEl) {
        locationEl.innerText = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
      }

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
const addContactBtn = document.getElementById("addContactBtn");

// Load contacts from backend
async function loadContacts() {
  try {
    const res = await fetch(`${BACKEND_URL}/contacts/${USER_ID}`);
    const contacts = await res.json();
    contactTags.innerHTML = "";
    contacts.forEach(c =>
      addContactTag(c.id, c.name, c.phone_number, c.relation)
    );
  } catch (err) {
    console.error("Error loading contacts:", err);
  }
}

// Add one contact element to UI
function addContactTag(id, name, number, relation) {
  const tag = document.createElement("div");
  tag.className = "tag";

  tag.innerHTML = `
    <span class="contact-text">${name} (${relation}) - ${number}</span>
    <input class="edit-name" type="text" value="${name}" style="display:none" />
    <input class="edit-relation" type="text" value="${relation}" style="display:none" />
    <input class="edit-number" type="text" value="${number}" style="display:none" />
    <button class="edit-btn">✏️</button>
    <button class="save-btn" style="display:none">💾</button>
    <button class="delete-btn">🗑️</button>
  `;
  contactTags.appendChild(tag);

  const contactText = tag.querySelector(".contact-text");
  const editName = tag.querySelector(".edit-name");
  const editRelation = tag.querySelector(".edit-relation");
  const editNumber = tag.querySelector(".edit-number");
  const editBtn = tag.querySelector(".edit-btn");
  const saveBtn = tag.querySelector(".save-btn");
  const deleteBtn = tag.querySelector(".delete-btn");

  // Delete contact
  deleteBtn.addEventListener("click", async () => {
    if (confirm(`Delete ${name}?`)) {
      const res = await fetch(`${BACKEND_URL}/contacts/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) tag.remove();
      else alert("❌ Failed to delete contact");
    }
  });

  // Edit contact (show inputs)
  editBtn.addEventListener("click", () => {
    contactText.style.display = "none";
    editName.style.display = "inline-block";
    editRelation.style.display = "inline-block";
    editNumber.style.display = "inline-block";
    editBtn.style.display = "none";
    saveBtn.style.display = "inline-block";
  });

  // Save updated contact
  saveBtn.addEventListener("click", async () => {
    const newName = editName.value.trim();
    const newRelation = editRelation.value.trim();
    const newNumber = editNumber.value.trim();

    if (!newName || !newRelation || !newNumber) return alert("⚠️ All fields are required!");

    const res = await fetch(`${BACKEND_URL}/contacts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, relation: newRelation, phone_number: newNumber }),
    });
    const result = await res.json();
    if (result.success) {
      contactText.innerText = `${newName} (${newRelation}) - ${newNumber}`;
      contactText.style.display = "inline";
      editName.style.display = "none";
      editRelation.style.display = "none";
      editNumber.style.display = "none";
      editBtn.style.display = "inline-block";
      saveBtn.style.display = "none";
    } else {
      alert("❌ Failed to update contact");
    }
  });
}

// Add contact to backend
async function addContactToBackend(name, relation, number) {
  const res = await fetch(`${BACKEND_URL}/contacts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: USER_ID,
      name,
      phone_number: number,
      relation
    }),
  });
  return await res.json();
}
async function updateContact(id, name, relation, number, tagElement) {
  try {
    const res = await fetch(`${BACKEND_URL}/contacts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, relation, phone_number: number }),
    });
    const result = await res.json();
    if (result.success) {
      tagElement.querySelector("span").innerText = `${name} (${relation}) - ${number}`;
    } else {
      alert("❌ Failed to update contact");
    }
  } catch (err) {
    console.error("Error updating contact:", err);
    alert("❌ Error updating contact");
  }
}

// Handle add button click
if (addContactBtn) {
  addContactBtn.addEventListener("click", async () => {
    const name = document.getElementById("contactName").value.trim();
    const relation = document.getElementById("contactRelation").value.trim();
    const number = document.getElementById("contactInput").value.trim();

    if (!name || !relation || !number) {
      alert("⚠️ Please enter name, relation, and number!");
      return;
    }

    const result = await addContactToBackend(name, relation, number);
    if (result.success) {
      addContactTag(
        result.contact.id,
        result.contact.name,
        result.contact.phone_number,
        result.contact.relation
      );
      document.getElementById("contactName").value = "";
      document.getElementById("contactRelation").value = "";
      document.getElementById("contactInput").value = "";
    } else {
      alert("❌ Failed to add contact: " + (result.error || JSON.stringify(result)));
    }
  });
}

// Load contacts on page ready
document.addEventListener("DOMContentLoaded", loadContacts);


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
