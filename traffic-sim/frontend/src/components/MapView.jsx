import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
} from "react-leaflet";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const hospitalIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1484/1484822.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -35],
});

const ambulanceIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2967/2967350.png",
  iconSize: [35, 35],
});

const altColors = ["#277DA1", "#F3722C", "#577590", "#F8961E", "#43AA8B"];

export default function MapView({
  hospitals = [],
  route,
  allRoutes = [],
  shortestRouteIndex = null,
  ambulancePos,
}) {
  return (
    <MapContainer
      center={[19.8762, 75.3433]}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Hospitals from backend */}
      {hospitals.map((h) => (
        <Marker key={h.id} position={[h.lat, h.lng]} icon={hospitalIcon}>
          <Popup>🏥 {h.name}</Popup>
        </Marker>
      ))}

      {/* Alternative routes */}
      {allRoutes.map((routeItem, idx) => {
        const isShortest = routeItem.index === shortestRouteIndex;
        const color = isShortest ? "lime" : altColors[idx % altColors.length];

        return (
          <Polyline
            key={`route-${routeItem.index}`}
            positions={routeItem.path}
            pathOptions={{
              color,
              weight: isShortest ? 6 : 4,
              opacity: isShortest ? 0.95 : 0.5,
              dashArray: isShortest ? undefined : "6, 8",
            }}
          />
        );
      })}

      {/* Fallback route renderer */}
      {allRoutes.length === 0 && route.length > 0 && (
        <Polyline positions={route} pathOptions={{ color: "lime", weight: 5 }} />
      )}

      {/* Ambulance */}
      {ambulancePos && (
        <Marker position={ambulancePos} icon={ambulanceIcon}>
          <Popup>🚑 Ambulance Active</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
