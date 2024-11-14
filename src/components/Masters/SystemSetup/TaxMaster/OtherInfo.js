import {
  Box,
  Checkbox,
  FormControlLabel,
  MenuItem,
  TextField,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "../../../../contexts/ToastContext";
import { useContext, useEffect, useState } from "react";
import "../../../../css/Masters/SystemSetup/TransConfigModal.css";

import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers";
import ThemeContext from "../../../../contexts/ThemeContext";

const OtherInfo = ({
  showOtherInfoModal,
  handleHideOtherInfoModal,
  onSaveOtherInfo,
  onSaveEditedOtherInfo,
  isEdit,
  fetchedData,
}) => {
  const { Colortheme } = useContext(ThemeContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { showToast, hideToast } = useToast();
  const [isLoading, setisLoading] = useState(false);
  const [selectedFromDate, setSelectedFromDate] = useState(dayjs());
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [applyOn, setApplyOn] = useState("Exchange");
  const [taxCodeOtherInfo, setTaxCodeOtherInfo] = useState("");

  const [isRoundOffTAX, setIsRoundOffTAX] = useState(false);
  const [isBifurcate, setIsBifurcate] = useState(false);
  const [isEEFCProds, setIsEEFCProds] = useState(false);
  const [isEEFCPortion, setIsEEFCPortion] = useState(false);

  //   ------------edit states-------------

  const [selectedEditFromDate, setSelectedEditFromDate] = useState(null);
  const [selectedEditEndDate, setSelectedEditEndDate] = useState(null);
  const [editApplyOn, setEditApplyOn] = useState("");
  const [editTaxCodeOtherInfo, setEditTaxCodeOtherInfo] = useState("");

  const [isEditRoundOffTAX, setIsEditRoundOffTAX] = useState(false);
  const [isEditBifurcate, setIsEditBifurcate] = useState(false);
  const [isEditEEFCProds, setIsEditEEFCProds] = useState(false);
  const [isEditEEFCPortion, setIsEditEEFCPortion] = useState(false);

  //   ------------edit states-------------

  useEffect(() => {
    if (fetchedData && fetchedData.other_info_data) {
      const {
        FromDate,
        EndDate,
        ApplyOn,
        Bifurcate,
        EEFCPortion,
        EEFCProds,
        RoundOffTAX,
        TaxCodeInfo,
      } = fetchedData.other_info_data;
      setSelectedEditFromDate(FromDate);
      setSelectedEditEndDate(EndDate === "Invalid Date" ? null : EndDate);
      setEditTaxCodeOtherInfo(TaxCodeInfo);
      setEditApplyOn(ApplyOn);
      setIsEditRoundOffTAX(RoundOffTAX);
      setIsEditBifurcate(Bifurcate);
      setIsEditEEFCProds(EEFCProds);
      setIsEditEEFCPortion(EEFCPortion);
    }
  }, [fetchedData]);

  const handleisRoundOffTAXChange = (event) => {
    setIsRoundOffTAX(event.target.checked);
  };

  const handleisBifurcateChange = (event) => {
    setIsBifurcate(event.target.checked);
  };

  const handleisEEFCProdsChange = (event) => {
    setIsEEFCProds(event.target.checked);
  };

  const handleisEEFCPortionChange = (event) => {
    setIsEEFCPortion(event.target.checked);
  };

  const handleisEditRoundOffTAXChange = (event) => {
    setIsEditRoundOffTAX(event.target.checked);
  };

  const handleisEditBifurcateChange = (event) => {
    setIsEditBifurcate(event.target.checked);
  };

  const handleisEditEEFCProdsChange = (event) => {
    setIsEditEEFCProds(event.target.checked);
  };

  const handleisEditEEFCPortionChange = (event) => {
    setIsEditEEFCPortion(event.target.checked);
  };

  const ApplyOnOptions = ["Exchange", "Tax", "Gross"];

  const handleSubmitSave = async (event) => {
    // setisLoading(true);
    // const token = localStorage.getItem("token");
    event.preventDefault();
    var data = new FormData(event.target);
    let formObject = Object.fromEntries(data.entries());
    if (selectedFromDate) {
      formObject.FromDate = dayjs(selectedFromDate).format("DD-MM-YYYY");
      formObject.EndDate = dayjs(selectedEndDate).format("DD-MM-YYYY");
    } else {
      // Handle the case where selectedDate is not set (e.g., no date selected)
      formObject.FromDate = ""; // Or any other default value
      formObject.EndDate = "";
    }
    console.log(formObject);
    onSaveOtherInfo(formObject);
    showToast("Saved Successfully!", "success");
    setTimeout(() => hideToast(), 2000);
    handleHideOtherInfoModal();
  };

  const handleEditSubmitSave = async (event) => {
    event.preventDefault();
    var data = new FormData(event.target);
    let formObject = Object.fromEntries(data.entries());
    if (selectedEditFromDate) {
      formObject.FromDate = dayjs(selectedEditFromDate, "DD-MM-YYYY").format(
        "DD-MM-YYYY"
      );
      formObject.EndDate = selectedEditEndDate
        ? dayjs(selectedEditEndDate, "DD-MM-YYYY").format("DD-MM-YYYY")
        : "";
    } else {
      // Handle the case where selectedDate is not set (e.g., no date selected)
      formObject.FromDate = ""; // Or any other default value
      formObject.EndDate = "";
    }
    console.log("Edit Other Info Data", formObject);
    onSaveEditedOtherInfo(formObject);
    showToast("Saved Successfully!", "success");
    setTimeout(() => hideToast(), 2000);
    handleHideOtherInfoModal();
  };

  return (
    <AnimatePresence>
      {showOtherInfoModal === true && (
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
              height: "40%",
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
              onClick={handleHideOtherInfoModal}
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
                  <p>Additional Information</p>
                </Box>
                <Box component={"form"} onSubmit={handleSubmitSave}>
                  <Box
                    id="inputs"
                    display={"grid"}
                    mt={{ xs: 2, md: 3 }}
                    gridTemplateColumns={
                      isMobile ? "repeat(1, 1fr)" : "repeat(3, 1fr)"
                    }
                    columnGap={isMobile ? "10px" : "40px"}
                    rowGap={isMobile ? "10px" : "40px"}
                  >
                    <DatePicker
                      label="From Date"
                      slotProps={{
                        textField: { name: "FromDate" },
                      }}
                      value={
                        selectedFromDate
                          ? dayjs(selectedFromDate, "YYYY-MM-DD")
                          : null
                      } // Parse PaxDOB with 'YYYY-MM-DD' format
                      onChange={(newValue) => {
                        setSelectedFromDate(
                          newValue ? newValue.format("YYYY-MM-DD") : null
                        );
                      }}
                      sx={{ width: isMobile ? "auto" : "12vw" }}
                      renderInput={(params) => (
                        <TextField {...params} variant="standard" />
                      )}
                      inputFormat="YYYY-MM-DD" // Specify the format expected for input
                      renderDay={(day, _value, _DayComponentProps) => (
                        <span>{dayjs(day).format("D")}</span>
                      )}
                      format="DD/MM/YYYY"
                    />
                    <Tooltip title="Leave Blank For No End Date">
                      <div>
                        <DatePicker
                          label="End Date"
                          slotProps={{
                            textField: { name: "EndDate" },
                          }}
                          value={
                            selectedEndDate
                              ? dayjs(selectedEndDate, "YYYY-MM-DD")
                              : null
                          } // Parse PaxDOB with 'YYYY-MM-DD' format
                          onChange={(newValue) => {
                            setSelectedEndDate(
                              newValue ? newValue.format("YYYY-MM-DD") : null
                            );
                          }}
                          sx={{ width: isMobile ? "auto" : "12vw" }}
                          renderInput={(params) => (
                            <TextField {...params} variant="standard" />
                          )}
                          inputFormat="YYYY-MM-DD" // Specify the format expected for input
                          renderDay={(day, _value, _DayComponentProps) => (
                            <span>{dayjs(day).format("D")}</span>
                          )}
                          format="DD/MM/YYYY"
                        />
                      </div>
                    </Tooltip>

                    <TextField
                      select
                      value={applyOn}
                      onChange={(e) => setApplyOn(e.target.value)}
                      sx={{ width: isMobile ? "auto" : "12vw" }}
                      name="ApplyOn"
                      label="Apply Tax On"
                    >
                      {ApplyOnOptions &&
                        ApplyOnOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                    </TextField>
                    {applyOn === "Tax" && (
                      <TextField
                        id="TaxCodeInfo"
                        name="TaxCodeInfo"
                        sx={{ width: isMobile ? "auto" : "12vw" }}
                        label="Tax Code"
                        value={taxCodeOtherInfo}
                        onChange={(e) => setTaxCodeOtherInfo(e.target.value)}
                      />
                    )}
                  </Box>

                  {applyOn === "Tax" && (
                    <Box display={"flex"} mt={3}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="RoundOffTAX"
                            checked={isRoundOffTAX}
                            onChange={handleisRoundOffTAXChange}
                          />
                        }
                        label="Round Off TAX"
                        sx={{ width: 170 }}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="Bifurcate"
                            checked={isBifurcate}
                            onChange={handleisBifurcateChange}
                          />
                        }
                        label="Bifurcate Cess etc (in print)"
                        sx={{ width: 170 }}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="EEFCProds"
                            checked={isEEFCProds}
                            onChange={handleisEEFCProdsChange}
                          />
                        }
                        label="EEFC (Products) Txn"
                        sx={{ width: 170 }}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="EEFCPortion"
                            checked={isEEFCPortion}
                            onChange={handleisEEFCPortionChange}
                          />
                        }
                        label="EEFC,CN Portion"
                        sx={{ width: 170 }}
                      />
                    </Box>
                  )}
                  <Box display={"flex"} justifyContent={"center"}>
                    <button
                      type="submit"
                      style={{
                        backgroundColor: Colortheme.secondaryBG,
                        color: "white",
                        borderRadius: 20,
                        width: 100,
                        height: 40,
                        border: "none",
                        cursor: "pointer",
                        marginTop: 20,
                      }}
                    >
                      SAVE
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
                  <p>Edit Additional Information</p>
                </Box>
                <Box component={"form"} onSubmit={handleEditSubmitSave}>
                  <Box
                    id="inputs"
                    display={"grid"}
                    mt={{ xs: 2, md: 3 }}
                    gridTemplateColumns={
                      isMobile ? "repeat(1, 1fr)" : "repeat(3, 1fr)"
                    }
                    columnGap={isMobile ? "10px" : "40px"}
                    rowGap={isMobile ? "10px" : "40px"}
                  >
                    <DatePicker
                      label="From Date"
                      slotProps={{
                        textField: { name: "FromDate" },
                      }}
                      value={
                        selectedEditFromDate
                          ? dayjs(selectedEditFromDate, "DD-MM-YYYY")
                          : null
                      }
                      onChange={(newValue) => {
                        setSelectedEditFromDate(
                          newValue ? newValue.format("DD-MM-YYYY") : null
                        );
                      }}
                      sx={{ width: isMobile ? "auto" : "12vw" }}
                      renderInput={(params) => (
                        <TextField {...params} variant="standard" />
                      )}
                      inputFormat="DD-MM-YYYY" // Specify the format expected for input
                      renderDay={(day, _value, _DayComponentProps) => (
                        <span>{dayjs(day).format("D")}</span>
                      )}
                      format="DD/MM/YYYY"
                    />
                    <Tooltip title="Leave Blank For No End Date">
                      <div>
                        <DatePicker
                          label="End Date"
                          slotProps={{
                            textField: { name: "EndDate" },
                          }}
                          value={
                            selectedEditEndDate
                              ? dayjs(selectedEditEndDate, "DD-MM-YYYY")
                              : null
                          }
                          onChange={(newValue) => {
                            setSelectedEditEndDate(
                              newValue ? newValue.format("DD-MM-YYYY") : null
                            );
                          }}
                          sx={{ width: "100%" }}
                          renderInput={(params) => (
                            <TextField {...params} variant="standard" />
                          )}
                          inputFormat="DD-MM-YYYY"
                          renderDay={(day, _value, _DayComponentProps) => (
                            <span>{dayjs(day).format("D")}</span>
                          )}
                          format="DD/MM/YYYY"
                        />
                      </div>
                    </Tooltip>

                    {/* <DatePicker
                      label="Date"
                      slotProps={{
                        textField: { name: "Date" },
                      }}
                      value={
                        selectedDate ? dayjs(selectedDate, "YYYY-MM-DD") : null
                      } // Parse PaxDOB with 'YYYY-MM-DD' format
                      onChange={(newValue) => {
                        setSelectedDate(
                          newValue ? newValue.format("YYYY-MM-DD") : null
                        );
                      }}
                      sx={{ width: isMobile ? "auto" : "12vw" }}
                      renderInput={(params) => (
                        <TextField {...params} variant="standard" />
                      )}
                      inputFormat="YYYY-MM-DD" // Specify the format expected for input
                      renderDay={(day, _value, _DayComponentProps) => (
                        <span>{dayjs(day).format("D")}</span>
                      )}
                      format="DD/MM/YYYY"
                    /> */}

                    <TextField
                      select
                      value={editApplyOn}
                      onChange={(e) => setEditApplyOn(e.target.value)}
                      sx={{ width: isMobile ? "auto" : "12vw" }}
                      name="ApplyOn"
                      label="Apply Tax On"
                    >
                      {ApplyOnOptions &&
                        ApplyOnOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                    </TextField>
                    {editApplyOn === "Tax" && (
                      <TextField
                        id="TaxCodeInfo"
                        name="editTaxCodeInfo"
                        sx={{ width: isMobile ? "auto" : "12vw" }}
                        label="Tax Code"
                        value={editTaxCodeOtherInfo}
                        onChange={(e) =>
                          setEditTaxCodeOtherInfo(e.target.value)
                        }
                      />
                    )}
                  </Box>

                  {editApplyOn === "Tax" && (
                    <Box display={"flex"} mt={3}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="editRoundOffTAX"
                            checked={isEditRoundOffTAX}
                            onChange={handleisEditRoundOffTAXChange}
                          />
                        }
                        label="Round Off TAX"
                        sx={{ width: 170 }}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="EditBifurcate"
                            checked={isEditBifurcate}
                            onChange={handleisEditBifurcateChange}
                          />
                        }
                        label="Bifurcate Cess etc (in print)"
                        sx={{ width: 170 }}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="EditEEFCProds"
                            checked={isEditEEFCProds}
                            onChange={handleisEditEEFCProdsChange}
                          />
                        }
                        label="EEFC (Products) Txn"
                        sx={{ width: 170 }}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="EditEEFCPortion"
                            checked={isEditEEFCPortion}
                            onChange={handleisEditEEFCPortionChange}
                          />
                        }
                        label="EEFC,CN Portion"
                        sx={{ width: 170 }}
                      />
                    </Box>
                  )}
                  <Box display={"flex"} justifyContent={"center"}>
                    <button
                      type="submit"
                      style={{
                        backgroundColor: Colortheme.secondaryBG,
                        color: "white",
                        borderRadius: 20,
                        width: 100,
                        height: 40,
                        border: "none",
                        cursor: "pointer",
                        marginTop: 20,
                      }}
                    >
                      SAVE
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

export default OtherInfo;
