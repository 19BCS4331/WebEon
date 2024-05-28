import {
  Autocomplete,
  Box,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AnimatePresence, motion } from "framer-motion";
import {
  PaxCheck,
  PaxDetailsFullMain,
  postPaxDetails,
} from "../../../apis/IndiviOrCorp/Buy";
import { useToast } from "../../../contexts/ToastContext";
import { COLORS } from "../../../assets/colors/COLORS";
import { useEffect, useState } from "react";
import {
  fetchCityOptions,
  fetchCountryOptions,
  fetchIDOptions,
  fetchNationalityOptions,
  fetchStateOptions,
} from "../../../apis/OptionsMaster";

import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import FlagIcon from "@mui/icons-material/Flag";
import ArticleIcon from "@mui/icons-material/Article";
import MoneyIcon from "@mui/icons-material/Money";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import NotListedLocationIcon from "@mui/icons-material/NotListedLocation";
import PersonPinIcon from "@mui/icons-material/PersonPin";
import HomeRepairServiceIcon from "@mui/icons-material/HomeRepairService";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import Skeleton from "@mui/material/Skeleton";

const PaxModal = ({
  showPaxModal,
  createPax,
  searchPax,
  handleHidePaxModal,
  selectClickOnRowVisibility,
  handleSearchPaxClick,
  handlebackClickOnPaxSearch,
  setIsPaxSaved,
  setPaxData,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { showToast, hideToast } = useToast();
  const [isLoading, setisLoading] = useState(false);

  const [paxID, setPaxID] = useState("");
  const [paxName, setPaxName] = useState("");
  const [PaxEmail, setPaxEmail] = useState("");
  const [PaxDOB, setPaxDOB] = useState(null);
  const [PaxNumber, setPaxNumber] = useState("");
  const [PaxNationality, setPaxNationality] = useState("");
  const [PaxCity, setPaxCity] = useState("");
  const [PaxState, setPaxState] = useState("");
  const [PaxCountry, setPaxCountry] = useState("");
  const [PaxOccupation, setPaxOccupation] = useState("");
  const [paxResiStatus, setPaxResiStatus] = useState("Select");
  const [PaxBldg, setPaxBldg] = useState("");
  const [PaxStreet, setPaxStreet] = useState("");
  const [PaxPanNumber, setPaxPanNumber] = useState("");
  const [PaxPanName, setPaxPanName] = useState("");
  const [paxRelation, setpaxRelation] = useState("Select");
  const [paxUIN, setpaxUIN] = useState("");
  const [paxPaidPanNumber, setpaxPaidPanNumber] = useState("");
  const [paxPaidPanName, setpaxPaidPanName] = useState("");
  const [paxLoanAmount, setpaxLoanAmount] = useState("");
  const [paxDeclaredAmount, setpaxDeclaredAmount] = useState("");
  const [paxGSTIN, setpaxGSTIN] = useState("");
  const [paxGSTState, setpaxGSTState] = useState("");
  const [paxPassNumber, setpaxPassNumber] = useState("");
  const [paxPassIssuedAt, setpaxPassIssuedAt] = useState("");
  const [PaxPassIssuedDate, setPaxPassIssuedDate] = useState(null);
  const [PaxPassExpiryDate, setPaxPassExpiryDate] = useState(null);
  const [paxOtherIDType, setPaxOtherIDType] = useState("");
  const [PaxOtherIDExpiryDate, setPaxOtherIDExpiryDate] = useState(null);
  const [otherIDNumber, setOtherIDNumber] = useState("");
  const [exemptionRemarks, setExemptionRemarks] = useState("");

  const [countries, setCountries] = useState(null);
  const [cities, setCities] = useState(null);
  const [stateOptions, setStateOptions] = useState(null);
  const [nationalityOptions, setNationalityOptions] = useState(null);
  const [idOptions, setIDOptions] = useState(null);
  const [optionsDataLoading, setOptionsDataLoading] = useState(true);

  const [paxDetailsFullMain, setPaxDetailsFullMain] = useState(null);

  const [searchKeyword, setSearchKeyword] = useState("");

  const [selectionModel, setSelectionModel] = useState([]);

  const resiStatus = ["Select", "Resident", "Non-Resident"];
  const PanRelationOptions = [
    "Select",
    "Brother",
    "Company",
    "Daughter",
    "Father",
    "Father In Law",
    "Husband",
    "Mother",
    "Mother In Law",
    "Self",
    "Sister",
    "Son",
    "Wife",
  ];

  const columnsPax = [
    { field: "paxid", headerName: "ID", width: 140 },
    { field: "name", headerName: "Name", width: 200 },
    { field: "pan_number", headerName: "Pan Number", width: 180 },
    { field: "address", headerName: "Address", width: 600 },
    { field: "contactno", headerName: "Mobile Number", width: 180 },

    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      width: 200,
      renderCell: (params) => (
        <Box>
          <button
            className="ActionsButtonsEdit"
            onClick={() => handleSelectClickOnRow(params.row)}
          >
            Select
          </button>
        </Box>
      ),
    },
    // {
    //   field: "branchcode",
    //   headerName: "Branch Code",

    //   width: 130,
    // },
  ];

  const handleSelectionModelChange = (newSelection) => {
    // Ensure that only one row is selected at a time
    if (newSelection.length > 0) {
      setSelectionModel([newSelection[newSelection.length - 1]]);
    } else {
      setSelectionModel(newSelection);
    }
  };

  const handleSelectClickOnRow = (row) => {
    // ----------------------Setting States for pax form-----------------------------------
    console.log("rowData", row);
    if (row) {
      setPaxID(row.paxid);
      setPaxName(row.name);
      setPaxEmail(row.email);
    }
    // const datePart = row.dob.split("T")[0];

    // ----------------------------DATEPICKERS----------------------------
    const adjustedDOB = dayjs(row.dob).format("YYYY-MM-DD");
    console.log(adjustedDOB);
    setPaxDOB(adjustedDOB);

    const adjustedIssuedDate = dayjs(row.p_issued_date).format("YYYY-MM-DD");
    console.log(adjustedIssuedDate);
    setPaxPassIssuedDate(adjustedIssuedDate);

    const adjustedPExpiry = dayjs(row.p_expiry).format("YYYY-MM-DD");
    console.log(adjustedPExpiry);
    setPaxPassExpiryDate(adjustedPExpiry);

    const adjustedOtherIDExpiry = dayjs(row.otherid_expiry).format(
      "YYYY-MM-DD"
    );
    console.log(adjustedOtherIDExpiry);
    setPaxOtherIDExpiryDate(adjustedOtherIDExpiry);

    // ----------------------------DATEPICKERS-----------------------------

    setPaxNumber(row.contactno);
    setPaxNationality(row.nationality);
    setPaxCity(row.city);
    setPaxState(row.state);
    setPaxCountry(row.country);
    setPaxOccupation(row.occupation);
    setPaxResiStatus(row.residentstatus);
    setPaxBldg(row.bldg);
    setPaxStreet(row.street);
    setPaxPanNumber(row.pan_number);
    setPaxPanName(row.pan_name);
    setpaxRelation(row.pan_relation);
    setpaxUIN(row.uin);
    setpaxPaidPanNumber(row.paidpan_number);
    setpaxPaidPanName(row.paidby_name);
    setpaxLoanAmount(row.loan_amount);
    setpaxDeclaredAmount(row.declared_amount);
    setpaxGSTIN(row.gst_number);
    setpaxGSTState(row.gst_state);

    setpaxPassNumber(row.p_number);
    setpaxPassIssuedAt(row.p_issuedat);

    setPaxOtherIDType(row.otherid_type);
    setOtherIDNumber(row.otherid_number);
    setExemptionRemarks(row.exemption_remarks);

    setSearchKeyword("");
    selectClickOnRowVisibility();
    // ----------------------Setting States for pax form-----------------------------------
  };

  useEffect(() => {
    setOptionsDataLoading(true);
    if (showPaxModal) {
      const OptionsFetch = async () => {
        const Countryresponse = await fetchCountryOptions();
        setCountries(Countryresponse);

        const Cityresponse = await fetchCityOptions();
        setCities(Cityresponse);

        const Stateresponse = await fetchStateOptions();
        setStateOptions(Stateresponse);

        const NationalityResponse = await fetchNationalityOptions();
        setNationalityOptions(NationalityResponse);

        const IDResponse = await fetchIDOptions();
        setIDOptions(IDResponse);

        setOptionsDataLoading(false);
      };
      OptionsFetch();
    }
  }, [showPaxModal]);

  useEffect(() => {
    if (searchPax) {
      const FetchPaxMain = async () => {
        try {
          await new Promise((resolve) => setTimeout(resolve, 300));
          const response = await PaxDetailsFullMain();
          setPaxDetailsFullMain(response);
          console.log(response);
        } catch (error) {
          console.log(error);
        }
      };
      FetchPaxMain();
    }
  }, [searchPax]);

  const handleSaveClick = async (event) => {
    setisLoading(true);
    event.preventDefault();
    var data = new FormData(event.target);
    let PaxformObject = Object.fromEntries(data.entries());
    console.log("Passport issued date:", PaxformObject.PassIssuedDate);
    // setPaxData(PaxformObject);
    console.log(PaxformObject);
    const response = await PaxCheck(
      PaxformObject.PaxName,
      PaxformObject.ContactNo
    );
    console.log(response.data.exists);
    console.log("response for saveclick", response.data);
    if (
      response.data.exists &&
      response.data.message ==
        "A PAX with the same name or mobile number already exists."
    ) {
      // If a matching PAX exists, update the view accordingly
      //   alert("A PAX with the same name and number already exists.");
      // Optionally, you can navigate to the existing PAX details page
      // history.push(`/pax/${response.data.existingPaxId}`);
      setIsPaxSaved(true);
      setPaxData({ paxid: paxID, name: paxName /* other pax data */ });
      setisLoading(false);
    } else if (
      response.data.exists &&
      response.data.message ==
        "Mobile number already exists with a different name."
    ) {
      setisLoading(false);
      showToast("Mobile Number Already Exists!", "fail");
      setTimeout(() => {
        hideToast();
      }, 2000);
    } else if (
      response.data.exists &&
      response.data.message == "Pax already exists with a different Number."
    ) {
      setisLoading(false);
      showToast("Pax Already Exists With Different Number!", "fail");
      setTimeout(() => {
        hideToast();
      }, 2000);
    } else {
      // If no matching PAX exists, proceed to save the PAX details

      if (PaxformObject.Paxname !== "") {
        try {
          const response = await postPaxDetails(
            PaxformObject.PaxName,
            PaxformObject.EmailID,
            PaxformObject.DOB,
            PaxformObject.ContactNo,
            PaxformObject.Nationality,
            PaxformObject.Occupation,
            PaxformObject.ResiStatus,
            PaxformObject.Bldg +
              " " +
              PaxformObject.StreetName +
              " " +
              PaxformObject.City +
              " " +
              PaxformObject.State +
              " " +
              PaxformObject.Country,
            PaxformObject.Bldg,
            PaxformObject.StreetName,
            PaxformObject.City,
            PaxformObject.State,
            PaxformObject.Country,
            PaxformObject.PanNo,
            PaxformObject.PanName,
            PaxformObject.PanHolderRelation,
            PaxformObject.UIN,
            PaxformObject.PaidPanNumber,
            PaxformObject.PaidPanName,
            PaxformObject.LoanAmount,
            PaxformObject.DeclaredAmount,
            PaxformObject.GSTIN,
            PaxformObject.GSTState,
            PaxformObject.isTourOperator,
            PaxformObject.isProprietorShip,
            PaxformObject.isNRI,
            PaxformObject.isITRProcess,
            PaxformObject.PassNumber,
            PaxformObject.PassIssueAt,
            PaxformObject.PassIssuedDate,
            PaxformObject.PassExpiryDate,
            PaxformObject.OtherIDType,
            PaxformObject.OtherIDNo,
            PaxformObject.OtherIDExpiry,
            PaxformObject.TCSExcemption,
            PaxformObject.ExemptionRemarks
          );

          console.log(response.data);
          showToast("Pax Added Successfully!", "success");
          setTimeout(() => {
            hideToast();
          }, 1500);
          setisLoading(false);
          // setIsPaxSaved(true);
          // handlePaxSubmit();
        } catch (error) {
          console.log(error);
          setisLoading(false);
        }
      } else {
        setisLoading(false);
        showToast("Please Enter All Fields", "Fail");
        setTimeout(() => {
          hideToast();
        }, 1500);
      }
      //   alert("PAX details saved successfully!");
      setIsPaxSaved(true);
      setPaxData({ paxid: paxID, name: paxName /* other pax data */ });
    }
  };

  // console.log("paxid", paxID);

  return (
    <AnimatePresence>
      {showPaxModal === true && (
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
              width: "90%",
              height: "85%",
              backgroundColor: "white",
              position: "absolute",
              top: "4%",
              bottom: 0,
              left: "4%",
              right: 0,
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
              onClick={handleHidePaxModal}
              style={{
                alignSelf: "flex-end",
                borderRadius: 50,
                border: "none",
                width: 80,
                height: 40,
                cursor: "pointer",
                marginBottom: isMobile ? "40px" : "20px",
              }}
            >
              &times;
            </button>
            {createPax === true && searchPax === false && (
              <Box
                display={isMobile ? "block" : "flex"}
                maxHeight={"80vh"}
                sx={{ overflow: isMobile ? "auto" : "visible", zIndex: 5 }}
                gap={5}
                component={"form"}
                autoComplete="off"
                onSubmit={handleSaveClick}
              >
                <Box
                  className="OverFlowBox"
                  // component={"form"}
                  sx={{
                    maxHeight: "80vh",
                    p: 2,
                    overflowX: "auto",
                    width: isMobile ? "76vw" : "auto",
                  }}
                  border={`1px solid ${COLORS.secondaryBG}`}
                  borderRadius={"5px"}
                >
                  <p style={{ marginTop: -2, color: COLORS.background }}>
                    PAX Details
                  </p>
                  <Box
                    name="InputsContainer2"
                    display={"grid"}
                    // gridTemplateColumns={"repeat(3, 1fr)"}
                    gridTemplateColumns={
                      isMobile ? "repeat(1, 1fr)" : "repeat(3, 1fr)"
                    }
                    // gridTemplateRows={"repeat(4, 1fr)"}
                    columnGap={isMobile ? "auto" : "40px"}
                    rowGap={"40px"}
                  >
                    <TextField
                      required
                      sx={{ width: isMobile ? "auto" : "12vw" }}
                      name="PaxName"
                      label="Name"
                      value={paxName}
                      // onFocus={handleFocus}
                      // onChange={(e) => setPaxName(e.target.value)}
                      onChange={(e) => setPaxName(e.target.value)}
                    />

                    <TextField
                      sx={{ width: isMobile ? "auto" : "12vw" }}
                      name="EmailID"
                      label="Email ID"
                      type="email"
                      value={PaxEmail}
                      onChange={(e) => setPaxEmail(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <EmailIcon />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <DatePicker
                      label="Date Of Birth"
                      slotProps={{
                        textField: { name: "DOB" },
                      }}
                      value={PaxDOB ? dayjs(PaxDOB, "YYYY-MM-DD") : null} // Parse PaxDOB with 'YYYY-MM-DD' format
                      onChange={(newValue) => {
                        setPaxDOB(
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

                    <TextField
                      required
                      sx={{ width: isMobile ? "auto" : "12vw" }}
                      name="ContactNo"
                      label="Contact Number"
                      value={PaxNumber}
                      onChange={(e) => setPaxNumber(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <PhoneIcon />
                          </InputAdornment>
                        ),
                      }}
                    />

                    {nationalityOptions ? (
                      <Autocomplete
                        value={PaxNationality}
                        onChange={(event, newValue) => {
                          setPaxNationality(newValue);
                        }}
                        options={nationalityOptions.map(
                          (item) => item.description
                        )}
                        id="Nationality"
                        sx={{ width: isMobile ? "auto" : "12vw" }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Nationality"
                            name="Nationality"
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  <InputAdornment position="end">
                                    <PersonPinIcon />
                                  </InputAdornment>
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                      />
                    ) : (
                      <Skeleton
                        variant="rectangular"
                        width={isMobile ? "auto" : "12vw"}
                        height={60}
                        animation={"wave"}
                      />
                    )}
                    <TextField
                      sx={{ width: isMobile ? "auto" : "12vw" }}
                      name="Occupation"
                      label="Occupation"
                      value={PaxOccupation}
                      onChange={(e) => setPaxOccupation(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <HomeRepairServiceIcon />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      select
                      sx={{ width: isMobile ? "auto" : "12vw" }}
                      name="ResiStatus"
                      label="Residential Status"
                      value={paxResiStatus}
                      onChange={(e) => setPaxResiStatus(e.target.value)}
                    >
                      {resiStatus &&
                        resiStatus.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                      sx={{ width: isMobile ? "auto" : "12vw" }}
                      name="Bldg"
                      label="Building / Flat"
                      value={PaxBldg}
                      onChange={(e) => setPaxBldg(e.target.value)}
                    />
                    <TextField
                      sx={{ width: isMobile ? "auto" : "12vw" }}
                      name="StreetName"
                      value={PaxStreet}
                      onChange={(e) => setPaxStreet(e.target.value)}
                      label="Street"
                    />

                    {cities ? (
                      <Autocomplete
                        // disablePortal

                        id="City"
                        value={PaxCity}
                        onChange={(event, newValue) => {
                          setPaxCity(newValue);
                        }}
                        options={cities.map((item) => item.description)}
                        sx={{ width: isMobile ? "auto" : "12vw" }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="City"
                            name="City"
                            InputProps={{
                              ...params.InputProps,

                              endAdornment: (
                                <>
                                  <InputAdornment position="end">
                                    <LocationCityIcon />
                                  </InputAdornment>
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                      />
                    ) : (
                      <Skeleton
                        variant="rectangular"
                        width={isMobile ? "auto" : "12vw"}
                        height={60}
                        animation={"wave"}
                      />
                    )}
                    {stateOptions ? (
                      <Autocomplete
                        // disablePortal

                        id="State"
                        value={PaxState}
                        onChange={(event, newValue) => {
                          setPaxState(newValue);
                        }}
                        options={stateOptions.map((item) => item.description)}
                        // onChange={(e, newValue) => setCalculationMethod(newValue)}
                        sx={{ width: isMobile ? "auto" : "12vw" }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="State"
                            name="State"
                            // value={calculationMethod}
                          />
                        )}
                      />
                    ) : (
                      <Skeleton
                        variant="rectangular"
                        width={isMobile ? "auto" : "12vw"}
                        height={60}
                        animation={"wave"}
                      />
                    )}
                    {countries ? (
                      <Autocomplete
                        // disablePortal
                        id="Country"
                        value={PaxCountry}
                        onChange={(event, newValue) => {
                          setPaxCountry(newValue);
                        }}
                        options={countries.map((item) => item.description)}
                        // onChange={(e, newValue) => setCalculationMethod(newValue)}
                        sx={{ width: isMobile ? "auto" : "12vw" }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Country"
                            name="Country"
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  <InputAdornment position="end">
                                    <FlagIcon />
                                  </InputAdornment>

                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                            // value={calculationMethod}
                          />
                        )}
                      />
                    ) : (
                      <Skeleton
                        variant="rectangular"
                        width={isMobile ? "auto" : "12vw"}
                        height={60}
                        animation={"wave"}
                      />
                    )}

                    <TextField
                      sx={{ width: isMobile ? "auto" : "12vw" }}
                      name="PanNo"
                      label="Pan Number"
                      value={PaxPanNumber}
                      onChange={(e) => setPaxPanNumber(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <ArticleIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      sx={{ width: isMobile ? "auto" : "12vw" }}
                      name="PanName"
                      label="Pan Holder Name"
                      value={PaxPanName}
                      onChange={(e) => setPaxPanName(e.target.value)}
                    />
                    <TextField
                      select
                      sx={{ width: isMobile ? "auto" : "12vw" }}
                      name="PanHolderRelation"
                      label="Pan Holder Relation"
                      value={paxRelation}
                      onChange={(e) => setpaxRelation(e.target.value)}
                    >
                      {PanRelationOptions &&
                        PanRelationOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                      sx={{ width: isMobile ? "auto" : "12vw" }}
                      name="UIN"
                      label="UIN"
                      value={paxUIN}
                      onChange={(e) => setpaxUIN(e.target.value)}
                    />

                    <TextField
                      sx={{ width: isMobile ? "auto" : "12vw" }}
                      name="PaidPanNumber"
                      label="Paid Pan Number"
                      value={paxPaidPanNumber}
                      onChange={(e) => setpaxPaidPanNumber(e.target.value)}
                    />
                    <TextField
                      sx={{ width: isMobile ? "auto" : "12vw" }}
                      name="PaidPanName"
                      label="Paid By"
                      value={paxPaidPanName}
                      onChange={(e) => setpaxPaidPanName(e.target.value)}
                    />

                    <TextField
                      sx={{ width: isMobile ? "auto" : "12vw" }}
                      name="LoanAmount"
                      label="Loan Amount"
                      value={paxLoanAmount}
                      onChange={(e) => setpaxLoanAmount(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <MoneyIcon />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      sx={{ width: isMobile ? "auto" : "12vw" }}
                      name="DeclaredAmount"
                      label="Declared Amount"
                      value={paxDeclaredAmount}
                      onChange={(e) => setpaxDeclaredAmount(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <MoneyIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Box display={"flex"} alignItems={"center"}>
                      <p>Tour Operator?</p>
                      <FormControlLabel
                        control={<Checkbox name="isTourOperator" />}
                        // label="isNRI"
                        sx={{ width: 50, marginLeft: 1 }}
                      />
                    </Box>
                    <Box display={"flex"} alignItems={"center"}>
                      <p>Proprietor Ship?</p>
                      <FormControlLabel
                        control={<Checkbox name="isProprietorShip" />}
                        // label="isNRI"
                        sx={{ width: 50, marginLeft: 1 }}
                      />
                    </Box>
                    <TextField
                      sx={{ width: isMobile ? "auto" : "12vw" }}
                      name="GSTIN"
                      label="GSTIN"
                      value={paxGSTIN}
                      onChange={(e) => setpaxGSTIN(e.target.value)}
                    />
                    <TextField
                      sx={{ width: isMobile ? "auto" : "12vw" }}
                      name="GSTState"
                      label="GST State"
                      value={paxGSTState}
                      onChange={(e) => setpaxGSTState(e.target.value)}
                    />
                  </Box>
                  <Box display={"flex"} alignItems={"center"} mt={2}>
                    <p>NRI?</p>
                    <FormControlLabel
                      control={<Checkbox name="isNRI" />}
                      // label="isNRI"
                      sx={{ width: 50, marginLeft: 1 }}
                    />
                  </Box>
                  <Box display={"flex"} alignItems={"center"}>
                    <p>ITR Process or TCS+TDS &lt;=50000?</p>
                    <FormControlLabel
                      control={<Checkbox name="isITRProcess" />}
                      // label="isNRI"
                      sx={{ width: 50, marginLeft: 1 }}
                    />
                  </Box>
                </Box>
                <Box
                  display={"flex"}
                  flexDirection={"column"}
                  gap={2}
                  border={`1px solid ${COLORS.secondaryBG}`}
                  sx={{
                    padding: 4,
                    overflow: "scroll",
                    overflowX: "hidden",
                    width: isMobile ? "70vw" : "auto",
                    marginTop: isMobile ? "40px" : "auto",
                  }}
                  borderRadius={"5px"}
                >
                  <Box>
                    <Box
                      // component={"form"}
                      sx={{
                        maxHeight: "20vh",
                        overflow: "hidden",
                        p: 2,
                      }}
                      border={`1px solid ${COLORS.secondaryBG}`}
                      borderRadius={"5px"}
                    >
                      <p style={{ marginTop: -2, color: COLORS.background }}>
                        Passport Information
                      </p>
                      <Box
                        name="InputsContainer2"
                        display={"grid"}
                        gridTemplateColumns={"repeat(2, 1fr)"}
                        // gridTemplateRows={"repeat(3, 1fr)"}
                        columnGap={"40px"}
                        rowGap={"20px"}
                      >
                        <TextField
                          sx={{ width: isMobile ? "auto" : "12vw" }}
                          name="PassNumber"
                          label="Passport Number"
                          value={paxPassNumber}
                          onChange={(e) => setpaxPassNumber(e.target.value)}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <AssignmentIndIcon />
                              </InputAdornment>
                            ),
                          }}
                        />

                        <TextField
                          sx={{ width: isMobile ? "auto" : "12vw" }}
                          name="PassIssueAt"
                          label="Issued At"
                          value={paxPassIssuedAt}
                          onChange={(e) => setpaxPassIssuedAt(e.target.value)}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <NotListedLocationIcon />
                              </InputAdornment>
                            ),
                          }}
                        />

                        {/* <TextField
                      sx={{ width: "12vw" }}
                      name="PassIssueDate"
                      label="Issued Date"
                    /> */}

                        <DatePicker
                          label="Issued Date"
                          slotProps={{
                            textField: { name: "PassIssuedDate" },
                          }}
                          value={
                            PaxPassIssuedDate
                              ? dayjs(PaxPassIssuedDate, "YYYY-MM-DD")
                              : null
                          } // Parse PaxDOB with 'YYYY-MM-DD' format
                          onChange={(newValue) => {
                            setPaxPassIssuedDate(
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

                        {/* <TextField
                      sx={{ width: "12vw" }}
                      name="PassExpDate"
                      label="Expiry Date"
                    /> */}

                        <DatePicker
                          label="Expiry Date"
                          slotProps={{
                            textField: { name: "PassExpiryDate" },
                          }}
                          value={
                            PaxPassExpiryDate
                              ? dayjs(PaxPassExpiryDate, "YYYY-MM-DD")
                              : null
                          } // Parse PaxDOB with 'YYYY-MM-DD' format
                          onChange={(newValue) => {
                            setPaxPassExpiryDate(
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
                      </Box>
                    </Box>
                  </Box>
                  <Box>
                    <Box
                      // component={"form"}
                      sx={{ maxHeight: "20vh", overflow: "hidden", p: 2 }}
                      border={`1px solid ${COLORS.secondaryBG}`}
                      borderRadius={"5px"}
                    >
                      <p style={{ marginTop: -5, color: COLORS.background }}>
                        Other ID Details
                      </p>
                      <Box
                        name="InputsContainer2"
                        display={"grid"}
                        gridTemplateColumns={"repeat(2, 1fr)"}
                        // gridTemplateRows={"repeat(3, 1fr)"}
                        columnGap={"40px"}
                        rowGap={"20px"}
                      >
                        {idOptions ? (
                          <Autocomplete
                            disablePortal
                            id="OtherIDType"
                            value={paxOtherIDType}
                            onChange={(event, newValue) => {
                              setPaxOtherIDType(newValue);
                            }}
                            options={idOptions.map((item) => item.description)}
                            isOptionEqualToValue={(option, value) =>
                              option === value
                            } // Custom equality test
                            sx={{ width: isMobile ? "auto" : "12vw" }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="ID Type"
                                name="OtherIDType"
                              />
                            )}
                          />
                        ) : (
                          <Skeleton
                            variant="rectangular"
                            width={isMobile ? "auto" : "12vw"}
                            height={60}
                          />
                        )}

                        <TextField
                          sx={{ width: isMobile ? "auto" : "12vw" }}
                          name="OtherIDNo"
                          label="ID Number"
                          value={otherIDNumber}
                          onChange={(e) => setOtherIDNumber(e.target.value)}
                        />

                        {/* <TextField
                      sx={{ width: "12vw" }}
                      name="OtherIDExpiry"
                      label="Expiry Date"
                    /> */}

                        <DatePicker
                          label="Expiry Date"
                          slotProps={{
                            textField: { name: "OtherIDExpiry" },
                          }}
                          value={
                            PaxOtherIDExpiryDate
                              ? dayjs(PaxOtherIDExpiryDate, "YYYY-MM-DD")
                              : null
                          } // Parse PaxDOB with 'YYYY-MM-DD' format
                          onChange={(newValue) => {
                            setPaxOtherIDExpiryDate(
                              newValue ? newValue.format("YYYY-MM-DD") : null
                            );
                          }}
                          sx={{
                            width: isMobile ? "auto" : "12vw",
                          }}
                          renderInput={(params) => (
                            <TextField {...params} variant="standard" />
                          )}
                          inputFormat="YYYY-MM-DD" // Specify the format expected for input
                          renderDay={(day, _value, _DayComponentProps) => (
                            <span>{dayjs(day).format("D")}</span>
                          )}
                          format="DD/MM/YYYY"
                        />
                      </Box>
                    </Box>
                  </Box>
                  <Box>
                    <Box
                      // component={"form"}
                      sx={{ maxHeight: "20vh", overflow: "hidden", p: 2 }}
                      border={`1px solid ${COLORS.secondaryBG}`}
                      borderRadius={"5px"}
                    >
                      <p style={{ marginTop: -5, color: COLORS.background }}>
                        TCS Exemption
                      </p>
                      <Box
                        name="InputsContainer2"
                        display={"flex"}
                        columnGap={"40px"}
                        flexDirection={"column"}
                      >
                        <Box display={"flex"} alignItems={"center"}>
                          <p>Government TCS Exemption</p>
                          <Checkbox
                            sx={{
                              width: "2vw",
                              height: "3vh",
                              marginLeft: isMobile ? "10px" : "auto",
                            }}
                            name="TCSExemption"
                          />
                        </Box>

                        <TextField
                          sx={{ width: isMobile ? "auto" : "25vw" }}
                          name="ExemptionRemarks"
                          label="Exemption Remarks"
                          value={exemptionRemarks}
                          onChange={(e) => setExemptionRemarks(e.target.value)}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Box>
                <Box
                  // position={"absolute"}
                  // bottom={"8vh"}
                  // right={"38vw"}
                  display={isMobile ? "block" : "flex"}
                  flexDirection={"column"}
                  marginLeft={isMobile ? "25%" : "auto"}
                  gap={5}
                  marginTop={isMobile ? 5 : 20}
                >
                  <button
                    className="SavePax"
                    type="submit"
                    style={{ width: isMobile ? "20vw" : "8vw" }}
                  >
                    {isLoading ? <CircularProgress /> : "Save"}
                  </button>

                  <button
                    className="SavePax"
                    onClick={handleSearchPaxClick}
                    style={{
                      width: isMobile ? "20vw" : "8vw",
                      marginLeft: isMobile ? 20 : "auto",
                    }}
                  >
                    {isLoading ? <CircularProgress /> : "Search"}
                  </button>
                </Box>
              </Box>
            )}
            {/* ------------------------------------------------------------SEARCHPAX START-------------------------------------------------------------- */}

            {searchPax === true && createPax === false && (
              <>
                <KeyboardBackspaceIcon
                  onClick={handlebackClickOnPaxSearch}
                  fontSize="large"
                  sx={{
                    alignSelf: "flex-start",
                    color: COLORS.secondaryBG,
                    position: "absolute",
                    cursor: "pointer",
                  }}
                />

                <TextField
                  placeholder="Search.."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  sx={{
                    "& fieldset": { border: "none" },
                  }}
                  style={{
                    display: "flex",
                    width: isMobile ? "auto" : "16vw",
                    backgroundColor: COLORS.text,
                    borderRadius: "20px",
                    border: `2px solid ${COLORS.secondaryBG}`,
                    height: 50,
                    justifyContent: "center",
                    boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1)",
                    alignSelf: "center",
                  }}
                  InputProps={
                    searchKeyword.length > 0
                      ? {
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <ClearIcon
                                onClick={() => setSearchKeyword("")}
                                style={{ cursor: "pointer" }}
                              />
                            </InputAdornment>
                          ),
                        }
                      : {
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          ),
                        }
                  }
                />
                <Box display={"flex"} mt={5} width={"95%"} alignSelf={"center"}>
                  {paxDetailsFullMain ? (
                    <DataGrid
                      disableRowSelectionOnClick
                      disableColumnFilter
                      rows={
                        paxDetailsFullMain &&
                        paxDetailsFullMain.filter((row) => {
                          if (searchKeyword === "") {
                            return true; // No search keyword, so show all rows
                          }

                          const lowerSearchKeyword =
                            searchKeyword.toLowerCase();

                          // Check if any column value includes the search keyword (case-insensitive)
                          for (const column of columnsPax) {
                            const cellValue = row[column.field]
                              ? row[column.field].toString().toLowerCase()
                              : "";
                            if (cellValue.includes(lowerSearchKeyword)) {
                              return true;
                            }
                          }

                          return false;
                        })
                      }
                      columnVisibilityModel={
                        isMobile
                          ? {
                              paxid: false,
                              pan_number: false,
                              address: false,
                              p_number: false,
                            }
                          : {
                              // Hide columns status and traderName, the other columns will remain visible
                              paxid: false,
                            }
                      }
                      getRowId={(row) => row.paxid}
                      rowSelectionModel={selectionModel}
                      onRowSelectionModelChange={handleSelectionModelChange}
                      sortModel={[
                        {
                          field: "paxid",
                          sort: "asc",
                        },
                      ]}
                      columns={columnsPax}
                      onModelChange={(model) => {
                        // Update the search keyword when filtering is applied
                        if (
                          model.filterModel &&
                          model.filterModel.items.length > 0
                        ) {
                          setSearchKeyword(model.filterModel.items[0].value);
                        } else {
                          setSearchKeyword("");
                        }
                      }}
                      sx={{
                        backgroundColor: COLORS.text,
                        p: "20px",
                        maxHeight: isMobile ? "500px" : "400px",
                        height: isMobile ? "500px" : "400px",
                        // width: "50vw",
                        boxShadow: 3,
                        border: "2px solid",
                        borderColor: COLORS.secondaryBG,
                        "& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnHeaderTitleContainer":
                          {
                            display: "none",
                          },
                      }}
                      initialState={{
                        pagination: {
                          paginationModel: { page: 0, pageSize: 5 },
                        },
                      }}
                      pageSizeOptions={[5, 10]}
                      // checkboxSelection
                    />
                  ) : (
                    <CircularProgress
                      style={{ marginLeft: "50%", marginTop: "10%" }}
                    />
                  )}
                </Box>
              </>
            )}

            {/* ------------------------------------------------------------SEARCHPAX END-------------------------------------------------------------- */}
          </Box>
        </>
      )}
    </AnimatePresence>
  );
};

export default PaxModal;
