import { createContext, useContext, useState } from "react";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const [alertModal, setAlertModal] = useState({
    open: false,
    title: "",
    dialogMsg: "",
  });

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: "", type: "" });
  };

  const showAlertDialog = (title, dialogMsg) => {
    setAlertModal({ open: true, title, dialogMsg });
  };

  const hideAlertDialog = () => {
    setAlertModal({ open: false, title: "", dialogMsg: "" });
  };

  return (
    <ToastContext.Provider
      value={{
        showToast,
        hideToast,
        showAlertDialog,
        hideAlertDialog,
        toast,
        alertModal,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  return useContext(ToastContext);
};
