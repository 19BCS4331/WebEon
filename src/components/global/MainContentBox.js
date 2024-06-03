import React, { useContext } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import ThemeContext from "../../contexts/ThemeContext";

const MainContentBox = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { Colortheme } = useContext(ThemeContext);
  return (
    <Box
      height={"85vh"}
      width={isMobile ? "90vw" : "98vw"}
      borderRadius={"20px"}
      sx={{ backgroundColor: Colortheme.secondaryBG }}
      mt={2}
      ml={2}
      display={"flex"}
      flexDirection={"column"}
      alignItems={"center"}
      justifyContent={"center"}
      gap={5}
    >
      {children}
    </Box>
  );
};

export default MainContentBox;
