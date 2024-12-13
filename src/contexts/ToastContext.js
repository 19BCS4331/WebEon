import { createContext, useContext, useState } from "react";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

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

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: "", type: "" });
  };

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
        toast,
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
