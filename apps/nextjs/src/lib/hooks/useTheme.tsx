import React, { createContext, useContext, useEffect, useState } from "react";

export type Mode = "light" | "dark";

export type ThemeContextProps = {
  mode?: Mode;
  toggleMode?: () => void;
};

export const ThemeContext = createContext<ThemeContextProps>({});

type ThemeProviderProps = { children: React.ReactNode; defaultMode?: Mode };

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = "light",
}) => {
  const [modeState, setModeState] = useState<Mode>(() => {
    if (typeof window === "undefined") {
      return defaultMode;
    }
    const savedMode = window.localStorage.getItem("ggpx_theme_mode") as Mode;
    return savedMode ?? defaultMode;
  });

  useEffect(() => {
    setModeInTheme(modeState);
  }, []);

  const toggleMode = () => {
    const newMode = modeState === "dark" ? "light" : "dark";
    setModeState(newMode);
    setModeInTheme(newMode);
  };
  const setModeInTheme = (mode: Mode) => {
    localStorage.setItem("ggpx_theme_mode", mode);
    if (typeof window === "undefined") return;
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
      return;
    }
    document.documentElement.classList.remove("dark");
  };

  return (
    <ThemeContext.Provider value={{ mode: modeState, toggleMode: toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};
