// CustomAlertModal.js
import * as React from "react";
import { Box } from "@mui/material";
import { useToast } from "../contexts/ToastContext";
import { AnimatePresence, motion } from "framer-motion";
import CancelIcon from "@mui/icons-material/Cancel";
import Backdrop from "@mui/material/Backdrop";
import ThemeContext from "../contexts/ThemeContext";
import { useContext } from "react";

export default function CustomAlertModal() {
  const { Colortheme } = useContext(ThemeContext);
  const { alertModal, hideAlertDialog } = useToast();

  const { open, title, dialogMsg, handleAction } = alertModal;

  return (
    <AnimatePresence>
      <Backdrop open={open} style={{ zIndex: 99999 }}>
        {open && (
          <Box
            component={motion.div}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100, opacity: 0 }}
            display={"flex"}
            flexDirection={"column"}
            sx={{ backgroundColor: Colortheme.secondaryBG }}
            width={"auto"}
            p={5}
            alignItems={"center"}
            // justifyContent={"center"}
            borderRadius={"30px"}
          >
            <p
              style={{
                color: Colortheme.text,
                fontSize: 20,
                userSelect: "none",
              }}
            >
              {title} ?
            </p>
            <Box>{dialogMsg}</Box>
            <Box display={"flex"} flexDirection={"row"} gap={3} marginTop={2}>
              <Box>
                <button
                  className="AlertDialogButtons"
                  onClick={hideAlertDialog}
                  style={{
                    border: "none",
                    width: 120,
                    borderRadius: 20,
                    height: 40,
                    fontSize: 18,
                  }}
                >
                  No
                </button>
              </Box>
              <button
                className="AlertDialogButtons"
                onClick={() => {
                  handleAction();
                  hideAlertDialog();
                }}
                style={{
                  border: "none",
                  width: 120,
                  borderRadius: 20,
                  height: 40,
                  fontSize: 18,
                }}
              >
                Yes
              </button>
            </Box>
          </Box>
        )}
      </Backdrop>
    </AnimatePresence>
  );
}
