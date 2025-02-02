// ThemeToggleButton.js
import React, { useContext } from "react";
import ThemeContext from "../../contexts/ThemeContext";
import { Button } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4"; // Dark mode icon
import Brightness7Icon from "@mui/icons-material/Brightness7"; // Light mode icon

const ThemeToggleButton = ({ isLoggedIn = true }) => {
  const { toggleMode, toggleModeNotLoggedIn, isDarkMode, Colortheme } =
    useContext(ThemeContext);

  return (
    <Button
      onClick={isLoggedIn ? toggleMode : toggleModeNotLoggedIn}
      size="15px"
      sx={{
        backgroundColor: Colortheme.background,
        color: Colortheme.text,
        "&:hover": {
          backgroundColor: Colortheme.text,
          color: Colortheme.background,
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
