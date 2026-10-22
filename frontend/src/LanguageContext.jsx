import { createContext, useContext, useState } from "react";
import { text } from "./i18n";

// 1. Create the "shared box" that any component can read from
const LanguageContext = createContext();

// 2. The Provider holds the data and shares it with everything inside it
export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en"); // current language, starts as English
  const t = text[lang];                   // t = the dictionary for that language

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// 3. A shortcut so other files can read the box with one line
export function useLang() {
  return useContext(LanguageContext);
}