let map = L.map("map").setView([40.7128, -74.006], 12); // NYC center

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(map);

let pickupMarker = null;
let dropoffMarker = null;
let pickupCoords = null;
let dropoffCoords = null;

// ---------- Handle map clicks ----------
map.on("click", (e) => {
  if (!pickupMarker) {
    pickupMarker = L.marker(e.latlng).addTo(map).bindPopup("Pickup").openPopup();
    pickupCoords = e.latlng;
    document.getElementById("pickup").value = `${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`;
  } else if (!dropoffMarker) {
    dropoffMarker = L.marker(e.latlng).addTo(map).bindPopup("Dropoff").openPopup();
    dropoffCoords = e.latlng;
    document.getElementById("dropoff").value = `${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`;
    calculateDistance();
  }
});

// ---------- Calculate distance ----------
function calculateDistance() {
  if (!pickupCoords || !dropoffCoords) return;
  const R = 3958.8; // Earth radius in miles
  const rlat1 = pickupCoords.lat * (Math.PI / 180);
  const rlat2 = dropoffCoords.lat * (Math.PI / 180);
  const diffLat = rlat2 - rlat1;
  const diffLon = (dropoffCoords.lng - pickupCoords.lng) * (Math.PI / 180);
  const dist =
    2 *
    R *
    Math.asin(
      Math.sqrt(
        Math.sin(diffLat / 2) ** 2 +
          Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(diffLon / 2) ** 2
      )
    );
  document.getElementById("trip_distance").value = dist.toFixed(2);
}

// ---------- Nominatim Autocomplete ----------
async function searchAddress(query, type) {
  if (!query || query.length < 3) return;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    query
  )}`;
  const res = await fetch(url);
  const results = await res.json();
  showSuggestions(results, type);
}

function showSuggestions(results, type) {
  const input = document.getElementById(type);
  let list = document.getElementById(`${type}-list`);
  if (!list) {
    list = document.createElement("ul");
    list.id = `${type}-list`;
    list.className = "suggestion-list";
    input.parentNode.appendChild(list);
  }
  list.innerHTML = "";
  results.slice(0, 5).forEach((r) => {
    const item = document.createElement("li");
    item.textContent = r.display_name;
    item.onclick = () => {
      input.value = r.display_name;
      map.setView([r.lat, r.lon], 14);
      if (type === "pickup") {
        if (pickupMarker) map.removeLayer(pickupMarker);
        pickupCoords = { lat: parseFloat(r.lat), lng: parseFloat(r.lon) };
        pickupMarker = L.marker(pickupCoords).addTo(map).bindPopup("Pickup");
      } else {
        if (dropoffMarker) map.removeLayer(dropoffMarker);
        dropoffCoords = { lat: parseFloat(r.lat), lng: parseFloat(r.lon) };
        dropoffMarker = L.marker(dropoffCoords).addTo(map).bindPopup("Dropoff");
      }
      list.innerHTML = "";
      calculateDistance();
    };
    list.appendChild(item);
  });
}

// ---------- Add event listeners ----------
["pickup", "dropoff"].forEach((type) => {
  const input = document.getElementById(type);
  input.addEventListener("input", () => searchAddress(input.value, type));
});
