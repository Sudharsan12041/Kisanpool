import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Mic, Sprout } from "lucide-react";
import { useLang } from "../useLang";
import { createListing } from "../api";

const VILLAGES = [
  "Coimbatore", "Peelamedu", "Singanallur", "Vadavalli",
  "Saravanampatti", "Mettupalayam", "Pollachi", "Tiruppur",
];
const inputClass = "form-control";

export default function FarmerAdd() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    crop: "Tomato",
    quantityKg: "",
    location: "Coimbatore",
    harvestDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  function startListening() {
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.onresult = (event) => {
      const spoken = event.results[0][0].transcript;
      const village = VILLAGES.find((name) => spoken.toLowerCase().includes(name.toLowerCase()));
      if (village) {
        setForm((previous) => ({ ...previous, location: village }));
        setError("");
      } else {
        setError(`Heard "${spoken}", which is not a known village. Choose a location from the list.`);
      }
    };
    recognition.onerror = () => setError("Could not hear you. Please try again.");
    recognition.start();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      setResult(await createListing(form));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <section className="success-panel">
        <span className="success-mark"><Check size={26} /></span>
        <p className="eyebrow">LISTING ADDED</p>
        <h2>Your harvest is in the pool.</h2>
        <p className="success-copy">Your {form.quantityKg} kg of {form.crop} joined lot <strong>#{result.lotId}</strong>. The lot now has {result.totalKg.toLocaleString()} kg and is {result.status === "READY" ? "ready for buyers" : "still pooling"}.</p>
        <button className="button button-primary button-large" onClick={() => navigate("/farmer/lots", { state: { lotId: result.lotId, myKg: Number(form.quantityKg) } })}>
          View pooling overview <ArrowRight size={17} />
        </button>
        <button className="text-button" onClick={() => setResult(null)}>Add another listing</button>
      </section>
    );
  }

  return (
    <div className="content-narrow">
      <Link to="/farmer/lots" className="back-link"><ArrowLeft size={16} /> Back to overview</Link>
      <div className="form-page-intro">
        <span className="section-icon"><Sprout size={21} /></span>
        <p className="eyebrow">FARMER WORKSPACE</p>
        <h2>Bring your harvest to market.</h2>
        <p>Share your produce details and we’ll match it with nearby farmers growing the same crop.</p>
      </div>
      <form className="form-panel" onSubmit={handleSubmit}>
        <div className="form-section-title"><span>01</span><div><strong>Produce details</strong><small>Tell us what you’re ready to harvest</small></div></div>
        <label className="field-label"><span>{t.crop}</span>
          <select name="crop" value={form.crop} onChange={handleChange} className={inputClass}>
            <option>Tomato</option><option>Onion</option><option>Potato</option>
          </select>
        </label>
        <label className="field-label"><span>{t.quantityKg}</span>
          <div className="input-suffix"><input type="number" name="quantityKg" value={form.quantityKg} onChange={handleChange} required min="1" max="100000" placeholder="e.g. 250" className={inputClass} /><span>kg</span></div>
        </label>
        <div className="form-section-title form-section-spaced"><span>02</span><div><strong>Harvest & location</strong><small>Help us find the right nearby pool</small></div></div>
        <label className="field-label"><span>{t.location}</span>
          <div className="location-field">
            <select name="location" value={form.location} onChange={handleChange} required className={inputClass}>
              {VILLAGES.map((village) => <option key={village} value={village}>{village}</option>)}
            </select>
            {SpeechRecognition && <button type="button" className="icon-button mic-button" onClick={startListening} aria-label="Select village using voice"><Mic size={18} /></button>}
          </div>
          <small className="field-note">Choose one of the mapped locations so your produce can join a nearby lot.</small>
        </label>
        <label className="field-label"><span>{t.harvestDate}</span>
          <input type="date" name="harvestDate" value={form.harvestDate} onChange={handleChange} required className={inputClass} />
        </label>
        {error && <p className="inline-error" role="alert">{error}</p>}
        <button type="submit" disabled={loading} className="button button-primary button-large form-submit">
          {loading ? "Adding your produce…" : "Add produce to pool"} {!loading && <ArrowRight size={17} />}
        </button>
        <p className="form-footnote">By submitting, your listing will be grouped with nearby produce of the same crop and harvest date.</p>
      </form>
    </div>
  );
}
