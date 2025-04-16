import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();
const MAX_TOASTS = 5;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const [alertModal, setAlertModal] = useState({
    open: false,
    title: "",
    dialogMsg: "",
    handleAction: null,
  });

  const [infoModal, setInfoModal] = useState({
    open: false,
    title: "",
    dialogMsg: "",
  });

  const [alertModalCurrency, setAlertModalCurrency] = useState({
    open: false,
    title: "",
    dialogMsg: "",
  });

  const showToast = useCallback((message, type, timeout = 3000) => {
    const id = Date.now();
    const newToast = { id, message, type };
    
    setToasts((currentToasts) => {
      // If we already have MAX_TOASTS, remove the oldest one
      const updatedToasts = currentToasts.length >= MAX_TOASTS 
        ? currentToasts.slice(1) 
        : currentToasts;
      return [...updatedToasts, newToast];
    });

    // Automatically remove the toast after the specified timeout
    setTimeout(() => {
      setToasts((currentToasts) =>
        currentToasts.filter((toast) => toast.id !== id)
      );
    }, timeout);
  }, []);

  const hideToast = useCallback((id) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    );
  }, []);

  const showAlertDialog = (title, dialogMsg, handleAction) => {
    setAlertModal({ open: true, title, dialogMsg, handleAction });
  };

  const showInfoModal = (title, dialogMsg) => {
    setInfoModal({ open: true, title, dialogMsg });
  };

  const hideAlertDialog = () => {
    setAlertModal({
      open: false,
      title: "",
      dialogMsg: "",
      handleAction: null,
    });
  };

  const hideInfoModal = () => {
    setInfoModal({ open: false, title: "", dialogMsg: "" });
  };

  const showAlertDialogCurrency = (title, dialogMsg) => {
    setAlertModalCurrency({ open: true, title, dialogMsg });
  };

  const hideAlertDialogCurrency = () => {
    setAlertModalCurrency({ open: false, title: "", dialogMsg: "" });
  };

  return (
    <ToastContext.Provider
      value={{
        showToast,
        hideToast,
        showAlertDialog,
        showInfoModal,
        hideAlertDialog,
        hideInfoModal,
        showAlertDialogCurrency,
        hideAlertDialogCurrency,
        toasts,
        alertModal,
        infoModal,
        alertModalCurrency,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  return useContext(ToastContext);
};
