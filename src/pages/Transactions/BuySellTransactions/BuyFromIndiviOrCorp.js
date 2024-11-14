import React, { useContext, useEffect, useState } from "react";
import MainContainerCompilation from "../../../components/global/MainContainerCompilation";
import {
  Alert,
  Autocomplete,
  Box,
  CircularProgress,
  MenuItem,
  Skeleton,
  TextField,
  useTheme,
  useMediaQuery,
} from "@mui/material";

import "../../../css/components/formComponent.css";

import axios from "axios";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { AnimatePresence, motion } from "framer-motion";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import "../../../css/pages/CurrencyProfile.css";
import { useToast } from "../../../contexts/ToastContext";

import { useNavigate } from "react-router-dom";
import { Colortheme } from "../../../assets/colors/COLORS.js";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import "../../../css/components/buyfromindiv.css";
import dayjs from "dayjs";
import Tooltip from "@mui/material/Tooltip";

import {
  PaxDetailsFullMain,
  getAgents,
  getDeliAgent,
  getMarktRef,
} from "../../../apis/IndiviOrCorp/Buy/index.js";
import PaxModal from "../../../components/Transactions/BuyFromIndivi/PaxModal.js";
import TransacDetails from "../../../components/Transactions/BuyFromIndivi/TransacDetails.js";

import {
  FormDataProvider,
  useFormData,
} from "../../../contexts/FormDataContext.js";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import ThemeContext from "../../../contexts/ThemeContext.js";

const BuyFromIndivi = () => {
  const { Colortheme } = useContext(ThemeContext);
  // -----------------STATES START---------------------

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      // Cancel the event to prevent the browser from unloading the page immediately
      event.preventDefault();
      // Chrome requires returnValue to be set
      event.returnValue = "";

      // Show the alert to inform the user
      const confirmationMessage = "This will reset your current transaction.";
      event.returnValue = confirmationMessage;
      return confirmationMessage;
    };

    // Add event listener for beforeunload
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup function to remove the event listener when the component is unmounted
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []); // Empty dependency array to ensure the effect runs only once

  const { updateFormData } = useFormData();
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
  const [entity, setEntity] = useState("Individual");
  const [purpose, setPurpose] = useState("Encashment");
  const [manualBillRef, setManualBillRef] = useState("");
  const [ratePer, setRatePer] = useState("");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [isPartySelect, setIsPartySelect] = useState(false);

  const [behalf, setBehalf] = useState("");
  const [category, setCategory] = useState("Low Risk");
  const [reference, setReference] = useState("");
  const [marktRef, setMarktRef] = useState(null);
  const [idText, setIdText] = useState("");
  const [vendorInvNo, setVendorInvNo] = useState("");
  const [remarks, setRemarks] = useState("");
  const [deliveryPerson, setDeliveryPerson] = useState(null);

  const EntityOptions = ["Individual", "Corporate"];
  const PurposeOptions = ["Encashment", "Surrender"];
  const CategoryOptions = ["High Risk", "Medium Risk", "Low Risk"];

  const [agentsOpen, setAgentsOpen] = useState(false);
  const [agentOptions, setAgentOptions] = useState([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);

  const [marktRefOpen, setMarktRefOpen] = useState(false);
  const [marktRefOptions, setMarktRefOptions] = useState([]);
  const [marktRefLoading, setMarktRefLoading] = useState(false);
  const [selectedMarktRef, setSelectedMarktRef] = useState(null);

  const [deliAgentOpen, setDeliAgentOpen] = useState(false);
  const [deliAgentOptions, setDeliAgentOptions] = useState([]);
  const [deliAgentLoading, setDeliAgentLoading] = useState(false);
  const [selectedDeliAgent, setSelectedDeliAgent] = useState(null);

  const [comission, setComission] = useState(false);

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
    //       `${baseUrl}/api/master/CurrencyMasterCreate`,
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
          `${baseUrl}/api/master/CurrencyMasterEdit`,
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
        `${baseUrl}/api/master/CurrencyMasterAll`,
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
            `${baseUrl}/api/master/CurrencyMasterAll`,
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
            `${baseUrl}/api/master/CurrencyMasterOne`,
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

  const selectClickOnRowVisibility = () => {
    setCreatePax(true);
    setSearchPax(false);
  };

  const handleCheckboxChange = (event) => {
    setEditedActiveStatus(event.target.checked); // Update the state when the checkbox is toggled
  };

  const [isPaxSaved, setIsPaxSaved] = useState(false);
  const [paxData, setPaxData] = useState(null);
  const [paxDetailsFullMain, setPaxDetailsFullMain] = useState(null);

  // ------------------------------ states for PAX MODAL-------------------------------------

  const [createPax, setCreatePax] = useState(true);
  const [searchPax, setSearchPax] = useState(false);
  const [showPaxModal, setShowPaxModal] = useState(false);

  // ------------------------------ states for PAX MODAL-------------------------------------

  const handleNextForTransac = () => {
    if (!paxData) {
      showToast("Please Select PAX First!", "error");
      setTimeout(() => {
        hideToast();
      }, 2000);
    } else {
      try {
        const formDataObject = {
          paxID: paxData.paxid,
          entity: entity,
          purpose: purpose,
          selectedDate: selectedDate,
          manualBillRef: manualBillRef,
          selectedAgent: selectedAgent ? selectedAgent.id : "",
          behalf: behalf,
          category: category,
          reference: reference,
          selectedMarktRef: selectedMarktRef ? selectedMarktRef.id : "",
          idText: idText,
          vendorInvNo: vendorInvNo,
          remarks: remarks,
          selectedDeliAgent: selectedDeliAgent ? selectedDeliAgent.id : "",
          // Add other form data here
        };

        const formDataJSON = JSON.stringify(formDataObject);
        updateFormData(formDataObject);
        console.log("HeaderForm", formDataJSON);
        // Attempt to store the JSON string in local storage
        // localStorage.setItem("HeaderForm", formDataJSON);

        setIsTransacDetailsView(true);
        setIsCreateForm(false);
      } catch (error) {
        // Handle any errors that occur during storage
        console.error("Error storing form data:", error);
        // Optionally, show a message to the user indicating that there was an error
      }
    }
  };

  const handlebackClickOnTransacView = () => {
    setIsTransacDetailsView(false);
    setIsCreateForm(true);
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

  const handleHidePaxModal = () => {
    setShowPaxModal(false);
  };

  const handleSearchPaxClick = () => {
    setCreatePax(false);
    setSearchPax(true);
  };

  const setIsPaxSavedState = (value) => {
    setIsPaxSaved(value);
    setShowPaxModal(false);
  };

  // Function to update paxData state
  const setPaxDataState = (data) => {
    setPaxData(data);
  };

  useEffect(() => {
    if (agentsOpen && !agentOptions.length) {
      // Set loading state to true before fetching data
      setAgentsLoading(true);
      // Fetch data from backend when dropdown is opened and options are empty
      fetchAgentData().then((data) => {
        setAgentOptions(data);
        setAgentsLoading(false); // Set loading state to false after data is fetched
      });
    }
  }, [agentsOpen]);

  const fetchAgentData = async () => {
    // Simulating a delay for demonstration purposes
    await new Promise((resolve) => setTimeout(resolve, 300));
    // Perform your API call to fetch data from backend
    const response = await getAgents();

    return response;
  };

  useEffect(() => {
    if (selectedAgent) {
      setComission(true);
    } else if (selectedAgent === null) {
      setComission(false);
    }
  }, [selectedAgent]);

  useEffect(() => {
    if (marktRefOpen && !marktRefOptions.length) {
      // Set loading state to true before fetching data
      setMarktRefLoading(true);
      // Fetch data from backend when dropdown is opened and options are empty
      fetchMarktRefData().then((data) => {
        setMarktRefOptions(data);
        setMarktRefLoading(false); // Set loading state to false after data is fetched
      });
    }
  }, [marktRefOpen]);

  const fetchMarktRefData = async () => {
    // Simulating a delay for demonstration purposes
    await new Promise((resolve) => setTimeout(resolve, 300));
    // Perform your API call to fetch data from backend
    const response = await getMarktRef();

    return response;
  };

  useEffect(() => {
    if (deliAgentOpen && !deliAgentOptions.length) {
      // Set loading state to true before fetching data
      setDeliAgentLoading(true);
      // Fetch data from backend when dropdown is opened and options are empty
      fetchDeliAgentData().then((data) => {
        setDeliAgentOptions(data);
        setDeliAgentLoading(false); // Set loading state to false after data is fetched
      });
    }
  }, [deliAgentOpen]);

  const fetchDeliAgentData = async () => {
    // Simulating a delay for demonstration purposes
    await new Promise((resolve) => setTimeout(resolve, 300));
    // Perform your API call to fetch data from backend
    const response = await getDeliAgent();

    return response;
  };

  //  ---------------------FUNCTIONS END----------------------

  // -------------------------------------CONSOLE LOGS--------------------------------------------

  // console.log("Selected Agent: ", selectedAgent);
  // console.log("Selected Markt Ref: ", selectedMarktRef);
  // console.log("PAx Data", paxData);

  // -------------------------------------CONSOLE LOGS--------------------------------------------

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
              sx={{
                backgroundColor: Colortheme.text,
                overflow: isMobile ? "auto" : "visible",
                maxHeight: isMobile ? "70vh" : "auto",
                maxWidth: isMobile ? "60vw" : "auto",
              }}
              height={"auto"}
              p={3}
              width={"70vw"}
              borderRadius={"40px"}
              boxShadow={"box-shadow: 0px 10px 15px -3px rgba(0,0,0,0.6)"}
            >
              <KeyboardBackspaceIcon
                onClick={handlebackClickOnCreate}
                fontSize="large"
                sx={{
                  alignSelf: "flex-start",
                  color: Colortheme.secondaryBG,
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
                  mt={{ xs: 2, md: 5 }}
                  display={"grid"}
                  // gridTemplateColumns={"repeat(5, 1fr)"}
                  // gridTemplateRows={"repeat(3, 1fr)"}
                  gridTemplateColumns={
                    isMobile ? "repeat(1, 1fr)" : "repeat(5, 1fr)"
                  }
                  // gridTemplateRows={"repeat(6, auto)"}
                  columnGap={isMobile ? "10px" : "40px"}
                  rowGap={isMobile ? "10px" : "40px"}
                >
                  <TextField
                    select
                    value={entity}
                    onChange={(e) => setEntity(e.target.value)}
                    sx={{ width: isMobile ? "auto" : "12vw" }}
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
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    sx={{ width: isMobile ? "auto" : "12vw" }}
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
                  />

                  {isPaxSaved && paxData ? (
                    // <TextField
                    //   value={paxData.name}
                    //   sx={{ width: "12vw" }}
                    //   label="Selected Pax"
                    // />
                    <Tooltip title="Click To Show PAX Selection">
                      <Box
                        onClick={() => setShowPaxModal(true)}
                        display={"flex"}
                        width={isMobile ? "auto" : "12vw"}
                        sx={{
                          border: `solid 1px ${Colortheme.background}`,
                          borderRadius: "5px",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        {paxData && (
                          <p
                            style={{
                              color: Colortheme.background,
                              fontWeight: "bold",
                            }}
                          >
                            {paxData.name}
                          </p>
                        )}
                      </Box>
                    </Tooltip>
                  ) : (
                    <button
                      // onClick={handlePaxview}
                      onClick={() => setShowPaxModal(true)}
                      className="PartySelect"
                      style={{
                        height: isMobile ? "7vh" : "auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                      }}
                    >
                      Select Party
                      <PersonAddAlt1Icon
                        style={{ color: Colortheme.background }}
                      />
                    </button>
                  )}

                  <TextField
                    id="ManualBillRef"
                    name="ManualBillRef"
                    sx={{ width: isMobile ? "auto" : "12vw" }}
                    label="Manual Bill Ref"
                    value={manualBillRef}
                    onChange={(e) => setManualBillRef(e.target.value)}
                  />
                  {/* <TextField
                    select
                    id="AgentSelect"
                    name="AgentSelect"
                    sx={{ width: "12vw" }}
                    label="Agent Involved?"
                    // value={defaultMinRate}
                    // onChange={(e) => setDefaultMinRate(e.target.value)}
                  /> */}

                  <Autocomplete
                    open={agentsOpen}
                    value={selectedAgent}
                    onChange={(event, newValue) => {
                      setSelectedAgent(newValue);
                    }}
                    onOpen={() => {
                      setAgentsOpen(true);
                    }}
                    onClose={() => {
                      setAgentsOpen(false);
                    }}
                    options={agentsLoading ? [1] : agentOptions} // Skeleton placeholders when loading
                    loading={agentsLoading}
                    getOptionLabel={(option) => option.name || ""}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderOption={(props, option) => {
                      if (agentsLoading) {
                        return (
                          <Box
                            display={"flex"}
                            alignItems={"center"}
                            justifyContent={"center"}
                            height={100}
                          >
                            <CircularProgress />
                          </Box>
                        );
                      }
                      return <li {...props}>{option.name}</li>;
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Agent Involved?" />
                    )}
                  />
                  <TextField
                    id="Behalf"
                    name="Behalf"
                    sx={{ width: isMobile ? "auto" : "12vw" }}
                    label="Behalf"
                    value={behalf}
                    onChange={(e) => setBehalf(e.target.value)}
                  />
                  {CategoryOptions && (
                    <Autocomplete
                      disablePortal
                      id="Category"
                      value={category}
                      onChange={(event, newValue) => {
                        setCategory(newValue);
                      }}
                      options={CategoryOptions}
                      getOptionLabel={(option) =>
                        typeof option === "string" || option instanceof String
                          ? option
                          : ""
                      }
                      // onChange={(e, newValue) => setCalculationMethod(newValue)}
                      sx={{ width: isMobile ? "auto" : "12vw" }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Category"
                          name="Category"
                          // value={calculationMethod}
                        />
                      )}
                    />
                  )}
                  <TextField
                    id="Reference"
                    name="Reference"
                    sx={{ width: isMobile ? "auto" : "12vw" }}
                    label="Reference"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                  />
                  {/* {CategoryOptions && (
                    <Autocomplete
                      disablePortal
                      id="MarktRef"
                      value={marktRef}
                      onChange={(event, newValue) => {
                        setMarktRef(newValue);
                      }}
                      options={CategoryOptions}
                      // onChange={(e, newValue) => setCalculationMethod(newValue)}
                      sx={{ width: "12vw" }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Marketing Reference"
                          name="Marketing Reference"
                          // value={calculationMethod}
                        />
                      )}
                    />
                  )} */}

                  <Autocomplete
                    open={marktRefOpen}
                    value={selectedMarktRef}
                    onChange={(event, newValue) => {
                      setSelectedMarktRef(newValue);
                    }}
                    onOpen={() => {
                      setMarktRefOpen(true);
                    }}
                    onClose={() => {
                      setMarktRefOpen(false);
                    }}
                    options={marktRefLoading ? [1] : marktRefOptions} // Skeleton placeholders when loading
                    loading={marktRefLoading}
                    getOptionLabel={(option) => option.name || ""}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderOption={(props, option) => {
                      if (marktRefLoading) {
                        return (
                          <Box
                            display={"flex"}
                            alignItems={"center"}
                            justifyContent={"center"}
                            height={100}
                          >
                            <CircularProgress />
                          </Box>
                        );
                      }
                      return <li {...props}>{option.name}</li>;
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Marketing Reference" />
                    )}
                  />

                  <TextField
                    label="ID"
                    name="IDText"
                    id="IDText"
                    sx={{ width: isMobile ? "auto" : "12vw" }}
                    value={idText}
                    onChange={(e) => setIdText(e.target.value)}
                  />
                  <TextField
                    label="Inv# Vendor"
                    name="VendorInvNo"
                    id="VendorInvNo"
                    sx={{ width: isMobile ? "auto" : "12vw" }}
                    value={vendorInvNo}
                    onChange={(e) => setVendorInvNo(e.target.value)}
                  />
                  <TextField
                    label="Remarks"
                    name="Remarks"
                    id="Remarks"
                    sx={{ width: isMobile ? "auto" : "12vw" }}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                  {/* {CategoryOptions && (
                    <Autocomplete
                      disablePortal
                      id="DeliveryPerson"
                      value={deliveryPerson}
                      onChange={(event, newValue) => {
                        setDeliveryPerson(newValue);
                      }}
                      options={CategoryOptions}
                      // onChange={(e, newValue) => setCalculationMethod(newValue)}
                      sx={{ width: "12vw" }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Delivery Person"
                          name="Delivery Person"
                          // value={calculationMethod}
                        />
                      )}
                    />
                  )} */}

                  <Autocomplete
                    open={deliAgentOpen}
                    value={selectedDeliAgent}
                    onChange={(event, newValue) => {
                      setSelectedDeliAgent(newValue);
                    }}
                    onOpen={() => {
                      setDeliAgentOpen(true);
                    }}
                    onClose={() => {
                      setDeliAgentOpen(false);
                    }}
                    options={deliAgentLoading ? [1] : deliAgentOptions} // Skeleton placeholders when loading
                    loading={deliAgentLoading}
                    getOptionLabel={(option) => option.name || ""}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderOption={(props, option) => {
                      if (deliAgentLoading) {
                        return (
                          <Box
                            display={"flex"}
                            alignItems={"center"}
                            justifyContent={"center"}
                            height={100}
                          >
                            <CircularProgress />
                          </Box>
                        );
                      }
                      return <li {...props}>{option.name}</li>;
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Delivery Agent" />
                    )}
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
                <button
                  className="NextOnCreate"
                  onClick={handleNextForTransac}
                  style={{ width: isMobile ? "20vw" : "12vw" }}
                >
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
              sx={{ backgroundColor: Colortheme.text }}
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
                      getOptionLabel={(option) =>
                        typeof option === "string" || option instanceof String
                          ? option
                          : ""
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
      <TransacDetails
        isTransacDetailsView={isTransacDetailsView}
        setIsTransacDetailsView={setIsTransacDetailsView}
        handlebackClickOnTransacView={handlebackClickOnTransacView}
        comission={comission}
      />

      {/* -----------------------------Transac Details End ----------------------- */}

      {/* <CustomAlertModalCurrency
        handleAction={() => CurrencyMasterDelete(rowid)}
      /> */}

      {/* -------------------------------------------------------PAX MODAL START--------------------------------------- */}

      <PaxModal
        showPaxModal={showPaxModal}
        createPax={createPax}
        searchPax={searchPax}
        handleHidePaxModal={handleHidePaxModal}
        selectClickOnRowVisibility={selectClickOnRowVisibility}
        handleSearchPaxClick={handleSearchPaxClick}
        handlebackClickOnPaxSearch={handlebackClickOnPaxSearch}
        setIsPaxSaved={setIsPaxSavedState}
        setPaxData={setPaxDataState}
      />
      {/* -------------------------------------------------------PAX MODAL END--------------------------------------- */}
    </MainContainerCompilation>
  );
};

export default BuyFromIndivi;
