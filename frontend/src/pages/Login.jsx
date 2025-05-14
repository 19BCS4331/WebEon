import { Box, useMediaQuery, useTheme, Typography, IconButton } from "@mui/material";
import React, { useEffect, useState, useContext } from "react";
import "../css/pages/Login.css";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "../contexts/ToastContext";
import { AuthContext } from "../contexts/AuthContext";
import CircularProgress from "@mui/material/CircularProgress";
import ThemeContext from "../contexts/ThemeContext";
import KeyboardBackspace from "@mui/icons-material/KeyboardBackspace";
import StyledButton from "../components/global/StyledButton";
import CustomTextField from "../components/global/CustomTextField";
import CustomAutocomplete from "../components/global/CustomAutocomplete";
import ThemeToggleButton from "../components/global/ThemeToggleButton";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LockIcon from '@mui/icons-material/Lock';
import BusinessIcon from '@mui/icons-material/Business';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import DateRangeIcon from '@mui/icons-material/DateRange';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { fetchBranchesData, fetchCounters, fetchFinYearData, loginPreFetch } from "../services/routeServices/authService";

const LoginNew = () => {
  const { Colortheme } = useContext(ThemeContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const { showToast, hideToast } = useToast();
  const {
    login,
    branch,
    setBranch,
    counter,
    setCounter,
    finyear,
    setFinyear,
    isAuthenticated,
    setUserId,
    userId,
    username,
    setUsername,
    setToken,
  } = useContext(AuthContext);

  const [branches, setBranches] = useState([]);
  const [counters, setCounters] = useState([]);
  const [finYearOptions, setFinYearOptions] = useState([]);
  const [finYearLoading, setFinYearLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successRes, setSuccessRes] = useState({});
  const [isLowerInputsVis, setIsLowerInputsVis] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/Dashboard");
    }
  }, [isAuthenticated,navigate]);

  const fetchBranches = async (username) => {
    try {
      const data = await fetchBranchesData(username);
      setBranches(data);
    } catch (err) {
      console.error("Error fetching branches:", err);
    }
  };

  useEffect(() => {
    if (branch) {
      const fetchCountersData = async () => {
        try {
          const data = await fetchCounters(branch, successRes);
          setCounters(data);
        } catch (err) {
          console.error("Error fetching counters:", err);
        }
      };
      fetchCountersData();
    } else {
      setCounters([]);
      setCounter(null);
    }
  }, [branch, username, successRes]);

  useEffect(() => {
    const fetchFinYearDataAsync = async () => {
      setFinYearLoading(true);
      try {
        const data = await fetchFinYearData();
        const currentDate = new Date();

        const formattedData = data.map((finyear) => ({
          ...finyear,
          value: `${formatDate(finyear.fromDate)} - ${formatDate(finyear.tillDate)}`,
        }));

        // Filter to get only the current financial year
        const currentFinYear = formattedData.filter((finyear) => {
          const fromDate = new Date(finyear.fromDate);
          const tillDate = new Date(finyear.tillDate);
          return currentDate >= fromDate && currentDate <= tillDate;
        });

        console.log("Current financial year:", currentFinYear);
        setFinYearOptions(currentFinYear);
        
        // If we have a current financial year and no year is selected yet, set the first one as default
        if (currentFinYear.length > 0 && !finyear) {
          setFinyear(currentFinYear[0]);
        }
      } catch (error) {
        console.error("Error fetching financial years:", error);
        showToast("Failed to load financial years", "fail");
      } finally {
        setFinYearLoading(false);
      }
    };

    fetchFinYearDataAsync();
  }, [finyear, setFinyear, showToast]);

  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };

  const ProceedClick = async () => {
    setIsLoading(true);
    try {
      const { token, user } = await loginPreFetch(username, password);

      if (token) {
        setToken(token);
        setUserId(user.nUserID);
        setUsername(user.vUID);
      }

      setSuccessRes(user);
      await fetchFinYearData();

      if (user) {
        await fetchBranches(user.vUID);
      }

      setIsLowerInputsVis(true);
      setErrorMsg("");
      setPassword("");
    } catch (error) {
      const errorMessage = error.response?.data?.error || "An error occurred";
      console.error(errorMessage);
      setErrorMsg(errorMessage);
      showToast(errorMessage, "error");
      setIsLowerInputsVis(false);
    } finally {
      setIsLoading(false);
      setTimeout(hideToast, 800);
    }
  };

  const loginUser = async () => {
    setIsLoading(true);

    if (!branch || !finyear || !counter) {
      showToast("Please Enter All Details!", "error");
      setIsLoading(false);
      setTimeout(hideToast, 1000);
      return;
    }

    try {
      await login();

      localStorage.setItem("branch", JSON.stringify(branch));
      localStorage.setItem("finyear", JSON.stringify(finyear));
      localStorage.setItem("counter", JSON.stringify(counter));
      setFinyear(finyear.value);

      showToast("Successfully Logged In!", "success");
      navigate("/Dashboard");

      // Optionally schedule logout after 1 hour
    } catch (error) {
      const errorMessage = error.response?.data?.msg || "An error occurred";
      console.error(errorMessage);
      setErrorMsg(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
      setTimeout(hideToast, 800);
    }
  };

  const handleBackClick = () => {
    setIsLowerInputsVis(false);
    setBranch(null);
    setCounter(null);
    setFinyear(null);
    setCounters([]);
  };

  const handleFinYearChange = (event, newValue) => {
    setFinyear(newValue);
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        backgroundColor: Colortheme.background,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        // p: isMobile ? 2 : 4,
      }}
    >
      {/* Theme Toggle */}
      <Box position="absolute" top={20} right={20} zIndex={2}>
        <ThemeToggleButton isLoggedIn={false} />
      </Box>

      {/* Background Decorative Elements */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.6, scale: 1 }}
        transition={{ duration: 0.8 }}
        sx={{
          backgroundColor: Colortheme.text,
          height: isMobile ? "150px" : isTablet ? "300px" : "400px",
          width: isMobile ? "150px" : isTablet ? "300px" : "400px",
          position: "absolute",
          zIndex: 1,
          top: isMobile ? "5%" : "-10%",
          left: isMobile ? "-20%" : "-10%",
          borderRadius: "50%",
          filter: "blur(5px)",
          transform: "rotate(-5deg)",
        }}
      />

      <Box
        component={motion.div}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.6, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        sx={{
          backgroundColor: Colortheme.text,
          height: isMobile ? "150px" : isTablet ? "300px" : "400px",
          width: isMobile ? "150px" : isTablet ? "300px" : "400px",
          position: "absolute",
          zIndex: 1,
          bottom: isMobile ? "5%" : "2%",
          right: isMobile ? "-20%" : "-5%",
          borderRadius: "50%",
          filter: "blur(5px)",
          transform: "rotate(5deg)",
        }}
      />

      {/* Main Content */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          gap: isMobile ? 2 : 3,
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: "1200px",
          maxHeight: "100%",
        }}
      >
        {/* Title */}
        <Box
          component={motion.div}
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          sx={{
            width: "100%",
            textAlign: "center",
            mb: isMobile ? 1 : 2,
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontFamily: "Poppins",
              color: Colortheme.text,
              textAlign: "center",
              fontSize: isMobile ? "24px" : isTablet ? "32px" : "42px",
              fontWeight: "bold",
              letterSpacing: "1px",
              textShadow: "0px 2px 4px rgba(0,0,0,0.1)",
              mb: 1,
              lineHeight: 1.2,
            }}
          >
            Maraekat's Advanced EON
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              fontFamily: "Poppins",
              color: Colortheme.text,
              opacity: 0.8,
              fontSize: isMobile ? "14px" : "16px",
              lineHeight: 1.2,
            }}
          >
            Your Gateway to Efficient Forex Management
          </Typography>
        </Box>

        {/* Login Container */}
        <Box
          component={motion.div}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          sx={{
            display: "flex",
            backgroundColor: Colortheme.secondaryBG,
            width: "100%",
            maxWidth: isMobile ? "85%" : isTablet ? "80%" : "500px",
            borderRadius: "20px",
            alignItems: "center",
            flexDirection: "column",
            padding: isMobile ? "20px" : "32px",
            boxShadow: "0px 8px 32px rgba(0,0,0,0.12)",
            backdropFilter: "blur(8px)",
            border: `1px solid ${Colortheme.text}10`,
            position: "relative",
            overflow: "visible",
          }}
        >
          {/* Login Title */}
          <Typography
            variant="h4"
            sx={{
              fontFamily: "Poppins",
              color: Colortheme.text,
              fontSize: isMobile ? "24px" : "30px",
              fontWeight: "600",
              marginBottom: 3,
            }}
          >
            Welcome Back
          </Typography>

          {/* Back Button */}
          {isLowerInputsVis && (
            <IconButton
              onClick={handleBackClick}
              sx={{
                position: "absolute",
                left: isMobile ? 10 : 20,
                top: isMobile ? 10 : 20,
                color: Colortheme.text,
              }}
            >
              <KeyboardBackspace />
            </IconButton>
          )}

          {isLowerInputsVis ? (
            <AnimatePresence>
              <Box
                component={motion.div}
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                {/* Branch and Counter Selection */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    width: "100%",
                    flexDirection: isMobile ? "column" : "row",
                    marginTop: 2,
                  }}
                >
                  <Box sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    flex: 1,
                    width: "100%",
                  }}>
                    <BusinessIcon sx={{ 
                      color: Colortheme.text,
                      mr: 1,
                      fontSize: isMobile ? "20px" : "24px"
                    }} />
                    <CustomAutocomplete
                      disablePortal
                      id="BranchSelect"
                      options={branches}
                      getOptionLabel={(option) => option.vBranchCode}
                      isOptionEqualToValue={(option, value) =>
                        option.nBranchID === value.nBranchID
                      }
                      value={branch || null}
                      onChange={(event, newValue) => setBranch(newValue)}
                      style={{ width: "100%" }}
                      label="Branch"
                    />
                  </Box>

                  <Box sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    flex: 1,
                    width: "100%",
                  }}>
                    <PointOfSaleIcon sx={{ 
                      color: Colortheme.text,
                      mr: 1,
                      fontSize: isMobile ? "20px" : "24px"
                    }} />
                    <CustomAutocomplete
                      disablePortal
                      id="CounterSelect"
                      noOptionsText="Select A Branch"
                      options={counters}
                      getOptionLabel={(option) => option.nCounterID.toString()}
                      isOptionEqualToValue={(option, value) =>
                        option.nCounterID === value.nCounterID
                      }
                      value={counter || null}
                      onChange={(event, newValue) => setCounter(newValue)}
                      style={{ width: "100%" }}
                      label="Counter"
                    />
                  </Box>
                </Box>

                {/* Financial Year Selection */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    marginTop: 3,
                  }}
                >
                  <DateRangeIcon sx={{ 
                    color: Colortheme.text,
                    mr: 1,
                    fontSize: isMobile ? "20px" : "24px"
                  }} />
                  <CustomAutocomplete
                    disablePortal
                    id="FinYearSelect"
                    options={finYearOptions}
                    getOptionLabel={(option) => option.value}
                    isOptionEqualToValue={(option, value) =>
                      option.nUniqCode === value.nUniqCode
                    }
                    value={finyear}
                    onChange={handleFinYearChange}
                    style={{ width: "100%" }}
                    styleTF={{width: "100%"}}
                    label="Financial Year"
                    loading={finYearLoading}
                    loadingText="Loading financial years..."
                    noOptionsText={finYearLoading ? "Loading..." : "No financial years available"}
                  />
                </Box>

                {/* Login Button */}
                <StyledButton
                  onClick={loginUser}
                  style={{
                    marginTop: "40px",
                    width: isMobile ? "100%" : "200px",
                    padding: isMobile ? "8px 20px" : "10px 40px",
                  }}
                  bgColor={Colortheme.text}
                  textColor={Colortheme.background}
                >
                  {isLoading ? (
                    <CircularProgress
                      size={isMobile ? "16px" : "20px"}
                      style={{ color: Colortheme.background }}
                    />
                  ) : (
                    "Login"
                  )}
                </StyledButton>
              </Box>
            </AnimatePresence>
          ) : (
            <Box
              component={motion.div}
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
              }}
            >
              {/* Username and Password Fields */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  width: "100%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <AccountCircleIcon sx={{ 
                    color: Colortheme.text,
                    mr: 1,
                    fontSize: isMobile ? "20px" : "24px"
                  }} />
                  <CustomTextField
                    autoComplete="off"
                    label="Username"
                    value={username}
                    error={errorMsg === "User does not exist !"}
                    onChange={(e) => setUsername(e.target.value)}
                    fullWidth
                    style={{width:'100%'}}
                    autofillStyle={{
                      background: Colortheme.secondaryBG,
                      textColor: Colortheme.text,
                      caretColor: Colortheme.text,
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    position: "relative"
                  }}
                >
                  <LockIcon sx={{ 
                    color: Colortheme.text,
                    mr: 1,
                    fontSize: isMobile ? "20px" : "24px"
                  }} />
                  <CustomTextField
                    autoComplete="off"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    error={errorMsg === "Incorrect Passsword"}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    style={{width:'100%'}}
                    autofillStyle={{
                      background: Colortheme.secondaryBG,
                      textColor: Colortheme.text,
                      caretColor: Colortheme.text,
                    }}
                  />
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    sx={{
                      position: "absolute",
                      right: "8px",
                      color: Colortheme.text,
                      padding: "4px",
                      "&:hover": {
                        backgroundColor: `${Colortheme.text}10`,
                      },
                    }}
                  >
                    {showPassword ? (
                      <VisibilityOff sx={{ fontSize: isMobile ? "18px" : "20px" }} />
                    ) : (
                      <Visibility sx={{ fontSize: isMobile ? "18px" : "20px" }} />
                    )}
                  </IconButton>
                </Box>
              </Box>

              {/* Proceed Button */}
              <StyledButton
                onClick={ProceedClick}
                style={{
                  marginTop: "40px",
                  width: isMobile ? "100%" : "200px",
                  padding: isMobile ? "8px 20px" : "10px 40px",
                }}
                bgColor={Colortheme.text}
                textColor={Colortheme.background}
              >
                {isLoading ? (
                  <CircularProgress
                    style={{ color: Colortheme.background }}
                    size={isMobile ? "16px" : "20px"}
                  />
                ) : (
                  "Proceed"
                )}
              </StyledButton>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default LoginNew;
