import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import { useToast } from "../../contexts/ToastContext";
import { AuthContext } from "../../contexts/AuthContext";
import CustomAlertModal from "../CustomAlertModal";
import ThemeContext from "../../contexts/ThemeContext";
import ThemeToggleButton from "./ThemeToggleButton";

const Topbar = ({ title }) => {
  const { Colortheme } = useContext(ThemeContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { logout, username, counter, finyear, branch } =
    useContext(AuthContext);
  const [isProfileVis, setIsProfileVis] = useState(false);

  const { showAlertDialog, hideAlertDialog, showToast, hideToast } = useToast();

  const navigate = useNavigate();

  const handleProfileToggle = (e) => {
    e.stopPropagation();
    setIsProfileVis(!isProfileVis);
  };

  useEffect(() => {
    const closeProfileDropdown = (e) => {
      if (isProfileVis && e.target.closest(".ProfileBox") === null) {
        setIsProfileVis(false);
      }
    };

    document.addEventListener("click", closeProfileDropdown);
    return () => {
      document.removeEventListener("click", closeProfileDropdown);
    };
  }, [isProfileVis]);

  const handleNavtoDash = () => {
    showAlertDialog("Navigate to Dashboard", "", () => handleNavtoDashAction());
  };

  const handleNavtoDashAction = () => {
    navigate("/Dashboard");
    hideAlertDialog();
  };

  const handleLogoutAuth = async () => {
    logout();
    showToast("Successfully Logged Out!", "success");
    setTimeout(() => {
      hideToast();
    }, 1000);
  };

  return (
    <Box>
      <Box
        component={motion.div}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        display={"flex"}
        height={"10vh"}
        width={isMobile ? "70vw" : "99vw"}
        borderRadius={"20px"}
        sx={{ backgroundColor: Colortheme.secondaryBG }}
        mt={2}
        ml={1}
        alignItems={"center"}
        justifyContent={
          isMobile
            ? title !== "Dashboard"
              ? "space-between"
              : "space-around"
            : "space-between"
        }
      >
        {title !== "Dashboard" && (
          <HomeIcon
            sx={{
              marginLeft: isMobile ? "40px" : "80px",
              fontSize: isMobile ? 30 : 40,
              color: Colortheme.text, // Use the text color from the ThemeContext
              transition: "0.3s", // Add transition for smoother styles
              "&:hover": {
                opacity: 0.6, // Change color on hover
                cursor: "pointer",
              },
            }}
            onClick={handleNavtoDash}
          />
        )}
        <h1
          style={
            title === "Dashboard"
              ? {
                  color: Colortheme.text,
                  userSelect: "none",
                  marginLeft: isMobile ? "0%" : "45%",
                  fontSize: isMobile ? 25 : 35,
                }
              : {
                  color: Colortheme.text,
                  userSelect: "none",
                  fontSize: isMobile ? 15 : 35,
                  textAlign: "center",
                }
          }
        >
          {title}
        </h1>

        <AccountCircleIcon
          // className="ProfileIcon"
          onClick={handleProfileToggle}
          sx={{
            marginRight: "40px",
            fontSize: isMobile ? 30 : 40,
            color: Colortheme.text, // Use the text color from the ThemeContext
            transition: "0.3s", // Add transition for smoother styles
            "&:hover": {
              opacity: 0.6, // Change color on hover
              cursor: "pointer",
            },
          }}
        />

        <AnimatePresence>
          {isProfileVis && (
            <Box
              className="ProfileBox"
              display={"flex"}
              component={motion.div}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 100 }}
              exit={{ y: -20, opacity: 0 }}
              flexDirection={"column"}
              alignItems={"center"}
              height={"50%"}
              sx={{
                border: "solid",
                borderWidth: "2px",
                borderColor: Colortheme.text,
                backgroundColor: Colortheme.secondaryBG,
                width: "auto",
                position: "absolute",
                top: 80,
                right: 10,
                bottom: 0,
                zIndex: 99999,
                borderRadius: "20px",
                p: 4,
                color: Colortheme.text,
              }}
            >
              <p className="ProfileInfo" style={{ fontWeight: "bold" }}>
                {username ? username : "User"}
              </p>
              <hr style={{ width: 100 }} />
              <p className="ProfileInfo">
                {branch ? branch.vBranchCode + " Branch" : "No Branch"}
              </p>
              <hr style={{ width: 100 }} />
              <p className="ProfileInfo">
                {counter ? "Counter " + counter.nCounterID : "No Counter"}
              </p>
              <hr style={{ width: 100 }} />
              <p className="ProfileInfo">{finyear ? finyear : "No FinYear"}</p>
              <hr style={{ width: 100 }} />
              <Box mt={2}>
                <ThemeToggleButton />
              </Box>
              <hr style={{ width: 100, marginTop: 20 }} />
              <Box
                display={"flex"}
                alignItems={"center"}
                mt={2}
                gap={2}
                onClick={handleLogoutAuth}
                sx={{ cursor: "pointer" }}
              >
                Logout
                <LogoutIcon />
              </Box>
            </Box>
          )}
        </AnimatePresence>
      </Box>
      {title !== "Dashboard" && <CustomAlertModal />}
    </Box>
  );
};

export default Topbar;
