import { Box, useMediaQuery, useTheme } from "@mui/material";
import React, { useEffect, useState, useContext } from "react";
import "../css/pages/Login.css";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import { useToast } from "../contexts/ToastContext";
import { AuthContext } from "../contexts/AuthContext";
import CircularProgress from "@mui/material/CircularProgress";
import { COLORS } from "../assets/colors/COLORS";
import ThemeContext from "../contexts/ThemeContext";
import { useBaseUrl } from "../contexts/BaseUrl";
import KeyboardBackspace from "@mui/icons-material/KeyboardBackspace";

const LoginNew = () => {
  const { logout } = useContext(AuthContext);
  const { baseUrl } = useBaseUrl();
  const { Colortheme } = useContext(ThemeContext);
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
    loginData,
    setLoginData,
    isAuthenticated,
    token,
    setToken,
  } = useContext(AuthContext);

  const [branches, setBranches] = useState([]);
  const [counters, setCounters] = useState([]);
  const [finYearOptions, setFinYearOptions] = useState([]);
  const [username, setUsername] = useState("");
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

  const loginUser = async () => {
    setIsLoading(true);
    if (
      branch !== null &&
      branch !== "" &&
      finyear !== null &&
      finyear !== "" &&
      counter !== null &&
      counter !== ""
    ) {
      try {
        const response = await axios.post(`http://localhost:5002/auth/login`, {
          username: username.toUpperCase(),
          password: password,
        });
        console.log("login response", response.data);

        if (response.data.token) {
          // Store the token in localStorage
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("userid", response.data.userID);
          localStorage.setItem("username", response.data.username);
        }

        login();
        setIsLoading(false);
        localStorage.setItem("branch", branch);
        localStorage.setItem("finyear", finyear);

        // Handle login success here
        showToast("Successfully Logged In !", "success");
        navigate("/Dashboard");

        // Schedule logout after 1 hour
      } catch (error) {
        // Handle login failure here
        console.error(error);
        setIsLoading(false);

        if (error.response) {
          // The request was made and the server responded with a status code
          const { data } = error.response;

          setErrorMsg(data.msg);

          showToast(data.msg || "An error occurred", "error");
          setIsLoading(false);
        } else if (error.request) {
          // The request was made but no response was received
          showToast("No response from server", "error");
          setIsLoading(false);
        } else {
          // Something else happened while setting up the request
          showToast("An error occurred", "error");
          setIsLoading(false);
        }
      } finally {
        // Hide the toast after a certain time (e.g., 2 seconds)
        setTimeout(() => {
          hideToast();
        }, 800);
      }
    } else {
      showToast("Please Enter All Details!", "error");
      setIsLoading(false);
      setTimeout(() => {
        hideToast();
      }, 1000);
    }
  };

  const fetchBranches = async (username) => {
    try {
      const response = await axios.post(
        `http://localhost:5002/auth/login/branchOnUser`,
        { username: username }
      );
      setBranches(response.data);
    } catch (err) {
      console.log("error", err);
    }
  };

  useEffect(() => {
    if (branch) {
      const fetchCounters = async () => {
        try {
          const response = await axios.post(
            `http://localhost:5002/auth/login/CounterOnBranchAndUser`,
            { vBranchCode: branch, vUID: successRes.username }
          );
          setCounters(response.data);
        } catch (err) {
          console.log("error", err);
        }
      };
      fetchCounters();
    } else {
      setCounters([]);
      setCounter("");
    }
  }, [branch]);

  //   useEffect(() => {
  //     const fetchCounters = async () => {
  //       try {
  //         const response = await axios.get(`${baseUrl}/api/auth/counter`);
  //         setCounters(response.data);
  //       } catch (err) {
  //         console.log("errorr", err);
  //       }
  //     };
  //     fetchCounters();
  //   }, []);

  //   useEffect(() => {
  //     const fetchFinYear = async () => {
  //       try {
  //         const response = await axios.get(`${baseUrl}/api/auth/finyear`);
  //         setFinYearOptions(response.data);
  //       } catch (err) {
  //         console.log("errorr", err);
  //       }
  //     };
  //     fetchFinYear();
  //   }, []);

  const fetchFinYearData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5002/auth/login/finYear"
      ); // Replace with your API endpoint
      const data = await response.data;
      const formattedData = data.map((finyear) => ({
        ...finyear,
        value: `${formatDate(finyear.fromDate)} - ${formatDate(
          finyear.tillDate
        )}`,
      }));
      console.log("format yhear", formattedData);
      setFinYearOptions(formattedData);
    } catch (error) {
      console.error("Error fetching financial years:", error);
    }
  };

  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };

  const ProceedClick = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`http://localhost:5002/auth/login`, {
        username: username.toUpperCase(),
        password: password,
      });

      const successRes = response.data;
      setSuccessRes(successRes);
      setLoginData(successRes);
      fetchFinYearData();
      if (successRes) {
        await fetchBranches(successRes.username);
      }
      setIsLowerInputsVis(true);
      setIsLoading(false);
    } catch (error) {
      // Handle login failure here
      console.error(error);
      setIsLoading(false);

      if (error.response) {
        // The request was made and the server responded with a status code
        const { data } = error.response;

        setErrorMsg(data.msg);

        showToast(data.msg || "An error occurred", "error");
        setIsLoading(false);
        setIsLowerInputsVis(false);
      } else if (error.request) {
        // The request was made but no response was received
        showToast("No response from server", "error");
        setIsLoading(false);
        setIsLowerInputsVis(false);
      } else {
        // Something else happened while setting up the request
        showToast("An error occurred", "error");
        setIsLoading(false);
        setIsLowerInputsVis(false);
      }
    } finally {
      setIsLoading(false);
      // Hide the toast after a certain time (e.g., 2 seconds)
      setTimeout(() => {
        hideToast();
      }, 800);
    }
  };

  const handleBackClick = () => {
    setIsLowerInputsVis(false);
    setBranch("");
    setCounter("");
    setFinyear(null);
    setCounters([]);
  };

  const handleFinYearChange = (event, newValue) => {
    setFinyear(newValue);
    localStorage.setItem("finyear", JSON.stringify(newValue));
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
      <Box
        sx={{ backgroundColor: Colortheme.text, opacity: 0.6 }}
        height={"400px"}
        width={"400px"}
        position={"absolute"}
        zIndex={1}
        top={-100}
        left={-150}
        borderRadius={100}
      />

      <Box
        sx={{ backgroundColor: Colortheme.text, opacity: 0.6 }}
        height={"400px"}
        width={"400px"}
        position={"absolute"}
        zIndex={1}
        bottom={20}
        right={50}
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
          <h1 style={{ color: Colortheme.text, textAlign: "center" }}>
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
            backgroundColor: "#edf2f4",
            width: "30vw",
            borderRadius: "30px",
            alignItems: "center",
            flexDirection: "column",
            padding: 5,
          }}
          className="WhiteContainer"
        >
          <h1
            style={{
              color: Colortheme.secondaryBG,
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
                color: COLORS.secondaryBG,
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
              >
                <Box
                  display={"flex"}
                  gap={5}
                  width={"25vw"}
                  mt={3}
                  className="Inputs"
                >
                  <Autocomplete
                    className="LowerInputs"
                    disablePortal
                    id="BranchSelect"
                    options={branches.map((branch) => branch.vBranchCode)}
                    isOptionEqualToValue={(option, value) =>
                      option.nBranchID === value.nBranchID
                    }
                    value={branch || ""} // Set the value to the selectedBranch state
                    onChange={(event, newValue) => {
                      setBranch(newValue); // Update the selectedBranch state
                    }}
                    sx={{ width: isMobile ? "35vw" : "16vw" }}
                    renderInput={(params) => (
                      <TextField {...params} label="Branch" />
                    )}
                  />

                  <Autocomplete
                    className="LowerInputs"
                    disablePortal
                    id="CounterSelect"
                    noOptionsText={"Select A Branch"}
                    options={counters.map((counter) => counter.nCounterID)}
                    isOptionEqualToValue={(option, value) =>
                      option.nCounterID === value.nCounterID
                    }
                    value={counter || ""} // Set the value to the selectedBranch state
                    onChange={(event, newValue) => {
                      setCounter(newValue); // Update the selectedBranch state
                    }}
                    sx={{ width: isMobile ? "25vw" : "16vw" }}
                    renderInput={(params) => (
                      <TextField {...params} label="Counter" />
                    )}
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
                <TextField {...params} label="Purpose" />
              )}
            /> */}
                  {/* --------------PURPOSE-------------------- */}

                  {/* <Autocomplete
                    className="LowerInputs"
                    disablePortal
                    id="FinYearSelect"
                    options={finYearOptions.map((finyear) => finyear.value)}
                    isOptionEqualToValue={(option, value) =>
                      option.finyearid === value.finyearid
                    }
                    value={finyear} // Set the value to the selectedBranch state
                    onChange={(event, newValue) => {
                      setFinyear(newValue); // Update the selectedBranch state
                    }}
                    sx={{ width: isMobile ? "40vw" : "16vw" }}
                    renderInput={(params) => (
                      <TextField {...params} label="Financial Year" />
                    )}
                  /> */}
                  <Autocomplete
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
                    sx={{ width: isMobile ? "40vw" : "16vw" }}
                    renderInput={(params) => (
                      <TextField {...params} label="Financial Year" />
                    )}
                  />
                </Box>
                <Box mt={8}>
                  <button className="loginButton" onClick={loginUser}>
                    {isLoading ? (
                      <CircularProgress
                        size="25px"
                        style={{ color: Colortheme.text }}
                      />
                    ) : (
                      "Login"
                    )}
                  </button>
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
              >
                <TextField
                  id="outlined-basic"
                  label="Username"
                  variant="outlined"
                  sx={{ width: isMobile ? "50vw" : "16vw" }}
                  value={username}
                  error={
                    errorMsg && errorMsg === "User does not exist !"
                      ? true
                      : false
                  }
                  onChange={(e) => setUsername(e.target.value)}
                />

                <TextField
                  id="outlined-basic"
                  label="Password"
                  variant="outlined"
                  sx={{ width: isMobile ? "50vw" : "16vw" }}
                  type="password"
                  value={password}
                  error={
                    errorMsg && errorMsg === "Invalid credentials"
                      ? true
                      : false
                  }
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Box>
              <button
                className="loginButton"
                onClick={ProceedClick}
                style={{
                  // backgroundColor: COLORS.secondaryBG,
                  border: "none",
                  color: "white",
                  borderRadius: 15,
                  width: "40%",
                  height: "5vh",
                  marginTop: 40,
                }}
              >
                {isLoading ? (
                  <CircularProgress style={{ color: "white" }} size={"25px"} />
                ) : (
                  "Proceed"
                )}
              </button>
            </Box>
          )}

          {/* <Box mt={5}>
            <Button
              variant="outlined"
              style={{ width: "25vw", height: "45px", borderRadius: 20 }}
            >
              Proceed
            </Button>
          </Box> */}
        </Box>
      </Box>
    </Box>
  );
};

export default LoginNew;
