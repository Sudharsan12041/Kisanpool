import { useLang } from "../LanguageContext";

export default function TopBar() {
  const { lang, setLang, t } = useLang();

  return (
    <header className="flex items-center justify-between bg-green-700 px-4 py-3 text-white">
      <span className="text-xl font-bold">{t.appName}</span>

      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className="rounded bg-white px-2 py-1 text-green-800"
      >
        <option value="en">English</option>
        <option value="hi">हिन्दी</option>
        <option value="ta">தமிழ்</option>
      </select>
    </header>
  );
}