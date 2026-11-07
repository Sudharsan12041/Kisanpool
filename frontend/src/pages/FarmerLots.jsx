import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, PackageCheck, PackagePlus, RefreshCw, Sprout, Truck } from "lucide-react";
import { getLots } from "../api";
import { EmptyState, ErrorState, LoadingState, PageHeading, StatCard, StatusBadge } from "../components/ui";

export default function FarmerLots() {
  const { state } = useLocation();
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    getLots()
      .then((data) => { if (active) { setLots(data); setError(""); } })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refreshKey]);

  function reloadLots() {
    setLoading(true);
    setRefreshKey((key) => key + 1);
  }

  const summary = useMemo(() => ({
    totalKg: lots.reduce((sum, lot) => sum + Number(lot.totalKg || 0), 0),
    active: lots.filter((lot) => lot.status === "OPEN").length,
    ready: lots.filter((lot) => lot.status === "READY").length,
    farmers: lots.reduce((sum, lot) => sum + Number(lot.farmers || 0), 0),
  }), [lots]);
  const ownLot = state?.lotId ? lots.find((lot) => lot.id === state.lotId) : null;
  const activeLots = lots.filter((lot) => lot.status !== "ORDERED");

  if (loading) return <LoadingState label="Loading the pooling network…" />;
  if (error) return <ErrorState message={error} onRetry={reloadLots} />;

  return (
    <div className="page-stack">
      <PageHeading
        eyebrow="FARMER WORKSPACE"
        title="Good things grow together."
        description="A live view of produce pooling across KisanPool. Individual listing history isn’t available without farmer accounts."
        action={<Link to="/farmer/add" className="button button-primary"><PackagePlus size={17} /> Add produce</Link>}
      />
      <div className="stats-grid">
        <StatCard label="Produce in network" value={`${summary.totalKg.toLocaleString()} kg`} note={`${lots.length} active and completed lots`} icon={Sprout} />
        <StatCard label="Pooling lots" value={summary.active} note="Still gathering produce" icon={Truck} tone="lime" />
        <StatCard label="Ready for buyers" value={summary.ready} note="Full lots available to order" icon={PackageCheck} tone="blue" />
        <StatCard label="Participating farmers" value={summary.farmers} note="Across all visible lots" icon={Sprout} tone="amber" />
      </div>

      {ownLot && (
        <section className="highlight-panel">
          <div className="highlight-icon"><PackageCheck size={20} /></div>
          <div><p className="eyebrow">YOUR LATEST LISTING</p><h3>{ownLot.crop} · Lot #{ownLot.id}</h3><p>Your contribution: <strong>{state.myKg} kg</strong> · {ownLot.totalKg.toLocaleString()} kg pooled so far</p></div>
          <StatusBadge status={ownLot.status} />
          <Link to={`/lot/${ownLot.id}`} className="button button-secondary">Lot details <ArrowRight size={15} /></Link>
        </section>
      )}

      <section className="panel">
        <div className="panel-heading">
          <div><p className="eyebrow">POOLING ACTIVITY</p><h3>Lots across the network</h3></div>
          <button className="button button-quiet" onClick={reloadLots}><RefreshCw size={15} /> Refresh</button>
        </div>
        {activeLots.length ? (
          <div className="data-list">
            {activeLots.map((lot) => {
              const progress = lot.thresholdKg ? Math.min(100, (lot.totalKg / lot.thresholdKg) * 100) : 0;
              return (
                <Link to={`/lot/${lot.id}`} className="data-list-row" key={lot.id}>
                  <span className="list-crop-icon">{lot.crop === "Tomato" ? "🍅" : lot.crop === "Onion" ? "🧅" : "🥔"}</span>
                  <span className="list-main"><strong>{lot.crop} · {lot.village}</strong><small>Lot #{lot.id} · {lot.farmers} contributing farmers</small></span>
                  <span className="list-progress"><span className="progress-track"><span className="progress-fill" style={{ width: `${progress}%` }} /></span><small>{lot.totalKg.toLocaleString()} / {lot.thresholdKg.toLocaleString()} kg</small></span>
                  <StatusBadge status={lot.status} />
                  <ArrowRight className="list-arrow" size={17} />
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyState title="No open pooling lots yet" description="Add your produce to start or join a nearby pool." action={<Link className="button button-primary" to="/farmer/add">Add produce</Link>} />
        )}
      </section>
      <div className="notice-card"><strong>About your dashboard</strong><span>Farmer-specific earnings and personal listing history will appear when KisanPool adds sign-in and farmer account APIs.</span></div>
    </div>
  );
}
