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
  const [orderingId, setOrderingId] = useState(null); // which lot is being ordered

  // Load all lots once when the page opens
  useEffect(() => {
    getLots().then((data) => {
      setLots(data);
      setLoading(false);
    });
  }, []);

  async function handleOrder(lotId) {
    setOrderingId(lotId);
    const order = await placeOrder(lotId); // mock call: returns { orderId, status }
    navigate(`/order/${order.orderId}`);   // go to the order status page
  }

  if (loading) {
    return <p className="p-8 text-center text-lg">Loading...</p>;
  }

  return (
    <div className="mx-auto max-w-md space-y-5 p-6">
      <h2 className="text-2xl font-bold text-green-800">{t.browseLots}</h2>

      {/* Turn each lot object into a LotCard component */}
      {lots.map((lot) => (
        <LotCard
          key={lot.id}
          lot={lot}
          ordering={orderingId === lot.id}
          onOrder={() => handleOrder(lot.id)}
        />
      ))}
    </div>
  );
}