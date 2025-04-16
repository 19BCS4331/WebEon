import React, { useContext } from "react";
import { Box } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import { useToast } from "../../contexts/ToastContext";
import ThemeContext from "../../contexts/ThemeContext";

const Toast = () => {
  const { toasts } = useToast();
  const { Colortheme } = useContext(ThemeContext);

  // Function to get the appropriate icon based on toast type
  const getToastIcon = (type) => {
    switch (type) {
      case "success":
        return <DoneIcon style={{ color: Colortheme.background || "green" }} />;
      case "error":
      case "fail":
        return <CloseIcon style={{ color: Colortheme.background || "red" }} />;
      case "info":
        return <InfoIcon style={{ color: Colortheme.background || "blue" }} />;
      case "warning":
        return <WarningIcon style={{ color: Colortheme.background || "orange" }} />;
      default:
        return <InfoIcon style={{ color: Colortheme.background || "blue" }} />;
    }
  };

  return (
    <AnimatePresence>
      {toasts.map((toast, index) => (
        <Box
          key={toast.id}
          component={motion.div}
          initial={{ y: -180, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
          position={"absolute"}
          top={30 + index * 80} // Stack toasts with 80px spacing
          right={20}
          height={"auto"}
          minHeight={40}
          width={"auto"}
          maxWidth={"400px"}
          borderRadius={20}
          sx={{
            backgroundColor: Colortheme.text,
            userSelect: "none",
            color: Colortheme.background,
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
          }}
          p={2}
          gap={2}
          zIndex={999999 - index} // Ensure proper stacking order
        >
          {getToastIcon(toast.type)}
          {toast.message}
        </Box>
      ))}
    </AnimatePresence>
  );
};

export default Toast;
