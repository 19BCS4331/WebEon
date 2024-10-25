// CustomAlertModal.js
import * as React from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { useToast } from "../contexts/ToastContext";
import { AnimatePresence, motion } from "framer-motion";
import CancelIcon from "@mui/icons-material/Cancel";
import Backdrop from "@mui/material/Backdrop";
import ThemeContext from "../contexts/ThemeContext";
import { useContext } from "react";
import StyledButton from "./global/StyledButton";

export default function CustomAlertModal() {
  const { Colortheme } = useContext(ThemeContext);
  const { alertModal, hideAlertDialog } = useToast();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
            width={isMobile ? "60%" : "auto"}
            height={isMobile ? "100px" : "auto"}
            p={5}
            pt={isMobile ? 2 : 5}
            alignItems={"center"}
            // justifyContent={"center"}
            borderRadius={"30px"}
          >
            <p
              style={{
                color: Colortheme.text,
                fontSize: isMobile ? 16 : 20,
                userSelect: "none",
              }}
            >
              {title} ?
            </p>
            <Box>{dialogMsg}</Box>
            <Box display={"flex"} flexDirection={"row"} gap={3} marginTop={2}>
              <Box>
                <StyledButton
                  // className="AlertDialogButtons"
                  bgColor={Colortheme.text}
                  textColor={Colortheme.background}
                  onClick={hideAlertDialog}
                  style={{
                    // border: "none",
                    width: isMobile ? 100 : 120,
                    // borderRadius: 20,
                    // height: 40,
                    // fontSize: 18,
                  }}
                >
                  No
                </StyledButton>
              </Box>
              <StyledButton
                // className="AlertDialogButtons"
                bgColor={Colortheme.text}
                textColor={Colortheme.background}
                bgColorHover={"red"}
                textColOnHover={"white"}
                onClick={() => {
                  handleAction();
                  hideAlertDialog();
                }}
                style={{
                  // border: "none",
                  width: isMobile ? 100 : 120,
                  // borderRadius: 20,
                  // height: 40,
                  // fontSize: 18,
                }}
              >
                Yes
              </StyledButton>
            </Box>
          </Box>
        )}
      </Backdrop>
    </AnimatePresence>
  );
}
