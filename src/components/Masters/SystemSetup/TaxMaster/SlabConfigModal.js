import { Box, useMediaQuery, useTheme } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";

import { useToast } from "../../../../contexts/ToastContext";
import { useContext, useEffect, useState } from "react";
import "../../../../css/Masters/SystemSetup/SlabConfigModal.css";
import { Colortheme } from "../../../../assets/colors/COLORS";
import ThemeContext from "../../../../contexts/ThemeContext";

const SlabConfigModal = ({
  showSlabConfigModal,
  handleHideSlabConfigModal,
  onSaveSlab,
  onEditSaveSlab,
  editSlabData,
  isEdit,
  isCreate,
}) => {
  const { Colortheme } = useContext(ThemeContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { showToast, hideToast } = useToast();
  const [isLoading, setisLoading] = useState(false);

  const [formData, setFormData] = useState({});
  const [rows, setRows] = useState([]);
  const [editRows, setEditRows] = useState([]);

  useEffect(() => {
    if (isEdit) {
      setEditRows(editSlabData);
    }
  }, [isEdit]);

  //   -------------- for input to add (Create MODE)

  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [rate, setRate] = useState("");

  //   -------------- for input to add (MAIN EDIT MODE)
  const [editminValueMain, setEditedMinValueMain] = useState("");
  const [editmaxValueMain, setEditedMaxValueMain] = useState("");
  const [editrateMain, setEditedRateMain] = useState("");
  //   -------------- for input to add

  // ----normal create----
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  // ----normal create----

  // -------Main Edit-------------
  const [dataIsEditing, setIsDataEditing] = useState(false);
  const [dataEditIndex, setDataEditIndex] = useState(null);
  // -------Main Edit-------------

  // ----create rows edit normal---------------
  const [editMinValue, setEditMinValue] = useState("");
  const [editMaxValue, setEditMaxValue] = useState("");
  const [editRate, setEditRate] = useState("");
  // ----create rows edit normal---------------

  //   -----------Main Edit edit rows----------------
  const [dataEditMinValue, setEditDataMinValue] = useState("");
  const [dataEditMaxValue, setEditDataMaxValue] = useState("");
  const [dataEditRate, setEditDataRate] = useState("");
  //   -----------Main Edit edit rows----------------

  const handleEditRow = (index) => {
    const row = rows[index];
    setEditMinValue(row.minValue);
    setEditMaxValue(row.maxValue);
    setEditRate(row.rate);
    setIsEditing(true);
    setEditIndex(index);
  };

  const handleEditDataRow = (index) => {
    const row = editRows[index];
    setEditDataMinValue(row.min_value);
    setEditDataMaxValue(row.max_value);
    setEditDataRate(row.rate);
    setIsDataEditing(true);
    setDataEditIndex(index);
  };

  const handleSaveEdit = () => {
    if (editMinValue && editMaxValue && editRate && editIndex !== null) {
      const updatedRows = [...rows];
      updatedRows[editIndex] = {
        ...updatedRows[editIndex],
        minValue: editMinValue,
        maxValue: editMaxValue,
        rate: editRate,
      };
      setRows(updatedRows);
      setIsEditing(false);
      setEditIndex(null);
      setEditMinValue("");
      setEditMaxValue("");
      setEditRate("");
    }
  };

  const handleSaveDataEdit = () => {
    if (
      dataEditMinValue &&
      dataEditMaxValue &&
      dataEditRate &&
      dataEditIndex !== null
    ) {
      const updatedRows = [...editRows];
      updatedRows[dataEditIndex] = {
        ...updatedRows[dataEditIndex],
        min_value: dataEditMinValue,
        max_value: dataEditMaxValue,
        rate: dataEditRate,
      };
      setEditRows(updatedRows);
      setIsDataEditing(false);
      setDataEditIndex(null);
      setEditDataMinValue("");
      setEditDataMaxValue("");
      setEditDataRate("");
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditIndex(null);
    setEditMinValue("");
    setEditMaxValue("");
    setEditRate("");
  };

  const handleCancelDataEdit = () => {
    setIsDataEditing(false);
    setDataEditIndex(null);
    setEditDataMinValue("");
    setEditDataMaxValue("");
    setEditDataRate("");
  };

  const handleAddRow = () => {
    if (minValue && maxValue && rate) {
      const newRow = {
        srNo: rows.length + 1,
        minValue: minValue,
        maxValue: maxValue,
        rate: rate,
      };
      setRows([...rows, newRow]);
      setMinValue("");
      setMaxValue("");
      setRate("");
    }
  };

  const handleAddEditedRow = () => {
    if (editminValueMain && editmaxValueMain && editrateMain) {
      const newSlabsId =
        editRows.length > 0 ? editRows[editRows.length - 1].slabsid + 1 : 1;
      const newRow = {
        slabsid: newSlabsId,
        taxid: editRows[0].taxid,
        sr_no: editRows.length + 1,
        min_value: editminValueMain,
        max_value: editmaxValueMain,
        rate: editrateMain,
      };
      setEditRows([...editRows, newRow]);
      setEditDataMinValue("");
      setEditDataMaxValue("");
      setEditDataRate("");
    }
  };

  const handleDeleteRow = (index) => {
    const updatedRows = rows.filter((row, i) => i !== index);
    setRows(updatedRows.map((row, i) => ({ ...row, srNo: i + 1 })));
  };

  const handleEditDeleteRow = (index) => {
    const updatedRows = editRows.filter((row, i) => i !== index);
    setEditRows(updatedRows.map((row, i) => ({ ...row, srNo: i + 1 })));
  };

  const handleSave = () => {
    onSaveSlab(rows);
    showToast("Saved Successfully!", "success");
    setTimeout(() => hideToast(), 2000);
    handleHideSlabConfigModal();
  };

  const handleEditSave = () => {
    onEditSaveSlab(editRows);
    showToast("Saved Successfully!", "success");
    setTimeout(() => hideToast(), 2000);
    handleHideSlabConfigModal();
  };

  return (
    <AnimatePresence>
      {showSlabConfigModal === true && (
        <>
          {isCreate && (
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
                  width: "60%",
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
                  onClick={handleHideSlabConfigModal}
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

                <Box
                  marginTop={"-70px"}
                  justifyContent={"center"}
                  display={"flex"}
                  fontSize={"18px"}
                >
                  <p>Slab Configuration</p>
                </Box>

                <div>
                  <div className="input-fields">
                    <input
                      type="number"
                      value={minValue}
                      onChange={(e) => setMinValue(e.target.value)}
                      placeholder="Min Value"
                    />
                    <input
                      type="number"
                      value={maxValue}
                      onChange={(e) => setMaxValue(e.target.value)}
                      placeholder="Max Value"
                    />
                    <input
                      type="number"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      placeholder="Rate"
                    />
                    <button onClick={handleAddRow}>Add</button>
                  </div>
                  <table className="tax-table">
                    <thead>
                      <tr>
                        <th>SR. No</th>
                        <th>Min Value</th>
                        <th>Max Value</th>
                        <th>Rate</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, index) => (
                        <tr key={index}>
                          <td>{row.srNo}</td>
                          <td>
                            {isEditing && editIndex === index ? (
                              <input
                                type="number"
                                value={editMinValue}
                                onChange={(e) =>
                                  setEditMinValue(e.target.value)
                                }
                              />
                            ) : (
                              row.minValue
                            )}
                          </td>
                          <td>
                            {isEditing && editIndex === index ? (
                              <input
                                type="number"
                                value={editMaxValue}
                                onChange={(e) =>
                                  setEditMaxValue(e.target.value)
                                }
                              />
                            ) : (
                              row.maxValue
                            )}
                          </td>
                          <td>
                            {isEditing && editIndex === index ? (
                              <input
                                type="number"
                                value={editRate}
                                onChange={(e) => setEditRate(e.target.value)}
                              />
                            ) : (
                              row.rate
                            )}
                          </td>
                          <td>
                            {isEditing && editIndex === index ? (
                              <>
                                <button onClick={handleSaveEdit}>Save</button>
                                <button onClick={handleCancelEdit}>
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => handleEditRow(index)}>
                                  Edit
                                </button>
                                <button onClick={() => handleDeleteRow(index)}>
                                  Delete
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {rows.length > 0 && (
                  <Box display={"flex"} justifyContent={"center"}>
                    <button
                      style={{
                        backgroundColor: Colortheme.secondaryBG,
                        border: "none",
                        color: "white",
                        cursor: "pointer",
                        width: "100px",
                        borderRadius: "20px",
                        height: "40px",
                        marginTop: 20,
                      }}
                      onClick={handleSave}
                    >
                      Save
                    </button>
                  </Box>
                )}
              </Box>
            </>
          )}

          {isEdit && editSlabData && (
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
                  width: "60%",
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
                  onClick={handleHideSlabConfigModal}
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

                <Box
                  marginTop={"-70px"}
                  justifyContent={"center"}
                  display={"flex"}
                  fontSize={"18px"}
                >
                  <p>Edit Slab Configuration</p>
                </Box>

                <div>
                  <div className="input-fields">
                    <input
                      type="number"
                      value={editminValueMain}
                      onChange={(e) => setEditedMinValueMain(e.target.value)}
                      placeholder="Min Value"
                    />
                    <input
                      type="number"
                      value={editmaxValueMain}
                      onChange={(e) => setEditedMaxValueMain(e.target.value)}
                      placeholder="Max Value"
                    />
                    <input
                      type="number"
                      value={editrateMain}
                      onChange={(e) => setEditedRateMain(e.target.value)}
                      placeholder="Rate"
                    />
                    <button onClick={handleAddEditedRow}>Add</button>
                  </div>
                  <table className="tax-table">
                    <thead>
                      <tr>
                        <th>SR. No</th>
                        <th>Min Value</th>
                        <th>Max Value</th>
                        <th>Rate</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editRows &&
                        editRows.map((row, index) => (
                          <tr key={index}>
                            <td>{row.sr_no}</td>
                            <td>
                              {dataIsEditing && dataEditIndex === index ? (
                                <input
                                  type="number"
                                  value={dataEditMinValue}
                                  onChange={(e) =>
                                    setEditDataMinValue(e.target.value)
                                  }
                                />
                              ) : (
                                row.min_value
                              )}
                            </td>
                            <td>
                              {dataIsEditing && dataEditIndex === index ? (
                                <input
                                  type="number"
                                  value={dataEditMaxValue}
                                  onChange={(e) =>
                                    setEditDataMaxValue(e.target.value)
                                  }
                                />
                              ) : (
                                row.max_value
                              )}
                            </td>
                            <td>
                              {dataIsEditing && dataEditIndex === index ? (
                                <input
                                  type="number"
                                  value={dataEditRate}
                                  onChange={(e) =>
                                    setEditDataRate(e.target.value)
                                  }
                                />
                              ) : (
                                row.rate
                              )}
                            </td>
                            <td>
                              {dataIsEditing && dataEditIndex === index ? (
                                <>
                                  <button onClick={handleSaveDataEdit}>
                                    Save
                                  </button>
                                  <button onClick={handleCancelDataEdit}>
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleEditDataRow(index)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleEditDeleteRow(index)}
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                {editRows && editRows.length > 0 && (
                  <Box display={"flex"} justifyContent={"center"}>
                    <button
                      style={{
                        backgroundColor: Colortheme.secondaryBG,
                        border: "none",
                        color: "white",
                        cursor: "pointer",
                        width: "100px",
                        borderRadius: "20px",
                        height: "40px",
                        marginTop: 20,
                      }}
                      onClick={handleEditSave}
                    >
                      Save
                    </button>
                  </Box>
                )}
              </Box>
            </>
          )}
        </>
      )}
    </AnimatePresence>
  );
};

export default SlabConfigModal;
