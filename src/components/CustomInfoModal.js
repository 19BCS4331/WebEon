// CustomInfoModal.js
import * as React from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { useToast } from "../contexts/ToastContext";
import { AnimatePresence, motion } from "framer-motion";
import Backdrop from "@mui/material/Backdrop";
import ThemeContext from "../contexts/ThemeContext";
import { useContext } from "react";
import StyledButton from "./global/StyledButton";

export default function CustomInfoModal() {
  const { Colortheme } = useContext(ThemeContext);
  const { infoModal, hideInfoModal } = useToast();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { open, title, dialogMsg } = infoModal;

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
            p={5}
            pt={isMobile ? 2 : 5}
            alignItems={"center"}
            // justifyContent={"center"}
            borderRadius={"30px"}
          >
            <h3
              style={{
                color: Colortheme.text,
                fontSize: isMobile ? 16 : 20,
                userSelect: "none",
              }}
            >
              {title}
            </h3>
            <Box
              sx={{
                color: Colortheme.text,
                fontSize: isMobile ? 12 : 15,
                textAlign: "center",
              }}
            >
              {dialogMsg}
            </Box>
            <Box display={"flex"} flexDirection={"row"} gap={3} marginTop={2}>
              <Box>
                <StyledButton

                  bgColor={Colortheme.text}
                  textColor={Colortheme.background}
                  onClick={hideInfoModal}
                  style={{
                    width: isMobile ? 100 : 120,
                    marginTop:10
                  }}
                >
                  Okay
                </StyledButton>
              </Box>
            </Box>
          </Box>
        )}
      </Backdrop>
    </AnimatePresence>
  );
}
