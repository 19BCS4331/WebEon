import React, { useContext } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { COLORS } from "../../assets/colors/COLORS";
import ThemeContext from "../../contexts/ThemeContext";

const MainBackBox = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { Colortheme } = useContext(ThemeContext);
  return (
    <Box
      display={"flex"}
      height={"100vh"}
      flexDirection={"column"}
      sx={{ backgroundColor: Colortheme.background }}
      alignItems={isMobile ? "center" : "flex-start"}
    >
      {children}
    </Box>
  );
};

export default MainBackBox;
