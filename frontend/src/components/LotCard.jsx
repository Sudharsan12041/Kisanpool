import { Link } from "react-router-dom";
import { ArrowUpRight, MapPin, UsersRound } from "lucide-react";
import { useLang } from "../useLang";
import { CropArt, StatusBadge } from "./ui";

export default function LotCard({ lot, onOrder, ordering }) {
  const { t } = useLang();
  const threshold = Number(lot.thresholdKg) || 0;
  const total = Number(lot.totalKg) || 0;
  const percent = threshold ? Math.min(100, (total / threshold) * 100) : 0;
  const remaining = Math.max(0, threshold - total);
  const ready = lot.status === "READY";

  return (
    <article className="lot-card">
      <div className="lot-card-art"><CropArt crop={lot.crop} /><StatusBadge status={lot.status} /></div>
      <div className="lot-card-body">
        <div className="lot-title-row"><div><p className="lot-id">LOT #{lot.id}</p><h3>{lot.crop}</h3></div><Link className="icon-button subtle-icon" to={`/lot/${lot.id}`} aria-label={`View ${lot.crop} lot details`}><ArrowUpRight size={17} /></Link></div>
        <p className="lot-location"><MapPin size={14} />{lot.village}</p>
        <div className="lot-metrics"><span><strong>{total.toLocaleString()}</strong> kg pooled</span><span><UsersRound size={14} />{lot.farmers} farmers</span></div>
        <div className="progress-label"><span>Pooling progress</span><strong>{Math.round(percent)}%</strong></div>
        <div className="progress-track"><div className="progress-fill" style={{ width: `${percent}%` }} /></div>
        <p className="lot-hint">{ready ? "This lot is ready for buyers" : `${remaining.toLocaleString()} kg needed to complete this lot`}</p>
        <div className="lot-card-footer">
          <div><small>Suggested price</small><strong>₹{lot.priceMin}–{lot.priceMax}<small> / kg</small></strong></div>
          <button className={`button ${ready ? "button-primary" : "button-disabled"}`} disabled={!ready || ordering} onClick={onOrder}>
            {ordering ? "Placing…" : ready ? t.orderLot : "Pooling"}
          </button>
        </div>
      </div>
    </article>
  );
}
