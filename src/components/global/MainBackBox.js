import React from "react";
import { Box } from "@mui/material";
import { COLORS } from "../../assets/colors/COLORS";

const MainBackBox = ({ children }) => {
  return (
    <Box
      display={"flex"}
      height={"100vh"}
      flexDirection={"column"}
      sx={{ backgroundColor: COLORS.background }}
    >
      {children}
    </Box>
  );
};

export default MainBackBox;
