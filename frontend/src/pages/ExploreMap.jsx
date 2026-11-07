import { useEffect, useMemo, useState } from "react";
import { MapPin, Search } from "lucide-react";
import PoolingMap from "../components/map/PoolingMap";
import { getLots } from "../api";
import { EmptyState, ErrorState, LoadingState, PageHeading, StatusBadge } from "../components/ui";

export default function ExploreMap() {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedLot, setSelectedLot] = useState(null);

  useEffect(() => {
    let active = true;
    getLots()
      .then((data) => { if (active) { setLots(data); setError(""); } })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const mappedLots = useMemo(() => lots.filter((lot) =>
    Number.isFinite(Number(lot.latitude)) &&
    Number.isFinite(Number(lot.longitude)) &&
    lot.latitude !== null && lot.longitude !== null
  ), [lots]);
  const filteredLots = useMemo(() => mappedLots.filter((lot) => {
    if (category === "ready" && lot.status !== "READY") return false;
    if (category === "pooling" && lot.status !== "OPEN") return false;
    return `${lot.crop} ${lot.village} ${lot.id}`.toLowerCase().includes(search.trim().toLowerCase());
  }), [mappedLots, category, search]);

  if (loading) return <LoadingState label="Loading mapped pooling lots…" />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="page-stack map-page-stack">
      <PageHeading eyebrow="KISANPOOL NETWORK" title="See the harvest coming together." description="Explore pooled produce at the coordinates stored for each lot." />
      {mappedLots.length ? (
        <section className="map-workspace">
          <aside className="map-sidebar">
            <div className="map-sidebar-heading"><div><p className="eyebrow">LIVE NETWORK</p><h3>Pooling locations</h3></div><span className="map-count">{filteredLots.length}</span></div>
            <label className="search-field map-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search crop or village" aria-label="Search mapped lots" /></label>
            <div className="map-filters" role="group" aria-label="Filter map by status">
              {[["all", "All lots"], ["ready", "Ready"], ["pooling", "Pooling"]].map(([value, label]) => <button key={value} className={category === value ? "map-filter active" : "map-filter"} onClick={() => setCategory(value)}>{label}</button>)}
            </div>
            <div className="map-lot-list">
              {filteredLots.map((lot) => <button key={lot.id} className={`map-lot-item ${selectedLot === lot.id ? "selected" : ""}`} onClick={() => setSelectedLot(lot.id)}>
                <span className="map-list-emoji">{lot.crop === "Tomato" ? "🍅" : lot.crop === "Onion" ? "🧅" : "🥔"}</span>
                <span className="map-list-copy"><strong>{lot.crop}</strong><small><MapPin size={12} />{lot.village} · {Number(lot.totalKg).toLocaleString()} kg</small></span>
                <StatusBadge status={lot.status} />
              </button>)}
              {!filteredLots.length && <p className="map-list-empty">No lots match this search or filter.</p>}
            </div>
            <div className="map-legend"><span><i className="legend-dot legend-green" />Ready to order</span><span><i className="legend-dot legend-lime" />Pooling</span></div>
          </aside>
          {filteredLots.length ? <PoolingMap lots={filteredLots} selectedLot={selectedLot} onSelectLot={setSelectedLot} /> : <div className="map-no-results"><EmptyState title="No locations match" description="Change your search or choose a different status filter." /></div>}
        </section>
      ) : (
        <div className="panel"><EmptyState icon={MapPin} title="No mapped locations available" description="The backend has no lot coordinates to display yet. Coordinates will appear here when the /lots response includes valid latitude and longitude values." /></div>
      )}
      <p className="map-attribution-note">Map tiles © OpenStreetMap contributors. Farmer-level locations and delivery destinations are not exposed by the current API.</p>
    </div>
  );
}
