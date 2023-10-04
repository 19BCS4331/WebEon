import React from "react";
import { Box } from "@mui/material";

const MainContentBox = ({ children }) => {
  return (
    <Box
      height={"85vh"}
      width={"80vw"}
      borderRadius={"20px"}
      sx={{ backgroundColor: "#8d99ae" }}
      mt={2}
      ml={2}
      display={"flex"}
      flexDirection={"column"}
      alignItems={"center"}
      gap={5}
    >
      {children}
    </Box>
  );
};

export default MainContentBox;
