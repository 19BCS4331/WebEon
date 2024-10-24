// ThemeContext.js
import React, { createContext, useState } from "react";
import { LIGHT_COLORS, DARK_COLORS } from "../assets/colors/COLORS";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [open, setOpen] = useState(false);
  const [openItems, setOpenItems] = useState([]);

  const Colortheme = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
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
        toggleTheme,
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
