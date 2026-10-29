import React, { createContext, useContext, useEffect } from "react";

const THEME_STORAGE_KEY = "abhedya_theme_preference";

const ThemeContext = createContext({
  theme: "dark",
  resolvedTheme: "dark",
  setTheme: () => {}
});

export function ThemeProvider({ children }) {
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.remove("light");
    root.classList.add("dark");
    root.setAttribute("data-theme", "dark");
    try {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } catch (_e) {}
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: "dark", resolvedTheme: "dark", setTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
