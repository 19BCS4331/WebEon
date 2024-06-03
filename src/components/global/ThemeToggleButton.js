// ThemeToggleButton.js
import React, { useContext } from "react";
import ThemeContext from "../../contexts/ThemeContext";
import { Button } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4"; // Dark mode icon
import Brightness7Icon from "@mui/icons-material/Brightness7"; // Light mode icon

const ThemeToggleButton = () => {
  const { toggleTheme, isDarkMode } = useContext(ThemeContext);

  return (
    <Button
      onClick={toggleTheme}
      size="15px"
      //   startIcon={isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
      sx={{
        backgroundColor: isDarkMode ? "#333" : "#ddd",
        color: isDarkMode ? "#fff" : "#000",
        "&:hover": {
          backgroundColor: isDarkMode ? "#444" : "#ccc",
        },
        padding: "10px 20px",
        borderRadius: "8px",
        textTransform: "none",
      }}
    >
      {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
    </Button>
  );
};

export default ThemeToggleButton;
