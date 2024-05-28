import { Box, useMediaQuery, useTheme } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";

import { useToast } from "../../../../contexts/ToastContext";
import { useEffect, useState } from "react";
import "../../../../css/Masters/SystemSetup/TransConfigModal.css";
import { COLORS } from "../../../../assets/colors/COLORS";

const TransConfigModal = ({
  showTransConfigModal,
  onSaveTransConfig,
  onSaveEditedTransConfig,
  handleHideTransConfigModal,
  isEdit,
  fetchedData,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { showToast, hideToast } = useToast();
  const [isLoading, setisLoading] = useState(false);

  const [formData, setFormData] = useState({});

  const [editFormData, setEditFormData] = useState({});

  const capitalizeFirstLetter = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  useEffect(() => {
    if (fetchedData) {
      const initialFormData = {};
      Object.entries(fetchedData).forEach(([key, value]) => {
        if (
          [
            "retail_buying",
            "retail_selling",
            "bulk_buying",
            "bulk_selling",
            "tc_settlement",
            "product_settlement",
          ].includes(key)
        ) {
          initialFormData[key] = {
            checked: value !== null,
            sign: value === "+" || value === "-" ? value : "",
          };
        }
      });
      setEditFormData(initialFormData);
    }
  }, [fetchedData]);

  const handleEditCheckboxChange = (event, item) => {
    const isChecked = event.target.checked;
    setEditFormData((prevFormData) => ({
      ...prevFormData,
      [item]: {
        ...prevFormData[item],
        checked: isChecked,
      },
    }));
  };

  const handleCheckboxChange = (event, item) => {
    const { checked } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [item]: { ...prevData[item], checked },
    }));
  };

  const handleSignChange = (event, item) => {
    const sign = event.target.value;
    setFormData((prevData) => ({
      ...prevData,
      [item]: { ...prevData[item], sign },
    }));
  };

  const handleEditSignChange = (event, item) => {
    const selectedSign = event.target.value;
    setEditFormData((prevFormData) => ({
      ...prevFormData,
      [item]: {
        ...prevFormData[item],
        sign: selectedSign,
      },
    }));
  };

  const handleSave = () => {
    const dataToSave = {};
    Object.entries(formData).forEach(([item, value]) => {
      if (value.checked && value.sign) {
        // Check if sign is selected
        dataToSave[item] = value.sign;
      }
    });
    onSaveTransConfig(dataToSave);
    console.log("Data to be saved:", dataToSave);
    showToast("Saved Successfully", "success");
    handleHideTransConfigModal();
    setTimeout(() => hideToast(), 2000);
  };

  const handleEditSave = () => {
    // Convert formData into the format required by the backend
    const updatedData = {};
    Object.keys(editFormData).forEach((key) => {
      if (editFormData[key].checked) {
        updatedData[key] = editFormData[key].sign;
      }
    });
    onSaveEditedTransConfig(updatedData);
    console.log("Data to be saved:", updatedData);
    showToast("Saved Successfully", "success");
    handleHideTransConfigModal();
    setTimeout(() => hideToast(), 2000);
  };
  return (
    <AnimatePresence>
      {showTransConfigModal === true && (
        <>
          <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 100 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)", // Adjust opacity here
              zIndex: 2,
            }}
          ></Box>
          <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 100 }}
            exit={{ opacity: 0 }}
            sx={{
              width: "40%",
              height: "60%",
              backgroundColor: "white",
              position: "absolute",
              borderRadius: 10,
              opacity: "99%",
              display: "flex",
              flexDirection: "column",
              p: 3,
              zIndex: 4,
            }}
          >
            <button
              className="timesButton"
              onClick={handleHideTransConfigModal}
              style={{
                alignSelf: "flex-end",
                borderRadius: 50,
                border: "none",
                width: 80,
                height: 40,
                cursor: "pointer",
                marginBottom: isMobile ? "40px" : "20px",
                zIndex: 99999,
              }}
            >
              &times;
            </button>
            {!isEdit ? (
              <>
                <Box
                  marginTop={"-70px"}
                  justifyContent={"center"}
                  display={"flex"}
                  fontSize={"18px"}
                >
                  <p>Transaction Configuration</p>
                </Box>

                <Box className="table-container">
                  <table className="my-table">
                    <thead>
                      <tr>
                        <th>Applicable in</th>
                        <th>Sign</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        "Retail Buying",
                        "Retail Selling",
                        "Bulk Buying",
                        "Bulk Selling",
                        "TC Settlement",
                        "Product Settlement",
                      ].map((item) => (
                        <tr key={item}>
                          <td>
                            <input
                              type="checkbox"
                              checked={
                                formData[item] ? formData[item].checked : false
                              }
                              onChange={(event) =>
                                handleCheckboxChange(event, item)
                              }
                            />
                            {item}
                          </td>
                          <td>
                            <select
                              className="sign-dropdown"
                              disabled={
                                !formData[item] || !formData[item].checked
                              }
                              value={formData[item] ? formData[item].sign : ""}
                              onChange={(event) =>
                                handleSignChange(event, item)
                              }
                            >
                              <option value="">Select</option>
                              <option value="+">+</option>
                              <option value="-">-</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Box display={"flex"} justifyContent={"center"}>
                    <button
                      onClick={handleSave}
                      style={{
                        backgroundColor: COLORS.secondaryBG,
                        color: "white",
                        borderRadius: 20,
                        width: 100,
                        height: 40,
                        border: "none",
                        cursor: "pointer",
                        marginTop: 20,
                      }}
                    >
                      Save
                    </button>
                  </Box>
                </Box>
              </>
            ) : (
              <>
                <Box
                  marginTop={"-70px"}
                  justifyContent={"center"}
                  display={"flex"}
                  fontSize={"18px"}
                >
                  <p>Edit Transaction Configuration</p>
                </Box>

                <Box className="table-container">
                  <table className="my-table">
                    <thead>
                      <tr>
                        <th>Applicable in</th>
                        <th>Sign</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(editFormData).map(([item, value]) => (
                        <tr key={item}>
                          <td>
                            <input
                              type="checkbox"
                              checked={value.checked}
                              onChange={(event) =>
                                handleEditCheckboxChange(event, item)
                              }
                            />
                            {capitalizeFirstLetter(item.replace(/_/g, " "))}
                          </td>
                          <td>
                            <select
                              className="sign-dropdown"
                              disabled={!value.checked}
                              value={value.sign}
                              onChange={(event) =>
                                handleEditSignChange(event, item)
                              }
                            >
                              <option value="">Select</option>
                              <option value="+">+</option>
                              <option value="-">-</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Box display={"flex"} justifyContent={"center"}>
                    <button
                      onClick={handleEditSave}
                      style={{
                        backgroundColor: COLORS.secondaryBG,
                        color: "white",
                        borderRadius: 20,
                        width: 100,
                        height: 40,
                        border: "none",
                        cursor: "pointer",
                        marginTop: 20,
                      }}
                    >
                      Save
                    </button>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </>
      )}
    </AnimatePresence>
  );
};

export default TransConfigModal;
