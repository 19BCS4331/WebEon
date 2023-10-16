import React, { useEffect, useState } from "react";
import MainContainerCompilation from "../../components/global/MainContainerCompilation";
import { Autocomplete, Box, InputAdornment, TextField } from "@mui/material";
import { COLORS } from "../../assets/colors/COLORS";
import "../../css/components/formComponent.css";
import axios from "axios";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { DataGrid } from "@mui/x-data-grid";
import { motion } from "framer-motion";
// import FormComponent from "../../components/global/Form/FormComponent";

const CurrencyProfile = () => {
  // const InputsData = [
  //   {
  //     name: "CurrencyProfile",
  //     label: "Currency Profile",
  //     // Autocomplete: true,
  //     select: true,
  //     options: [
  //       { label: "Hello" },
  //       { label: "World" },
  //       { label: "First form input" },
  //     ],
  //   },
  //   {
  //     name: "FinancialCodes",
  //     label: "Financial Codes",
  //   },
  //   {
  //     name: "FinancialSubProfile",
  //     label: "Financial Sub Profile",
  //   },
  //   {
  //     name: "DivisionProfile",
  //     label: "Division Profile",
  //     // Autocomplete: true,
  //     select: true,
  //     options: [
  //       { label: "Hello" },
  //       { label: "World" },
  //       { label: "First form input" },
  //     ],
  //   },
  //   {
  //     name: "DivisionDetails",
  //     label: "Division Details",
  //   },
  //   {
  //     name: "AccountsProfile",
  //     label: "Accounts Profile",
  //   },
  //   {
  //     name: "AD1Provider",
  //     label: "AD1 Provider",
  //   },
  //   {
  //     name: "AnotherInput",
  //     label: "Another Input",
  //   },
  // ];

  const options = ["hello", "hi", "bye"];

  const CalculationMethodOptions = ["Multiplication", "Division"];

  const [allCurrencyData, setAllCurrencyData] = useState(null);
  const [currencyOneData, setCurrencyOneData] = useState(null);
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

  const [iscreateForm, setIsCreateForm] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [isSearch, setIsSearch] = useState(false);

  const handleSubmitCreate = (event) => {
    event.preventDefault();
    var data = new FormData(event.target);
    let formObject = Object.fromEntries(data.entries());
    console.log(formObject);
  };

  const handleEditClick = () => {
    setIsEdit(!isEdit);
  };

  const handleSearchClick = () => {
    setIsSearch(true);
    // setIsEdit(true);
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

  const [searchKeyword, setSearchKeyword] = useState("");
  const columns = [
    { field: "currencyid", headerName: "ID", width: 70 },
    { field: "currency_code", headerName: "Currency Code", width: 130 },
    { field: "currency_name", headerName: "Currency Name", width: 130 },
    {
      field: "branchcode",
      headerName: "Branch Code",

      width: 130,
    },
  ];

  // const rows = [
  //   { id: 1, lastName: "Snow", firstName: "Jon", age: 35 },
  //   { id: 2, lastName: "Lannister", firstName: "Cersei", age: 42 },
  //   { id: 3, lastName: "Lannister", firstName: "Jaime", age: 45 },
  //   { id: 4, lastName: "Stark", firstName: "Arya", age: 16 },
  //   { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
  //   { id: 6, lastName: "Melisandre", firstName: null, age: 150 },
  //   { id: 7, lastName: "Clifford", firstName: "Ferrara", age: 44 },
  //   { id: 8, lastName: "Frances", firstName: "Rossini", age: 36 },
  //   { id: 9, lastName: "Roxie", firstName: "Harvey", age: 65 },
  // ];

  return (
    <MainContainerCompilation title={"Currency Profile"}>
      {/* <FormComponent InputsData={InputsData} title={"Currency Master"} /> */}
      {iscreateForm && (
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
              id="Rate/per"
              name="Rate/per"
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

            <button className="FormFooterButton" type="reset">
              Cancel
            </button>
            <button className="FormFooterButton" type="submit">
              Add
            </button>
          </Box>
        </Box>
      )}

      {isSearch && (
        // <Box
        //   display={"flex"}
        //   flexDirection={"column"}
        //   alignItems={"center"}
        //   name="ContainerBox"
        //   sx={{ backgroundColor: COLORS.text }}
        //   height={"auto"}
        //   p={3}
        //   width={"auto"}
        //   borderRadius={"40px"}
        //   boxShadow={"box-shadow: 0px 10px 15px -3px rgba(0,0,0,0.6)"}
        // >
        <Box
          component={motion.div}
          initial={{ y: -150 }}
          animate={{ y: 0 }}
          display={"flex"}
          flexDirection={"column"}
          alignItems={"center"}
          gap={4}
          p={5}
          borderRadius={"20px"}
          sx={{ backgroundColor: COLORS.text }}
          boxShadow={5}
        >
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
              maxHeight: "60vh",
              boxShadow: 3,
              border: "2px solid",
              borderColor: COLORS.secondaryBG,
            }}
            // rows={rows}
            // columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 5 },
              },
            }}
            pageSizeOptions={[5, 10]}
            checkboxSelection
          />
        </Box>
      )}
    </MainContainerCompilation>
  );
};

export default CurrencyProfile;
