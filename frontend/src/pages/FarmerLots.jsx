import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLang } from "../LanguageContext";
import { getLots } from "../api";

export default function FarmerLots() {
  const { t } = useLang();
  const { state } = useLocation();
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Reload the lots whenever the refresh button changes the key.
  useEffect(() => {
    getLots()
      .then((data) => {
        setLots(data);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) {
    return <p className="p-8 text-center text-lg">Loading...</p>;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md space-y-4 p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => setRefreshKey(refreshKey + 1)}
          className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="mx-auto max-w-md space-y-4 p-6 text-center">
        <p>Add your produce first to see your lot.</p>
        <Link
          to="/farmer/add"
          className="block w-full rounded-xl bg-green-600 py-3 font-semibold text-white"
        >
          {t.addProduce}
        </Link>
      </div>
    );
  }

  // Use the lot ID passed from the produce form to find this farmer's lot.
  const lot = lots.find((l) => l.id === state.lotId);

  if (!lot) {
    return <p className="p-8 text-center text-lg">This lot no longer exists.</p>;
  }

  const percent = Math.min(100, (lot.totalKg / lot.thresholdKg) * 100);
  const remaining = Math.max(0, lot.thresholdKg - lot.totalKg);
  const statusText =
    lot.status === "READY"
      ? "Full - waiting for a buyer"
      : lot.status === "ORDERED"
        ? "A buyer has ordered this lot"
        : `Needs ${remaining} kg more`;

  return (
    <div className="mx-auto max-w-md space-y-5 p-6">
      <h2 className="text-2xl font-bold text-green-800">{t.myLots}</h2>

      <div className="space-y-4 rounded-2xl bg-white p-5 shadow">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xl font-semibold">
            {lot.crop} - {lot.village}
          </p>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              lot.status === "OPEN"
                ? "bg-amber-100 text-amber-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {statusText}
          </span>
        </div>

        <p className="text-lg">
          {lot.totalKg} kg from {lot.farmers} farmers
        </p>

        {/* The green fill shows how much of the lot threshold is reached. */}
        <div>
          <div className="h-4 w-full rounded-full bg-gray-200">
            <div
              className="h-4 rounded-full bg-green-600"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-1 text-sm text-gray-600">
            {lot.totalKg} / {lot.thresholdKg} kg ({Math.round(percent)}%)
          </p>
        </div>

        {state.myKg > 0 && (
          <p className="text-lg font-semibold text-green-700">
            Your share: {state.myKg} kg
          </p>
        )}
      </div>

      <button
        onClick={() => setRefreshKey(refreshKey + 1)}
        className="w-full rounded-xl border-2 border-green-600 py-3 font-semibold text-green-700"
      >
        Refresh
      </button>
    </div>
  );
}
