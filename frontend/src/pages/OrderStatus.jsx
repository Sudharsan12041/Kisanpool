import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOrderStatus } from "../api";

// The 6 stages of an order, in order
const steps = [
  "Order placed",
  "Payment held in escrow",
  "Pickup scheduled",
  "Delivery confirmed",
  "Quality graded",
  "Payment released",
];

// Which timeline step each status from the backend points to
const STATUS_TO_STEP = {
  ORDER_PLACED: 0,
  ESCROW_HELD: 1,
  PICKUP_SCHEDULED: 2,
  DELIVERED: 3,
  GRADED: 4,
  PAYMENT_RELEASED: 5,
};

// SAMPLE payout data. The real split belongs to the escrow module (Member 4),
// so this table is labelled as a sample until that is connected.
const farmers = [
  { name: "Murugan", kg: 250 },
  { name: "Lakshmi", kg: 300 },
  { name: "Selvam", kg: 150 },
  { name: "Kavitha", kg: 280 },
  { name: "Ravi", kg: 220 },
];
const PRICE_PER_KG = 22;

export default function OrderStatus() {
  // Reads :orderId from the URL (/order/1 gives "1")
  const { orderId } = useParams();

  const [order, setOrder] = useState(null); // the real order from the backend
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0); // changing it re-runs the fetch
  const [simStep, setSimStep] = useState(0); // demo-only progress for steps 5 and 6

  useEffect(() => {
    getOrderStatus(orderId)
      .then((data) => {
        setOrder(data);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [orderId, refreshKey]);

  if (loading) {
    return <p className="p-8 text-center text-lg">Loading...</p>;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md space-y-4 p-8 text-center">
        <p className="text-lg text-red-600">{error}</p>
        <button
          onClick={() => setRefreshKey(refreshKey + 1)}
          className="w-full rounded-2xl bg-green-600 py-3 text-lg font-semibold text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  // Where the real order is, and where the timeline shows it
  const realStep = STATUS_TO_STEP[order.status] ?? 0;
  const currentStep = Math.max(realStep, simStep);
  const lastIndex = steps.length - 1;
  const finished = currentStep === lastIndex;

  // The OTP is only needed until the delivery has been confirmed
  const waitingForDelivery = realStep < STATUS_TO_STEP.DELIVERED;

  // The backend drives the order up to "Delivery confirmed". Grading and payout
  // are not connected yet, so from there the demo button simulates them.
  const canSimulate = realStep >= STATUS_TO_STEP.DELIVERED && !finished;

  // Payout maths: each farmer gets kg x price. The total is the sum of all payouts.
  const totalKg = farmers.reduce((sum, f) => sum + f.kg, 0);
  const totalPayout = totalKg * PRICE_PER_KG;

  return (
    <div className="mx-auto max-w-md space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-green-800">Order #{order.orderId}</h2>
        <p className="text-gray-600">Lot #{order.lotId}</p>
      </div>

      {/* The buyer's OTP: shown until the produce has been delivered */}
      {waitingForDelivery && (
        <div className="rounded-2xl bg-amber-50 p-5 text-center shadow">
          <p className="text-sm text-gray-600">Delivery OTP</p>
          <p className="text-4xl font-bold tracking-widest text-amber-600">
            {order.otp}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Give this code to the delivery agent only when your produce arrives.
          </p>
        </div>
      )}

      {/* Timeline */}
      <ol className="space-y-4">
        {steps.map((label, i) => {
          // A step is done if it's before the current one, or we've reached the end
          const done = i < currentStep || finished;
          const current = i === currentStep && !finished;

          return (
            <li key={label} className="flex items-center gap-3">
              <span
                className={
                  "flex h-8 w-8 items-center justify-center rounded-full text-white " +
                  (done
                    ? "bg-green-600"
                    : current
                    ? "bg-amber-500 ring-4 ring-amber-200"
                    : "bg-gray-300")
                }
              >
                {done ? "✓" : i + 1}
              </span>
              <span
                className={
                  "text-lg " +
                  (current ? "font-bold" : done ? "text-green-800" : "text-gray-400")
                }
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Check what the delivery agent has done since this page was opened */}
      {!finished && (
        <button
          onClick={() => setRefreshKey(refreshKey + 1)}
          className="w-full rounded-2xl border border-green-600 py-3 text-lg font-semibold text-green-700"
        >
          Refresh status
        </button>
      )}

      {/* Demo-only button: appears once the backend part of the order is done */}
      {canSimulate && (
        <div className="space-y-2">
          <button
            onClick={() => setSimStep(currentStep + 1)}
            className="w-full rounded-2xl bg-green-600 py-4 text-xl font-semibold text-white"
          >
            Simulate grading and payout (demo)
          </button>
          <p className="text-center text-sm text-gray-500">
            Quality grading and payout are not connected yet.
          </p>
        </div>
      )}

      {/* Payout table: only appears when payment is released */}
      {finished && (
        <div className="space-y-3 rounded-2xl bg-white p-5 shadow">
          <h3 className="text-xl font-bold text-green-800">
            Farmer payouts (sample data)
          </h3>

          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-gray-600">
                <th className="py-2">Farmer</th>
                <th>Kg</th>
                <th className="text-right">Payout</th>
              </tr>
            </thead>
            <tbody>
              {farmers.map((f) => (
                <tr key={f.name} className="border-b">
                  <td className="py-2">{f.name}</td>
                  <td>{f.kg}</td>
                  <td className="text-right">₹{f.kg * PRICE_PER_KG}</td>
                </tr>
              ))}
              <tr className="font-bold">
                <td className="py-2">Total</td>
                <td>{totalKg}</td>
                <td className="text-right">₹{totalPayout}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Link to the delivery agent screen, with this order's number */}
      <Link
        to={`/agent?order=${order.orderId}`}
        className="block text-center text-green-700 underline"
      >
        Open delivery agent screen
      </Link>
    </div>
  );
}