import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import MapMarker from "./MapMarker";

function FitMarkers({ lots, selectedLot }) {
  const map = useMap();
  const key = lots.map((lot) => lot.id).join(",") + selectedLot;
  useEffect(() => {
    const selected = lots.find((lot) => lot.id === selectedLot);
    if (selected) {
      map.flyTo([Number(selected.latitude), Number(selected.longitude)], 13, { duration: 0.6 });
    } else if (lots.length > 1) {
      const bounds = lots.map((lot) => [Number(lot.latitude), Number(lot.longitude)]);
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 12 });
    } else if (lots.length === 1) {
      map.flyTo([Number(lots[0].latitude), Number(lots[0].longitude)], 11, { duration: 0.6 });
    }
  }, [key, lots, selectedLot, map]);
  return null;
}

export default function PoolingMap({ lots, selectedLot, onSelectLot }) {
  const center = useMemo(() => {
    const selected = lots.find((lot) => lot.id === selectedLot) || lots[0];
    return [Number(selected.latitude), Number(selected.longitude)];
  }, [lots, selectedLot]);

  return (
    <MapContainer center={center} zoom={11} scrollWheelZoom className="pooling-map">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitMarkers lots={lots} selectedLot={selectedLot} />
      {lots.map((lot) => (
        <MapMarker key={lot.id} lot={lot} eventHandlers={{ click: () => onSelectLot(lot.id) }} />
      ))}
    </MapContainer>
  );
}
