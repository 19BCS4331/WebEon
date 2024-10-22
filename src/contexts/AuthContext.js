import React, { createContext, useState, useEffect, useContext } from "react";
import { useIdleTimer } from "react-idle-timer";
import CloseIcon from "@mui/icons-material/Close";
import { AnimatePresence, motion } from "framer-motion";
import { Box } from "@mui/material";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState("");
  const [token, setToken] = useState(null);
  const [branch, setBranch] = useState("");
  const [counter, setCounter] = useState("");
  const [finyear, setFinyear] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [state, setState] = useState("Active");
  const [count, setCount] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [loginData, setLoginData] = useState({});
  let [show, setShow] = useState(false);

  const onIdle = () => {
    setState("Idle");

    logout();

    setShow(true);
    setTimeout(() => {
      setShow(false);
    }, 2000);
  };

  const onActive = () => {
    setState("Active");
  };

  const onAction = () => {
    setCount(count + 1);
  };

  const { getRemainingTime } = useIdleTimer({
    onIdle,
    onActive,
    onAction,
    timeout: 15 * 60 * 1000,
    throttle: 500,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(Math.ceil(getRemainingTime() / 1000));
    }, 500);

    return () => {
      clearInterval(interval);
    };
  });

  useEffect(() => {
    const getTokenFromLocalStorage = async () => {
      const token = localStorage.getItem("token");
      const userid = localStorage.getItem("userid");
      const username = localStorage.getItem("username");
      const isAuth = localStorage.getItem("isAuth");
      const branch = JSON.parse(localStorage.getItem("branch"));
      const counter = JSON.parse(localStorage.getItem("counter"));
      const finyear = JSON.parse(localStorage.getItem("finyear"));

      if (token && userid && isAuth && finyear) {
        setToken(token);
        setUserId(userid);
        setUsername(username);
        setIsAuthenticated(true);
        setBranch(branch);
        setCounter(counter);
        setFinyear(finyear.value);
      }
      if (!userid || !token) {
        setIsAuthenticated(false);
        setToken(null);
        setUserId(null);
        setUsername("");
        setBranch(null);
        setCounter("");
        setFinyear(null);
        localStorage.removeItem("isAuth");
        localStorage.removeItem("username");
      }
    };

    getTokenFromLocalStorage();
  }, []);

  const login = () => {
    setIsAuthenticated(true);
    localStorage.setItem("isAuth", true);
    // setUserId(userId);
    // setToken(token);
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuth");
    localStorage.removeItem("menuData");
    localStorage.removeItem("userData");
    localStorage.removeItem("finyear");
    localStorage.removeItem("username");
    localStorage.removeItem("branch");
    localStorage.removeItem("counter");
    localStorage.removeItem("token");
    localStorage.removeItem("userid");

    setUserId(null);
    setToken(null);
    setFinyear(null);
    setUsername("");
    setBranch("");
    setCounter("");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        userId,
        setUserId,
        username,
        setUsername,
        token,
        login,
        logout,
        branch,
        setBranch,
        counter,
        setCounter,
        finyear,
        setFinyear,
        userRole,
        setUserRole,
        state,
        count,
        remaining,
        loginData,
        setLoginData,
        token,
        setToken,
      }}
    >
      <AnimatePresence>
        {show && (
          <Box
            component={motion.div}
            initial={{ y: -180 }}
            animate={{ y: 0 }}
            display={"flex"}
            exit={{ y: -180 }}
            alignItems={"center"}
            justifyContent={"center"}
            position={"absolute"}
            top={30}
            right={20}
            height={40}
            width={"auto"}
            borderRadius={20}
            sx={{ backgroundColor: "white", userSelect: "none" }}
            p={2}
            gap={2}
            zIndex={999999}
          >
            <CloseIcon style={{ color: "red" }} />
            Logged Out Due To Inactivity
          </Box>
        )}
      </AnimatePresence>

      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider }; // Export the useLogout custom hook
