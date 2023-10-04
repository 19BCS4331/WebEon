import React from "react";
import { Box } from "@mui/material";
import { motion } from "framer-motion";

const MainContentLayout = ({ children }) => {
  return (
    <Box
      display={"flex"}
      flexDirection={"row"}
      component={motion.div}
      initial={{ y: -50 }}
      animate={{ y: 0 }}
    >
      {children}
    </Box>
  );
};

export default MainContentLayout;
