

var map = L.map("map1").setView([52.05102, -9.6871], 11);
L.tileLayer("https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=m3Lj5QIcWzzqBkEBCk7v", {
  attribution:
    '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
}).addTo(map);

var popup = L.popup();
function onMapClick(e) {
  var point = e.latlng;
  var lat = point.lat;
  var lon = point.lng;
  popup
    .setLatLng(e.latlng)
    .setContent("Latitude " + lat.toString() + " Longtitude " + lon.toString())
    .openOn(map);
}

map.on("click", onMapClick);
