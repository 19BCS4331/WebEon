// ThemeContext.js
import React, { createContext, useEffect, useState } from "react";
import { useThemePersistence } from "../hooks/useThemePersistence";
import {
  DEFAULT_LIGHT,
  DEFAULT_DARK,
  EARTHY_BROWN_LIGHT,
  EARTHY_BROWN_DARK,
  SEA_AND_SKY_LIGHT,
  SEA_AND_SKY_DARK,
  PLAYFUL_LIGHT,
  PLAYFUL_DARK,
  CALM_SERENE_LIGHT,
  CALM_SERENE_DARK,
  ENERGETIC_BOLD_LIGHT,
  ENERGETIC_BOLD_DARK,
  COZY_WARM_LIGHT,
  COZY_WARM_DARK,
  FRESH_UPLIFTING_LIGHT,
  FRESH_UPLIFTING_DARK,
  MINIMAL_MODERN_LIGHT,
  MINIMAL_MODERN_DARK,
  LUXURIOUS_ELEGANT_LIGHT,
  LUXURIOUS_ELEGANT_DARK,
  CLASSIC_MONOCHROME_LIGHT,
  CLASSIC_MONOCHROME_DARK,
  NAVY_SILVER_LIGHT,
  NAVY_SILVER_DARK,
  SLATE_CHARCOAL_LIGHT,
  SLATE_CHARCOAL_DARK,
  MIDNIGHT_PLATINUM_LIGHT,
  MIDNIGHT_PLATINUM_DARK,
  BURGUNDY_IVORY_LIGHT,
  BURGUNDY_IVORY_DARK,
  EXEC_BLUE_STEAL_LIGHT,
  EXEC_BLUE_STEAL_DARK,
} from "../assets/colors/COLORS";
import { useAuth } from "./AuthContext";

const ThemeContext = createContext();

export const themes = {
  default: { light: DEFAULT_LIGHT, dark: DEFAULT_DARK },
  earthyBrown: { light: EARTHY_BROWN_LIGHT, dark: EARTHY_BROWN_DARK },
  seaAndSky: { light: SEA_AND_SKY_LIGHT, dark: SEA_AND_SKY_DARK },
  playful: { light: PLAYFUL_LIGHT, dark: PLAYFUL_DARK },
  calmSerene: { light: CALM_SERENE_LIGHT, dark: CALM_SERENE_DARK },
  energeticBold: { light: ENERGETIC_BOLD_LIGHT, dark: ENERGETIC_BOLD_DARK },
  cozyWarm: { light: COZY_WARM_LIGHT, dark: COZY_WARM_DARK },
  freshUplifting: { light: FRESH_UPLIFTING_LIGHT, dark: FRESH_UPLIFTING_DARK },
  minimalModern: { light: MINIMAL_MODERN_LIGHT, dark: MINIMAL_MODERN_DARK },
  luxuriousElegant: {
    light: LUXURIOUS_ELEGANT_LIGHT,
    dark: LUXURIOUS_ELEGANT_DARK,
  },
  classicMonochrome: {
    light: CLASSIC_MONOCHROME_LIGHT,
    dark: CLASSIC_MONOCHROME_DARK,
  },
  navySilver: { light: NAVY_SILVER_LIGHT, dark: NAVY_SILVER_DARK },
  slateCharcoal: { light: SLATE_CHARCOAL_LIGHT, dark: SLATE_CHARCOAL_DARK },
  midnightPlatinum: {
    light: MIDNIGHT_PLATINUM_LIGHT,
    dark: MIDNIGHT_PLATINUM_DARK,
  },
  burgundyIvory: { light: BURGUNDY_IVORY_LIGHT, dark: BURGUNDY_IVORY_DARK },
  execBlueSteal: { light: EXEC_BLUE_STEAL_LIGHT, dark: EXEC_BLUE_STEAL_DARK },
};

export const ThemeProvider = ({ children }) => {
  const {isAuthenticated} = useAuth();
  const [themeName, setThemeName] = useState("default");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [open, setOpen] = useState(false);
  const [openItems, setOpenItems] = useState([]);
  const { saveTheme, loadTheme } = useThemePersistence();

  useEffect(() => {
    if(isAuthenticated){
    const initTheme = async () => {
      const savedTheme = await loadTheme();
      if (savedTheme) {
        const { theme, mode } = savedTheme;
        setThemeName(theme);
        setIsDarkMode(mode === "dark");
      }
    };
    initTheme();
  }
  }, [isAuthenticated]);

  const Colortheme = themes[themeName][isDarkMode ? "dark" : "light"];

  const setTheme = (theme) => {
    setThemeName(theme);
    saveTheme(theme, isDarkMode ? "dark" : "light");
  };

  const toggleMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    saveTheme(themeName, newMode ? "dark" : "light");
  };

  const toggleModeNotLoggedIn = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
  };

  const toggleDrawer = () => {
    setOpen(!open);
    if (open) {
      setOpenItems([]);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        Colortheme,
        setTheme,
        setThemeName,
        setIsDarkMode,
        toggleMode,
        toggleModeNotLoggedIn,
        themeName,
        isDarkMode,
        open,
        openItems,
        toggleDrawer,
        setOpen,
        setOpenItems,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext }; // Ensure ThemeContext is exported
export default ThemeContext;
