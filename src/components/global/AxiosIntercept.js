import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";

const useAxiosInterceptor = () => {
  const { logout } = useAuth();
  const { showToast, hideToast } = useToast();

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const { status } = error.response;
      if (status === 401) {
        logout();
        showToast("Token Expired, Please Login Again", "Fail");
        setTimeout(() => {
          hideToast();
        }, 5000);
      }
      return Promise.reject(error);
    }
  );
};

export default useAxiosInterceptor;
