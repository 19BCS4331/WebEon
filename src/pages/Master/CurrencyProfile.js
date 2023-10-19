import React, { useEffect, useState } from "react";
import MainContainerCompilation from "../../components/global/MainContainerCompilation";
import {
  Autocomplete,
  Box,
  CircularProgress,
  InputAdornment,
  TextField,
} from "@mui/material";
import { COLORS } from "../../assets/colors/COLORS";
import "../../css/components/formComponent.css";
import axios from "axios";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { DataGrid } from "@mui/x-data-grid";
import { AnimatePresence, motion } from "framer-motion";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import "../../css/pages/CurrencyProfile.css";
import { useToast } from "../../contexts/ToastContext";
import CustomAlertModalCurrency from "../../components/CustomerAlertModalCurrency";

const CurrencyProfile = () => {
  // -----------------STATES START---------------------
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

  // --------------end create form states (values--------------

  // --------------Edit form states--------------
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
  const [editedgroup, setEditedGroup] = useState(null);

  // --------------end Edit form states--------------

  const [iscreateForm, setIsCreateForm] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [rowid, SetRowid] = useState(null);
  const [dataForEdit, setDataForEdit] = useState(null);

  const [selectionModel, setSelectionModel] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const columns = [
    { field: "currencyid", headerName: "ID", width: 140 },
    { field: "currency_code", headerName: "Currency Code", width: 200 },
    { field: "currency_name", headerName: "Currency Name", width: 180 },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      width: 200,
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
    // {
    //   field: "branchcode",
    //   headerName: "Branch Code",

    //   width: 130,
    // },
  ];

  // -----------------STATES END---------------------

  //  ---------------------FUNCTIONS START----------------------

  const handleSubmitCreate = async (event) => {
    const token = localStorage.getItem("token");
    event.preventDefault();
    var data = new FormData(event.target);
    let formObject = Object.fromEntries(data.entries());
    console.log(formObject);
    if (
      currencyCode !== "" &&
      currencyName !== "" &&
      priority !== "" &&
      ratePer !== ""
    ) {
      try {
        const response = await axios.post(
          `http://localhost:5001/api/master/CurrencyMasterCreate`,
          {
            currency_code: formObject.CurrencyCode,
            currency_name: formObject.CurrencyName,
            priority: formObject.Priority,
            rateper: formObject.Rateper,
            defaultminrate: formObject.DefaultMinRate,
            defaultmaxrate: formObject.DefaultMaxRate,
            calculationmethod:
              formObject.CalculationMethod === "Multiplication" ? "M" : "D",
            openratepremium: formObject.OpenRatePremium,
            gulfdiscfactor: formObject.GulfDiscFactor,
            isactive: formObject.Activate === "on" ? true : false,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(response.data);
        showToast("Data Inserted Successfully!", "success");
        setTimeout(() => {
          hideToast();
        }, 1500);
      } catch (error) {
        console.log(error);
      }
    } else {
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

  const handlebackClickOnSearch = () => {
    setIsSearch(false);
    setIsCreateForm(true);
  };

  const handleBackOnEdit = () => {
    setIsSearch(true);
    setIsEdit(false);
    setIsCreateForm(false);
  };

  useEffect(() => {
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
  }, []);

  useEffect(() => {
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
  }, []);

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
    } catch (error) {
      console.log(error);
      setisLoading(false);
      hideAlertDialogCurrency();
    }
  };

  const handleSelectionModelChange = (newSelection) => {
    // Ensure that only one row is selected at a time
    if (newSelection.length > 0) {
      setSelectionModel([newSelection[newSelection.length - 1]]);
    } else {
      setSelectionModel(newSelection);
    }
  };

  const handleEditClickOnRow = (row) => {
    // --------------setting all states-------------------------
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
    // setEditedGroup()

    // --------------End of setting all data states-------------------------

    setDataForEdit(row);
    setIsEdit(true);
    setIsCreateForm(false);
    setIsSearch(false);
    setSearchKeyword("");
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

  //  ---------------------FUNCTIONS END----------------------

  return (
    <MainContainerCompilation title={"Currency Profile"}>
      {/* -------------------------CREATION START------------------------------- */}
      {iscreateForm && (
        <AnimatePresence>
          <Box
            component={motion.div}
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            exit={{ x: 100 }}
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
              <Box
                name="HeaderSection"
                textAlign={"center"}
                fontSize={"20px"}
                mt={0}
              >
                Currency Master
              </Box>
              <Box name="HeaderSection" fontSize={"14px"} mt={2}>
                (Create New)
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
                  name="CurrencyCode"
                  value={currencyCode}
                  onChange={(e) => setCurrencyCode(e.target.value)}
                  label="Currency Code"
                />

                <TextField
                  sx={{ width: "12vw" }}
                  name="CurrencyName"
                  label="Currency Name"
                  value={currencyName}
                  onChange={(e) => setCurrencyName(e.target.value)}
                />
                <Autocomplete
                  disabled
                  disablePortal
                  id="Countries"
                  name="Countries"
                  onChange={(event, newValue) => setCountry(newValue)}
                  options={options}
                  sx={{ width: "12vw" }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Countries"
                      value={country}
                      name="country"
                    />
                  )}
                />
                <TextField
                  id="Priority"
                  sx={{ width: "12vw" }}
                  label="Priority"
                  name="Priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                />
                <TextField
                  id="Rateper"
                  name="Rateper"
                  sx={{ width: "12vw" }}
                  label="Rate / per"
                  value={ratePer}
                  onChange={(e) => setRatePer(e.target.value)}
                />
                <TextField
                  id="DefaultMinRate"
                  name="DefaultMinRate"
                  sx={{ width: "12vw" }}
                  label="Default Min Rate"
                  value={defaultMinRate}
                  onChange={(e) => setDefaultMinRate(e.target.value)}
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
                  control={<Checkbox name="Activate" />}
                  label="Activate"
                  sx={{ width: 50 }}
                />
                <FormControlLabel
                  control={<Checkbox name="OnlyStocking" />}
                  label="Only Stocking"
                  sx={{ width: 50 }}
                />
              </Box>
              <Box display="flex" name="FooterSection" mt={4} gap={5}>
                <button
                  onClick={handleSearchClick}
                  className="FormFooterButton"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                  }}
                >
                  <SearchIcon />
                  Search
                </button>

                {/* <button className="FormFooterButton" type="reset">
                  Cancel
                </button> */}
                <button className="FormFooterButton" type="submit">
                  Add
                </button>
              </Box>
            </Box>
          </Box>
        </AnimatePresence>
      )}

      {/* -------------------------CREATION END------------------------------- */}

      {/* -------------------------SEARCH & DELETE) START------------------------------- */}

      {isSearch && (
        <Box
          component={motion.div}
          initial={{ x: 150 }}
          animate={{ x: 0 }}
          height={"auto"}
          minHeight={"40vh"}
          width={"50vw"}
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
              width: "16vw",
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
          <DataGrid
            disableRowSelectionOnClick
            disableColumnFilter
            rows={allCurrencyData.filter((row) => {
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
            getRowId={(row) => row.currencyid}
            rowSelectionModel={selectionModel}
            onRowSelectionModelChange={handleSelectionModelChange}
            sortModel={[
              {
                field: "currencyid",
                sort: "asc", // 'asc' for ascending, 'desc' for descending
              },
            ]}
            columns={columns}
            onModelChange={(model) => {
              // Update the search keyword when filtering is applied
              if (model.filterModel && model.filterModel.items.length > 0) {
                setSearchKeyword(model.filterModel.items[0].value);
              } else {
                setSearchKeyword("");
              }
            }}
            sx={{
              backgroundColor: COLORS.text,
              p: "20px",
              maxHeight: "60vh",
              width: "50vw",
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
      )}

      {/* -------------------------SEARCH END------------------------------- */}

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
              onSubmit={handleSubmitCreate}
              sx={{ backgroundColor: COLORS.text }}
              height={"auto"}
              p={3}
              width={"auto"}
              borderRadius={"40px"}
              boxShadow={"box-shadow: 0px 10px 15px -3px rgba(0,0,0,0.6)"}
            >
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
                  name="CurrencyCode"
                  value={editedcurrencyCode}
                  onChange={(e) => setEditedCurrencyCode(e.target.value)}
                  label="Currency Code"
                />

                <TextField
                  sx={{ width: "12vw" }}
                  name="CurrencyName"
                  label="Currency Name"
                  value={editedcurrencyName}
                  onChange={(e) => setEditedCurrencyName(e.target.value)}
                />
                <Autocomplete
                  disabled
                  disablePortal
                  id="Countries"
                  name="Countries"
                  onChange={(event, newValue) => setCountry(newValue)}
                  options={options}
                  sx={{ width: "12vw" }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Countries"
                      value={country}
                      name="country"
                    />
                  )}
                />
                <TextField
                  id="Priority"
                  sx={{ width: "12vw" }}
                  label={"Priority"}
                  name="Priority"
                  value={editedpriority}
                  onChange={(e) => setEditedPriority(e.target.value)}
                />
                <TextField
                  id="Rate/per"
                  name="Rate/per"
                  sx={{ width: "12vw" }}
                  label="Rate / per"
                  value={editedratePer}
                  onChange={(e) => setEditedRatePer(e.target.value)}
                />
                <TextField
                  id="DefaultMinRate"
                  name="DefaultMinRate"
                  sx={{ width: "12vw" }}
                  label="Default Min Rate"
                  value={editeddefaultMinRate}
                  onChange={(e) => setEditedDefaultMinRate(e.target.value)}
                />
                <TextField
                  id="DefaultMaxRate"
                  name="DefaultMaxRate"
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
                  value={editedopenRatePremium}
                  onChange={(e) => setEditedOpenRatePremium(e.target.value)}
                />
                <TextField
                  id="GulfDiscFactor"
                  name="GulfDiscFactor"
                  sx={{ width: "12vw" }}
                  label="Gulf Disc Factor"
                  value={editedgulfDiscFactor}
                  onChange={(e) => setEditedGulfDiscFactor(e.target.value)}
                />
                <TextField
                  label="Amex Map Code"
                  name="AmexMapCode"
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
                  control={<Checkbox name="Activate" />}
                  label="Active"
                  sx={{ width: 50 }}
                />
                <FormControlLabel
                  control={<Checkbox name="OnlyStocking" />}
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
            </Box>
          </Box>
        </AnimatePresence>
      )}

      {/* -------------------------EDIT END------------------------------- */}

      <CustomAlertModalCurrency
        handleAction={() => CurrencyMasterDelete(rowid)}
      />
    </MainContainerCompilation>
  );
};

export default CurrencyProfile;
