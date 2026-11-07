import { useMemo } from "react";
import { Link } from "react-router-dom";
import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import { StatusBadge } from "../ui";

const cropSymbols = { Tomato: "🍅", Onion: "🧅", Potato: "🥔" };

export default function MapMarker({ lot, onSelectLot }) {
  const icon = useMemo(() => L.divIcon({
    className: `lot-marker-icon marker-${String(lot.status).toLowerCase()}`,
    html: `<span class="marker-pin"><span class="marker-emoji">${cropSymbols[lot.crop] || "🌿"}</span></span>`,
    iconSize: [42, 48],
    iconAnchor: [21, 43],
    popupAnchor: [0, -39],
  }), [lot.crop, lot.status]);

  return (
    <Marker position={[Number(lot.latitude), Number(lot.longitude)]} icon={icon} eventHandlers={{ click: () => onSelectLot?.(lot.id) }}>
      <Popup>
        <div className="map-popup">
          <span className="popup-lot-id">LOT #{lot.id}</span>
          <strong>{lot.crop} · {lot.village}</strong>
          <span>{Number(lot.totalKg).toLocaleString()} kg · ₹{lot.priceMin}–{lot.priceMax}/kg</span>
          <StatusBadge status={lot.status} />
          <Link to={`/lot/${lot.id}`}>View lot details →</Link>
        </div>
      </Popup>
    </Marker>
  );
}
