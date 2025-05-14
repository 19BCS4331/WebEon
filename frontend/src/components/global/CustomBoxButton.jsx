// CustomBoxButton.js
import React, { useContext, useState } from "react";
import { Box } from "@mui/material";
import ThemeContext from "../../contexts/ThemeContext";

const CustomBoxButton = ({ children, onClick, label }) => {
  const { Colortheme } = useContext(ThemeContext);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box 
      sx={{ position: "relative", width: "100%", height: "100%" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Label */}
      {label &&  <Box
        sx={{
        display:isHovered ? "none": "block",
          position: "absolute",
          top: "-10px",
          left: "10px",
          padding: "0 5px",
          backgroundColor: isHovered ? Colortheme.text : Colortheme.background,
          color: isHovered ? Colortheme.background : Colortheme.text,
          fontSize: "0.8rem",
          zIndex: 1,
          transition: "all 0.3s ease",
        }}
      >
        {label}
      </Box>}
     
      
      {/* Button Box */}
      <Box
        onClick={onClick}
        sx={{
          border: `1px solid ${Colortheme.text}`,
          borderRadius: isHovered ? "10px" : "5px",
          color: isHovered ? Colortheme.background : Colortheme.text,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          width: "100%",
          minHeight: "40px",
          position: "relative",
          backgroundColor: isHovered ? Colortheme.text : "transparent",
          transition: "all 0.3s ease",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default CustomBoxButton;
