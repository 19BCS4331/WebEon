import React, { useEffect, useState } from "react";
import MainContainerCompilation from "../../../components/global/MainContainerCompilation";
import {
  Box,
  TextField,
  useMediaQuery,
  useTheme,
  FormControlLabel,
  Checkbox,
  MenuItem,
  CircularProgress,
  Autocomplete,
  InputAdornment,
} from "@mui/material";
import {
  AccountsProfileCreate,
  FincodeFetch,
  FincodeFetchOnType,
  SubFincodeFetchOnFinCode,
  SubFincodeFetchOnFinCodeForEdit,
  getFincodeAsId,
} from "../../../apis/Master/MasterProfiles/AccountsProfile";
import { useToast } from "../../../contexts/ToastContext";
import { COLORS } from "../../../assets/colors/COLORS";
import axios from "axios";
import { fetchCurrencyNames } from "../../../apis/OptionsMaster";
import { DataGrid } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { AnimatePresence, motion } from "framer-motion";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import CustomAlertModalCurrency from "../../../components/CustomerAlertModalCurrency";
import { useNavigate } from "react-router-dom";

const AccountsProfile = () => {
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isCreate, setIsCreate] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const {
    showToast,
    hideToast,
    showAlertDialogCurrency,
    hideAlertDialogCurrency,
  } = useToast();
  const [shouldFetchData, setShouldFetchData] = useState(false);
  const [selectedAccType, setSelectedAccType] = useState("");
  const [selectedFinType, setSelectedFinType] = useState("");
  const [finCodeOptions, setFinCodeOptions] = useState([]);
  const [subFinCodeOptions, setSubFinCodeOptions] = useState([]);
  const [selectedFinCode, setSelectedFinCode] = useState("");
  const [selectedBN, setSelectedBN] = useState("");
  const [selectedSubFinCode, setSelectedSubFincode] = useState("");
  const [selectedDiv, setSelectedDiv] = useState("");
  const [selectedSL, setSelectedSL] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoading, setisLoading] = useState(false);
  const [isEodBalZero, setIsEodBalZero] = useState("");
  const [branches, setBranches] = useState("");
  const [currencyOptions, setCurrencyOptions] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [selectedFinCodeObject, setSelectedFinCodeObject] = useState(null);
  const [selectedSubFinCodeObject, setSelectedSubFinCodeObject] =
    useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  const [APMasterData, setAPMasterData] = useState(null);
  const [selectionModel, setSelectionModel] = useState([]);

  // ----------------EDIT FORM STATES--------------------

  const [editedFinCodeOptions, setEditedFinCodeOptions] = useState(null);
  const [editedSubFinCodeOptions, setEditedSubFinCodeOptions] = useState(null);
  const [editedSelectedId, setEditedSelectedId] = useState(null);
  const [editedAccCode, setEditedAccCode] = useState("");
  const [editedAccName, setEditedAccName] = useState("");
  const [editedSelectedAccType, setEditedSelectedAccType] = useState("");
  const [editedSelectedFinType, setEditedSelectedFinType] = useState("");
  const [editedSelectedFinCode, setEditedSelectedFinCode] = useState(null);
  const [editedSelectedBN, setEditedSelectedBN] = useState("");
  const [editedSelectedSubFinCode, setEditedSelectedSubFincode] = useState("");
  const [editedSelectedDiv, setEditedSelectedDiv] = useState("");
  const [editedSelectedSL, setEditedSelectedSL] = useState("");
  const [editedPCExpId, setEditedPCExpId] = useState("");
  const [editedIsEodBalZero, setEditedIsEodBalZero] = useState("");
  const [editedSelectedCurrency, setEditedSelectedCurrency] = useState(null);
  const [editedSelectedFinCodeObject, setEditedSelectedFinCodeObject] =
    useState(null);
  const [editedSelectedSubFinCodeObject, setEditedSelectedSubFinCodeObject] =
    useState(null);
  const [dataForEdit, setDataForEdit] = useState(null);
  const [branchToTransfer, setBranchToTransfer] = useState(null);

  const [editedDoSale, setEditedDoSale] = useState("");
  const [editedDoPurchase, setEditedDoPurchase] = useState("");
  const [editedDoReceipt, setEditedDoReceipt] = useState("");
  const [editedDoPayment, setEditedDoPayment] = useState("");
  const [editedIsActive, setEditedIsActive] = useState("");
  const [editedIsCMSBank, setEditedIsCMSBank] = useState("");
  const [editedIsDirRemit, setEditedIsDirRemit] = useState("");

  // ----------------EDIT FORM STATES--------------------
  // -----------------ROW Setters---------------
  const [rowid, SetRowid] = useState(null);
  // -----------------ROW Setters---------------
  const navigate = useNavigate();

  const handleSearchClick = () => {
    setIsSearch(true);
    setIsCreate(false);
    setIsEdit(false);
  };

  const handleBackOnEdit = () => {
    setIsEdit(false);
    setIsSearch(true);
    setIsCreate(false);
    setShouldFetchData(false);
  };

  const handlebackClickOnCreate = () => {
    navigate(-1);
  };

  useEffect(() => {
    if (selectedBN) {
      const OptionsFetch = async () => {
        const CurrencyNameOptions = await fetchCurrencyNames();
        setCurrencyOptions(CurrencyNameOptions);

        // setOptionsDataLoading(false);
      };
      OptionsFetch();
    }
  }, [selectedBN]);

  useEffect(() => {
    if (editedSelectedBN) {
      const OptionsFetch = async () => {
        const CurrencyNameOptions = await fetchCurrencyNames();
        setCurrencyOptions(CurrencyNameOptions);

        // setOptionsDataLoading(false);
      };
      OptionsFetch();
    }
  }, [editedSelectedBN]);

  const DivOptions = [
    {
      value: "F",
      label: "Forex Division",
    },
    {
      value: "W",
      label: "Western Union Division",
    },
  ];

  const AccTypeOptions = [
    {
      value: "GL",
      label: "General Ledger",
    },
    {
      value: "SL",
      label: "Sub Ledger",
    },
    {
      value: "C",
      label: "Cash",
    },
    {
      value: "B",
      label: "Bank",
    },
    {
      value: "PC",
      label: "Petty Cash",
    },
    {
      value: "CC",
      label: "Credit Card",
    },
  ];

  const SLOptions = [
    {
      value: "AD",
      label: "Auth. Dealer",
    },
    {
      value: "BR",
      label: "Branches",
    },
    {
      value: "CC",
      label: "Corporate Client",
    },
    {
      value: "EM",
      label: "Employee",
    },
    {
      value: "EX",
      label: "Exporter",
    },
    {
      value: "FF",
      label: "FFMC",
    },
    {
      value: "TA",
      label: "Forex Agent",
    },
    {
      value: "FR",
      label: "Franchisee",
    },
    {
      value: "GS",
      label: "GST States",
    },
    {
      value: "MS",
      label: "Misc. Supplier",
    },
    {
      value: "RM",
      label: "RMC",
    },
    {
      value: "TC",
      label: "TC Issuer",
    },
    {
      value: "WA",
      label: "W.U. Agent",
    },
  ];

  const BNOptions = [
    {
      value: "L",
      label: "Local",
    },
    {
      value: "N",
      label: "Nostro",
    },
  ];

  const FTypeOptions = [
    {
      value: "TA",
      label: "Trading Account",
    },
    {
      value: "PL",
      label: "Profit & Loss",
    },
    {
      value: "BS",
      label: "Balance Sheet",
    },
  ];

  useEffect(() => {
    const fetchFinCodeOptions = async () => {
      setLoading(true);
      // Make sure selectedFinType is not empty
      if (!selectedFinType) return;

      // Fetch data based on selected financial type (you need to implement this)
      const response = await FincodeFetchOnType(selectedFinType);

      // Update financial code options based on the response
      setFinCodeOptions(response);
    };

    fetchFinCodeOptions();
    setLoading(false);
  }, [selectedFinType]);

  useEffect(() => {
    const fetchSubFinCodeOptions = async () => {
      setLoading(true);
      // Make sure selectedFinCode is not empty
      if (!selectedFinCode) return;

      // Fetch data based on selected financial code (you need to implement this)
      const response = await SubFincodeFetchOnFinCode(selectedFinCode);

      // Update financial subcode options based on the response
      setSubFinCodeOptions(response);
    };

    fetchSubFinCodeOptions();
    setLoading(false);
  }, [selectedFinCode]);

  useEffect(() => {
    // Fetch data based on selected financial type
    if (shouldFetchData && editedSelectedFinType) {
      const fetchEditFinCodeOptions = async () => {
        setLoading(true);
        const response = await FincodeFetchOnType(editedSelectedFinType);
        setEditedFinCodeOptions(response);
        setLoading(false);
      };
      fetchEditFinCodeOptions();
    }
  }, [shouldFetchData, editedSelectedFinType]);

  useEffect(() => {
    // Fetch data based on selected financial code
    if (shouldFetchData && editedSelectedFinCode) {
      const fetchEditSubFinCodeOptions = async () => {
        setLoading(true);
        const response = await SubFincodeFetchOnFinCodeForEdit(
          editedSelectedFinCode
        );
        setEditedSubFinCodeOptions(response);
        setLoading(false);
      };
      fetchEditSubFinCodeOptions();
    }
  }, [shouldFetchData, editedSelectedFinCode]);

  const handleFinTypeChange = (event) => {
    setSelectedFinType(event.target.value);

    // setEditedSelectedSubFincode(null);
  };

  const handleEditedFinTypeChange = (event) => {
    setEditedSelectedFinType(event.target.value);
    setEditedSelectedFinCode("");
    setEditedSelectedSubFincode("");
  };
  console.log("Selected FinType", selectedFinType);
  console.log("Selected FinCode", selectedFinCode);
  console.log("finOptions", finCodeOptions);
  console.log("subfinOptions", subFinCodeOptions);

  // --------------------------SUBMIT FUNCTIONS --------------------------------

  const handleSubmitCreate = async (e) => {
    setisLoading(true);
    e.preventDefault();
    const data = new FormData(e.target);
    const formObject = Object.fromEntries(data.entries());

    // Check if PCExpID is empty
    if (!formObject.PCExpID) {
      // Set PCExpID to 0 if it's empty
      formObject.PCExpID = 0;
    }

    // Replace the id with the corresponding code
    if (selectedFinCodeObject) {
      formObject.finCode = selectedFinCodeObject.code;
    }
    if (selectedSubFinCodeObject) {
      formObject.finSubCode = selectedSubFinCodeObject.code;
    }

    console.log(formObject);
    if (formObject) {
      const response = await AccountsProfileCreate(formObject);
      if (response.data.message === "Data saved successfully") {
        setisLoading(false);
        showToast("Data Inserted Successfully", "success");
        window.location.reload();
        setTimeout(() => {
          hideToast();
        }, 1500);
      } else {
        console.log(response.data.message);
      }
    }
  };

  const handleSubmitEdit = async (event) => {
    setisLoading(true);
    const token = localStorage.getItem("token");
    event.preventDefault();
    var data = new FormData(event.target);
    let formObject = Object.fromEntries(data.entries());
    console.log("Edit Form Object: ", formObject);
    if (editedAccCode !== "" && editedAccName !== "") {
      try {
        const response = await axios.post(
          `${baseUrl}/api/master/APMasterEdit`,
          {
            id: editedSelectedId,
            AccCode: formObject.AccCode,
            Accname: formObject.Accname,
            SL: formObject.SL,
            BN: formObject.BN,
            BranchIdTransfer: formObject.BranchIdTransfer,
            Currency: formObject.Currency,
            PCExpID: formObject.PCExpID,
            accType: formObject.accType,
            division: formObject.division,
            doPayment: formObject.doPayment,
            doPurchase: formObject.doPurchase,
            doReceipt: formObject.doReceipt,
            doSale: formObject.doSale,
            finCode: formObject.finCode,
            finSubCode: formObject.finSubCode,
            finType: formObject.finType,
            isActive: formObject.isActive,
            isCMSBank: formObject.isCMSBank,
            isDirRemit: formObject.isDirRemit,
            isEodBalZero: formObject.isEodBalZero,
            mapAcc: formObject.mapAcc,
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
        const updatedData = await APMasterRefresh(); // Replace with your API call to fetch data
        if (updatedData) {
          setAPMasterData(updatedData);
        }
        setIsEdit(false);
        setIsSearch(true);
        setIsCreate(false);
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

  // --------------------------SUBMIT FUNCTIONS --------------------------------

  useEffect(() => {
    if (isEodBalZero) {
      const fetchBranches = async () => {
        try {
          const response = await axios.get(`${baseUrl}/api/auth/branch`);
          setBranches(response.data);
        } catch (err) {
          console.log("errorr", err);
        }
      };
      fetchBranches();
    }
  }, [isEodBalZero]);

  useEffect(() => {
    if (editedIsEodBalZero) {
      const fetchBranches = async () => {
        try {
          const response = await axios.get(`${baseUrl}/api/auth/branch`);
          setBranches(response.data);
        } catch (err) {
          console.log("errorr", err);
        }
      };
      fetchBranches();
    }
  }, [editedIsEodBalZero]);

  const handleCurrencyChange = async (event, newValue) => {
    setSelectedCurrency(newValue);
  };

  const handleEditedCurrencyChange = async (event, newValue) => {
    setEditedSelectedCurrency(newValue);
  };

  // ----------------------FETCH MASTER--------------------------------

  const APMasterRefresh = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${baseUrl}/api/master/APMasterFetch`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAPMasterData(response.data);
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchAPMaster = async () => {
      setLoading(true);
      if (isSearch === true) {
        const token = localStorage.getItem("token");
        try {
          const response = await axios.get(
            `${baseUrl}/api/master/APMasterFetch`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setAPMasterData(response.data);
          console.log(response.data);
          setLoading(false);
        } catch (error) {
          console.log(error);
          setLoading(false);
        }
      }
    };

    fetchAPMaster();
  }, [isSearch]);

  // ----------------------FETCH MASTER--------------------------------

  // ----------------------DATAGRID OPTIONS-----------------------------

  // ----------------ROW EDIT FUNCTION-------------------------------

  const handleEditClickOnRow = async (row) => {
    // --------------setting all states-------------------------
    setShouldFetchData(true);
    setEditedSelectedId(row.id);
    setEditedAccCode(row.acc_code);
    setEditedAccName(row.acc_name);
    setEditedSelectedAccType(row.acc_type);
    setEditedSelectedFinType(row.fin_type);
    setEditedSelectedFinCode(row.fin_code);
    console.log("EditedSelectedFinCode", row.fin_code);
    setEditedSelectedBN(row.banknature);
    setEditedSelectedSubFincode(row.fin_sub_code);
    setEditedSelectedDiv(row.division);
    setEditedSelectedSL(row.subledger);
    setBranchToTransfer(row.branch_id_transfer);
    setEditedPCExpId(row.petty_cash_expense_id);
    setEditedIsEodBalZero(row.iszerobal_eod);
    setEditedSelectedCurrency(row.currency);
    setEditedDoSale(row.issale);
    setEditedDoPurchase(row.ispurchase);
    setEditedDoReceipt(row.isreceipt);
    setEditedDoPayment(row.ispayment);
    setEditedIsActive(row.isactive);
    setEditedIsCMSBank(row.iscms);
    setEditedIsDirRemit(row.isdirremit);
    // setEditedSelectedFinCodeObject(row.)
    // setEditedSelectedSubFinCodeObject(row.)

    // --------------End of setting all data states-------------------------

    setIsEdit(true);
    setIsCreate(false);
    setIsSearch(false);
    setSearchKeyword("");
    setDataForEdit(row);

    // Switch the view and fetch the corresponding row's data for editing
    // You can set the data in your component's state for editing
    console.log("Edit button clicked for currency ID:", row.id);
    console.log("row Data:", row);
    console.log("editedSelectedFinCode", editedSelectedFinCode);

    // Add your logic to switch views and show the data in inputs
  };

  // ----------------ROW EDIT FUNCTION-------------------------------

  // ----------------ROW Delete FUNCTION-------------------------------
  const handleDeleteClick = (row) => {
    SetRowid(row.id);
    console.log("Delete button clicked for currency ID:", row.id);
    showAlertDialogCurrency(`Delete the record : ${row.acc_code} `);
  };

  const APMasterDelete = async (id) => {
    setisLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `${baseUrl}/api/master/APMasterDelete`,
        { id: id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
      const updatedData = APMasterData.filter((item) => item.id !== id);
      setAPMasterData(updatedData);
      setisLoading(false);
      showToast("Successfully Deleted!", "success");
      setTimeout(() => {
        hideToast();
      }, 2000);
      hideAlertDialogCurrency();
      setSearchKeyword("");
    } catch (error) {
      console.log(error);
      setisLoading(false);
      hideAlertDialogCurrency();
    }
  };
  // ----------------ROW Delete FUNCTION-------------------------------

  const columns = [
    { field: "id", headerName: "ID", width: 140 },
    {
      field: "acc_code",
      headerName: "Account Code",
      width: isMobile ? 120 : 150,
    },
    { field: "acc_name", headerName: "Account Name", width: 180 },
    {
      field: "acc_type",
      headerName: "Account Type",
      width: isMobile ? 100 : 170,
      valueGetter: (params) => {
        switch (params.value) {
          case "GL":
            return "General Ledger";
          case "SL":
            return "Sub Ledger";
          case "C":
            return "Cash";
          case "B":
            return "Bank";
          case "PC":
            return "Petty Cash";
          case "CC":
            return "Credit Card";
          default:
            return params.value; // Default to the original value
        }
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      width: 200,
      headerAlign: "center",
      renderCell: (params) => (
        <Box display={"flex"} gap={2}>
          <button
            className="ActionsButtonsEdit"
            onClick={() => handleEditClickOnRow(params.row)}
          >
            Edit
          </button>
          {isLoading ? (
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
          )}
        </Box>
      ),
    },
  ];

  const handlebackClickOnSearch = () => {
    setIsSearch(false);
    setIsCreate(true);
  };
  // const handleBackOnEdit = () => {
  //   setIsSearch(true);
  //   setIsEdit(false);
  //   setIsCreate(false);
  // };
  const handleSelectionModelChange = (newSelection) => {
    // Ensure that only one row is selected at a time
    if (newSelection.length > 0) {
      setSelectionModel([newSelection[newSelection.length - 1]]);
    } else {
      setSelectionModel(newSelection);
    }
  };

  // ----------------------DATAGRID OPTIONS-----------------------------

  console.log("editedSelectedSubFinCode", editedSelectedSubFinCode);
  return (
    <MainContainerCompilation title={"Accounts Profile"}>
      {/* ---------------------------------------CREATION FORM---------------------------------------- */}
      {isCreate && (
        <Box
          component={motion.div}
          initial={{ x: 50 }}
          animate={{ x: 0 }}
          display={"flex"}
          flexDirection={"column"}
          alignItems={"center"}
          gap={4}
          p={5}
          borderRadius={10}
          sx={{ backgroundColor: "white" }}
          boxShadow={5}
        >
          <Box
            component={"form"}
            onSubmit={handleSubmitCreate}
            sx={{ backgroundColor: "white" }}
            borderRadius={10}
            p={2}
            display={"flex"}
            alignItems={"center"}
            flexDirection={"column"}
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
            <p style={{ fontSize: 20 }}> Account Details (Create)</p>
            <Box
              // mt={2}
              display={"grid"}
              overflow={isMobile ? "scroll" : "none"}
              sx={{ overflowX: "hidden" }}
              gridTemplateColumns={
                isMobile ? "repeat(1, 1fr)" : "repeat(4, 1fr)"
              }
              // gridTemplateColumns={"repeat(3, 1fr)"}
              gridTemplateRows={"repeat(3, 1fr)"}
              columnGap={"60px"}
              rowGap={"30px"}
            >
              <TextField
                name="division"
                select
                label="Division / Dept"
                sx={{ width: isMobile ? "auto" : "12vw" }}
                value={selectedDiv}
                onChange={(e) => setSelectedDiv(e.target.value)}
              >
                {DivOptions.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                required
                name="AccCode"
                label="Account Code"
                sx={{ width: isMobile ? "auto" : "12vw" }}
              />
              <TextField
                required
                name="Accname"
                label="Account Name"
                sx={{ width: isMobile ? "auto" : "12vw" }}
              />
              <TextField
                name="accType"
                select
                label="Account Type"
                sx={{ width: isMobile ? "auto" : "12vw" }}
                value={selectedAccType}
                onChange={(e) => setSelectedAccType(e.target.value)}
              >
                {AccTypeOptions.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </TextField>
              {selectedAccType === "SL" && (
                <TextField
                  name="SL"
                  select
                  label="Sub Ledger"
                  sx={{ width: isMobile ? "auto" : "12vw" }}
                  value={selectedSL}
                  onChange={(e) => setSelectedSL(e.target.value)}
                >
                  {SLOptions.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              {selectedAccType === "B" && (
                <TextField
                  name="BN"
                  select
                  label="Bank Nature"
                  sx={{ width: isMobile ? "auto" : "12vw" }}
                  value={selectedBN}
                  onChange={(e) => setSelectedBN(e.target.value)}
                >
                  {BNOptions.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              {selectedAccType === "B" &&
                selectedBN === "N" &&
                currencyOptions && (
                  <Autocomplete
                    id="CurrencyCodeRate"
                    value={selectedCurrency}
                    options={currencyOptions}
                    getOptionLabel={(option) => option.currency_code || ""}
                    isOptionEqualToValue={(option, value) =>
                      option.currency_code === value.currency_code
                    }
                    sx={{ width: isMobile ? "auto" : "12vw" }}
                    onChange={handleCurrencyChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Currency"
                        name="Currency"
                        required
                      />
                    )}
                  />
                )}
              <TextField
                required
                name="finType"
                select
                label="Financial Type"
                sx={{ width: isMobile ? "auto" : "12vw" }}
                value={selectedFinType}
                onChange={handleFinTypeChange}
              >
                {FTypeOptions.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                // name="finCode"
                select
                label="Financial Code"
                sx={{ width: isMobile ? "auto" : "12vw" }}
                value={selectedFinCode}
                onChange={(e) => {
                  const selectedId = e.target.value; // Get the id of the selected item
                  setSelectedFinCode(selectedId); // Update state with the id
                  const selectedCode = finCodeOptions.find(
                    (item) => item.id === selectedId
                  )?.code; // Find the code corresponding to the selected id
                  setSelectedFinCodeObject({
                    id: selectedId,
                    code: selectedCode,
                  }); // Update the object with both id and code
                }}
              >
                {loading ? (
                  <MenuItem
                    disabled
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <CircularProgress />
                  </MenuItem>
                ) : (
                  finCodeOptions.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {`${item.code} - ${item.name}`}
                    </MenuItem>
                  ))
                )}
              </TextField>
              <TextField
                select
                label="Financial SubCode"
                sx={{ width: isMobile ? "auto" : "12vw" }}
                value={selectedSubFinCode}
                onChange={(e) => {
                  const selectedId = e.target.value; // Get the id of the selected item
                  setSelectedSubFincode(selectedId); // Update state with the id
                  const selectedSubCode = subFinCodeOptions.find(
                    (item) => item.id === selectedId
                  )?.code; // Find the code corresponding to the selected id
                  setSelectedSubFinCodeObject({
                    id: selectedId,
                    code: selectedSubCode,
                  }); // Update the object with both id and code
                }}
              >
                {loading ? (
                  <MenuItem
                    disabled
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <CircularProgress />
                  </MenuItem>
                ) : (
                  subFinCodeOptions.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {`${item.code} - ${item.name}`}
                    </MenuItem>
                  ))
                )}
              </TextField>
              <TextField
                name="PCExpID"
                label="Petty Cash Expense ID"
                sx={{ width: isMobile ? "auto" : "12vw" }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="isEodBalZero"
                    checked={isEodBalZero}
                    onChange={(e) => setIsEodBalZero(e.target.checked)}
                  />
                }
                label="Zero Balance At EOD"
                sx={{ width: isMobile ? "auto" : "12vw" }}
              />
              {isEodBalZero && branches && (
                <>
                  <TextField
                    name="BranchIdTransfer"
                    disabled={!isEodBalZero}
                    select
                    label="Branch ID To Transfer"
                    sx={{ width: isMobile ? "auto" : "12vw" }}
                  >
                    {loading ? (
                      <MenuItem
                        disabled
                        sx={{ display: "flex", justifyContent: "center" }}
                      >
                        <CircularProgress />
                      </MenuItem>
                    ) : (
                      branches.map((item) => (
                        <MenuItem key={item.branchid} value={item.name}>
                          {item.name}
                        </MenuItem>
                      ))
                    )}
                  </TextField>
                  <TextField
                    select
                    label="Map To Account"
                    sx={{ width: isMobile ? "auto" : "12vw" }}
                    name="mapAcc"
                  />
                </>
              )}

              <FormControlLabel
                control={
                  <Checkbox
                    name="doSale"
                    // checked={editedActiveStatus}
                    // onChange={handleCheckboxChange}
                  />
                }
                label="Do Sale"
                sx={{ width: isMobile ? "auto" : "12vw" }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="doPurchase"
                    // checked={editedActiveStatus}
                    // onChange={handleCheckboxChange}
                  />
                }
                label="Do Purchase"
                sx={{ width: isMobile ? "auto" : "12vw" }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="doReceipt"
                    // checked={editedActiveStatus}
                    // onChange={handleCheckboxChange}
                  />
                }
                label="Do Receipt"
                sx={{ width: isMobile ? "auto" : "12vw" }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="doPayment"
                    // checked={editedActiveStatus}
                    // onChange={handleCheckboxChange}
                  />
                }
                label="Do Payment"
                sx={{ width: isMobile ? "auto" : "12vw" }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="isActive"
                    // checked={editedActiveStatus}
                    // onChange={handleCheckboxChange}
                  />
                }
                label="Active"
                sx={{ width: isMobile ? "auto" : "12vw" }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="isCMSBank"
                    // checked={editedActiveStatus}
                    // onChange={handleCheckboxChange}
                  />
                }
                label="CMS Bank"
                sx={{ width: isMobile ? "auto" : "12vw" }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="isDirRemit"
                    // checked={editedActiveStatus}
                    // onChange={handleCheckboxChange}
                  />
                }
                label="Direct Remittance"
                sx={{ width: isMobile ? "auto" : "12vw" }}
              />
            </Box>
            <Box display={"flex"} gap={5}>
              <button
                type="submit"
                style={{
                  border: "none",
                  backgroundColor: COLORS.secondaryBG,
                  color: "white",
                  borderRadius: 20,
                  width: 100,
                  height: 45,
                  fontSize: 18,
                  cursor: "pointer",
                  marginTop: 40,
                }}
              >
                Create
              </button>

              <button
                onClick={handleSearchClick}
                style={{
                  border: "none",
                  backgroundColor: COLORS.secondaryBG,
                  color: "white",
                  borderRadius: 20,
                  width: 100,
                  height: 45,
                  fontSize: 18,
                  cursor: "pointer",
                  marginTop: 40,
                }}
              >
                Search
              </button>
            </Box>
          </Box>
        </Box>
      )}
      {/* ---------------------------------------CREATION FORM---------------------------------------- */}

      {/* -----------------------------------SEARCH------------------------------------------------------------ */}
      {isSearch && (
        <>
          {isSearch && APMasterData && (
            <Box
              component={motion.div}
              initial={{ x: 150 }}
              animate={{ x: 0 }}
              height={"auto"}
              minHeight={"40vh"}
              width={isMobile ? "65vw" : "50vw"}
              display={"flex"}
              flexDirection={"column"}
              alignItems={"center"}
              gap={4}
              p={5}
              borderRadius={"20px"}
              sx={{ backgroundColor: COLORS.text }}
              boxShadow={5}
            >
              <KeyboardBackspaceIcon
                onClick={handlebackClickOnSearch}
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
                  width: isMobile ? "40vw" : "16vw",
                  backgroundColor: COLORS.text,
                  borderRadius: "20px",
                  border: `2px solid ${COLORS.secondaryBG}`,
                  height: 50,
                  justifyContent: "center",
                  boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1)",
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
              {isLoading ? (
                <CircularProgress sx={{ marginTop: 10 }} />
              ) : (
                <DataGrid
                  disableRowSelectionOnClick
                  disableColumnFilter
                  rows={APMasterData.map((row) => {
                    // Add a new field to each row based on the acc_type value
                    let accTypeLabel = "";
                    switch (row.acc_type) {
                      case "B":
                        accTypeLabel = "Bank";
                        break;
                      // Add more cases for other acc_type values if needed
                      default:
                        accTypeLabel = row.acc_type; // Default to the original value
                        break;
                    }
                    return { ...row, accTypeLabel };
                  }).filter((row) => {
                    if (searchKeyword === "") {
                      return true; // No search keyword, so show all rows
                    }

                    const lowerSearchKeyword = searchKeyword.toLowerCase();

                    // Check if any column value includes the search keyword (case-insensitive)
                    for (const column of columns) {
                      const cellValue = row[column.field]
                        ? row[column.field].toString().toLowerCase()
                        : "";
                      if (cellValue.includes(lowerSearchKeyword)) {
                        return true;
                      }
                    }

                    return false;
                  })}
                  columnVisibilityModel={
                    isMobile
                      ? {
                          // Hide columns status and traderName, the other columns will remain visible
                          id: false,
                        }
                      : { id: false }
                  }
                  getRowId={(row) => row.id}
                  rowSelectionModel={selectionModel}
                  onRowSelectionModelChange={handleSelectionModelChange}
                  sortModel={[
                    {
                      field: "id",
                      sort: "asc",
                    },
                  ]}
                  columns={columns}
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
                    p: isMobile ? "10px" : "20px",
                    maxHeight: "60vh",
                    width: isMobile ? "70vw" : "50vw",
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
              )}
            </Box>
          )}
        </>
      )}

      {/* -----------------------------------SEARCH------------------------------------------------------------ */}

      {/* -------------------------------------EDIT FORM------------------------------------------------ */}
      {isEdit && editedSelectedDiv && (
        <Box
          component={motion.div}
          initial={{ x: 50 }}
          animate={{ x: 0 }}
          display={"flex"}
          flexDirection={"column"}
          alignItems={"center"}
          gap={4}
          p={5}
          borderRadius={10}
          sx={{ backgroundColor: "white" }}
          boxShadow={5}
        >
          <Box
            component={"form"}
            onSubmit={handleSubmitEdit}
            display={"flex"}
            alignItems={"center"}
            flexDirection={"column"}
          >
            <KeyboardBackspaceIcon
              onClick={handleBackOnEdit}
              fontSize="large"
              sx={{
                alignSelf: "flex-start",
                color: COLORS.secondaryBG,
                position: "absolute",
                cursor: "pointer",
              }}
            />
            <p style={{ fontSize: 20 }}>
              Account Details (Edit : {editedAccName})
            </p>
            <Box
              mt={2}
              display={"grid"}
              overflow={isMobile ? "scroll" : "none"}
              sx={{ overflowX: "hidden" }}
              gridTemplateColumns={
                isMobile ? "repeat(1, 1fr)" : "repeat(4, 1fr)"
              }
              // gridTemplateColumns={"repeat(3, 1fr)"}
              gridTemplateRows={"repeat(3, 1fr)"}
              columnGap={"60px"}
              rowGap={"40px"}
            >
              <TextField
                name="division"
                select
                label="Division / Dept"
                sx={{ width: isMobile ? "auto" : "12vw" }}
                value={editedSelectedDiv}
                onChange={(e) => setEditedSelectedDiv(e.target.value)}
              >
                {DivOptions.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                required
                value={editedAccCode}
                onChange={(e) => setEditedAccCode(e.target.value)}
                name="AccCode"
                label="Account Code"
                sx={{ width: isMobile ? "auto" : "12vw" }}
              />
              <TextField
                required
                value={editedAccName}
                onChange={(e) => setEditedAccName(e.target.value)}
                name="Accname"
                label="Account Name"
                sx={{ width: isMobile ? "auto" : "12vw" }}
              />
              <TextField
                name="accType"
                select
                label="Account Type"
                sx={{ width: isMobile ? "auto" : "12vw" }}
                value={editedSelectedAccType}
                onChange={(e) => setEditedSelectedAccType(e.target.value)}
              >
                {AccTypeOptions.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </TextField>
              {editedSelectedAccType === "SL" && (
                <TextField
                  name="SL"
                  select
                  label="Sub Ledger"
                  sx={{ width: isMobile ? "auto" : "12vw" }}
                  value={editedSelectedSL}
                  onChange={(e) => setEditedSelectedSL(e.target.value)}
                >
                  {SLOptions.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              {editedSelectedAccType === "B" && (
                <TextField
                  name="BN"
                  select
                  label="Bank Nature"
                  sx={{ width: isMobile ? "auto" : "12vw" }}
                  value={editedSelectedBN}
                  onChange={(e) => setEditedSelectedBN(e.target.value)}
                >
                  {BNOptions.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              {editedSelectedAccType === "B" &&
                editedSelectedBN === "N" &&
                currencyOptions && (
                  <Autocomplete
                    id="CurrencyCodeRate"
                    value={editedSelectedCurrency}
                    options={currencyOptions}
                    getOptionLabel={(option) => option.currency_code || ""}
                    isOptionEqualToValue={(option, value) =>
                      option.currency_code === value.currency_code
                    }
                    sx={{ width: isMobile ? "auto" : "12vw" }}
                    onChange={handleEditedCurrencyChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Currency"
                        name="Currency"
                        required
                      />
                    )}
                  />
                )}
              <TextField
                required
                name="finType"
                select
                label="Financial Type"
                sx={{ width: isMobile ? "auto" : "12vw" }}
                value={editedSelectedFinType}
                onChange={handleEditedFinTypeChange}
              >
                {FTypeOptions.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                name="finCode"
                select
                label="Financial Code"
                sx={{ width: isMobile ? "auto" : "12vw" }}
                value={editedSelectedFinCode}
                onChange={(e) => {
                  const editedSelectedId = e.target.value; // Get the id of the selected item
                  setEditedSelectedFinCode(editedSelectedId); // Update state with the id
                  setEditedSelectedSubFincode("");
                  const selectedCode = editedFinCodeOptions.find(
                    (item) => item.id === editedSelectedId
                  )?.code; // Find the code corresponding to the selected id
                  setEditedSelectedFinCodeObject({
                    id: editedSelectedId,
                    code: selectedCode,
                  }); // Update the object with both id and code
                }}
              >
                {loading ? (
                  <MenuItem
                    disabled
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <CircularProgress />
                  </MenuItem>
                ) : (
                  editedFinCodeOptions &&
                  editedFinCodeOptions.map((item) => (
                    <MenuItem key={item.id} value={item.code}>
                      {`${item.code}-${item.name}`}
                    </MenuItem>
                  ))
                )}
              </TextField>
              <TextField
                name="finSubCode"
                select
                label="Financial SubCode"
                sx={{ width: isMobile ? "auto" : "12vw" }}
                value={editedSelectedSubFinCode}
                onChange={(e) => {
                  const editedselectedId = e.target.value; // Get the id of the selected item
                  setEditedSelectedSubFincode(editedselectedId); // Update state with the id
                  const selectedSubCode = editedSubFinCodeOptions.find(
                    (item) => item.id === editedselectedId
                  )?.code; // Find the code corresponding to the selected id
                  setEditedSelectedSubFinCodeObject({
                    id: editedselectedId,
                    code: selectedSubCode,
                  }); // Update the object with both id and code
                }}
              >
                {loading ? (
                  <MenuItem
                    disabled
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <CircularProgress />
                  </MenuItem>
                ) : (
                  editedSubFinCodeOptions &&
                  editedSubFinCodeOptions.map((item) => (
                    <MenuItem key={item.id} value={item.code}>
                      {`${item.code} - ${item.name}`}
                    </MenuItem>
                  ))
                )}
              </TextField>
              <TextField
                name="PCExpID"
                value={editedPCExpId}
                onChange={(e) => setEditedPCExpId(e.target.value)}
                label="Petty Cash Expense ID"
                sx={{ width: isMobile ? "auto" : "12vw" }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="isEodBalZero"
                    checked={editedIsEodBalZero}
                    onChange={(e) => setEditedIsEodBalZero(e.target.checked)}
                  />
                }
                label="Zero Balance At EOD"
                sx={{ width: isMobile ? "auto" : "12vw" }}
              />
              {editedIsEodBalZero && branches && (
                <>
                  <TextField
                    name="BranchIdTransfer"
                    disabled={!editedIsEodBalZero}
                    value={branchToTransfer}
                    onChange={(e) => setBranchToTransfer(e.target.value)}
                    select
                    label="Branch ID To Transfer"
                    sx={{ width: isMobile ? "auto" : "12vw" }}
                  >
                    {loading ? (
                      <MenuItem
                        disabled
                        sx={{ display: "flex", justifyContent: "center" }}
                      >
                        <CircularProgress />
                      </MenuItem>
                    ) : (
                      branches.map((item) => (
                        <MenuItem key={item.branchid} value={item.name}>
                          {item.name}
                        </MenuItem>
                      ))
                    )}
                  </TextField>
                  <TextField
                    select
                    label="Map To Account"
                    sx={{ width: isMobile ? "auto" : "12vw" }}
                    name="mapAcc"
                  />
                </>
              )}

              <FormControlLabel
                control={
                  <Checkbox
                    name="doSale"
                    checked={editedDoSale}
                    onChange={(e) => setEditedDoSale(e.target.checked)}
                  />
                }
                label="Do Sale"
                sx={{ width: isMobile ? "auto" : "12vw" }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="doPurchase"
                    checked={editedDoPurchase}
                    onChange={(e) => setEditedDoPurchase(e.target.checked)}
                  />
                }
                label="Do Purchase"
                sx={{ width: isMobile ? "auto" : "12vw" }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="doReceipt"
                    checked={editedDoReceipt}
                    onChange={(e) => setEditedDoReceipt(e.target.checked)}
                  />
                }
                label="Do Receipt"
                sx={{ width: isMobile ? "auto" : "12vw" }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="doPayment"
                    checked={editedDoPayment}
                    onChange={(e) => setEditedDoPayment(e.target.checked)}
                  />
                }
                label="Do Payment"
                sx={{ width: isMobile ? "auto" : "12vw" }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="isActive"
                    checked={editedIsActive}
                    onChange={(e) => setEditedIsActive(e.target.checked)}
                  />
                }
                label="Active"
                sx={{ width: isMobile ? "auto" : "12vw" }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="isCMSBank"
                    checked={editedIsCMSBank}
                    onChange={(e) => setEditedIsCMSBank(e.target.checked)}
                  />
                }
                label="CMS Bank"
                sx={{ width: isMobile ? "auto" : "12vw" }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="isDirRemit"
                    checked={editedIsDirRemit}
                    onChange={(e) => setEditedIsDirRemit(e.target.checked)}
                  />
                }
                label="Direct Remittance"
                sx={{ width: isMobile ? "auto" : "12vw" }}
              />
            </Box>
            <Box display={"flex"} gap={5}>
              <button
                onClick={handleBackOnEdit}
                style={{
                  border: "none",
                  backgroundColor: COLORS.secondaryBG,
                  color: "white",
                  borderRadius: 20,
                  width: 100,
                  height: 45,
                  fontSize: 18,
                  cursor: "pointer",
                  marginTop: 40,
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  border: "none",
                  backgroundColor: COLORS.background,
                  color: "white",
                  borderRadius: 20,
                  width: 100,
                  height: 45,
                  fontSize: 18,
                  cursor: "pointer",
                  marginTop: 40,
                }}
              >
                Save
              </button>
            </Box>
          </Box>
        </Box>
      )}
      {/* -------------------------------------EDIT FORM------------------------------------------------ */}

      <CustomAlertModalCurrency handleAction={() => APMasterDelete(rowid)} />
    </MainContainerCompilation>
  );
};

export default AccountsProfile;
