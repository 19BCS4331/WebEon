// ThemeContext.js
import React, { createContext, useState } from "react";
import { LIGHT_COLORS, DARK_COLORS } from "../assets/colors/COLORS";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const Colortheme = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ Colortheme, toggleTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext }; // Ensure ThemeContext is exported
export default ThemeContext;
