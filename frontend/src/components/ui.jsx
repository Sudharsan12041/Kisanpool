import { ArrowUpRight, MapPin, Sprout } from "lucide-react";

export function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {description && <p className="page-description">{description}</p>}
      </div>
      {action && <div className="heading-action">{action}</div>}
    </div>
  );
}

export function StatCard({ label, value, note, icon: Icon = Sprout, tone = "green" }) {
  return (
    <article className={`stat-card tone-${tone}`}>
      <div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon size={19} /></span></div>
      <div className="stat-value">{value}</div>
      {note && <div className="stat-note">{note}</div>}
    </article>
  );
}

export function StatusBadge({ status }) {
  const normalized = (status || "UNKNOWN").toLowerCase().replaceAll("_", " ");
  return <span className={`status-badge status-${(status || "unknown").toLowerCase()}`}>{normalized}</span>;
}

const crops = {
  Tomato: { emoji: "🍅", cls: "crop-tomato" },
  Onion: { emoji: "🧅", cls: "crop-onion" },
  Potato: { emoji: "🥔", cls: "crop-potato" },
};

export function CropArt({ crop, compact = false }) {
  const art = crops[crop] || { emoji: "🌿", cls: "crop-default" };
  return <div className={`crop-art ${art.cls} ${compact ? "crop-art-compact" : ""}`} aria-hidden="true"><span>{art.emoji}</span></div>;
}

export function EmptyState({ icon: Icon = Sprout, title, description, action }) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><Icon size={25} /></span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
}

export function LoadingState({ label = "Loading your data…" }) {
  return <div className="loading-state"><span className="spinner" />{label}</div>;
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state" role="alert">
      <div><strong>We couldn’t load this data</strong><p>{message}</p></div>
      {onRetry && <button className="button button-secondary" onClick={onRetry}>Try again <ArrowUpRight size={15} /></button>}
    </div>
  );
}

export function LocationText({ children }) {
  return <span className="location-text"><MapPin size={14} />{children || "Location not available"}</span>;
}
