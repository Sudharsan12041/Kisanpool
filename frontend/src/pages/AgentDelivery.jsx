import { useState } from "react";
import { Link } from "react-router-dom";
import { confirmDelivery, gradePhoto } from "../api";

// Badge colour for each grade
const gradeColors = {
  A: "bg-green-600",
  B: "bg-amber-500",
  Reject: "bg-red-600",
};

export default function AgentDelivery() {
  // Demo shortcut: the order ID is pre-filled with the one from Screen 4
  const [orderId, setOrderId] = useState("101");
  const [otp, setOtp] = useState("");

  const [photoUrl, setPhotoUrl] = useState(null); // preview of the chosen photo
  const [result, setResult] = useState(null);     // { grade, confidence } from the model
  const [grading, setGrading] = useState(false);

  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  // Runs when the agent picks a photo
  async function handlePhoto(e) {
    const file = e.target.files[0]; // the first (only) chosen file
    if (!file) return;              // user cancelled the picker

    setPhotoUrl(URL.createObjectURL(file)); // temporary local link for the preview
    setResult(null);
    setGrading(true);
    const res = await gradePhoto(file);     // mock call: returns { grade, confidence }
    setResult(res);
    setGrading(false);
  }

  async function handleConfirm() {
    if (otp.length < 4) {
      setError("Enter the 4-digit OTP");
      return;
    }
    setError("");
    setConfirming(true);
    await confirmDelivery(orderId, otp); // mock call
    setConfirming(false);
    setConfirmed(true);
  }

  // After confirming, show a success card instead of the form
  if (confirmed) {
    return (
      <div className="mx-auto max-w-md space-y-6 p-8 text-center">
        <p className="text-2xl font-semibold text-green-700">
          Delivery confirmed for order #{orderId}
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
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 p-4 text-lg"
        />
      </label>

      <label className="block">
        <span className="text-lg">OTP from buyer</span>
        <input
          type="text"
          inputMode="numeric" // shows the number keypad on phones
          maxLength={4}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
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
        <div className="flex items-center justify-center gap-3 rounded-2xl bg-white p-4 shadow">
          <span
            className={
              "rounded-full px-4 py-2 text-xl font-bold text-white " +
              (gradeColors[result.grade] || "bg-gray-500")
            }
          >
            Grade {result.grade}
          </span>
          <span className="text-lg">{Math.round(result.confidence * 100)}% confidence</span>
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