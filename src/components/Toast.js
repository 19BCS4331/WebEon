import React from "react";
import { Box } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import { useToast } from "../contexts/ToastContext";

const Toast = () => {
  const { toast } = useToast();

  const { show, message, type } = toast;

  return (
    <AnimatePresence>
      {show && (
        <Box
          component={motion.div}
          initial={{ y: -180 }}
          animate={{ y: 0 }}
          display={"flex"}
          exit={{ y: -180 }}
          alignItems={"center"}
          justifyContent={"center"}
          position={"absolute"}
          top={30}
          right={20}
          height={40}
          width={"auto"}
          borderRadius={20}
          sx={{ backgroundColor: "white", userSelect: "none" }}
          p={2}
          gap={2}
          zIndex={999999}
        >
          {type === "success" ? (
            <DoneIcon style={{ color: "green" }} />
          ) : (
            <CloseIcon style={{ color: "red" }} />
          )}
          {message}
        </Box>
      )}
    </AnimatePresence>
  );
};

export default Toast;
