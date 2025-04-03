import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  primaryColor: "216 98% 52%", // Default blue primary color
  setPrimaryColor: () => null,
  setTheme: () => null,
};

export const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "voltus-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  
  const [primaryColor, setPrimaryColor] = useState<string>(
    () => localStorage.getItem(`${storageKey}-primary-color`) || initialState.primaryColor
  );

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove previous theme class
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    
    // Update CSS variable for primary color
    root.style.setProperty("--primary", primaryColor);
    
    // Store preferences
    localStorage.setItem(storageKey, theme);
    localStorage.setItem(`${storageKey}-primary-color`, primaryColor);
  }, [theme, primaryColor, storageKey]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = () => {
      if (theme === "system") {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(mediaQuery.matches ? "dark" : "light");
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const value = {
    theme,
    primaryColor,
    setTheme,
    setPrimaryColor,
  };

  return React.createElement(ThemeProviderContext.Provider, 
    { ...props, value }, 
    children
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
    
  return context;
};

export const predefinedColors = {
  blue: "216 98% 52%", // Default
  purple: "262 83% 58%",
  green: "142 71% 45%",
  red: "0 84% 60%",
  orange: "24 75% 50%",
  teal: "180 100% 37%",
}; 