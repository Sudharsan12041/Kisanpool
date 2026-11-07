import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../LanguageContext";
import { createListing } from "../api";

const VILLAGES = [
  "Coimbatore",
  "Peelamedu",
  "Singanallur",
  "Vadavalli",
  "Saravanampatti",
  "Mettupalayam",
  "Pollachi",
  "Tiruppur",
];

// Shared Tailwind classes for every input, so we don't repeat them
const inputClass = "mt-1 w-full rounded-lg border border-gray-300 p-4 text-lg";

export default function FarmerAdd() {
  const { t } = useLang();
  const navigate = useNavigate();

  // Keep the form values together in one object.
  const [form, setForm] = useState({
    crop: "Tomato",
    quantityKg: "",
    location: "Coimbatore",
    harvestDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Update only the field the user changed.
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Voice input is available only in browsers that support speech recognition.
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  function startListening() {
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.onresult = (e) => {
      const spoken = e.results[0][0].transcript;
      const village = VILLAGES.find((name) =>
        spoken.toLowerCase().includes(name.toLowerCase()),
      );

      if (village) {
        setForm((prev) => ({ ...prev, location: village }));
        setError("");
      } else {
        setError(`Heard "${spoken}", which is not a known village. Pick one from the list.`);
      }
    };
    recognition.onerror = () => {
      setError("Could not hear you. Please try again.");
    };
    recognition.start();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await createListing(form);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Show the new lot details after the listing is created.
  if (result !== null) {
    return (
      <div className="mx-auto max-w-md space-y-6 p-8 text-center">
        <p className="text-3xl font-bold text-green-700">
          Your produce joined lot #{result.lotId}!
        </p>
        <p>
          The lot now has {result.totalKg} kg.
          {result.status === "READY"
            ? " It is full and ready for buyers."
            : " It is still filling up."}
        </p>
        <button
          onClick={() =>
            navigate("/farmer/lots", {
              state: {
                lotId: result.lotId,
                myKg: Number(form.quantityKg),
              },
            })
          }
          className="w-full rounded-2xl bg-green-600 py-4 text-xl font-semibold text-white"
        >
          {t.myLots}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-5 p-6">
      <h2 className="text-2xl font-bold text-green-800">{t.addProduce}</h2>

      <label className="block">
        <span className="text-lg">{t.crop}</span>
        <select
          name="crop"
          value={form.crop}
          onChange={handleChange}
          className={inputClass}
        >
          <option>Tomato</option>
          <option>Onion</option>
          <option>Potato</option>
        </select>
      </label>

      <label className="block">
        <span className="text-lg">{t.quantityKg}</span>
        <input
          type="number"
          name="quantityKg"
          value={form.quantityKg}
          onChange={handleChange}
          required
          min="1"
          max="100000"
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="text-lg">{t.location}</span>
        <div className="flex gap-2">
          <select
            name="location"
            value={form.location}
            onChange={handleChange}
            required
            className={inputClass}
          >
            {VILLAGES.map((village) => (
              <option key={village} value={village}>
                {village}
              </option>
            ))}
          </select>
          {/* Show the mic button only if the browser supports speech */}
          {SpeechRecognition && (
            <button
              type="button"
              onClick={startListening}
              className="mt-1 rounded-lg bg-amber-500 px-4 text-2xl"
            >
              🎤
            </button>
          )}
        </div>
      </label>

      <label className="block">
        <span className="text-lg">{t.harvestDate}</span>
        <input
          type="date"
          name="harvestDate"
          value={form.harvestDate}
          onChange={handleChange}
          required
          className={inputClass}
        />
      </label>

      {error && <p className="text-center text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-green-600 py-4 text-xl font-semibold text-white disabled:opacity-50"
      >
        {loading ? "..." : t.submit}
      </button>
    </form>
  );
}