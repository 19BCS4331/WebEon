import React, { createContext, useState, useEffect, useContext } from "react";

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
      if (!userid) {
        setIsAuthenticated(false);
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

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
