import { Box, useMediaQuery, useTheme } from "@mui/material";
import React, { useEffect, useState, useContext } from "react";
import "../css/pages/Login.css";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { useToast } from "../contexts/ToastContext";
import { AuthContext } from "../contexts/AuthContext";
import CircularProgress from "@mui/material/CircularProgress";
import { COLORS } from "../assets/colors/COLORS";
import ThemeContext from "../contexts/ThemeContext";
import { useBaseUrl } from "../contexts/BaseUrl";

const Login = () => {
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
    isAuthenticated,
  } = useContext(AuthContext);

  const [branches, setBranches] = useState([]);
  const [counters, setCounters] = useState([]);
  const [finYear, setFinYear] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      finyear !== ""
    ) {
      try {
        const response = await axios.post(`${baseUrl}/api/auth/login`, {
          username: username,
          password: password,
        });

        if (response.data.token) {
          // Store the token in localStorage
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("userid", response.data.userid);
        }

        login();
        setIsLoading(false);
        localStorage.setItem("branch", branch);
        localStorage.setItem("finyear", finyear);

        // Handle login success here
        // console.log(response.data);
        showToast("Successfully Logged In !", "success");
        navigate("/Dashboard");
        setTimeout(() => {
          logout();
          showToast("Token Expired, Logged Out !", "error");
        }, 60 * 60 * 1000);
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

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/auth/branch`);
        setBranches(response.data);
      } catch (err) {
        console.log("errorr", err);
      }
    };
    fetchBranches();
  }, []);

  useEffect(() => {
    const fetchCounters = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/auth/counter`);
        setCounters(response.data);
      } catch (err) {
        console.log("errorr", err);
      }
    };
    fetchCounters();
  }, []);

  useEffect(() => {
    const fetchFinYear = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/auth/finyear`);
        setFinYear(response.data);
      } catch (err) {
        console.log("errorr", err);
      }
    };
    fetchFinYear();
  }, []);

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
            height: "70vh",
            backgroundColor: "#edf2f4",
            width: "30vw",
            borderRadius: "30px",
            alignItems: "center",
            flexDirection: "column",
          }}
          className="WhiteContainer"
        >
          <h1
            style={{
              color: Colortheme.secondaryBG,
              fontSize: "30px",
              marginTop: 20,
            }}
          >
            Login
          </h1>

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
                errorMsg && errorMsg === "User does not exist !" ? true : false
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
                errorMsg && errorMsg === "Invalid credentials" ? true : false
              }
              onChange={(e) => setPassword(e.target.value)}
            />
          </Box>

          <Box
            display={"flex"}
            gap={5}
            width={"25vw"}
            mt={5}
            className="Inputs"
          >
            <Autocomplete
              className="LowerInputs"
              disablePortal
              id="BranchSelect"
              options={branches.map((branch) => branch.name)}
              value={branch || ""} // Set the value to the selectedBranch state
              onChange={(event, newValue) => {
                setBranch(newValue); // Update the selectedBranch state
              }}
              sx={{ width: isMobile ? "35vw" : "16vw" }}
              renderInput={(params) => <TextField {...params} label="Branch" />}
            />

            <Autocomplete
              className="LowerInputs"
              disablePortal
              id="CounterSelect"
              options={counters.map((counter) => counter.name)}
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
            <Autocomplete
              className="LowerInputs"
              disablePortal
              id="PurposeSelect"
              options={counters.map((counter) => counter.name)}
              value={counter || ""}
              sx={{ width: isMobile ? "25vw" : "16vw" }}
              renderInput={(params) => (
                <TextField {...params} label="Purpose" />
              )}
            />

            <Autocomplete
              className="LowerInputs"
              disablePortal
              id="FinYearSelect"
              options={finYear.map((finyear) => finyear.value)}
              value={finyear} // Set the value to the selectedBranch state
              onChange={(event, newValue) => {
                setFinyear(newValue); // Update the selectedBranch state
              }}
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

export default Login;
