import {
  Autocomplete,
  Box,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  TextField,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AnimatePresence, motion } from "framer-motion";
import {
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

const PaxModal = ({
  showPaxModal,
  createPax,
  searchPax,
  handleHidePaxModal,
  selectClickOnRowVisibility,
  handleSearchPaxClick,
  handlebackClickOnPaxSearch,
}) => {
  const { showToast, hideToast } = useToast();
  const [isLoading, setisLoading] = useState(false);

  const [paxName, setPaxName] = useState("");
  const [PaxEmail, setPaxEmail] = useState("");
  const [PaxDOB, setPaxDOB] = useState(null);
  const [PaxNumber, setPaxNumber] = useState("");
  const [PaxNationality, setPaxNationality] = useState("");
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
    { field: "p_number", headerName: "Passport Number", width: 180 },

    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      width: 200,
      renderCell: (params) => (
        <Box display={"flex"} gap={2}>
          <button
            className="ActionsButtonsEdit"
            onClick={() => handleSelectClickOnRow(params.row)}
          >
            Select
          </button>
          <button
            className="ActionsButtonsEdit"
            // onClick={() => handleEditClickOnRow(params.row)}
          >
            Edit
          </button>
          {/* {isLoading ? (
             <CircularProgress
               size="25px"
               style={{ color: COLORS.secondaryBG }}
             />
           ) : (
             <button
               className="ActionsButtonsDelete"
               onClick={() => handleDeleteClick(params.row)}
             >
               Delete
             </button>
           )} */}
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
    setPaxName(row.name);
    setPaxEmail(row.email);
    const formattedDob = dayjs(row.dob).format("DD-MM-YYYY");
    console.log(formattedDob);
    setPaxDOB(formattedDob);
    setPaxNumber(row.contactno);
    setPaxNationality(row.nationality);
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

  const handlePaxCreate = async (event) => {
    setisLoading(true);
    event.preventDefault();
    var data = new FormData(event.target);
    let PaxformObject = Object.fromEntries(data.entries());
    // setPaxData(PaxformObject);
    console.log(PaxformObject);

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
  };

  useEffect(() => {
    if (searchPax) {
      const FetchPaxMain = async () => {
        try {
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

  console.log("optionsDataLoading: ", optionsDataLoading);

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
              zIndex: 3,
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
              }}
            >
              &times;
            </button>
            {createPax === true && searchPax === false && (
              <Box
                display={"flex"}
                maxHeight={"80vh"}
                gap={5}
                component={"form"}
                autoComplete="off"
                onSubmit={handlePaxCreate}
              >
                <Box
                  className="OverFlowBox"
                  // component={"form"}
                  sx={{ maxHeight: "80vh", p: 2, overflowX: "auto" }}
                  border={`1px solid ${COLORS.secondaryBG}`}
                  borderRadius={"5px"}
                >
                  <p style={{ marginTop: -2, color: COLORS.background }}>
                    PAX Details
                  </p>
                  <Box
                    name="InputsContainer2"
                    display={"grid"}
                    gridTemplateColumns={"repeat(3, 1fr)"}
                    // gridTemplateRows={"repeat(4, 1fr)"}
                    columnGap={"40px"}
                    rowGap={"40px"}
                  >
                    <TextField
                      required
                      sx={{ width: "12vw" }}
                      name="PaxName"
                      label="Name"
                      value={paxName}
                      // onFocus={handleFocus}
                      // onChange={(e) => setPaxName(e.target.value)}
                      onChange={(e) => setPaxName(e.target.value)}
                    />

                    <TextField
                      sx={{ width: "12vw" }}
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
                      value={dayjs(PaxDOB)}
                      onChange={(date) => {
                        if (date) {
                          setPaxDOB(dayjs(date));
                        } else {
                          setPaxDOB(null);
                        }
                      }}
                      format="DD-MM-YYYY"
                      sx={{ width: "12vw" }}
                    />

                    <TextField
                      required
                      sx={{ width: "12vw" }}
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

                    <Autocomplete
                      // disablePortal
                      inputValue={PaxNationality}
                      options={
                        nationalityOptions &&
                        nationalityOptions.map((item) => item.description)
                      }
                      onInputChange={(e, newInputValue) => {
                        console.log("New Input Value:", newInputValue);
                        setPaxNationality(newInputValue);
                      }}
                      id="Nationality"
                      sx={{ width: "12vw" }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Nationality"
                          name="Nationality"
                          // value={PaxNationality}
                          // onChange={(e) => setPaxNationality(e.target.va)}
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
                    <TextField
                      sx={{ width: "12vw" }}
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
                      sx={{ width: "12vw" }}
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
                      sx={{ width: "12vw" }}
                      name="Bldg"
                      label="Building / Flat"
                      value={PaxBldg}
                      onChange={(e) => setPaxBldg(e.target.value)}
                    />
                    <TextField
                      sx={{ width: "12vw" }}
                      name="StreetName"
                      value={PaxStreet}
                      onChange={(e) => setPaxStreet(e.target.value)}
                      label="Street"
                    />
                    <Autocomplete
                      // disablePortal

                      id="City"
                      options={cities && cities.map((item) => item.description)}
                      // onChange={(e, newValue) => setCalculationMethod(newValue)}
                      sx={{ width: "12vw" }}
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

                          // value={calculationMethod}
                        />
                      )}
                    />
                    <Autocomplete
                      // disablePortal

                      id="State"
                      options={
                        stateOptions &&
                        stateOptions.map((item) => item.description)
                      }
                      // onChange={(e, newValue) => setCalculationMethod(newValue)}
                      sx={{ width: "12vw" }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="State"
                          name="State"
                          // value={calculationMethod}
                        />
                      )}
                    />
                    <Autocomplete
                      // disablePortal
                      id="Country"
                      options={
                        countries && countries.map((item) => item.description)
                      }
                      // onChange={(e, newValue) => setCalculationMethod(newValue)}
                      sx={{ width: "12vw" }}
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
                    <TextField
                      sx={{ width: "12vw" }}
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
                      sx={{ width: "12vw" }}
                      name="PanName"
                      label="Pan Holder Name"
                      value={PaxPanName}
                      onChange={(e) => setPaxPanName(e.target.value)}
                    />
                    <TextField
                      select
                      sx={{ width: "12vw" }}
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
                      sx={{ width: "12vw" }}
                      name="UIN"
                      label="UIN"
                      value={paxUIN}
                      onChange={(e) => setpaxUIN(e.target.value)}
                    />
                    <TextField
                      sx={{ width: "12vw" }}
                      name="PaidPanNumber"
                      label="Paid Pan Number"
                      value={paxPaidPanNumber}
                      onChange={(e) => setpaxPaidPanNumber(e.target.value)}
                    />
                    <TextField
                      sx={{ width: "12vw" }}
                      name="PaidPanName"
                      label="Paid By"
                      value={paxPaidPanName}
                      onChange={(e) => setpaxPaidPanName(e.target.value)}
                    />

                    <TextField
                      sx={{ width: "12vw" }}
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
                      sx={{ width: "12vw" }}
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
                      sx={{ width: "12vw" }}
                      name="GSTIN"
                      label="GSTIN"
                      value={paxGSTIN}
                      onChange={(e) => setpaxGSTIN(e.target.value)}
                    />
                    <TextField
                      sx={{ width: "12vw" }}
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
                  sx={{ padding: 4, overflow: "scroll", overflowX: "hidden" }}
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
                          sx={{ width: "12vw" }}
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
                          sx={{ width: "12vw" }}
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
                          slotProps={{
                            textField: { name: "PassIssuedDate" },
                          }}
                          label="Issued Date"
                          // value={selectedDate}
                          // onChange={handleDateChange}
                          format="DD-MM-YYYY"
                          sx={{ width: "12vw" }}
                        />

                        {/* <TextField
                      sx={{ width: "12vw" }}
                      name="PassExpDate"
                      label="Expiry Date"
                    /> */}

                        <DatePicker
                          slotProps={{
                            textField: { name: "PassExpiryDate" },
                          }}
                          label="Expiry Date"
                          // value={selectedDate}
                          // onChange={handleDateChange}
                          format="DD-MM-YYYY"
                          sx={{ width: "12vw" }}
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
                        <Autocomplete
                          disablePortal
                          id="OtherIDType"
                          options={
                            idOptions &&
                            idOptions.map((item) => item.description)
                          }
                          // onChange={(e, newValue) => setCalculationMethod(newValue)}
                          sx={{ width: "12vw" }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="ID Type"
                              name="OtherIDType"
                              // value={calculationMethod}
                            />
                          )}
                        />

                        <TextField
                          sx={{ width: "12vw" }}
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
                          // value={selectedDate}
                          // onChange={handleDateChange}
                          format="DD-MM-YYYY"
                          sx={{ width: "12vw" }}
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
                            sx={{ width: "2vw", height: "3vh" }}
                            name="TCSExemption"
                          />
                        </Box>

                        <TextField
                          sx={{ width: "25vw" }}
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
                  display={"flex"}
                  flexDirection={"column"}
                  gap={5}
                  marginTop={20}
                >
                  <button className="SavePax" type="submit">
                    {isLoading ? <CircularProgress /> : "Create"}
                  </button>

                  <button className="SavePax" onClick={handleSearchPaxClick}>
                    {isLoading ? <CircularProgress /> : "Search"}
                  </button>
                </Box>
              </Box>
            )}
            {/* ------------------------------------------------------------SEARCHPAX START-------------------------------------------------------------- */}

            {searchPax === true &&
              createPax === false &&
              paxDetailsFullMain && (
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
                      width: "16vw",
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
                  <Box
                    display={"flex"}
                    mt={5}
                    width={"95%"}
                    alignSelf={"center"}
                  >
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
                      columnVisibilityModel={{
                        // Hide columns status and traderName, the other columns will remain visible
                        paxid: false,
                      }}
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
                        maxHeight: "400px",
                        height: "400px",
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
