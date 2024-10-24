import React, { useContext } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import ThemeContext from "../../contexts/ThemeContext";

const MainContentBox = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { Colortheme } = useContext(ThemeContext);
  return (
    <Box
      height={"100%"}
      width={isMobile ? "85%" : "95%"}
      borderRadius={"20px"}
      sx={{ backgroundColor: Colortheme.secondaryBG }}
      mt={2}
      p={2}
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
