import { useLang } from "../LanguageContext";

// Props: lot = the data to show, onOrder = function to run when the button is pressed,
// ordering = true while the order is being placed (disables the button)
export default function LotCard({ lot, onOrder, ordering }) {
  const { t } = useLang();

  // Only a full lot (READY) can be ordered
  const ready = lot.status === "READY";
  const remaining = Math.max(0, lot.thresholdKg - lot.totalKg);
  const percent = Math.min(100, (lot.totalKg / lot.thresholdKg) * 100);

  return (
    <div className="space-y-3 rounded-2xl bg-white p-5 shadow">
      <div className="flex items-center justify-between">
        <p className="text-xl font-semibold">{lot.crop}</p>
        {/* Chip: green when the lot can be ordered, amber while it is still filling */}
        <span
          className={
            "rounded-full px-3 py-1 text-sm font-medium " +
            (ready ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800")
          }
        >
          {ready ? "Ready to order" : `Needs ${remaining} kg more`}
        </span>
      </div>

      <p className="text-gray-700">
        {lot.totalKg} kg - {lot.farmers} farmers - {lot.village}
      </p>

      {/* Slim progress bar towards the truckload target */}
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-green-600"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="text-lg">
        <span className="text-sm text-gray-500">Suggested price: </span>
        ₹{lot.priceMin} - ₹{lot.priceMax} / kg
      </p>

      <button
        onClick={onOrder}
        disabled={!ready || ordering}
        className="w-full rounded-xl bg-amber-500 py-3 text-lg font-semibold text-white disabled:opacity-50"
      >
        {ordering ? "..." : ready ? t.orderLot : "Waiting for more produce"}
      </button>
    </div>
  );
}