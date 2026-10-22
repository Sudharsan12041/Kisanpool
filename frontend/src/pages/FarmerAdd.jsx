import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../LanguageContext";
import { createListing } from "../api";

// Shared Tailwind classes for every input, so we don't repeat them
const inputClass = "mt-1 w-full rounded-lg border border-gray-300 p-4 text-lg";

export default function FarmerAdd() {
  const { t, lang } = useLang();
  const navigate = useNavigate();

  // One state object holds all four form fields
  const [form, setForm] = useState({
    crop: "Tomato",
    quantityKg: "",
    location: "",
    harvestDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Runs on every keystroke/selection; updates only the field that changed
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Voice input (Web Speech API). Not available in every browser.
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  function startListening() {
    const recognition = new SpeechRecognition();
    recognition.lang = { en: "en-IN", hi: "hi-IN", ta: "ta-IN" }[lang];
    recognition.onresult = (e) => {
      const spoken = e.results[0][0].transcript;
      setForm((prev) => ({ ...prev, location: spoken }));
    };
    recognition.start();
  }

  async function handleSubmit(e) {
    e.preventDefault(); // stop the browser from reloading the page
    setLoading(true);
    await createListing(form); // mock call from api.js
    setLoading(false);
    setSubmitted(true);
  }

  // After submitting, show a success message instead of the form
  if (submitted) {
    return (
      <div className="mx-auto max-w-md space-y-6 p-8 text-center">
        <p className="text-2xl font-semibold text-green-700">
          Your produce joined a lot!
        </p>
        <button
          onClick={() => navigate("/farmer/lots")}
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
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="text-lg">{t.location}</span>
        <div className="flex gap-2">
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            required
            className={inputClass}
          />
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