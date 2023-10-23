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
  const [token, setToken] = useState(null);
  const [branch, setBranch] = useState("");
  const [counter, setCounter] = useState("");
  const [finyear, setFinyear] = useState("");
  const [userRole, setUserRole] = useState("");
  const [state, setState] = useState("Active");
  const [count, setCount] = useState(0);
  const [remaining, setRemaining] = useState(0);
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
      const isAuth = localStorage.getItem("isAuth");
      if (token && userid && isAuth) {
        setToken(token);
        setUserId(userid);
        setIsAuthenticated(true);
      }
      if (!userid || !token) {
        setIsAuthenticated(false);
        localStorage.removeItem("isAuth");
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
    setUserId(null);
    setToken(null);
  };

  // const toastShow = () => {
  //   return (

  //   );
  // };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        userId,
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

export { AuthContext, AuthProvider };
