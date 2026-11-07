import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, ShoppingBasket, Sparkles } from "lucide-react";
import { getLots, placeOrder } from "../api";
import LotCard from "../components/LotCard";
import { EmptyState, ErrorState, LoadingState, PageHeading, StatCard } from "../components/ui";

export default function BuyerLots() {
  const navigate = useNavigate();
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [orderError, setOrderError] = useState("");
  const [orderingId, setOrderingId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState("");
  const [crop, setCrop] = useState("all");
  const [location, setLocation] = useState("all");
  const [minimum, setMinimum] = useState("");
  const [sort, setSort] = useState("recommended");

  useEffect(() => {
    let active = true;
    getLots()
      .then((data) => { if (active) { setLots(data); setLoadError(""); } })
      .catch((error) => { if (active) setLoadError(error.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refreshKey]);

  function reloadLots() {
    setLoading(true);
    setRefreshKey((key) => key + 1);
  }

  async function handleOrder(lotId) {
    setOrderingId(lotId);
    setOrderError("");
    try {
      const order = await placeOrder(lotId);
      navigate(`/order/${order.orderId}`);
    } catch (error) {
      setOrderError(error.message);
      setOrderingId(null);
      reloadLots();
    }
  }

  const locations = useMemo(() => [...new Set(lots.map((lot) => lot.village))].sort(), [lots]);
  const available = useMemo(() => {
    const filtered = lots.filter((lot) => {
      if (lot.status === "ORDERED") return false;
      if (crop !== "all" && lot.crop !== crop) return false;
      if (location !== "all" && lot.village !== location) return false;
      if (Number(minimum) > 0 && Number(lot.totalKg) < Number(minimum)) return false;
      const query = search.trim().toLowerCase();
      return !query || `${lot.crop} ${lot.village}`.toLowerCase().includes(query);
    });
    return filtered.sort((a, b) => {
      if (sort === "price-low") return a.priceMin - b.priceMin;
      if (sort === "price-high") return b.priceMax - a.priceMax;
      if (sort === "quantity") return b.totalKg - a.totalKg;
      return Number(b.status === "READY") - Number(a.status === "READY");
    });
  }, [lots, crop, location, minimum, search, sort]);

  if (loading) return <LoadingState label="Finding fresh produce…" />;
  if (loadError) return <ErrorState message={loadError} onRetry={reloadLots} />;

  return (
    <div className="page-stack">
      <PageHeading
        eyebrow="DIRECT FROM THE FARM"
        title="A better harvest starts here."
        description="Discover pooled produce from nearby farmers. Order full lots directly, with transparent suggested pricing."
        action={<span className="market-badge"><Sparkles size={15} /> Farmer pooled</span>}
      />
      <div className="stats-grid buyer-stats">
        <StatCard label="Available lots" value={lots.filter((lot) => lot.status !== "ORDERED").length} note="Across all crops and locations" icon={ShoppingBasket} />
        <StatCard label="Ready to order" value={lots.filter((lot) => lot.status === "READY").length} note="Complete pooled lots" icon={Sparkles} tone="lime" />
        <StatCard label="Crops in season" value={new Set(lots.map((lot) => lot.crop)).size} note="Currently listed on KisanPool" icon={ShoppingBasket} tone="blue" />
      </div>

      <section className="marketplace-section">
        <div className="marketplace-toolbar">
          <div className="marketplace-title"><div><p className="eyebrow">MARKETPLACE</p><h3>Explore pooled lots <span className="result-count">{available.length}</span></h3></div></div>
          <div className="search-field"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search crop or location" aria-label="Search by crop or location" /></div>
        </div>
        <div className="filter-toolbar">
          <span className="filter-label"><SlidersHorizontal size={15} /> Filter by</span>
          <select value={crop} onChange={(event) => setCrop(event.target.value)} aria-label="Filter by crop" className="filter-select"><option value="all">All crops</option><option>Tomato</option><option>Onion</option><option>Potato</option></select>
          <select value={location} onChange={(event) => setLocation(event.target.value)} aria-label="Filter by location" className="filter-select"><option value="all">All locations</option>{locations.map((item) => <option key={item}>{item}</option>)}</select>
          <input type="number" min="0" value={minimum} onChange={(event) => setMinimum(event.target.value)} placeholder="Min. kg" aria-label="Minimum available quantity in kilograms" className="filter-select filter-number" />
          <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort lots" className="filter-select sort-select"><option value="recommended">Recommended</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="quantity">Most quantity</option></select>
        </div>
        {orderError && <p className="inline-error" role="alert">{orderError}</p>}
        {available.length ? (
          <div className="lot-grid">
            {available.map((lot) => <LotCard key={lot.id} lot={lot} ordering={orderingId === lot.id} onOrder={() => handleOrder(lot.id)} />)}
          </div>
        ) : (
          <EmptyState title="No lots match those filters" description="Try a different search or clear one of the selected filters." action={<button className="button button-secondary" onClick={() => { setSearch(""); setCrop("all"); setLocation("all"); setMinimum(""); }}>Clear filters</button>} />
        )}
      </section>
      <p className="data-disclaimer">Prices shown are suggested ranges configured by the platform, not live mandi prices or forecasts. Quality grades are not yet available from the backend.</p>
    </div>
  );
}
