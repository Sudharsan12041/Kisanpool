import { useState } from "react";
import { text } from "./i18n";
import { LanguageContext } from "./languageContext";

export function LanguageProvider({ children }) {
  const [lang, setLanguage] = useState(() => {
    const saved = window.localStorage.getItem("kisanpool-language");
    return saved && text[saved] ? saved : "en";
  });

  function setLang(nextLanguage) {
    if (!text[nextLanguage]) return;
    window.localStorage.setItem("kisanpool-language", nextLanguage);
    setLanguage(nextLanguage);
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: text[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}