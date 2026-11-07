import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { confirmDelivery, gradePhoto } from "../api";

// Badge colour for each grade
const gradeColors = {
  A: "bg-green-600",
  B: "bg-amber-500",
  Reject: "bg-red-600",
};

// Keep only the digits of what was typed or pasted
const digitsOnly = (text) => text.replace(/\D/g, "");

// The backend says "Cannot move order from DELIVERED to DELIVERED" when the
// same delivery is confirmed twice. Say that in plain words instead.
function friendlyError(message) {
  if (message.startsWith("Cannot move order")) {
    return "This order has already been delivered.";
  }
  return message;
}

export default function AgentDelivery() {
  // The order page links here as /agent?order=1, so the number arrives pre-filled
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(digitsOnly(searchParams.get("order") || ""));
  const [otp, setOtp] = useState("");

  const [photoUrl, setPhotoUrl] = useState(null); // preview of the chosen photo
  const [result, setResult] = useState(null); // { grade, confidence } from the model
  const [grading, setGrading] = useState(false);

  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  // Runs when the agent picks a photo
  async function handlePhoto(e) {
    const file = e.target.files[0]; // the first (only) chosen file
    if (!file) return; // user cancelled the picker

    setPhotoUrl(URL.createObjectURL(file)); // temporary local link for the preview
    setResult(null);
    setError("");
    setGrading(true);
    try {
      setResult(await gradePhoto(file)); // returns { grade, confidence }
    } catch (err) {
      setError(err.message);
    } finally {
      setGrading(false);
    }
  }

  async function handleConfirm() {
    if (!orderId) {
      setError("Enter the order number");
      return;
    }
    if (otp.length < 4) {
      setError("Enter the 4-digit OTP");
      return;
    }
    setError("");
    setConfirming(true);
    try {
      await confirmDelivery(orderId, otp); // real call: the backend checks the OTP
      setConfirmed(true);
    } catch (err) {
      setError(friendlyError(err.message));
    } finally {
      setConfirming(false);
    }
  }

  // After confirming, show a success card instead of the form
  if (confirmed) {
    return (
      <div className="mx-auto max-w-md space-y-6 p-8 text-center">
        <p className="text-2xl font-semibold text-green-700">
          Delivery confirmed for order #{orderId}
        </p>
        <p className="text-gray-600">
          The buyer can press Refresh status on the order page to see this.
        </p>
        <Link
          to={`/order/${orderId}`}
          className="block w-full rounded-2xl bg-green-600 py-4 text-xl font-semibold text-white"
        >
          Back to order
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-5 p-6">
      <h2 className="text-2xl font-bold text-green-800">Delivery agent</h2>

      <label className="block">
        <span className="text-lg">Order ID</span>
        <input
          type="text"
          inputMode="numeric" // shows the number keypad on phones
          value={orderId}
          onChange={(e) => setOrderId(digitsOnly(e.target.value))}
          className="mt-1 w-full rounded-lg border border-gray-300 p-4 text-lg"
        />
      </label>

      <label className="block">
        <span className="text-lg">OTP from buyer</span>
        <input
          type="text"
          inputMode="numeric"
          maxLength={4}
          value={otp}
          onChange={(e) => setOtp(digitsOnly(e.target.value))}
          className="mt-1 w-full rounded-lg border border-gray-300 p-4 text-center text-2xl tracking-widest"
        />
      </label>

      <label className="block">
        <span className="text-lg">Upload crate photo</span>
        <input
          type="file"
          accept="image/*"
          onChange={handlePhoto}
          className="mt-1 w-full rounded-lg border border-gray-300 p-3"
        />
      </label>

      {photoUrl && (
        <img src={photoUrl} alt="Crate sample" className="w-full rounded-xl shadow" />
      )}

      {grading && <p className="text-center text-lg">Grading...</p>}

      {result && (
        <div className="space-y-1 rounded-2xl bg-white p-4 text-center shadow">
          <div className="flex items-center justify-center gap-3">
            <span
              className={
                "rounded-full px-4 py-2 text-xl font-bold text-white " +
                (gradeColors[result.grade] || "bg-gray-500")
              }
            >
              Grade {result.grade}
            </span>
            <span className="text-lg">
              {Math.round(result.confidence * 100)}% confidence
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Placeholder grade until the grading model is connected.
          </p>
        </div>
      )}

      {error && <p className="text-center text-red-600">{error}</p>}

      {/* Disabled until the photo has been graded, matching the real flow */}
      <button
        onClick={handleConfirm}
        disabled={!result || confirming}
        className="w-full rounded-2xl bg-green-600 py-4 text-xl font-semibold text-white disabled:opacity-50"
      >
        {confirming ? "..." : "Confirm delivery"}
      </button>
    </div>
  );
}