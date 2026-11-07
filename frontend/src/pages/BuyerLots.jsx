import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../LanguageContext";
import { getLots, placeOrder } from "../api";
import LotCard from "../components/LotCard";

export default function BuyerLots() {
  const { t } = useLang();
  const navigate = useNavigate();

  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(""); // the list could not be loaded
  const [orderError, setOrderError] = useState(""); // an order was refused
  const [orderingId, setOrderingId] = useState(null); // which lot is being ordered
  const [refreshKey, setRefreshKey] = useState(0); // changing it re-runs the fetch

  // Load the lots when the page opens, and again whenever refreshKey changes
  useEffect(() => {
    getLots()
      .then((data) => {
        setLots(data);
        setLoadError("");
      })
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  async function handleOrder(lotId) {
    setOrderingId(lotId);
    setOrderError("");
    try {
      const order = await placeOrder(lotId); // real order, with an OTP
      navigate(`/order/${order.orderId}`);
    } catch (err) {
      setOrderError(err.message);
      setOrderingId(null); // let the buyer try again
      setRefreshKey(refreshKey + 1); // the lot may have changed: reload the list
    }
  }

  if (loading) {
    return <p className="p-8 text-center text-lg">Loading...</p>;
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-md space-y-4 p-8 text-center">
        <p className="text-lg text-red-600">{loadError}</p>
        <button
          onClick={() => setRefreshKey(refreshKey + 1)}
          className="w-full rounded-2xl bg-green-600 py-3 text-lg font-semibold text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  // Lots that were already ordered are gone from the shelf.
  // Ready lots go first, because those are the ones a buyer can act on.
  const available = lots
    .filter((lot) => lot.status !== "ORDERED")
    .sort(
      (a, b) =>
        (a.status === "READY" ? 0 : 1) - (b.status === "READY" ? 0 : 1)
    );

  return (
    <div className="mx-auto max-w-md space-y-5 p-6">
      <h2 className="text-2xl font-bold text-green-800">{t.browseLots}</h2>

      {orderError && (
        <p className="text-center text-red-600">{orderError}</p>
      )}

      {available.length === 0 && (
        <p className="text-center text-lg">No lots available right now.</p>
      )}

      {available.map((lot) => (
        <LotCard
          key={lot.id}
          lot={lot}
          ordering={orderingId === lot.id}
          onOrder={() => handleOrder(lot.id)}
        />
      ))}

      <button
        onClick={() => setRefreshKey(refreshKey + 1)}
        className="w-full rounded-2xl border border-green-600 py-3 text-lg font-semibold text-green-700"
      >
        Refresh
      </button>
    </div>
  );
}