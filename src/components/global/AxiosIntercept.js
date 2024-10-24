import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";

const useAxiosInterceptor = () => {
  const { logout } = useAuth();
  const { showToast, hideToast } = useToast();

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const { status, data } = error.response;
      // if (status === 401) {
      //   logout();
      //   showToast("Token Expired, Please Login Again", "Fail");
      //   setTimeout(() => {
      //     hideToast();
      //   }, 5000);
      // }
      if (status === 401) {
        switch (data?.error) {
          case "Token expired":
            showToast("Your session has expired. Please login again.", "Fail");
            break;
          case "Invalid token":
            showToast("You have been logged in from another location.", "Fail");
            break;
          default:
            showToast("Authentication error. Please login again.", "Fail");
        }

        logout();

        setTimeout(() => {
          hideToast();
        }, 5000);
      }
      return Promise.reject(error);
    }
  );
};

export default useAxiosInterceptor;
