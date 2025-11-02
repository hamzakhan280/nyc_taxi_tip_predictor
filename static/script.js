let map = L.map('map').setView([40.7128, -74.0060], 12);
let markers = [];

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

document.getElementById("add-location").addEventListener("click", () => {
  map.once('click', (e) => {
    let marker = L.marker(e.latlng).addTo(map);
    markers.push(marker);

    if (markers.length >= 2) {
      let loc1 = markers[markers.length - 2].getLatLng();
      let loc2 = markers[markers.length - 1].getLatLng();
      let distance = map.distance(loc1, loc2) / 1609.34; // meters to miles
      document.getElementById("trip_distance").value = distance.toFixed(2);
    }
  });
});

document.getElementById("remove-location").addEventListener("click", () => {
  if (markers.length > 0) {
    map.removeLayer(markers.pop());
    if (markers.length < 2) {
      document.getElementById("trip_distance").value = "";
    } else {
      let loc1 = markers[markers.length - 2].getLatLng();
      let loc2 = markers[markers.length - 1].getLatLng();
      let distance = map.distance(loc1, loc2) / 1609.34;
      document.getElementById("trip_distance").value = distance.toFixed(2);
    }
  }
});
