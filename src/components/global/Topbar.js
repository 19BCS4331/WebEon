import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import { COLORS } from "../../assets/colors/COLORS";
import { useToast } from "../../contexts/ToastContext";
import { AuthContext } from "../../contexts/AuthContext";
import axios from "axios";
import CustomAlertModal from "../CustomAlertModal";

const Topbar = ({ title }) => {
  const { logout, setUserRole } = useContext(AuthContext);
  const [isProfileVis, setIsProfileVis] = useState(false);

  const { showAlertDialog, hideAlertDialog, showToast, hideToast } = useToast();

  const navigate = useNavigate();

  const handleProfileToggle = (e) => {
    e.stopPropagation();
    setIsProfileVis(!isProfileVis);
  };

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      const userid = localStorage.getItem("userid");
      try {
        const response = await axios.get(
          `http://localhost:5001/api/users/userData/${userid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUserRole(response.data.role);
        setUserData(response.data);
      } catch (err) {
        console.log("Error", err);
        logout();
        showToast("Session Expired, Kindly Login Again", "Failed");
        setTimeout(() => {
          hideToast();
        }, 2500);
      }
    };
    fetchUserData();
  }, [setUserRole]);

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
    showAlertDialog(
      "Navigate to Dashboard",
      "Are you sure you want to back to the dashboard ?"
    );
  };

  const handleNavtoDashAction = () => {
    navigate("/Dashboard");
    hideAlertDialog();
  };

  const handleLogoutAuth = async () => {
    const userid = localStorage.getItem("userid");
    try {
      const response = axios.post("http://localhost:5001/api/auth/logout", {
        userid: userid,
      });
      console.log(response);
      // navigate("/");
      showToast("Successfully Logged Out!", "success");
      setTimeout(() => {
        hideToast();
      }, 1000);
      logout();
      localStorage.removeItem("branch");
      localStorage.removeItem("finyear");
    } catch (error) {
      console.log("error occured", error);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("userid");
  };

  return (
    <Box>
      <Box
        component={motion.div}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        display={"flex"}
        height={"10vh"}
        width={"99vw"}
        borderRadius={"20px"}
        sx={{ backgroundColor: COLORS.secondaryBG }}
        mt={2}
        ml={1}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        {title !== "Dashboard" && (
          <HomeIcon
            className="ProfileIcon"
            style={{ marginLeft: 40, fontSize: 40 }}
            onClick={handleNavtoDash}
          />
        )}
        <h1
          style={
            title === "Dashboard"
              ? {
                  color: "#edf2f4",
                  userSelect: "none",
                  marginLeft: "45%",
                }
              : {
                  color: "#edf2f4",
                  userSelect: "none",
                }
          }
        >
          {title}
        </h1>

        <AccountCircleIcon
          className="ProfileIcon"
          onClick={handleProfileToggle}
          style={{ marginRight: 40, fontSize: 40 }}
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
              height={"30vh"}
              sx={{
                border: "solid",
                borderWidth: "2px",
                borderColor: "white",
                backgroundColor: COLORS.background,
                width: "auto",
                position: "absolute",
                top: 80,
                right: 10,
                bottom: 0,
                zIndex: 99999,
                borderRadius: "20px",
                p: 4,
                color: "#edf2f4",
              }}
            >
              <p className="ProfileInfo" style={{ fontWeight: "bold" }}>
                {userData?.username || "User"}
              </p>
              <hr style={{ width: 100 }} />
              <p className="ProfileInfo">
                {localStorage.getItem("branch") === null
                  ? "No Branch"
                  : localStorage.getItem("branch") + " Branch"}
              </p>
              <hr style={{ width: 100 }} />
              <p className="ProfileInfo">
                {localStorage.getItem("finyear") === null
                  ? "No FinYear"
                  : localStorage.getItem("finyear")}
              </p>
              <hr style={{ width: 100 }} />
              <Box
                display={"flex"}
                alignItems={"center"}
                mt={1}
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
      {title !== "Dashboard" && (
        <CustomAlertModal handleAction={handleNavtoDashAction} />
      )}
    </Box>
  );
};

export default Topbar;
