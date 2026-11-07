import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, MapPin, UsersRound } from "lucide-react";
import PoolingMap from "../components/map/PoolingMap";
import { getLots } from "../api";
import { CropArt, ErrorState, LoadingState, PageHeading, StatusBadge } from "../components/ui";

const stages = [
  { status: "OPEN", label: "Pooling" },
  { status: "READY", label: "Ready" },
  { status: "ORDERED", label: "Ordered" },
];

export default function PoolingDetails() {
  const { lotId } = useParams();
  const [lot, setLot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getLots()
      .then((lots) => {
        if (!active) return;
        const found = lots.find((item) => String(item.id) === lotId);
        if (found) setLot(found);
        else setError("This lot could not be found.");
      })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [lotId]);

  if (loading) return <LoadingState label="Loading lot details…" />;
  if (error) return <ErrorState message={error} />;

  const progress = lot.thresholdKg ? Math.min(100, (lot.totalKg / lot.thresholdKg) * 100) : 0;
  const currentStage = stages.findIndex((stage) => stage.status === lot.status);
  const hasCoordinates = Number.isFinite(Number(lot.latitude)) && lot.latitude !== null && Number.isFinite(Number(lot.longitude)) && lot.longitude !== null;
  const returnPath = window.localStorage.getItem("kisanpool-role") === "buyer" ? "/buyer" : "/farmer/lots";

  return (
    <div className="page-stack">
      <Link to={returnPath} className="back-link"><ArrowLeft size={16} /> Back to pooling overview</Link>
      <PageHeading eyebrow={`POOLING LOT #${lot.id}`} title={`${lot.crop} harvest pool`} description="A single view of the produce gathered into this nearby lot." action={<StatusBadge status={lot.status} />} />
      <div className="lot-detail-grid">
        <section className="panel lot-detail-main">
          <div className="detail-crop-header"><CropArt crop={lot.crop} /><div><p className="eyebrow">CURRENT QUANTITY</p><h3>{Number(lot.totalKg).toLocaleString()} <small>kg</small></h3><span>of {Number(lot.thresholdKg).toLocaleString()} kg needed</span></div></div>
          <div className="detail-progress"><div className="progress-label"><span>Pooling progress</span><strong>{Math.round(progress)}%</strong></div><div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div><p>{Math.max(0, lot.thresholdKg - lot.totalKg).toLocaleString()} kg remaining to complete the pool</p></div>
          <div className="detail-facts">
            <div><UsersRound size={17} /><span><small>Contributors</small><strong>{lot.farmers} farmers</strong></span></div>
            <div><MapPin size={17} /><span><small>Pooling location</small><strong>{lot.village}</strong></span></div>
            <div><CalendarDays size={17} /><span><small>Harvest date</small><strong>{lot.harvestDate || "Not provided"}</strong></span></div>
            <div><span className="rupee-icon">₹</span><span><small>Suggested price</small><strong>₹{lot.priceMin}–{lot.priceMax} / kg</strong></span></div>
          </div>
          <div className="lot-timeline">
            {stages.map((stage, index) => {
              const isDone = currentStage >= 0 && index < currentStage;
              const isCurrent = stage.status === lot.status;
              return <div key={stage.status} className={`lot-timeline-step ${isDone ? "done" : ""} ${isCurrent ? "current" : ""}`}><span className="timeline-node">{isDone ? "✓" : index + 1}</span><span>{stage.label}</span></div>;
            })}
          </div>
          <p className="data-disclaimer">Status and quantity come from the backend. Farmer identities, individual contributions and detailed harvest-date ranges are not currently exposed.</p>
        </section>
        <section className="panel detail-map-panel"><div className="panel-heading"><div><p className="eyebrow">LOT LOCATION</p><h3>{lot.village}</h3></div></div>
          {hasCoordinates ? <PoolingMap lots={[lot]} selectedLot={lot.id} /> : <div className="map-empty-inline"><MapPin size={20} /><span>Coordinates are not available for this lot.</span></div>}
        </section>
      </div>
    </div>
  );
}
