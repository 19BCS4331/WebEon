import * as React from "react";
import { Box } from "@mui/material";
import { useToast } from "../contexts/ToastContext";
import { COLORS } from "../assets/colors/COLORS";
import { AnimatePresence, motion } from "framer-motion";
import CancelIcon from "@mui/icons-material/Cancel";

export default function CustomAlertModal({ handleAction }) {
  const { alertModal, hideAlertDialog } = useToast();

  const { open, title, DialogMsg } = alertModal;
  //   const [open, setOpen] = React.useState(false);

  return (
    <AnimatePresence>
      {open && (
        <Box
          component={motion.div}
          display={"flex"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          sx={{ backgroundColor: "black" }}
          height={"100vh"}
          //   mt={-13}
          width={"100%"}
          position={"absolute"}
          top={0}
          zIndex={999}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <Box
            component={motion.div}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100, opacity: 0 }}
            display={"flex"}
            flexDirection={"column"}
            sx={{ backgroundColor: COLORS.secondaryBG }}
            width={"20vw"}
            height={"20vh"}
            alignItems={"center"}
            justifyContent={"center"}
            borderRadius={"30px"}
          >
            <CancelIcon
              onClick={hideAlertDialog}
              className="CancelIcon"
              style={{
                alignSelf: "flex-end",
                marginRight: 20,

                cursor: "pointer",
              }}
            />
            <p style={{ color: "white", fontSize: 20, userSelect: "none" }}>
              {title} ?
            </p>
            <Box>{DialogMsg}</Box>

            <Box display={"flex"} flexDirection={"row"} gap={3}>
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
                onClick={handleAction}
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
        </Box>
      )}
    </AnimatePresence>
  );
}
