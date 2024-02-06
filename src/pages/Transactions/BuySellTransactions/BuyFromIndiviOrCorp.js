import React, { useEffect, useState } from "react";
import MainContainerCompilation from "../../../components/global/MainContainerCompilation";
import {
  Autocomplete,
  Box,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Popper,
  TextField,
} from "@mui/material";

import "../../../css/components/formComponent.css";

import axios from "axios";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

import { DataGrid } from "@mui/x-data-grid";
import { AnimatePresence, motion } from "framer-motion";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import "../../../css/pages/CurrencyProfile.css";
import { useToast } from "../../../contexts/ToastContext";
import CustomAlertModalCurrency from "../../../components/CustomerAlertModalCurrency";
import { useNavigate } from "react-router-dom";
import { COLORS } from "../../../assets/colors/COLORS";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import "../../../css/components/buyfromindiv.css";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import dayjs from "dayjs";
import PersonPinIcon from "@mui/icons-material/PersonPin";
import HomeRepairServiceIcon from "@mui/icons-material/HomeRepairService";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import FlagIcon from "@mui/icons-material/Flag";
import ArticleIcon from "@mui/icons-material/Article";
import MoneyIcon from "@mui/icons-material/Money";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import NotListedLocationIcon from "@mui/icons-material/NotListedLocation";
// import Checkbox from "@mui/material/Checkbox";
import {
  fetchCountryOptions,
  fetchCityOptions,
  fetchNationalityOptions,
  fetchStateOptions,
  fetchIDOptions,
  fetchCurrencyRate,
} from "../../../apis/OptionsMaster/index.js";

import {
  postPaxDetails,
  PaxDetailsID,
  PaxDetailsFull,
  PaxDetailsFullMain,
} from "../../../apis/IndiviOrCorp/Buy/index.js";
import { ClickAwayListener } from "@mui/base/ClickAwayListener";
import PaxModal from "../../../components/Transactions/BuyFromIndivi/PaxModal.js";

const BuyFromIndivi = () => {
  // -----------------STATES START---------------------
  const navigate = useNavigate();
  const {
    showAlertDialogCurrency,
    hideAlertDialogCurrency,
    showToast,
    hideToast,
  } = useToast();
  const [isLoading, setisLoading] = useState(false);
  const options = ["hello", "hi", "bye"];

  const CalculationMethodOptions = ["Multiplication", "Division"];

  const [allCurrencyData, setAllCurrencyData] = useState(null);
  const [currencyOneData, setCurrencyOneData] = useState(null);
  const [isTransacDetailsView, setIsTransacDetailsView] = useState(false);

  // --------------create form states(values)--------------
  const [currencyCode, setCurrencyCode] = useState("");
  const [currencyName, setCurrencyName] = useState("");
  const [country, setCountry] = useState("");
  const [priority, setPriority] = useState("");
  const [ratePer, setRatePer] = useState("");
  const [defaultMinRate, setDefaultMinRate] = useState("");
  const [defaultMaxRate, setDefaultMaxRate] = useState("");
  const [calculationMethod, setCalculationMethod] = useState(null);
  const [openRatePremium, setOpenRatePremium] = useState("");
  const [gulfDiscFactor, setGulfDiscFactor] = useState("");
  const [amexMapCode, setAmexMapCode] = useState("");
  const [group, setGroup] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [isPartySelect, setIsPartySelect] = useState(false);

  const EntityOptions = ["Individual", "Corporate"];
  const PurposeOptions = ["Encashment", "Surrender"];

  // --------------end create form states (values--------------

  // --------------Edit form states--------------
  const [editedSelectedId, setEditedSelectedId] = useState("");
  const [editedcurrencyCode, setEditedCurrencyCode] = useState("");
  const [editedcurrencyName, setEditedCurrencyName] = useState("");
  const [editedcountry, setEditedCountry] = useState("");
  const [editedpriority, setEditedPriority] = useState("");
  const [editedratePer, setEditedRatePer] = useState("");
  const [editeddefaultMinRate, setEditedDefaultMinRate] = useState("");
  const [editeddefaultMaxRate, setEditedDefaultMaxRate] = useState("");
  const [editedcalculationMethod, setEditedCalculationMethod] = useState(null);
  const [editedopenRatePremium, setEditedOpenRatePremium] = useState("");
  const [editedgulfDiscFactor, setEditedGulfDiscFactor] = useState("");
  const [editedamexMapCode, setEditedAmexMapCode] = useState("");
  const [editedActiveStatus, setEditedActiveStatus] = useState("");
  const [editedgroup, setEditedGroup] = useState(null);

  // --------------end Edit form states--------------

  const [iscreateForm, setIsCreateForm] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [rowid, SetRowid] = useState(null);
  const [dataForEdit, setDataForEdit] = useState(null);

  // -----------------STATES END---------------------

  //  ---------------------FUNCTIONS START----------------------

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleSubmitCreate = async (event) => {
    // setisLoading(true);
    // const token = localStorage.getItem("token");
    event.preventDefault();
    var data = new FormData(event.target);
    let formObject = Object.fromEntries(data.entries());
    if (selectedDate) {
      formObject.Date = dayjs(selectedDate).format("DD-MM-YYYY");
    } else {
      // Handle the case where selectedDate is not set (e.g., no date selected)
      formObject.Date = ""; // Or any other default value
    }
    console.log(formObject);

    // if (
    //   currencyCode !== "" &&
    //   currencyCode.length === 3 &&
    //   currencyName !== "" &&
    //   priority !== "" &&
    //   ratePer !== ""
    // ) {
    //   try {
    //     const response = await axios.post(
    //       `http://localhost:5001/api/master/CurrencyMasterCreate`,
    //       {
    //         currency_code: formObject.CurrencyCode.toUpperCase(),
    //         currency_name: formObject.CurrencyName,
    //         priority: formObject.Priority,
    //         rateper: formObject.Rateper,
    //         defaultminrate: formObject.DefaultMinRate,
    //         defaultmaxrate: formObject.DefaultMaxRate,
    //         calculationmethod:
    //           formObject.CalculationMethod === "Multiplication" ? "M" : "D",
    //         openratepremium: formObject.OpenRatePremium,
    //         gulfdiscfactor: formObject.GulfDiscFactor,
    //         isactive: formObject.Activate === "on" ? true : false,
    //       },
    //       {
    //         headers: {
    //           Authorization: `Bearer ${token}`,
    //         },
    //       }
    //     );

    //     console.log(response.data);

    //     setisLoading(false);
    //     setCurrencyCode("");
    //     setCurrencyName("");
    //     setPriority("");
    //     setRatePer("");
    //     setDefaultMinRate("");
    //     setDefaultMaxRate("");
    //     setCalculationMethod("");
    //     setOpenRatePremium("");
    //     setGulfDiscFactor("");

    //     const updatedData = await CurrencyRefresh();
    //     if (updatedData) {
    //       setAllCurrencyData(updatedData);
    //     }
    //     showToast("Data Inserted Successfully!", "success");
    //     setTimeout(() => {
    //       hideToast();
    //     }, 1500);
    //   } catch (error) {
    //     console.log(error);
    //     setisLoading(false);
    //   }
    // }
    // if (currencyName === "" && priority === "" && ratePer === "") {
    //   setisLoading(false);
    //   showToast("Please Enter All Fields", "Fail");
    //   setTimeout(() => {
    //     hideToast();
    //   }, 1500);
    // } else if (currencyCode.length !== 3) {
    //   setisLoading(false);
    //   showToast("Currency Code Should be in 3 letters", "Fail");
    //   setTimeout(() => {
    //     hideToast();
    //   }, 1500);
    // }
  };

  const handleSubmitEdit = async (event) => {
    setisLoading(true);
    const token = localStorage.getItem("token");
    event.preventDefault();
    var data = new FormData(event.target);
    let formObject = Object.fromEntries(data.entries());
    console.log(formObject);
    if (
      editedcurrencyCode !== "" &&
      editedcurrencyName !== "" &&
      editedpriority !== "" &&
      editedratePer !== ""
    ) {
      try {
        const response = await axios.post(
          `http://localhost:5001/api/master/CurrencyMasterEdit`,
          {
            currencyid: editedSelectedId,
            currency_code: formObject.CurrencyCodeEdited,
            currency_name: formObject.CurrencyNameEdited,
            priority: formObject.PriorityEdited,
            rateper: formObject.RateperEdited,
            defaultminrate: formObject.DefaultMinRateEdited,
            defaultmaxrate: formObject.DefaultMaxRateEdited,
            calculationmethod:
              formObject.CalculationMethodEdited === "Multiplication"
                ? "M"
                : "D",
            openratepremium: formObject.OpenRatePremiumEdited,
            gulfdiscfactor: formObject.GulfDiscFactorEdited,
            isactive: formObject.ActivateEdited === "on" ? true : false,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(response.data);
        showToast("Data Edited Successfully!", "success");
        setTimeout(() => {
          hideToast();
        }, 1500);
        const updatedData = await CurrencyRefresh();
        if (updatedData) {
          setAllCurrencyData(updatedData);
        }
        setIsEdit(false);
        setIsSearch(true);
        setIsCreateForm(false);
        setisLoading(false);
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

  const handleSearchClick = () => {
    setIsSearch(true);
    // setIsEdit(true);
    setIsCreateForm(false);
  };

  const handlebackClickOnPax = () => {
    setIsPartySelect(false);
    setIsCreateForm(true);
  };

  const handlebackClickOnPaxSearch = () => {
    setSearchPax(false);
    setCreatePax(true);
  };

  const handlebackClickOnCreate = () => {
    navigate(-1);
  };

  const handleBackOnEdit = () => {
    setIsSearch(true);
    setIsEdit(false);
    setIsCreateForm(false);
  };

  const CurrencyRefresh = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:5001/api/master/CurrencyMasterAll`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAllCurrencyData(response.data);
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (isTransacDetailsView) {
      const fetchCurrencyAll = async () => {
        const token = localStorage.getItem("token");
        try {
          const response = await axios.get(
            `http://localhost:5001/api/master/CurrencyMasterAll`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setAllCurrencyData(response.data);
          console.log(response.data);
        } catch (error) {
          console.log(error);
        }
      };

      fetchCurrencyAll();
    }
  }, [isTransacDetailsView]);

  useEffect(() => {
    if (isTransacDetailsView) {
      const fetchCurrencyOne = async () => {
        const token = localStorage.getItem("token");
        try {
          const response = await axios.get(
            `http://localhost:5001/api/master/CurrencyMasterOne`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setCurrencyOneData(response.data);
          console.log(response.data);
        } catch (error) {
          console.log(error);
        }
      };

      fetchCurrencyOne();
    }
  }, [isTransacDetailsView]);

  const CurrencyMasterDelete = async (currencyid) => {
    setisLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `http://localhost:5001/api/master/CurrencyMasterDelete`,
        { currencyid: currencyid },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
      const updatedData = allCurrencyData.filter(
        (item) => item.currencyid !== currencyid
      );
      setAllCurrencyData(updatedData);
      setisLoading(false);
      showToast("Successfully Deleted!", "success");
      setTimeout(() => {
        hideToast();
      }, 2000);
      hideAlertDialogCurrency();
      // setSearchKeyword("");
    } catch (error) {
      console.log(error);
      setisLoading(false);
      hideAlertDialogCurrency();
    }
  };

  const selectClickOnRowVisibility = () => {
    setCreatePax(true);
    setSearchPax(false);
  };

  const handleEditClickOnRow = (row) => {
    // --------------setting all states-------------------------
    setEditedSelectedId(row.currencyid);
    setEditedCurrencyCode(row.currency_code);
    setEditedCurrencyName(row.currency_name);
    // setEditedCountry()
    setEditedPriority(row.priority);
    setEditedRatePer(row.rateper);
    setEditedDefaultMinRate(row.defaultminrate);
    setEditedDefaultMaxRate(row.defaultmaxrate);
    setEditedCalculationMethod(
      row.calculationmethod === "M" ? "Multiplication" : "Division"
    );
    setEditedOpenRatePremium(row.openratepremium);
    setEditedGulfDiscFactor(row.gulfdiscfactor);
    setEditedAmexMapCode(row.amexcode);
    setEditedActiveStatus(row.isactive);

    // setEditedGroup()

    // --------------End of setting all data states-------------------------

    setDataForEdit(row);
    setIsEdit(true);
    setIsCreateForm(false);
    setIsSearch(false);
    // setSearchKeyword("");
    // Switch the view and fetch the corresponding row's data for editing
    // You can set the data in your component's state for editing
    console.log("Edit button clicked for currency ID:", row.currencyid);

    // Add your logic to switch views and show the data in inputs
  };

  const handleDeleteClick = (row) => {
    SetRowid(row.currencyid);
    console.log("Delete button clicked for currency ID:", row.currencyid);
    showAlertDialogCurrency(`Delete the record : ${row.currency_name} `);
  };

  const handleCheckboxChange = (event) => {
    setEditedActiveStatus(event.target.checked); // Update the state when the checkbox is toggled
  };

  const handlePaxview = () => {
    setIsPartySelect(true);
    setIsCreateForm(false);
  };
  const [countries, setCountries] = useState(null);
  const [cities, setCities] = useState(null);
  const [stateOptions, setStateOptions] = useState(null);
  const [nationalityOptions, setNationalityOptions] = useState(null);
  const [idOptions, setIDOptions] = useState(null);
  const [optionsDataLoading, setOptionsDataLoading] = useState(true);

  const [currencyRateOptions, setCurrencyRateOptions] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [rateCurr, setRateCurr] = useState(null);
  const [transacType, setTransacType] = useState(null);
  const [feAmount, setFeAmount] = useState(null);
  const [isPaxSaved, setIsPaxSaved] = useState(false);
  const [paxData, setPaxData] = useState(null);
  const [showPaxNameDropdown, setShowPaxNameDropdown] = useState(false);

  const [paxNameOptions, setPaxNameOptions] = useState(null);
  const [searchItem, setSearchItem] = useState("");
  const [filteredPaxNames, setFilteredPaxNames] = useState(null);
  const [paxDetailsFullMain, setPaxDetailsFullMain] = useState(null);

  // ------------------------------ states for PAX MODAL-------------------------------------

  const [createPax, setCreatePax] = useState(true);
  const [searchPax, setSearchPax] = useState(false);
  const [showPaxModal, setShowPaxModal] = useState(false);

  // ------------------------------ states for PAX MODAL-------------------------------------

  const handleClickAway = () => {
    setShowPaxNameDropdown(false);
  };

  useEffect(() => {
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
    if (isTransacDetailsView) {
      const OptionsFetch = async () => {
        const CurrencyRateOptions = await fetchCurrencyRate();
        setCurrencyRateOptions(CurrencyRateOptions);

        setOptionsDataLoading(false);
      };
      OptionsFetch();
    }
  }, [isTransacDetailsView]);

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
  const TransTypeOptions = [
    "Select",
    "CN (Currency)",
    "EM (Encashed TM)",
    "ET (Encashed TCS)",
    "TP (TT Purchase Back)",
    "DP (DD Purchase Back)",
  ];

  const handlePaxCreate = async (event) => {
    setisLoading(true);
    event.preventDefault();
    var data = new FormData(event.target);
    let PaxformObject = Object.fromEntries(data.entries());
    setPaxData(PaxformObject);
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
        setIsPaxSaved(true);
        handlePaxSubmit();
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

  const handlePaxSubmit = () => {
    setIsPartySelect(false);
    setIsCreateForm(true);
  };

  const handleNextForTransac = () => {
    setIsTransacDetailsView(true);
    setIsCreateForm(false);
  };

  const handleCurrencyChange = (event, newValue) => {
    if (newValue !== null) {
      const selectedCurrency = newValue;
      const selectedRate = currencyRateOptions.find(
        (currency) => currency.currencycode === selectedCurrency
      ).rate;

      setSelectedCurrency(selectedCurrency);
      setRateCurr(selectedRate);
      console.log(selectedRate);
      console.log(newValue);
    } else {
      setRateCurr(null);
    }
  };

  const handlebackClickOnTransacView = () => {
    setIsTransacDetailsView(false);
    setIsCreateForm(true);
  };

  const finalAmountInit = feAmount * rateCurr;
  const finalAmount = finalAmountInit.toFixed(0);

  useEffect(() => {
    const fetchPaxId = async () => {
      try {
        const response = await PaxDetailsID();

        setPaxNameOptions(response);
      } catch (error) {
        console.log(error);
      }
    };

    fetchPaxId();
  }, []);

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

  const handleHidePaxModal = () => {
    setShowPaxModal(false);
  };

  const handleSearchPaxClick = () => {
    setCreatePax(false);
    setSearchPax(true);
  };

  //  ---------------------FUNCTIONS END----------------------

  return (
    <MainContainerCompilation title={"Buy From Individual / Corporates"}>
      {/* -------------------------CREATION START------------------------------- */}
      {iscreateForm && (
        <AnimatePresence>
          <Box
            component={motion.div}
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            exit={{ x: 50 }}
          >
            <Box
              display={"flex"}
              flexDirection={"column"}
              alignItems={"center"}
              name="ContainerBox"
              component={"form"}
              onSubmit={handleSubmitCreate}
              sx={{ backgroundColor: COLORS.text }}
              height={"auto"}
              p={3}
              width={"auto"}
              borderRadius={"40px"}
              boxShadow={"box-shadow: 0px 10px 15px -3px rgba(0,0,0,0.6)"}
            >
              <KeyboardBackspaceIcon
                onClick={handlebackClickOnCreate}
                fontSize="large"
                sx={{
                  alignSelf: "flex-start",
                  color: COLORS.secondaryBG,
                  position: "absolute",
                  cursor: "pointer",
                }}
              />
              <Box
                name="HeaderSection"
                textAlign={"center"}
                fontSize={"20px"}
                mt={0}
              >
                Buy From Individual / Corporates
              </Box>
              <Box name="HeaderSection" fontSize={"14px"} mt={2}>
                (Create New)
              </Box>
              {isLoading ? (
                <CircularProgress sx={{ marginTop: 5 }} />
              ) : (
                <Box
                  name="InputsContainer"
                  mt={5}
                  display={"grid"}
                  gridTemplateColumns={"repeat(4, 1fr)"}
                  gridTemplateRows={"repeat(3, 1fr)"}
                  columnGap={"40px"}
                  rowGap={"40px"}
                >
                  <TextField
                    select
                    sx={{ width: "12vw" }}
                    name="Entity"
                    label="Entity"
                    defaultValue="Individual"
                  >
                    {EntityOptions &&
                      EntityOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                  </TextField>

                  <TextField
                    select
                    sx={{ width: "12vw" }}
                    name="Purpose"
                    label="Purpose"
                    defaultValue="Encashment"
                  >
                    {PurposeOptions &&
                      PurposeOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                  </TextField>

                  <DatePicker
                    label="Date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    format="DD-MM-YYYY"
                    sx={{ width: "12vw" }}
                  />

                  {isPaxSaved && paxData ? (
                    <TextField
                      value={paxData.PaxName}
                      sx={{ width: "12vw" }}
                      label="Selected Pax"
                    />
                  ) : (
                    <button
                      // onClick={handlePaxview}
                      onClick={() => setShowPaxModal(true)}
                      className="PartySelect"
                    >
                      Select Party
                    </button>
                  )}

                  <TextField
                    id="ManualBillRef"
                    name="ManualBillRef"
                    sx={{ width: "12vw" }}
                    label="Manual Bill Ref"
                    value={ratePer}
                    onChange={(e) => setRatePer(e.target.value)}
                  />
                  <TextField
                    select
                    id="AgentSelect"
                    name="AgentSelect"
                    sx={{ width: "12vw" }}
                    label="Agent Involved?"
                    // value={defaultMinRate}
                    // onChange={(e) => setDefaultMinRate(e.target.value)}
                  />
                  <TextField
                    id="DefaultMaxRate"
                    name="DefaultMaxRate"
                    sx={{ width: "12vw" }}
                    label="Default Max Rate"
                    value={defaultMaxRate}
                    onChange={(e) => setDefaultMaxRate(e.target.value)}
                  />
                  <Autocomplete
                    disablePortal
                    id="CalculationMethod"
                    options={CalculationMethodOptions}
                    // onChange={(e, newValue) => setCalculationMethod(newValue)}
                    sx={{ width: "12vw" }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Calculation Method"
                        name="CalculationMethod"
                        // value={calculationMethod}
                      />
                    )}
                  />
                  <TextField
                    id="OpenRatePremium"
                    name="OpenRatePremium"
                    sx={{ width: "12vw" }}
                    label="Open Rate Premium"
                    value={openRatePremium}
                    onChange={(e) => setOpenRatePremium(e.target.value)}
                  />
                  <TextField
                    id="GulfDiscFactor"
                    name="GulfDiscFactor"
                    sx={{ width: "12vw" }}
                    label="Gulf Disc Factor"
                    value={gulfDiscFactor}
                    onChange={(e) => setGulfDiscFactor(e.target.value)}
                  />
                  <TextField
                    label="Amex Map Code"
                    name="AmexMapCode"
                    id="AmexMapCode"
                    sx={{ width: "12vw" }}
                    value={amexMapCode}
                    onChange={(e) => setAmexMapCode(e.target.value)}
                  />
                </Box>
              )}

              <Box
                display="flex"
                name="TransacDetailsBlock"
                mt={2}
                gap={5}
                flexDirection={"column"}
                alignItems={"center"}
              >
                <button className="NextOnCreate" onClick={handleNextForTransac}>
                  Next
                </button>
              </Box>
            </Box>
          </Box>
        </AnimatePresence>
      )}

      {/* -------------------------CREATION END------------------------------- */}

      {/* -------------------------EDIT START------------------------------- */}

      {isEdit && dataForEdit && (
        <AnimatePresence>
          <Box
            component={motion.div}
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            exit={{ y: -50 }}
          >
            <Box
              display={"flex"}
              flexDirection={"column"}
              alignItems={"center"}
              name="ContainerBox"
              component={"form"}
              onSubmit={handleSubmitEdit}
              sx={{ backgroundColor: COLORS.text }}
              height={"auto"}
              p={3}
              width={"auto"}
              borderRadius={"40px"}
              boxShadow={"box-shadow: 0px 10px 15px -3px rgba(0,0,0,0.6)"}
            >
              {isLoading ? (
                <CircularProgress size={"30px"} />
              ) : (
                <>
                  <Box
                    name="HeaderSection"
                    textAlign={"center"}
                    fontSize={"20px"}
                    mt={0}
                  >
                    Edit Data
                  </Box>
                  <Box name="HeaderSection" fontSize={"14px"} mt={2}>
                    (Currency : {dataForEdit.currency_name})
                  </Box>
                  <Box
                    name="InputsContainer"
                    mt={4}
                    display={"grid"}
                    gridTemplateColumns={"repeat(3, 1fr)"}
                    gridTemplateRows={"repeat(3, 1fr)"}
                    columnGap={"40px"}
                    rowGap={"40px"}
                  >
                    <TextField
                      sx={{ width: "12vw" }}
                      name="CurrencyCodeEdited"
                      value={editedcurrencyCode}
                      onChange={(e) => setEditedCurrencyCode(e.target.value)}
                      label="Currency Code"
                    />

                    <TextField
                      sx={{ width: "12vw" }}
                      name="CurrencyNameEdited"
                      label="Currency Name"
                      value={editedcurrencyName}
                      onChange={(e) => setEditedCurrencyName(e.target.value)}
                    />

                    <TextField
                      id="Priority"
                      sx={{ width: "12vw" }}
                      label={"Priority"}
                      name="PriorityEdited"
                      value={editedpriority}
                      onChange={(e) => setEditedPriority(e.target.value)}
                    />
                    <TextField
                      id="Rate/per"
                      name="RateperEdited"
                      sx={{ width: "12vw" }}
                      label="Rate / per"
                      value={editedratePer}
                      onChange={(e) => setEditedRatePer(e.target.value)}
                    />
                    <TextField
                      id="DefaultMinRate"
                      name="DefaultMinRateEdited"
                      sx={{ width: "12vw" }}
                      label="Default Min Rate"
                      value={editeddefaultMinRate}
                      onChange={(e) => setEditedDefaultMinRate(e.target.value)}
                    />
                    <TextField
                      id="DefaultMaxRate"
                      name="DefaultMaxRateEdited"
                      sx={{ width: "12vw" }}
                      label="Default Max Rate"
                      value={editeddefaultMaxRate}
                      onChange={(e) => setEditedDefaultMaxRate(e.target.value)}
                    />
                    <Autocomplete
                      disablePortal
                      id="CalculationMethod"
                      options={CalculationMethodOptions}
                      value={editedcalculationMethod}
                      onChange={(e, newValue) =>
                        setEditedCalculationMethod(newValue)
                      }
                      sx={{ width: "12vw" }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Calculation Method"
                          name="CalculationMethodEdited"
                          // value={calculationMethod}
                        />
                      )}
                    />
                    <TextField
                      id="OpenRatePremium"
                      name="OpenRatePremiumEdited"
                      sx={{ width: "12vw" }}
                      label="Open Rate Premium"
                      value={editedopenRatePremium}
                      onChange={(e) => setEditedOpenRatePremium(e.target.value)}
                    />
                    <TextField
                      id="GulfDiscFactor"
                      name="GulfDiscFactorEdited"
                      sx={{ width: "12vw" }}
                      label="Gulf Disc Factor"
                      value={editedgulfDiscFactor}
                      onChange={(e) => setEditedGulfDiscFactor(e.target.value)}
                    />
                    <TextField
                      label="Amex Map Code"
                      name="AmexMapCodeEdited"
                      id="AmexMapCode"
                      sx={{ width: "12vw" }}
                      value={editedamexMapCode}
                      onChange={(e) => setEditedAmexMapCode(e.target.value)}
                    />
                    <Autocomplete
                      disabled
                      disablePortal
                      id="Group"
                      options={options}
                      sx={{ width: "12vw" }}
                      renderInput={(params) => (
                        <TextField {...params} label="Group" name="Group" />
                      )}
                      // value={group}
                      // onChange={(_, newValue) => setGroup(newValue)}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="ActivateEdited"
                          checked={editedActiveStatus}
                          onChange={handleCheckboxChange}
                        />
                      }
                      label="Active"
                      sx={{ width: 50 }}
                    />
                    <FormControlLabel
                      control={<Checkbox name="OnlyStockingEdited" />}
                      label="Only Stocking"
                      sx={{ width: 50 }}
                    />
                  </Box>
                  <Box display="flex" name="FooterSection" mt={4} gap={5}>
                    <button
                      onClick={handleBackOnEdit}
                      className="FormFooterButton"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 5,
                      }}
                    >
                      <KeyboardBackspaceIcon />
                      Go Back
                    </button>

                    {/* <button className="FormFooterButton" type="reset">
                    Cancel
                  </button> */}
                    <button className="FormFooterButton" type="submit">
                      Edit & Save
                    </button>
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </AnimatePresence>
      )}

      {/* -------------------------EDIT END------------------------------- */}

      {/* --------------------------Transac Details Start----------------------- */}
      {isTransacDetailsView && (
        <Box
          display={"flex"}
          flexDirection={"column"}
          alignItems={"center"}
          sx={{ backgroundColor: COLORS.text }}
          width={"50vw"}
          height={"50vh"}
          borderRadius={"25px"}
          boxShadow={"0px 10px 15px -3px rgba(0,0,0,0.1)"}
        >
          <p style={{ color: COLORS.background, fontSize: "16px" }}>
            Transaction Details
          </p>
          <KeyboardBackspaceIcon
            onClick={handlebackClickOnTransacView}
            fontSize="large"
            sx={{
              alignSelf: "flex-start",
              color: COLORS.secondaryBG,
              position: "absolute",
              cursor: "pointer",
              marginTop: 1.5,
              marginLeft: 4,
            }}
          />

          <Box
            display={"flex"}
            gap={3}
            flexDirection={"column"}
            mt={2}
            border={`1px solid ${COLORS.secondaryBG}`}
            padding={2}
            borderRadius={"10px"}
          >
            <Box display={"flex"} gap={4}>
              <Autocomplete
                disablePortal
                id="CurrencyCodeRate"
                options={
                  currencyRateOptions &&
                  currencyRateOptions.map((item) => item.currencycode)
                }
                onChange={handleCurrencyChange}
                sx={{ width: "9vw" }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Currency Code"
                    name="CurrencyCodeRate"

                    // value={calculationMethod}
                  />
                )}
              />
              {/* <TextField label="Transaction Nature" sx={{ width: "10vw" }} /> */}
              <TextField
                select
                label="Type"
                sx={{ width: "9vw" }}
                defaultValue={"Select"}
                value={transacType}
                onChange={(e) => setTransacType(e.target.value)}
              >
                {TransTypeOptions &&
                  TransTypeOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
              </TextField>
              <TextField
                disabled={transacType !== "EM (Encashed TM)"}
                label="Issuer"
                sx={{ width: "9vw" }}
              />
              <TextField
                label="FE Amount"
                sx={{ width: "9vw" }}
                value={feAmount}
                onChange={(e) => setFeAmount(e.target.value)}
              />
            </Box>
            <Box display={"flex"} gap={5}>
              <TextField
                label="Rate"
                disabled
                sx={{ width: "9vw" }}
                value={rateCurr ? rateCurr : ""}
              />
              <TextField label="Commission Type" sx={{ width: "9vw" }} />
              <TextField label="Commission Per 1" sx={{ width: "9.5vw" }} />
            </Box>
            <Box display={"flex"} gap={5}>
              <TextField label="Commission Amount" sx={{ width: "10.5vw" }} />
              <TextField
                label="Final Amount"
                sx={{ width: "9vw" }}
                value={finalAmount}
              />
              {/* <TextField label="Rounded" sx={{ width: "9vw" }} /> */}
            </Box>
          </Box>
        </Box>
      )}

      {/* -----------------------------Transac Details End ----------------------- */}

      <CustomAlertModalCurrency
        handleAction={() => CurrencyMasterDelete(rowid)}
      />

      {/* -------------------------------------------------------PAX MODAL START--------------------------------------- */}

      <PaxModal
        showPaxModal={showPaxModal}
        createPax={createPax}
        searchPax={searchPax}
        handleHidePaxModal={handleHidePaxModal}
        selectClickOnRowVisibility={selectClickOnRowVisibility}
        handleSearchPaxClick={handleSearchPaxClick}
        handlebackClickOnPaxSearch={handlebackClickOnPaxSearch}
      />
      {/* -------------------------------------------------------PAX MODAL END--------------------------------------- */}
    </MainContainerCompilation>
  );
};

export default BuyFromIndivi;
