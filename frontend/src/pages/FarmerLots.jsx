import { useEffect, useState } from "react";
import { useLang } from "../LanguageContext";
import { getLots } from "../api";

export default function FarmerLots() {
  const { t } = useLang();

  // lots starts empty; loading starts true until data arrives
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Runs once when the page first appears: fetch data from api.js
  useEffect(() => {
    getLots().then((data) => {
      setLots(data);
      setLoading(false);
    });
  }, []); // the empty [] means "run only once"

  if (loading) {
    return <p className="p-8 text-center text-lg">Loading...</p>;
  }

  // For now, the farmer belongs to the first lot
  const lot = lots[0];

  // Progress as a percentage, capped at 100 so the bar never overflows
  const percent = Math.min(100, (lot.totalKg / lot.thresholdKg) * 100);

  // Hardcoded for now; the real value will come from the backend later
  const myShareKg = 250;

  return (
    <div className="mx-auto max-w-md space-y-5 p-6">
      <h2 className="text-2xl font-bold text-green-800">{t.myLots}</h2>

      <div className="space-y-4 rounded-2xl bg-white p-5 shadow">
        <p className="text-xl font-semibold">
          {lot.crop} - {lot.village}
        </p>

        <p className="text-lg">
          {lot.totalKg} kg from {lot.farmers} farmers
        </p>

        {/* Progress bar: grey track with a green fill whose width is the percent */}
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

        <p className="text-lg font-semibold text-green-700">
          Your share: {myShareKg} kg
        </p>
      </div>
    </div>
  );
}