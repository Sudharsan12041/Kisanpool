import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Check, Clock3, MapPin, Package, RefreshCw, ShieldCheck, Truck } from "lucide-react";
import { getOrderStatus } from "../api";
import { ErrorState, LoadingState, PageHeading, StatusBadge } from "../components/ui";

const stages = [
  { status: "ORDER_CREATED", title: "Order created", detail: "The order was accepted by KisanPool.", icon: Package },
  { status: "ESCROW_HELD", title: "Payment held", detail: "Payment hold is simulated in this demo.", icon: ShieldCheck },
  { status: "PICKUP_SCHEDULED", title: "Pickup scheduled", detail: "The backend has not scheduled a pickup.", icon: Clock3 },
  { status: "DELIVERED", title: "Delivered", detail: "Buyer OTP verified by the delivery agent.", icon: Truck },
  { status: "GRADED", title: "Quality graded", detail: "Quality grading is not connected.", icon: Check },
  { status: "PAYMENT_RELEASED", title: "Payment released", detail: "Payout is not connected.", icon: ShieldCheck },
];
const statusIndex = Object.fromEntries(stages.map((stage, index) => [stage.status, index]));
statusIndex.ORDER_PLACED = statusIndex.ORDER_CREATED;

export default function OrderStatus() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    getOrderStatus(orderId)
      .then((data) => { if (active) { setOrder(data); setError(""); } })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [orderId, refreshKey]);

  function refreshStatus() {
    setLoading(true);
    setRefreshKey((key) => key + 1);
  }

  if (loading) return <LoadingState label="Refreshing order status…" />;
  if (error) return <ErrorState message={error} onRetry={refreshStatus} />;

  const currentIndex = statusIndex[order.status] ?? -1;
  const delivered = currentIndex >= statusIndex.DELIVERED;
  return (
    <div className="page-stack">
      <PageHeading eyebrow={`ORDER #${order.orderId}`} title="Your order, at a glance." description={`Tracking the pooled produce in lot #${order.lotId}.`} action={<StatusBadge status={order.status} />} />
      <div className="order-detail-grid">
        <section className="panel order-summary-panel">
          <div className="panel-heading"><div><p className="eyebrow">ORDER SUMMARY</p><h3>{order.crop || "Produce order"}</h3></div><span className="order-crop-emoji">{order.crop === "Tomato" ? "🍅" : order.crop === "Onion" ? "🧅" : "🥔"}</span></div>
          <div className="order-facts">
            <div><small>Quantity</small><strong>{order.quantityKg?.toLocaleString?.() ?? order.quantityKg} kg</strong></div>
            <div><small>Suggested price</small><strong>{order.priceMin != null ? `₹${order.priceMin}–${order.priceMax} / kg` : "Not available"}</strong></div>
            <div><small>Harvest date</small><strong>{order.harvestDate || "Not provided"}</strong></div>
            <div><small>Pickup location</small><strong><MapPin size={14} />{order.village || "Not provided"}</strong></div>
          </div>
          {!delivered && (
            <div className="otp-card"><span className="otp-shield"><ShieldCheck size={19} /></span><div><small>Share this OTP with your delivery agent</small><strong>{order.otp}</strong><span>Only provide this code when your produce arrives.</span></div></div>
          )}
          {delivered && <div className="delivered-note"><Check size={17} /> Delivery verified. The OTP is hidden after delivery.</div>}
          <div className="order-help-links"><Link to={`/agent?order=${order.orderId}`}>Open delivery verification <ArrowRight size={15} /></Link><button onClick={refreshStatus}><RefreshCw size={14} /> Refresh status</button></div>
        </section>
        <section className="panel timeline-panel">
          <div className="panel-heading"><div><p className="eyebrow">ORDER JOURNEY</p><h3>Delivery progress</h3></div></div>
          <ol className="order-timeline">
            {stages.map((stage, index) => {
              const isDone = currentIndex >= 0 && index < currentIndex;
              const isCurrent = index === currentIndex;
              const Icon = stage.icon;
              return <li key={stage.status} className={`order-timeline-item ${isDone ? "done" : ""} ${isCurrent ? "current" : ""}`}>
                <span className="timeline-icon">{isDone ? <Check size={16} /> : <Icon size={16} />}</span>
                <span className="timeline-copy"><strong>{stage.title}</strong><small>{stage.detail}</small></span>
                {isCurrent && <span className="timeline-now">CURRENT</span>}
              </li>;
            })}
          </ol>
          <p className="timeline-disclaimer">Status is read directly from the order API. Pending milestones are not simulated.</p>
        </section>
      </div>
      <div className="notice-card"><strong>Order participant details</strong><span>Buyer and farmer identities, destination addresses, grading results and payout records are not exposed by the current backend API.</span></div>
    </div>
  );
}
