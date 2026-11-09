import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartNoAxesCombined, Info, MapPin } from "lucide-react";
import { getLots, getPriceRange } from "../api";
import { ErrorState, LoadingState, PageHeading } from "../components/ui";

const crops = ["Tomato", "Onion", "Potato"];

export default function MarketPrices() {
  const [prices, setPrices] = useState([]);
  const [lots, setLots] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([Promise.all(crops.map((crop) => getPriceRange(crop))), getLots()])
      .then(([ranges, lots]) => {
        if (!active) return;
        setPrices(ranges);
        setLots(lots);
        setLocations([...new Set(lots.map((lot) => lot.village))].sort());
        setError("");
      })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const visibleCrops = useMemo(() => {
    if (selectedLocation === "all") return prices;
    const listed = new Set(lots.filter((lot) => lot.village === selectedLocation).map((lot) => lot.crop));
    return prices.filter((price) => listed.has(price.crop));
  }, [prices, selectedLocation, lots]);

  if (loading) return <LoadingState label="Loading suggested price ranges…" />;
  if (error) return <ErrorState message={error} />;

  const chartData = visibleCrops.map((price) => ({ crop: price.crop, Minimum: price.min, Maximum: price.max }));
  return (
    <div className="page-stack">
      <PageHeading eyebrow="PRICE TRANSPARENCY" title="Know your crop’s suggested range." description="Platform-configured price suggestions help buyers and farmers start with a clearer conversation." action={<label className="filter-select location-filter"><MapPin size={15} /><select value={selectedLocation} onChange={(event) => setSelectedLocation(event.target.value)} aria-label="Filter by location"><option value="all">All locations</option>{locations.map((location) => <option key={location}>{location}</option>)}</select></label>} />
      <div className="notice-card notice-blue"><Info size={18} /><div><strong>Suggested ranges, not live market data</strong><span>These fixed ranges come from the backend’s current configuration. Live mandi prices, historical trends and forecasts are not connected.</span></div></div>
      <div className="analytics-grid">
        <section className="panel chart-panel">
          <div className="panel-heading"><div><p className="eyebrow">CURRENT CONFIGURATION</p><h3>Suggested range by crop</h3></div><span className="chart-legend"><i className="legend-min" />Min <i className="legend-max" />Max</span></div>
          {chartData.length ? <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 10, right: 12, left: -12, bottom: 0 }} barGap={5}>
            <CartesianGrid stroke="#edf1ed" vertical={false} />
            <XAxis dataKey="crop" tickLine={false} axisLine={false} tick={{ fill: "#718074", fontSize: 13 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#879188", fontSize: 13 }} tickFormatter={(value) => `₹${value}`} />
            <Tooltip formatter={(value) => [`₹${value}/kg`, "Suggested"]} cursor={{ fill: "#f5f8f4" }} />
            <Bar dataKey="Minimum" radius={[5, 5, 0, 0]}>{chartData.map((item) => <Cell key={item.crop} fill="#84cc16" />)}</Bar>
            <Bar dataKey="Maximum" radius={[5, 5, 0, 0]}>{chartData.map((item) => <Cell key={item.crop} fill="#166534" />)}</Bar>
          </BarChart></ResponsiveContainer></div> : <p className="chart-empty">Price suggestions aren’t available for this location yet.</p>}
          <p className="chart-caption"><ChartNoAxesCombined size={14} /> Values configured in KisanPool · ₹ per kg</p>
        </section>
        <section className="panel price-list-panel">
          <div className="panel-heading"><div><p className="eyebrow">CROP SNAPSHOT</p><h3>Configured ranges</h3></div></div>
          <div className="price-list">
            {visibleCrops.map((price) => <article className="price-row" key={price.crop}>
              <span className={`price-crop crop-${price.crop.toLowerCase()}`}>{price.crop === "Tomato" ? "🍅" : price.crop === "Onion" ? "🧅" : "🥔"}</span>
              <span className="price-crop-name"><strong>{price.crop}</strong><small>Platform suggestion</small></span>
              <span className="price-value">₹{price.min}–{price.max}<small>/ kg</small></span>
            </article>)}
          </div>
          <div className="price-footnote">No historical market-price data is available to calculate a trend.</div>
        </section>
      </div>
      <div className="notice-card"><strong>Location filtering</strong><span>Locations currently indicate where lots are listed, not separate mandi-market price feeds. The configured range is the same across locations.</span></div>
    </div>
  );
}
