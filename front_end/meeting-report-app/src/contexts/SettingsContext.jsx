import { createContext, useContext, useMemo, useState } from "react";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [defaultLanguage, setDefaultLanguage] = useState(localStorage.getItem("defaultLanguage") || "auto");
  const [speakerThreshold, setSpeakerThreshold] = useState(Number(localStorage.getItem("speakerThreshold") || 0.7));
  const [aiModel, setAiModel] = useState(localStorage.getItem("aiModel") || "llama-3.3-70b-versatile");

  const persist = (key, value) => localStorage.setItem(key, String(value));

  const value = useMemo(
    () => ({
      defaultLanguage,
      setDefaultLanguage: (v) => {
        setDefaultLanguage(v);
        persist("defaultLanguage", v);
      },
      speakerThreshold,
      setSpeakerThreshold: (v) => {
        setSpeakerThreshold(v);
        persist("speakerThreshold", v);
      },
      aiModel,
      setAiModel: (v) => {
        setAiModel(v);
        persist("aiModel", v);
      },
    }),
    [defaultLanguage, speakerThreshold, aiModel]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
