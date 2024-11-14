import { Box, useMediaQuery, useTheme } from "@mui/material";
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
import {
  fetchBranchesData,
  fetchCounters,
  fetchFinYearData,
  loginPreFetch,
} from "../services/routeServices/authService";
import { apiClient } from "../services/apiClient";

const LoginNew = () => {
  const { Colortheme, setThemeName, setIsDarkMode } = useContext(ThemeContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successRes, setSuccessRes] = useState({});
  const [isLowerInputsVis, setIsLowerInputsVis] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/Dashboard");
    }
  }, [isAuthenticated, navigate]);

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
      try {
        const data = await fetchFinYearData();
        const currentDate = new Date();

        const formattedData = data.map((finyear) => ({
          ...finyear,
          value: `${formatDate(finyear.fromDate)} - ${formatDate(
            finyear.tillDate
          )}`,
        }));

        // Filter to get only the current financial year
        const currentFinYear = formattedData.filter((finyear) => {
          const fromDate = new Date(finyear.fromDate);
          const tillDate = new Date(finyear.tillDate);
          return currentDate >= fromDate && currentDate <= tillDate;
        });

        console.log("Current financial year:", currentFinYear);
        setFinYearOptions(currentFinYear);
      } catch (error) {
        console.error("Error fetching financial years:", error);
      }
    };

    fetchFinYearDataAsync();
  }, []);

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
        flex: 1,
        height: "100vh",
        backgroundColor: Colortheme.background,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box position={"absolute"} top={20} right={20}>
        <ThemeToggleButton isLoggedIn={false} />
      </Box>
      <Box
        sx={{ backgroundColor: Colortheme.text, opacity: 0.6 }}
        height={isMobile ? "200px" : "400px"}
        width={isMobile ? "200px" : "400px"}
        position={"absolute"}
        zIndex={1}
        top={isMobile ? 10 : -100}
        left={isMobile ? -100 : -150}
        borderRadius={100}
      />

      <Box
        sx={{ backgroundColor: Colortheme.text, opacity: 0.6 }}
        height={isMobile ? "200px" : "400px"}
        width={isMobile ? "200px" : "400px"}
        position={"absolute"}
        zIndex={1}
        bottom={isMobile ? 10 : 20}
        right={isMobile ? 10 : 50}
        borderRadius={100}
      />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          gap: 5,
        }}
        zIndex={99999}
      >
        <Box
          component={motion.div}
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h1
            style={{
              color: Colortheme.text,
              textAlign: "center",
              fontSize: isMobile ? "24px" : "auto",
              width: isMobile ? "50vw" : "auto",
              marginTop: isMobile ? "-80px" : "0px",
            }}
          >
            Maraekat's Advanced EON
          </h1>
        </Box>
        <Box
          component={motion.div}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          sx={{
            display: "flex",
            height: "auto",
            backgroundColor: Colortheme.secondaryBG,
            width: isMobile ? "70vw" : "30vw",
            borderRadius: "30px",
            alignItems: "center",
            flexDirection: "column",
            padding: 5,
            boxShadow: "0px 4px 8px 0px rgba(0,0,0,0.2);",
          }}
          // className="WhiteContainer"
        >
          <h1
            style={{
              color: Colortheme.text,
              fontSize: "30px",
            }}
          >
            Login
          </h1>
          {isLowerInputsVis && (
            <KeyboardBackspace
              onClick={handleBackClick}
              fontSize="large"
              sx={{
                alignSelf: "flex-start",
                color: Colortheme.text,
                position: "absolute",
                cursor: "pointer",
              }}
            />
          )}

          {isLowerInputsVis ? (
            <AnimatePresence>
              <Box
                component={motion.div}
                initial={{ x: 40 }}
                animate={{ x: 0 }}
                display={"flex"}
                flexDirection={"column"}
                alignItems={"center"}
              >
                <Box
                  display={"flex"}
                  gap={5}
                  width={"25vw"}
                  mt={3}
                  className="Inputs"
                >
                  <CustomAutocomplete
                    className="LowerInputs"
                    disablePortal
                    id="BranchSelect"
                    // options={branches.map((branch) => branch.vBranchCode)}
                    // isOptionEqualToValue={(option, value) =>
                    //   option.nBranchID === value.nBranchID
                    // }

                    options={branches}
                    getOptionLabel={(option) => option.vBranchCode}
                    isOptionEqualToValue={(option, value) =>
                      option.nBranchID === value.nBranchID
                    }
                    value={branch || null} // Set the value to the selectedBranch state
                    onChange={(event, newValue) => {
                      setBranch(newValue); // Update the selectedBranch state
                    }}
                    styleTF={{ width: isMobile ? "30vw" : "12vw" }}
                    label="Branch"
                  />
                  {/* <CustomTextField
                    disablePortal
                    select={true}
                    name="nBranchID"
                    label="Branch"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    style={{
                      width: isMobile ? "35vw" : "40vw",
                      zIndex: 9999999999,
                    }}
                    fullWidth
                  >
                    <MenuItem value="" key="select">
                      Select
                    </MenuItem>
                    {branches &&
                      branches.map((item) => (
                        <MenuItem value={item.value} key={item.nBranchID}>
                          {item.label}
                        </MenuItem>
                      ))}
                  </CustomTextField> */}

                  <CustomAutocomplete
                    className="LowerInputs"
                    disablePortal
                    id="CounterSelect"
                    noOptionsText={"Select A Branch"}
                    // options={counters.map((counter) =>
                    //   counter.nCounterID.toString()
                    // )}
                    // isOptionEqualToValue={(option, value) =>
                    //   option.nCounterID === value.nCounterID
                    // }
                    options={counters}
                    getOptionLabel={(option) => option.nCounterID.toString()}
                    isOptionEqualToValue={(option, value) =>
                      option.nCounterID === value.nCounterID
                    }
                    value={counter || null} // Set the value to the selectedBranch state
                    onChange={(event, newValue) => {
                      setCounter(newValue); // Update the selectedBranch state
                    }}
                    styleTF={{ width: isMobile ? "30vw" : "12vw" }}
                    label="Counter"
                  />
                </Box>
                <Box
                  display={"flex"}
                  gap={5}
                  width={"25vw"}
                  mt={5}
                  className="Inputs"
                >
                  {/* --------------PURPOSE-------------------- */}
                  {/* <Autocomplete
              className="LowerInputs"
              disablePortal
              id="PurposeSelect"
              options={counters.map((counter) => counter.name)}
              isOptionEqualToValue={(option, value) =>
                option.counterid === value.counterid
              }
              value={counter || ""}
              sx={{ width: isMobile ? "25vw" : "16vw" }}
              renderInput={(params) => (
                <CustomTextField {...params} label="Purpose" />
              )}
            /> */}
                  {/* --------------PURPOSE-------------------- */}

                  <CustomAutocomplete
                    className="LowerInputs"
                    disablePortal
                    id="FinYearSelect"
                    options={finYearOptions}
                    getOptionLabel={(option) => option.value}
                    isOptionEqualToValue={(option, value) =>
                      option.nUniqCode === value.nUniqCode
                    }
                    value={finyear}
                    onChange={handleFinYearChange}
                    styleTF={{ width: isMobile ? "69vw" : "26.5vw" }}
                    label="Financial Year"
                  />
                </Box>
                <Box
                  mt={2}
                  width={"100%"}
                  display={"flex"}
                  justifyContent={"center"}
                >
                  <StyledButton
                    onClick={loginUser}
                    style={{ marginTop: "40px" }}
                    bgColor={Colortheme.text}
                    textColor={Colortheme.background}
                  >
                    {isLoading ? (
                      <CircularProgress
                        size="20px"
                        style={{ color: Colortheme.background }}
                      />
                    ) : (
                      "Login"
                    )}
                  </StyledButton>
                </Box>
              </Box>
            </AnimatePresence>
          ) : (
            <Box
              component={motion.div}
              initial={{ x: -40 }}
              animate={{ x: 0 }}
              display={"flex"}
              flexDirection={"column"}
              alignItems={"center"}
            >
              <Box
                display={"flex"}
                gap={5}
                width={"25vw"}
                mt={2}
                className="Inputs"
                flexDirection={isMobile ? "column" : "row"}
              >
                <CustomTextField
                  autoComplete="off"
                  label="Username"
                  value={username}
                  error={
                    errorMsg && errorMsg === "User does not exist !"
                      ? true
                      : false
                  }
                  onChange={(e) => setUsername(e.target.value)}
                  autofillStyle={{
                    background: Colortheme.secondaryBG,
                    textColor: Colortheme.text,
                    caretColor: Colortheme.text,
                  }}
                />

                <CustomTextField
                  autoComplete="off"
                  label="Password"
                  type="password"
                  value={password}
                  error={
                    errorMsg && errorMsg === "Incorrect Passsword"
                      ? true
                      : false
                  }
                  onChange={(e) => setPassword(e.target.value)}
                  autofillStyle={{
                    background: Colortheme.secondaryBG,
                    textColor: Colortheme.text,
                    caretColor: Colortheme.text,
                  }}
                />
              </Box>
              <StyledButton
                onClick={ProceedClick}
                style={{ marginTop: "40px" }}
                bgColor={Colortheme.text}
                textColor={Colortheme.background}
              >
                {isLoading ? (
                  <CircularProgress
                    style={{ color: Colortheme.background }}
                    size={"20px"}
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
