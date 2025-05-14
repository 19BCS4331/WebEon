import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

const useAuthHook = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export default useAuthHook;
