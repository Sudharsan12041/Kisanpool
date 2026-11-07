import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, ClipboardCheck, ImagePlus, MapPin, ShieldCheck, Truck } from "lucide-react";
import { confirmDelivery } from "../api";
import { PageHeading } from "../components/ui";

const digitsOnly = (value) => value.replace(/\D/g, "");

export default function AgentDelivery() {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(digitsOnly(searchParams.get("order") || ""));
  const [otp, setOtp] = useState("");
  const [photoUrl, setPhotoUrl] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => () => { if (photoUrl) URL.revokeObjectURL(photoUrl); }, [photoUrl]);

  function handlePhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoUrl(URL.createObjectURL(file));
  }

  async function handleConfirm(event) {
    event.preventDefault();
    if (!orderId) { setError("Enter the order number."); return; }
    if (otp.length !== 4) { setError("Enter the 4-digit OTP from the buyer."); return; }
    setError("");
    setConfirming(true);
    try {
      await confirmDelivery(orderId, otp);
      setConfirmed(true);
    } catch (requestError) {
      setError(requestError.message.startsWith("Cannot move order") ? "This order has already been delivered." : requestError.message);
    } finally {
      setConfirming(false);
    }
  }

  if (confirmed) {
    return <section className="success-panel"><span className="success-mark"><Check size={26} /></span><p className="eyebrow">DELIVERY VERIFIED</p><h2>Order #{orderId} is delivered.</h2><p className="success-copy">The backend accepted the buyer’s OTP and updated the order status. Quality grading and payment are separate steps and have not been marked complete.</p><Link className="button button-primary button-large" to={`/order/${orderId}`}>View order status</Link></section>;
  }

  return (
    <div className="page-stack">
      <PageHeading eyebrow="DELIVERY WORKSPACE" title="Complete a verified delivery." description="Confirm the order only when the produce has arrived and the buyer shares their one-time code." />
      <div className="agent-summary-grid">
        <div className="agent-info-card"><span className="agent-info-icon"><ClipboardCheck size={20} /></span><strong>OTP protected</strong><small>Delivery is confirmed only when the order number and buyer code are valid.</small></div>
        <div className="agent-info-card"><span className="agent-info-icon agent-info-lime"><Truck size={20} /></span><strong>Order lookup</strong><small>Use the order link shared by the buyer to return to its status.</small></div>
        <div className="agent-info-card"><span className="agent-info-icon agent-info-blue"><ShieldCheck size={20} /></span><strong>Real status updates</strong><small>Only the backend can move an order through its supported steps.</small></div>
      </div>
      <div className="agent-form-grid">
        <form className="panel agent-form" onSubmit={handleConfirm}>
          <div className="panel-heading"><div><p className="eyebrow">VERIFY DELIVERY</p><h3>Order confirmation</h3></div><span className="step-count">STEP 01 / 01</span></div>
          <label className="field-label"><span>Order ID</span><input type="text" inputMode="numeric" value={orderId} onChange={(event) => setOrderId(digitsOnly(event.target.value))} placeholder="Enter order number" className="form-control" /></label>
          <label className="field-label"><span>Buyer’s 4-digit OTP</span><input type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={4} value={otp} onChange={(event) => setOtp(digitsOnly(event.target.value).slice(0, 4))} placeholder="• • • •" className="form-control otp-input" /></label>
          <label className="field-label"><span>Delivery photo <small className="optional-label">Optional</small></span><span className="upload-field"><ImagePlus size={19} /><span><strong>{photoUrl ? "Photo attached" : "Choose a delivery photo"}</strong><small>Image preview only; upload storage is not connected.</small><input type="file" accept="image/*" onChange={handlePhoto} /></span></span></label>
          {photoUrl && <img className="delivery-photo-preview" src={photoUrl} alt="Selected delivery proof" />}
          {error && <p className="inline-error" role="alert">{error}</p>}
          <button type="submit" className="button button-primary button-large form-submit" disabled={confirming}>{confirming ? "Verifying with backend…" : "Verify OTP & confirm delivery"} {!confirming && <Check size={17} />}</button>
          <p className="form-footnote">Do not ask for or enter the OTP until the buyer has received the produce.</p>
        </form>
        <aside className="panel delivery-side-card"><span className="section-icon"><MapPin size={20} /></span><p className="eyebrow">DELIVERY FLOW</p><h3>From pickup to handoff</h3><div className="delivery-flow"><div className="flow-item complete"><span>1</span><p><strong>Pickup scheduled</strong><small>Pickup tasks and routes are not provided by the current API.</small></p></div><div className="flow-item current"><span>2</span><p><strong>Buyer receives produce</strong><small>Confirm the order using the buyer’s OTP.</small></p></div><div className="flow-item"><span>3</span><p><strong>Delivery confirmed</strong><small>Order moves to DELIVERED after OTP verification.</small></p></div></div><div className="notice-card notice-blue compact-notice"><strong>Not connected yet</strong><span>Agent assignments, route maps, pickup addresses and delivery statistics need backend endpoints.</span></div></aside>
      </div>
    </div>
  );
}
