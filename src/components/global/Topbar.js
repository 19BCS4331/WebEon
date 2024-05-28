import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
// import { COLORS } from "../../assets/colors/COLORS";
import { useToast } from "../../contexts/ToastContext";
import { AuthContext } from "../../contexts/AuthContext";
import axios from "axios";
import CustomAlertModal from "../CustomAlertModal";
import ThemeContext from "../../contexts/ThemeContext";
import { useBaseUrl } from "../../contexts/BaseUrl";

const Topbar = ({ title }) => {
  const { baseUrl } = useBaseUrl();
  const { Colortheme } = useContext(ThemeContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const {
    logout,
    setUserRole,
    loginData,
    setLoginData,
    finyear,
    setBranch,
    setCounter,
    setFinyear,

    setToken,
  } = useContext(AuthContext);
  const [isProfileVis, setIsProfileVis] = useState(false);

  const { showAlertDialog, hideAlertDialog, showToast, hideToast } = useToast();

  const navigate = useNavigate();

  const handleProfileToggle = (e) => {
    e.stopPropagation();
    setIsProfileVis(!isProfileVis);
  };

  const [userData, setUserData] = useState(null);

  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     const token = localStorage.getItem("token");
  //     const userid = localStorage.getItem("userid");

  //     // Check if user data exists in local storage
  //     const cachedUserData = JSON.parse(localStorage.getItem("userData"));

  //     // If user data exists and is not expired, set it
  //     if (cachedUserData) {
  //       setUserRole(cachedUserData.role);
  //       setUserData(cachedUserData);
  //     } else {
  //       try {
  //         // Fetch user data from the server
  //         const response = await axios.get(
  //           `${baseUrl}/api/users/userData/${userid}`,
  //           {
  //             headers: {
  //               Authorization: `Bearer ${token}`,
  //             },
  //           }
  //         );

  //         // Set user role and data from the response
  //         setUserRole(response.data.role);
  //         setUserData(response.data);

  //         // Update local storage with the new user data
  //         localStorage.setItem("userData", JSON.stringify(response.data));
  //       } catch (err) {
  //         console.error("Error", err);
  //         logout();
  //         showToast("Session Expired, Kindly Login Again", "Failed");
  //         setTimeout(() => {
  //           hideToast();
  //         }, 2500);
  //       }
  //     }
  //   };

  //   fetchUserData();
  // }, [setUserRole]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (loginData) {
          setUserData(loginData);
        }
      } catch (err) {
        console.error("Error", err);
        logout();
        showToast("Session Expired, Kindly Login Again", "Failed");
        setTimeout(() => {
          hideToast();
        }, 2500);
      }
    };

    fetchUserData();
  }, []);

  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     const token = localStorage.getItem("token");
  //     const userid = localStorage.getItem("userid");
  //     try {
  //       const response = await axios.get(
  //         `${baseUrl}/api/users/userData/${userid}`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );
  //       setUserRole(response.data.role);
  //       setUserData(response.data);
  //     } catch (err) {
  //       console.log("Error", err);
  //       logout();
  //       showToast("Session Expired, Kindly Login Again", "Failed");
  //       setTimeout(() => {
  //         hideToast();
  //       }, 2500);
  //     }
  //   };
  //   fetchUserData();
  // }, [setUserRole]);

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
      const response = axios.post(`${baseUrl}/api/auth/logout`, {
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
      setBranch("");
      setCounter("");
      setFinyear(null);
      localStorage.removeItem("finyear");
    } catch (error) {
      console.log("error occured", error);
    }
    localStorage.removeItem("token");
    setToken(null);
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
            className="ProfileIcon"
            style={{ marginLeft: 40, fontSize: isMobile ? 30 : 40 }}
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
          className="ProfileIcon"
          onClick={handleProfileToggle}
          style={{ marginRight: 40, fontSize: isMobile ? 30 : 40 }}
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
                borderColor: Colortheme.text,
                backgroundColor: Colortheme.background,
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
                  : finyear.value}
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
