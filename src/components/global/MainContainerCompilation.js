import React, { useContext } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import ThemeContext from "../../contexts/ThemeContext";
import Topbar from "./Topbar";
import LazyFallBack from "../../pages/LazyFallBack";

const MainContainer = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { Colortheme } = useContext(ThemeContext);

  return (
    <Box
      display="flex"
      height="100vh"
      width="100vw"
      flexDirection="column"
      sx={{
        backgroundColor: Colortheme.background,
        alignItems: isMobile ? "center" : "flex-start",
      }}
    >
      {children}
    </Box>
  );
};

const ContentLayout = ({ children }) => {
  const { Colortheme } = useContext(ThemeContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <AnimatePresence mode="wait">
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
        layout
        display="flex"
        width="100%"
        height="80%"
        flexDirection="row"
        justifyContent="center"
      >
        <Box
          height="98%"
          width={isMobile ? "85%" : "95%"}
          borderRadius="20px"
          mt={2}
          p={isMobile ? 2 : 3}
          display="flex"
          flexDirection="column"
          sx={{
            backgroundColor: Colortheme.secondaryBG,
            alignItems: "center",
            justifyContent: "center",
            gap: isMobile ? 2 : 5,
          }}
        >
          {children}
        </Box>
      </Box>
    </AnimatePresence>
  );
};

const MainContainerCompilation = ({ children, title, loading }) => {
  if (loading) {
    return (
      <MainContainer>
        <LazyFallBack />
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <Topbar title={title} />
      <ContentLayout>{children}</ContentLayout>
    </MainContainer>
  );
};

export default MainContainerCompilation;
