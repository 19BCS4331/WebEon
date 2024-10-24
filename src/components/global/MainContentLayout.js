import React from "react";
import { Box } from "@mui/material";
import { motion } from "framer-motion";

const MainContentLayout = ({ children }) => {
  return (
    <Box
      display={"flex"}
      width={"100%"}
      height={"80%"}
      flexDirection={"row"}
      component={motion.div}
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      justifyContent={"center"}
    >
      {children}
    </Box>
  );
};

export default MainContentLayout;
