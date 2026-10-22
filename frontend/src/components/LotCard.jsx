import { useEffect, useState } from "react";
import { useLang } from "../LanguageContext";
import { getPriceRange } from "../api";

// Props: lot = the data to show, onOrder = function to run when the button is pressed,
// ordering = true while the order is being placed (disables the button)
export default function LotCard({ lot, onOrder, ordering }) {
  const { t } = useLang();
  const [price, setPrice] = useState(null); // null until the price arrives

  // Fetch the AI-suggested price for this lot's crop
  useEffect(() => {
    getPriceRange(lot.crop).then(setPrice);
  }, [lot.crop]); // re-run only if the crop changes

  return (
    <div className="space-y-3 rounded-2xl bg-white p-5 shadow">
      <div className="flex items-center justify-between">
        <p className="text-xl font-semibold">{lot.crop}</p>
        {/* Badge: small coloured label */}
        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
          Expected Grade A
        </span>
      </div>

      <p className="text-gray-700">
        {lot.totalKg} kg - {lot.farmers} farmers - {lot.village}
      </p>

      <p className="text-lg">
        {/* Show "..." while loading, then the real range */}
        <span className="text-sm text-gray-500">AI suggested: </span>
        {price ? `₹${price.min} - ₹${price.max} / kg` : "..."}
      </p>

      <button
        onClick={onOrder}
        disabled={ordering}
        className="w-full rounded-xl bg-amber-500 py-3 text-lg font-semibold text-white disabled:opacity-50"
      >
        {ordering ? "..." : t.orderLot}
      </button>
    </div>
  );
}