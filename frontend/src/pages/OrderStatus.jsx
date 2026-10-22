import { useState } from "react";
import { Link, useParams } from "react-router-dom";

// The 6 stages of an order, in order
const steps = [
  "Order placed",
  "Payment held in escrow",
  "Pickup scheduled",
  "Delivery confirmed",
  "Quality graded",
  "Payment released",
];

// Demo data: the 5 farmers pooled into this lot
const farmers = [
  { name: "Murugan", kg: 250 },
  { name: "Lakshmi", kg: 300 },
  { name: "Selvam", kg: 150 },
  { name: "Kavitha", kg: 280 },
  { name: "Ravi", kg: 220 },
];

const PRICE_PER_KG = 22;

export default function OrderStatus() {
  // Reads :orderId from the URL (/order/101 gives "101")
  const { orderId } = useParams();

  // Index of the current step. Starts at 1 because the order is already in escrow.
  const [currentStep, setCurrentStep] = useState(1);

  const lastIndex = steps.length - 1;
  const finished = currentStep === lastIndex;

  // Payout maths: each farmer gets kg x price. The total is the sum of all payouts.
  const totalKg = farmers.reduce((sum, f) => sum + f.kg, 0);
  const totalPayout = totalKg * PRICE_PER_KG;

  function nextStep() {
    // Only move forward if we're not already at the last step
    if (currentStep < lastIndex) {
      setCurrentStep(currentStep + 1);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 p-6">
      <h2 className="text-2xl font-bold text-green-800">Order #{orderId}</h2>

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

      {/* Demo button: hidden once the order is finished */}
      {!finished && (
        <button
          onClick={nextStep}
          className="w-full rounded-2xl bg-green-600 py-4 text-xl font-semibold text-white"
        >
          Simulate next step
        </button>
      )}

      {/* Payout table: only appears when payment is released */}
      {finished && (
        <div className="space-y-3 rounded-2xl bg-white p-5 shadow">
          <h3 className="text-xl font-bold text-green-800">Farmer payouts</h3>

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

      {/* Link to the delivery agent screen (built in Screen 6) */}
      <Link to="/agent" className="block text-center text-green-700 underline">
        Open delivery agent screen
      </Link>
    </div>
  );
}