import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, IconButton, useMediaQuery, useTheme } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import { useToast } from "../../contexts/ToastContext";
import { AuthContext } from "../../contexts/AuthContext";
import CustomAlertModal from "../CustomAlertModal";
import ThemeContext from "../../contexts/ThemeContext";
import ThemeToggleButton from "./ThemeToggleButton";
import ProfileDropdown from "./ProfileDropdown";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

const Topbar = ({ title }) => {
  const { Colortheme, toggleDrawer, open } = useContext(ThemeContext);
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
    <Box width={"100%"} display={"flex"} justifyContent={"center"}>
      <Box
        component={motion.div}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        display={"flex"}
        height={"10vh"}
        width={isMobile ? "85%" : "98%"}
        borderRadius={"20px"}
        sx={{ backgroundColor: Colortheme.secondaryBG }}
        mt={2}
        // ml={isMobile ? 1 : 1}
        alignItems={"center"}
        justifyContent={"space-between"}
        pl={isMobile ? 2 : "auto"}
        pr={isMobile ? 2 : "auto"}
      >
        <Box display={"flex"} alignItems={"center"} gap={isMobile ? 2 : 5}>
          <IconButton
            onClick={toggleDrawer}
            style={{
              marginLeft: isMobile ? "0px" : "40px",
              color: Colortheme.secondaryBG,
              backgroundColor: Colortheme.text,
              padding: "10px",
              borderRadius: "50%",
              boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
              width: 40,
              height: 40,
            }}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
          {title !== "Dashboard" && (
            <HomeIcon
              sx={{
                // marginLeft: isMobile ? "0px" : "-350px",
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
        </Box>
        <h1
          style={
            title === "Dashboard"
              ? {
                  color: Colortheme.text,
                  userSelect: "none",
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
            marginRight: isMobile ? "0px" : "40px",
            fontSize: isMobile ? 30 : 40,
            color: Colortheme.text, // Use the text color from the ThemeContext
            transition: "0.3s", // Add transition for smoother styles
            "&:hover": {
              opacity: 0.6, // Change color on hover
              cursor: "pointer",
            },
          }}
        />

        <ProfileDropdown
          isProfileVis={isProfileVis}
          username={username}
          branch={branch}
          counter={counter}
          finyear={finyear}
          handleLogoutAuth={() =>
            showAlertDialog("Log Out", "", () => handleLogoutAuth())
          }
          Colortheme={Colortheme}
          ThemeToggleButton={ThemeToggleButton}
        />
      </Box>
      <CustomAlertModal />
    </Box>
  );
};

export default Topbar;
