// CustomAlertModal.js
import * as React from "react";
import { Box, useMediaQuery, useTheme, Typography, IconButton } from "@mui/material";
import { useToast } from "../contexts/ToastContext";
import { AnimatePresence, motion } from "framer-motion";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
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

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 200, damping: 20 }
    },
    exit: { 
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.15 }
    }
  };

  return (
    <AnimatePresence mode="wait">
      <Backdrop 
        open={open} 
        sx={{ 
          zIndex: 99999,
          backgroundColor: "rgba(0, 0, 0, 0.7)"
        }}
      >
        {open && (
          <Box
            component={motion.div}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            display="flex"
            flexDirection="column"
            sx={{
              backgroundColor: Colortheme.secondaryBG,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
              position: "relative",
              maxWidth: isMobile ? "90%" : "400px",
              width: "100%",
              minHeight: dialogMsg ? (isMobile ? "180px" : "200px") : (isMobile ? "120px" : "140px"),
              display: "flex",
              flexDirection: "column",
              justifyContent: dialogMsg ? "flex-start" : "center",
              paddingBottom: dialogMsg ? 4 : 3
            }}
            p={4}
            borderRadius="16px"
          >
            <IconButton
              onClick={hideAlertDialog}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: Colortheme.text,
                "&:hover": {
                  backgroundColor: `${Colortheme.text}15`
                }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>

            {!dialogMsg && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <WarningAmberIcon 
                  sx={{ 
                    fontSize: 40, 
                    color: 'orange',
                    opacity: 0.8
                  }} 
                />
              </Box>
            )}


            <Typography
              variant={isMobile ? "h6" : "h5"}
              component="h2"
              sx={{
                color: Colortheme.text,
                fontWeight: 600,
                mb: dialogMsg ? 2 : 3,
                mt: 1,
                userSelect: "none",
                textAlign: dialogMsg ? "left" : "center"
              }}
            >
              {title} ?
            </Typography>

           
            {dialogMsg && (
              <Typography
                variant="body1"
                sx={{
                  color: Colortheme.text,
                  mb: 4,
                  flex: 1
                }}
              >
                {dialogMsg}
              </Typography>
            )}
            <Box 
              display="flex" 
              flexDirection="row" 
              gap={2} 
              justifyContent="space-around"
              width="100%"
              mt={dialogMsg ? 'auto' : 0}
            >
              <StyledButton
                bgColor={`${Colortheme.text}20`}
                textColor={Colortheme.text}
                onClick={hideAlertDialog}
                style={{
                  width: dialogMsg ? (isMobile ? 100 : 120) : (isMobile ? 120 : 140),
                  fontWeight: 500
                }}
              >
                Cancel
              </StyledButton>
              <StyledButton
                bgColor={Colortheme.text}
                textColor={Colortheme.background}
                bgColorHover={"#ff4444"}
                textColOnHover={"white"}
                onClick={() => {
                  handleAction();
                  hideAlertDialog();
                }}
                style={{
                  width: dialogMsg ? (isMobile ? 100 : 120) : (isMobile ? 120 : 140),
                  fontWeight: 500
                }}
              >
                Confirm
              </StyledButton>
            </Box>
          </Box>
        )}
      </Backdrop>
    </AnimatePresence>
  );
}
