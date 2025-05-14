import React, { createContext, useContext, useState } from "react";
import "../css/components/ActionModal.css";
import { AnimatePresence, motion } from "framer-motion";
import { Box } from "@mui/material";

const ModalContext = createContext();

export const useActionModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
  const [modalContent, setModalContent] = useState(null);

  const openModal = (content) => {
    setModalContent(content);
  };

  const closeModal = () => {
    setModalContent(null);
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal, modalContent }}>
      {children}
      <AnimatePresence>
        {modalContent && (
          <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 100 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
          >
            <Box className="modal-content">
              <p>{modalContent.message}</p>
              <Box className="modal-buttons">
                <button
                  onClick={modalContent.onConfirm}
                  className="modal-buttons-indi"
                >
                  Yes
                </button>
                <button onClick={closeModal} className="modal-buttons-indi">
                  No
                </button>
              </Box>
            </Box>
          </Box>
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  );
};
