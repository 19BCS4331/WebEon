// import React, { useContext, useEffect, useState } from "react";
// import MainContainerCompilation from "../../../components/global/MainContainerCompilation";
// import {
//   Autocomplete,
//   Box,
//   CircularProgress,
//   InputAdornment,
//   MenuItem,
//   TextField,
//   Tooltip,
//   useMediaQuery,
//   useTheme,
// } from "@mui/material";
// import "../../../css/components/formComponent.css";
// import axios from "axios";
// import Checkbox from "@mui/material/Checkbox";
// import FormControlLabel from "@mui/material/FormControlLabel";
// import SearchIcon from "@mui/icons-material/Search";
// import ClearIcon from "@mui/icons-material/Clear";
// import { DataGrid } from "@mui/x-data-grid";
// import { AnimatePresence, motion } from "framer-motion";
// import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
// import "../../../css/pages/CurrencyProfile.css";
// import { useToast } from "../../../contexts/ToastContext";
// import CustomAlertModalCurrency from "../../../components/CustomerAlertModalCurrency";
// import { useNavigate } from "react-router-dom";
// import TransConfigModal from "../../../components/Masters/SystemSetup/TaxMaster/TransConfigModal";
// import OtherInfo from "../../../components/Masters/SystemSetup/TaxMaster/OtherInfo";
// import SlabConfigModal from "../../../components/Masters/SystemSetup/TaxMaster/SlabConfigModal";
// import {
//   TaxMasterCreate,
//   TaxMasterSlabFetch,
// } from "../../../apis/Master/SystemSetup";
// import ThemeContext from "../../../contexts/ThemeContext";

// const TaxMaster = () => {
//   // -----------------STATES START---------------------
//   const { Colortheme } = useContext(ThemeContext);
//   const baseUrl = process.env.REACT_APP_BASE_URL;
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
//   const navigate = useNavigate();
//   const {
//     showAlertDialogCurrency,
//     hideAlertDialogCurrency,
//     showToast,
//     hideToast,
//   } = useToast();
//   const [isLoading, setisLoading] = useState(false);
//   const options = ["hello", "hi", "bye"];

//   const ApplyAsOptions = [
//     {
//       value: "%",
//       label: "Percentage",
//     },
//     {
//       value: "F",
//       label: "Fixed Value",
//     },
//   ];
//   const CalculationMethodOptions = ["Multiplication", "Division"];
//   const [loading, setLoading] = useState(false);

//   const [taxMasterData, setTaxMasterData] = useState(null);
//   const [taxMasterSlabsData, setTaxMasterSlabData] = useState(null);

//   const [showTransConfigModal, setShowTransConfigModal] = useState(false);
//   const [showSlabConfigModal, setShowSlabConfigModal] = useState(false);
//   const [showOtherInfoModal, setShowOtherInfoModal] = useState(false);
//   const [savedSlabs, setSavedSlabs] = useState([]);
//   const [editedSavedSlabs, setEditedSavedSlabs] = useState([]);
//   const [savedTransConfigData, setSavedTransConfigData] = useState([]);
//   const [savedEditedTransConfigData, setSavedEditedTransConfigData] = useState(
//     []
//   );
//   const [savedOtherInfoData, setSavedOtherInfoData] = useState([]);

//   const [editedSavedOtherInfoData, setSavedEditedOtherInfoData] = useState([]);

//   const handleSaveSlabs = (updatedRows) => {
//     // Assuming you want to save the updated rows to state in the parent component
//     setSavedSlabs(updatedRows);
//   };

//   const handleEditSaveSlabs = (updatedEditedRows) => {
//     // Assuming you want to save the updated rows to state in the parent component
//     setEditedSavedSlabs(updatedEditedRows);
//   };

//   const handleSaveTransConfigData = (transConfigData) => {
//     // Assuming you want to save the updated rows to state in the parent component
//     setSavedTransConfigData(transConfigData);
//   };

//   const handleSaveEditedTransConfigData = (editedTransConfigData) => {
//     // Assuming you want to save the updated rows to state in the parent component
//     setSavedEditedTransConfigData(editedTransConfigData);
//   };

//   const handleSaveOtherInfo = (otherInfoData) => {
//     // Assuming you want to save the updated rows to state in the parent component
//     setSavedOtherInfoData(otherInfoData);
//   };

//   const handleSaveEditedOtherInfo = (editedOtherInfoData) => {
//     // Assuming you want to save the updated rows to state in the parent component
//     setSavedEditedOtherInfoData(editedOtherInfoData);
//   };

//   // --------------create form states(values)--------------
//   const [taxCode, setTaxCode] = useState("");
//   const [description, setDescription] = useState("");
//   const [postAcc, setPostAcc] = useState(null);
//   const [applyAs, setApplyAs] = useState(null);
//   const [taxValue, setTaxValue] = useState("");
//   const [isSlab, setIsSlab] = useState(false);

//   const [isTranround, setIsTranround] = useState(false);
//   const [isFeehead, setIsFeehead] = useState(false);
//   const [isActive, setIsActive] = useState(false);
//   const [isInstrumentChgHead, setIsInstrumentChgHead] = useState(false);
//   const [isInclInvoiceAmount, setIsInclInvoiceAmount] = useState(false);
//   const [isRbiRefRate, setIsRbiRefRate] = useState(false);

//   const handleisTranroundChange = (event) => {
//     setIsTranround(event.target.checked);
//   };

//   const handleisFeeheadChange = (event) => {
//     setIsFeehead(event.target.checked);
//   };

//   const handleisActiveChange = (event) => {
//     setIsActive(event.target.checked);
//   };

//   const handleisInstrumentChgHeadChange = (event) => {
//     setIsInstrumentChgHead(event.target.checked);
//   };

//   const handleisInclInvoiceAmountChange = (event) => {
//     setIsInclInvoiceAmount(event.target.checked);
//   };

//   const handleisRbiRefRateChange = (event) => {
//     setIsRbiRefRate(event.target.checked);
//   };

//   const handleSlabCheckboxChange = () => {
//     setIsSlab((prevIsSlab) => !prevIsSlab);
//   };

//   // --------------end create form states (values--------------

//   // --------------Edit form states--------------

//   const [editedtaxCode, setEditedTaxCode] = useState("");
//   const [editedDescription, setEditedDescription] = useState("");
//   const [editedPostAcc, setEditedPostAcc] = useState(null);
//   const [editedApplyAs, setEditedApplyAs] = useState(null);
//   const [editedTaxValue, setEditedTaxValue] = useState("");

//   const [editedIsSlab, setEditedIsSlab] = useState(false);
//   const [editedIsTranround, setEditedIsTranround] = useState(false);
//   const [editedIsFeehead, setEditedIsFeehead] = useState(false);
//   const [editedIsActive, setEditedIsActive] = useState(false);
//   const [editedIsInstrumentChgHead, setEditedIsInstrumentChgHead] =
//     useState(false);
//   const [editedIsInclInvoiceAmount, setEditedIsInclInvoiceAmount] =
//     useState(false);
//   const [editedIsRbiRefRate, setEditedIsRbiRefRate] = useState(false);

//   const handleEditedisTranroundChange = (event) => {
//     setEditedIsTranround(event.target.checked);
//   };

//   const handleEditedisFeeheadChange = (event) => {
//     setEditedIsFeehead(event.target.checked);
//   };

//   const handleEditedIsActiveChange = (event) => {
//     setEditedIsActive(event.target.checked);
//   };

//   const handleEditedIsInstrumentChgHeadChange = (event) => {
//     setEditedIsInstrumentChgHead(event.target.checked);
//   };

//   const handleEditedisInclInvoiceAmountChange = (event) => {
//     setEditedIsInclInvoiceAmount(event.target.checked);
//   };

//   const handleEditedIsRbiRefRateChange = (event) => {
//     setEditedIsRbiRefRate(event.target.checked);
//   };

//   const handleEditedSlabCheckboxChange = () => {
//     setEditedIsSlab((prevIsSlab) => !prevIsSlab);
//   };

//   const [editedSelectedId, setEditedSelectedId] = useState("");
//   const [editedcurrencyCode, setEditedCurrencyCode] = useState("");
//   const [editedcurrencyName, setEditedCurrencyName] = useState("");
//   const [editedcountry, setEditedCountry] = useState("");
//   const [editedpriority, setEditedPriority] = useState("");
//   const [editedratePer, setEditedRatePer] = useState("");
//   const [editeddefaultMinRate, setEditedDefaultMinRate] = useState("");
//   const [editeddefaultMaxRate, setEditedDefaultMaxRate] = useState("");
//   const [editedcalculationMethod, setEditedCalculationMethod] = useState(null);
//   const [editedopenRatePremium, setEditedOpenRatePremium] = useState("");
//   const [editedgulfDiscFactor, setEditedGulfDiscFactor] = useState("");
//   const [editedamexMapCode, setEditedAmexMapCode] = useState("");
//   const [editedActiveStatus, setEditedActiveStatus] = useState("");
//   const [editedgroup, setEditedGroup] = useState(null);

//   // --------------end Edit form states--------------

//   const [iscreateForm, setIsCreateForm] = useState(true);
//   const [isEdit, setIsEdit] = useState(false);
//   const [isDelete, setIsDelete] = useState(false);
//   const [isSearch, setIsSearch] = useState(false);
//   const [rowid, SetRowid] = useState(null);
//   const [dataForEdit, setDataForEdit] = useState(null);

//   const [editSlabData, setSlabData] = useState(null);

//   const [selectionModel, setSelectionModel] = useState([]);
//   const [searchKeyword, setSearchKeyword] = useState("");
//   const columns = [
//     { field: "taxid", headerName: "ID", width: 140 },
//     {
//       field: "tax_code",
//       headerName: "Tax Code",
//       width: isMobile ? 120 : 150,
//     },
//     { field: "description", headerName: "Description", width: 180 },
//     {
//       field: "apply_as",
//       headerName: "Apply As",
//       width: isMobile ? 100 : 100,
//     },
//     {
//       field: "tax_value",
//       headerName: "Tax Value",
//       width: isMobile ? 100 : 100,
//     },
//     {
//       field: "actions",
//       headerName: "Actions",
//       sortable: false,
//       width: 200,
//       headerAlign: "center",
//       renderCell: (params) => (
//         <Box display={"flex"} gap={2}>
//           <button
//             className="ActionsButtonsEdit"
//             onClick={() => handleEditClickOnRow(params.row)}
//           >
//             Edit
//           </button>
//           {isLoading ? (
//             <CircularProgress
//               size="25px"
//               style={{ color: Colortheme.secondaryBG }}
//             />
//           ) : (
//             <button
//               className="ActionsButtonsDelete"
//               onClick={() => handleDeleteClick(params.row)}
//             >
//               Delete
//             </button>
//           )}
//         </Box>
//       ),
//     },
//     // {
//     //   field: "branchcode",
//     //   headerName: "Branch Code",

//     //   width: 130,
//     // },
//   ];

//   // -----------------STATES END---------------------

//   //  ---------------------FUNCTIONS START----------------------

//   const handleHideTransConfigModal = () => {
//     setShowTransConfigModal(false);
//   };

//   const handleHideSlabConfigModal = () => {
//     setShowSlabConfigModal(false);
//   };

//   const handleHideOtherInfoModal = () => {
//     setShowOtherInfoModal(false);
//   };

//   const handleSubmitCreate = async (event) => {
//     setisLoading(true);
//     event.preventDefault();
//     var data = new FormData(event.target);
//     let formObject = Object.fromEntries(data.entries());
//     formObject.Slabs = savedSlabs;
//     formObject.TransConfig = savedTransConfigData;
//     formObject.OtherInfoData = savedOtherInfoData;
//     formObject.isdeleted = false;
//     console.log(formObject);
//     if (formObject) {
//       const response = await TaxMasterCreate(formObject);
//       if (response.data.message === "Data saved successfully") {
//         setisLoading(false);
//         showToast("Data Inserted Successfully", "success");
//         window.location.reload();
//         setTimeout(() => {
//           hideToast();
//         }, 1500);
//       } else {
//         console.log(response.data.message);
//       }
//     }
//     if (taxCode === "" && description === "") {
//       setisLoading(false);
//       showToast("Please Enter All Fields", "Fail");
//       setTimeout(() => {
//         hideToast();
//       }, 1500);
//     }
//   };

//   const handleSubmitEdit = async (event) => {
//     setisLoading(true);
//     const token = localStorage.getItem("token");
//     event.preventDefault();
//     var data = new FormData(event.target);
//     let formObject = Object.fromEntries(data.entries());
//     const {
//       bulk_buying,
//       bulk_selling,
//       product_settlement,
//       retail_buying,
//       retail_selling,
//       tc_settlement,
//     } = savedEditedTransConfigData;
//     formObject.EditedSlabs = editedSavedSlabs;
//     formObject.EditedTransConfig = savedEditedTransConfigData;
//     formObject.EditedOtherInfoData = editedSavedOtherInfoData;
//     console.log("Edit Form Object: ", formObject);
//     if (editedtaxCode !== "" && editedDescription !== "") {
//       try {
//         const response = await axios.post(
//           `${baseUrl}/api/master/TaxMasterEdit`,
//           {
//             taxid: editedSelectedId,
//             // currency_code: formObject.CurrencyCodeEdited,
//             // currency_name: formObject.CurrencyNameEdited,
//             // priority: formObject.PriorityEdited,
//             // rateper: formObject.RateperEdited,
//             // defaultminrate: formObject.DefaultMinRateEdited,
//             // defaultmaxrate: formObject.DefaultMaxRateEdited,
//             // calculationmethod:
//             //   formObject.CalculationMethodEdited === "Multiplication"
//             //     ? "M"
//             //     : "D",
//             // openratepremium: formObject.OpenRatePremiumEdited,
//             // gulfdiscfactor: formObject.GulfDiscFactorEdited,
//             // isactive: formObject.ActivateEdited === "on" ? true : false,

//             tax_code: formObject.editedTaxCode,
//             description: formObject.editedDescription,
//             apply_as: formObject.editedApplyAs,
//             incl_invoice_amount: formObject.editedInclInvoiceAmount,
//             rbi_ref_rate: formObject.editedRbiRefRate,
//             slab_wise: formObject.editedSlabWise,
//             tax_value: formObject.editedTaxValue,
//             fee_head: formObject.editedFeehead,
//             is_active: formObject.editedIsActive,
//             is_instrument_chg_head: formObject.editedIsInstrumentChgHead,
//             tran_round: formObject.editedTranround,
//             other_info_data: formObject.EditedOtherInfoData,
//             retail_buying: retail_buying,
//             retail_selling: retail_selling,
//             bulk_buying: bulk_buying,
//             bulk_selling: bulk_selling,
//             tc_settlement: tc_settlement,
//             product_settlement: product_settlement,
//             slabData: formObject.EditedSlabs,
//           },
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//         console.log(response.data);
//         showToast("Data Edited Successfully!", "success");
//         setTimeout(() => {
//           hideToast();
//         }, 1500);
//         const updatedData = await TaxMasterRefresh(); // Replace with your API call to fetch data
//         if (updatedData) {
//           setTaxMasterData(updatedData);
//         }
//         setIsEdit(false);
//         setIsSearch(true);
//         setIsCreateForm(false);
//         setisLoading(false);
//       } catch (error) {
//         console.log(error);
//         setisLoading(false);
//       }
//     } else {
//       setisLoading(false);
//       showToast("Please Enter All Fields", "Fail");
//       setTimeout(() => {
//         hideToast();
//       }, 1500);
//     }
//   };

//   const handleSearchClick = () => {
//     setIsSearch(true);
//     // setIsEdit(true);
//     setIsCreateForm(false);
//   };

//   const handlebackClickOnSearch = () => {
//     setIsSearch(false);
//     setIsCreateForm(true);
//   };

//   const handlebackClickOnCreate = () => {
//     navigate(-1);
//   };

//   const handleBackOnEdit = () => {
//     setIsSearch(true);
//     setIsEdit(false);
//     setIsCreateForm(false);
//   };

//   const TaxMasterRefresh = async () => {
//     const token = localStorage.getItem("token");
//     try {
//       const response = await axios.get(`${baseUrl}/api/master/TaxMasterFetch`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       setTaxMasterData(response.data);
//       console.log(response.data);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     const fetchTaxMaster = async () => {
//       setLoading(true);
//       if (isSearch === true) {
//         const token = localStorage.getItem("token");
//         try {
//           const response = await axios.get(
//             `${baseUrl}/api/master/TaxMasterFetch`,
//             {
//               headers: {
//                 Authorization: `Bearer ${token}`,
//               },
//             }
//           );
//           setTaxMasterData(response.data);
//           console.log(response.data);
//           setLoading(false);
//         } catch (error) {
//           console.log(error);
//           setLoading(false);
//         }
//       }
//     };

//     fetchTaxMaster();
//   }, [isSearch]);

//   useEffect(() => {
//     const fetchTaxMasterSlabs = async () => {
//       setLoading(true);
//       if (isSearch === true) {
//         const response = await TaxMasterSlabFetch();
//         if (response) {
//           setTaxMasterSlabData(response.data);
//         }
//         console.log(response);
//         setLoading(false);
//       }
//     };

//     fetchTaxMasterSlabs();
//   }, [isSearch]);

//   const TaxMasterDelete = async (taxid) => {
//     setisLoading(true);
//     const token = localStorage.getItem("token");
//     try {
//       const response = await axios.post(
//         `${baseUrl}/api/master/TaxMasterDelete`,
//         { taxid: taxid },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       console.log(response.data);
//       const updatedData = taxMasterData.filter((item) => item.taxid !== taxid);
//       setTaxMasterData(updatedData);
//       setisLoading(false);
//       showToast("Successfully Deleted!", "success");
//       setTimeout(() => {
//         hideToast();
//       }, 2000);
//       hideAlertDialogCurrency();
//       setSearchKeyword("");
//     } catch (error) {
//       console.log(error);
//       setisLoading(false);
//       hideAlertDialogCurrency();
//     }
//   };

//   const handleSelectionModelChange = (newSelection) => {
//     // Ensure that only one row is selected at a time
//     if (newSelection.length > 0) {
//       setSelectionModel([newSelection[newSelection.length - 1]]);
//     } else {
//       setSelectionModel(newSelection);
//     }
//   };

//   const handleEditClickOnRow = async (row) => {
//     // --------------setting all states-------------------------
//     setEditedSelectedId(row.taxid);
//     setEditedTaxCode(row.tax_code);
//     setEditedDescription(row.description);
//     setEditedPostAcc(row.post_acc);
//     setEditedApplyAs(row.apply_as);
//     setEditedTaxValue(row.tax_value);
//     setEditedIsSlab(row.slab_wise);
//     setEditedIsTranround(row.tran_round);
//     setEditedIsFeehead(row.fee_head);
//     setEditedIsActive(row.is_active);
//     setEditedIsInstrumentChgHead(row.is_instrument_chg_head);
//     setEditedIsInclInvoiceAmount(row.incl_invoice_amount);
//     setEditedIsRbiRefRate(row.rbi_ref_rate);

//     // --------------End of setting all data states-------------------------

//     const filteredSlabsData = taxMasterSlabsData.filter(
//       (slab) => slab.taxid === row.taxid
//     );
//     setSlabData(filteredSlabsData);

//     setIsEdit(true);
//     setIsCreateForm(false);
//     setIsSearch(false);
//     setSearchKeyword("");
//     setDataForEdit(row);

//     // Switch the view and fetch the corresponding row's data for editing
//     // You can set the data in your component's state for editing
//     console.log("Edit button clicked for currency ID:", row.taxid);

//     // Add your logic to switch views and show the data in inputs
//   };

//   const handleDeleteClick = (row) => {
//     SetRowid(row.taxid);
//     console.log("Delete button clicked for currency ID:", row.taxid);
//     showAlertDialogCurrency(`Delete the record : ${row.tax_code} `);
//   };

//   //  ---------------------FUNCTIONS END----------------------

//   return (
//     <MainContainerCompilation title={"Tax Master"}>
//       {/* -------------------------CREATION START------------------------------- */}
//       {iscreateForm && (
//         <AnimatePresence>
//           <Box
//             component={motion.div}
//             initial={{ x: -100 }}
//             animate={{ x: 0 }}
//             exit={{ x: 100 }}
//           >
//             <Box
//               display={"flex"}
//               flexDirection={"column"}
//               alignItems={"center"}
//               name="ContainerBox"
//               component={"form"}
//               onSubmit={handleSubmitCreate}
//               sx={{
//                 backgroundColor: Colortheme.text,
//                 overflow: isMobile ? "auto" : "visible",
//                 maxHeight: isMobile ? "70vh" : "auto",
//               }}
//               height={isMobile ? "auto" : "65vh"}
//               p={3}
//               width={isMobile ? "70vw" : "60vw"}
//               borderRadius={"40px"}
//               boxShadow={"box-shadow: 0px 10px 15px -3px rgba(0,0,0,0.6)"}
//             >
//               <KeyboardBackspaceIcon
//                 onClick={handlebackClickOnCreate}
//                 fontSize="large"
//                 sx={{
//                   alignSelf: "flex-start",
//                   color: Colortheme.secondaryBG,
//                   position: "absolute",
//                   cursor: "pointer",
//                 }}
//               />
//               <Box
//                 name="HeaderSection"
//                 textAlign={"center"}
//                 fontSize={"20px"}
//                 mt={0}
//               >
//                 Tax Master
//               </Box>
//               <Box name="HeaderSection" fontSize={"14px"} mt={2}>
//                 (Create New)
//               </Box>
//               {isLoading ? (
//                 <CircularProgress sx={{ marginTop: 5 }} />
//               ) : (
//                 <Box
//                   name="InputsContainer"
//                   mt={4}
//                   display={"grid"}
//                   gridTemplateColumns={
//                     isMobile ? "repeat(1, 1fr)" : "repeat(4, 1fr)"
//                   }
//                   // gridTemplateColumns={"repeat(3, 1fr)"}
//                   gridTemplateRows={"repeat(3, 1fr)"}
//                   columnGap={"40px"}
//                   rowGap={"40px"}
//                 >
//                   <TextField
//                     required
//                     sx={{ width: isMobile ? "auto" : "12vw" }}
//                     name="TaxCode"
//                     value={taxCode}
//                     onChange={(e) => setTaxCode(e.target.value)}
//                     label="Tax Code"
//                   />
//                   <TextField
//                     sx={{ width: isMobile ? "auto" : "12vw" }}
//                     name="description"
//                     label="Description"
//                     value={description}
//                     onChange={(e) => setDescription(e.target.value)}
//                   />
//                   <FormControlLabel
//                     control={
//                       <Checkbox
//                         name="tranround"
//                         checked={isTranround}
//                         onChange={handleisTranroundChange}
//                       />
//                     }
//                     label="Trn.Round"
//                     sx={{ width: 50 }}
//                   />
//                   <FormControlLabel
//                     control={
//                       <Checkbox
//                         name="feehead"
//                         checked={isFeehead}
//                         onChange={handleisFeeheadChange}
//                       />
//                     }
//                     label="Fee Head"
//                     sx={{ width: 50 }}
//                   />
//                   <TextField
//                     id="PostAcc"
//                     sx={{ width: isMobile ? "auto" : "12vw" }}
//                     label="Post Account"
//                     name="PostAcc"
//                     value={postAcc}
//                     onChange={(e) => setPostAcc(e.target.value)}
//                   />
//                   <TextField
//                     required
//                     select
//                     id="ApplyAs"
//                     sx={{ width: isMobile ? "auto" : "12vw" }}
//                     label="Apply As"
//                     name="ApplyAs"
//                     value={applyAs}
//                     onChange={(e) => setApplyAs(e.target.value)}
//                   >
//                     {ApplyAsOptions.map((option) => (
//                       <MenuItem key={option.value} value={option.value}>
//                         {option.label}
//                       </MenuItem>
//                     ))}
//                   </TextField>
//                   <TextField
//                     required
//                     id="TaxValue"
//                     type="number"
//                     sx={{ width: isMobile ? "auto" : "12vw" }}
//                     label="Value"
//                     name="TaxValue"
//                     value={taxValue}
//                     onChange={(e) => setTaxValue(e.target.value)}
//                   />
//                   <Tooltip title="Config For Transactions">
//                     <Box
//                       onClick={() => setShowTransConfigModal(true)}
//                       display={"flex"}
//                       width={isMobile ? "auto" : "12vw"}
//                       sx={{
//                         border: `solid 1px ${Colortheme.background}`,
//                         borderRadius: "5px",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         cursor: "pointer",
//                       }}
//                     >
//                       <p
//                         style={{
//                           color: Colortheme.background,
//                           fontWeight: "bold",
//                         }}
//                       >
//                         Txn Configuration
//                       </p>
//                     </Box>
//                   </Tooltip>
//                   <Tooltip title="Other Information">
//                     <Box
//                       onClick={() => setShowOtherInfoModal(true)}
//                       display={"flex"}
//                       width={isMobile ? "auto" : "12vw"}
//                       sx={{
//                         border: `solid 1px ${Colortheme.background}`,
//                         borderRadius: "5px",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         cursor: "pointer",
//                       }}
//                     >
//                       <p
//                         style={{
//                           color: Colortheme.background,
//                           fontWeight: "bold",
//                         }}
//                       >
//                         Additional Info
//                       </p>
//                     </Box>
//                   </Tooltip>

//                   <FormControlLabel
//                     control={
//                       <Checkbox
//                         name="isActive"
//                         checked={isActive}
//                         onChange={handleisActiveChange}
//                       />
//                     }
//                     label="Active ?"
//                     sx={{ width: 170 }}
//                   />
//                   <FormControlLabel
//                     control={
//                       <Checkbox
//                         name="isInstrumentChgHead"
//                         checked={isInstrumentChgHead}
//                         onChange={handleisInstrumentChgHeadChange}
//                       />
//                     }
//                     label="Is Instrument Chg head ?"
//                     sx={{ width: 170 }}
//                   />
//                   <FormControlLabel
//                     control={
//                       <Checkbox
//                         name="InclInvoiceAmount"
//                         checked={isInclInvoiceAmount}
//                         onChange={handleisInclInvoiceAmountChange}
//                       />
//                     }
//                     label="Incl Invoice Amount"
//                     sx={{ width: 170 }}
//                   />
//                   <FormControlLabel
//                     control={
//                       <Checkbox
//                         name="RbiRefRate"
//                         checked={isRbiRefRate}
//                         onChange={handleisRbiRefRateChange}
//                       />
//                     }
//                     label="RBI Ref Rate"
//                     sx={{ width: 170 }}
//                   />
//                   <FormControlLabel
//                     control={
//                       <Checkbox
//                         name="SlabWise"
//                         checked={isSlab}
//                         onChange={handleSlabCheckboxChange}
//                       />
//                     }
//                     label="Slab Wise"
//                     sx={{ width: 180 }}
//                   />
//                   {isSlab && (
//                     <Tooltip title="Config For Transactions">
//                       <Box
//                         onClick={() => setShowSlabConfigModal(true)}
//                         display={"flex"}
//                         width={isMobile ? "auto" : "12vw"}
//                         sx={{
//                           border: `solid 1px ${Colortheme.background}`,
//                           borderRadius: "5px",
//                           alignItems: "center",
//                           justifyContent: "center",
//                           cursor: "pointer",
//                         }}
//                       >
//                         <p
//                           style={{
//                             color: Colortheme.background,
//                             fontWeight: "bold",
//                           }}
//                         >
//                           Slab Configuration
//                         </p>
//                       </Box>
//                     </Tooltip>
//                   )}
//                 </Box>
//               )}

//               <Box display="flex" name="FooterSection" mt={5} gap={5}>
//                 <button
//                   onClick={handleSearchClick}
//                   className="FormFooterButton"
//                   style={{
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     gap: 5,
//                   }}
//                 >
//                   <SearchIcon />
//                   Search
//                 </button>

//                 {/* <button className="FormFooterButton" type="reset">
//                   Cancel
//                 </button> */}
//                 <button className="FormFooterButton" type="submit">
//                   Add
//                 </button>
//               </Box>
//             </Box>
//           </Box>
//         </AnimatePresence>
//       )}

//       {/* -------------------------CREATION END------------------------------- */}

//       {/* -------------------------SEARCH & DELETE) START------------------------------- */}
//       {loading && isSearch ? (
//         <CircularProgress />
//       ) : (
//         <>
//           {isSearch && taxMasterData && (
//             <Box
//               component={motion.div}
//               initial={{ x: 150 }}
//               animate={{ x: 0 }}
//               height={"auto"}
//               minHeight={"40vh"}
//               width={isMobile ? "65vw" : "50vw"}
//               display={"flex"}
//               flexDirection={"column"}
//               alignItems={"center"}
//               gap={4}
//               p={5}
//               borderRadius={"20px"}
//               sx={{ backgroundColor: Colortheme.text }}
//               boxShadow={5}
//             >
//               <KeyboardBackspaceIcon
//                 onClick={handlebackClickOnSearch}
//                 fontSize="large"
//                 sx={{
//                   alignSelf: "flex-start",
//                   color: Colortheme.secondaryBG,
//                   position: "absolute",
//                   cursor: "pointer",
//                 }}
//               />
//               <TextField
//                 placeholder="Search.."
//                 value={searchKeyword}
//                 onChange={(e) => setSearchKeyword(e.target.value)}
//                 sx={{
//                   "& fieldset": { border: "none" },
//                 }}
//                 style={{
//                   display: "flex",
//                   width: isMobile ? "40vw" : "16vw",
//                   backgroundColor: Colortheme.text,
//                   borderRadius: "20px",
//                   border: `2px solid ${Colortheme.secondaryBG}`,
//                   height: 50,
//                   justifyContent: "center",
//                   boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1)",
//                 }}
//                 InputProps={
//                   searchKeyword.length > 0
//                     ? {
//                         startAdornment: (
//                           <InputAdornment position="start">
//                             <SearchIcon />
//                           </InputAdornment>
//                         ),
//                         endAdornment: (
//                           <InputAdornment position="end">
//                             <ClearIcon
//                               onClick={() => setSearchKeyword("")}
//                               style={{ cursor: "pointer" }}
//                             />
//                           </InputAdornment>
//                         ),
//                       }
//                     : {
//                         startAdornment: (
//                           <InputAdornment position="start">
//                             <SearchIcon />
//                           </InputAdornment>
//                         ),
//                       }
//                 }
//               />
//               <DataGrid
//                 disableRowSelectionOnClick
//                 disableColumnFilter
//                 rows={taxMasterData.filter((row) => {
//                   if (searchKeyword === "") {
//                     return true; // No search keyword, so show all rows
//                   }

//                   const lowerSearchKeyword = searchKeyword.toLowerCase();

//                   // Check if any column value includes the search keyword (case-insensitive)
//                   for (const column of columns) {
//                     const cellValue = row[column.field]
//                       ? row[column.field].toString().toLowerCase()
//                       : "";
//                     if (cellValue.includes(lowerSearchKeyword)) {
//                       return true;
//                     }
//                   }

//                   return false;
//                 })}
//                 columnVisibilityModel={
//                   isMobile
//                     ? {
//                         // Hide columns status and traderName, the other columns will remain visible
//                         taxid: false,
//                         description: false,
//                       }
//                     : { taxid: false, currencyid: false }
//                 }
//                 getRowId={(row) => row.taxid}
//                 rowSelectionModel={selectionModel}
//                 onRowSelectionModelChange={handleSelectionModelChange}
//                 sortModel={[
//                   {
//                     field: "taxid",
//                     sort: "asc",
//                   },
//                 ]}
//                 columns={columns}
//                 onModelChange={(model) => {
//                   // Update the search keyword when filtering is applied
//                   if (model.filterModel && model.filterModel.items.length > 0) {
//                     setSearchKeyword(model.filterModel.items[0].value);
//                   } else {
//                     setSearchKeyword("");
//                   }
//                 }}
//                 sx={{
//                   backgroundColor: Colortheme.text,
//                   p: isMobile ? "10px" : "20px",
//                   maxHeight: "60vh",
//                   width: isMobile ? "70vw" : "50vw",
//                   boxShadow: 3,
//                   border: "2px solid",
//                   borderColor: Colortheme.secondaryBG,
//                   "& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnHeaderTitleContainer":
//                     {
//                       display: "none",
//                     },
//                 }}
//                 initialState={{
//                   pagination: {
//                     paginationModel: { page: 0, pageSize: 5 },
//                   },
//                 }}
//                 pageSizeOptions={[5, 10]}
//                 // checkboxSelection
//               />
//             </Box>
//           )}{" "}
//         </>
//       )}

//       {/* -------------------------SEARCH END------------------------------- */}

//       {/* -------------------------EDIT START------------------------------- */}

//       {isEdit && dataForEdit && (
//         <AnimatePresence>
//           <Box
//             component={motion.div}
//             initial={{ y: -50 }}
//             animate={{ y: 0 }}
//             exit={{ y: -50 }}
//           >
//             <Box
//               display={"flex"}
//               flexDirection={"column"}
//               alignItems={"center"}
//               name="ContainerBox"
//               component={"form"}
//               onSubmit={handleSubmitEdit}
//               sx={{
//                 backgroundColor: Colortheme.text,
//                 overflow: isMobile ? "auto" : "visible",
//                 maxHeight: isMobile ? "70vh" : "auto",
//               }}
//               height={"auto"}
//               p={3}
//               width={isMobile ? "70vw" : "auto"}
//               borderRadius={"40px"}
//               boxShadow={"box-shadow: 0px 10px 15px -3px rgba(0,0,0,0.6)"}
//             >
//               {isLoading ? (
//                 <CircularProgress size={"30px"} />
//               ) : (
//                 <>
//                   <Box
//                     name="HeaderSection"
//                     textAlign={"center"}
//                     fontSize={"20px"}
//                     mt={0}
//                   >
//                     Edit Data
//                   </Box>
//                   <Box name="HeaderSection" fontSize={"14px"} mt={2}>
//                     (Tax Code : {dataForEdit.tax_code})
//                   </Box>

//                   <Box
//                     name="InputsContainer"
//                     mt={4}
//                     display={"grid"}
//                     gridTemplateColumns={
//                       isMobile ? "repeat(1, 1fr)" : "repeat(4, 1fr)"
//                     }
//                     // gridTemplateColumns={"repeat(3, 1fr)"}
//                     gridTemplateRows={"repeat(3, 1fr)"}
//                     columnGap={"40px"}
//                     rowGap={"40px"}
//                   >
//                     <TextField
//                       required
//                       sx={{ width: isMobile ? "auto" : "12vw" }}
//                       name="editedTaxCode"
//                       value={editedtaxCode}
//                       onChange={(e) => setEditedTaxCode(e.target.value)}
//                       label="Tax Code"
//                     />
//                     <TextField
//                       sx={{ width: isMobile ? "auto" : "12vw" }}
//                       name="editedDescription"
//                       label="Description"
//                       value={editedDescription}
//                       onChange={(e) => setEditedDescription(e.target.value)}
//                     />
//                     <FormControlLabel
//                       control={
//                         <Checkbox
//                           name="editedTranround"
//                           checked={editedIsTranround}
//                           onChange={handleEditedisTranroundChange}
//                         />
//                       }
//                       label="Trn.Round"
//                       sx={{ width: 50 }}
//                     />
//                     <FormControlLabel
//                       control={
//                         <Checkbox
//                           name="editedFeehead"
//                           checked={editedIsFeehead}
//                           onChange={handleEditedisFeeheadChange}
//                         />
//                       }
//                       label="Fee Head"
//                       sx={{ width: 50 }}
//                     />
//                     <TextField
//                       id="editedPostAcc"
//                       sx={{ width: isMobile ? "auto" : "12vw" }}
//                       label="Post Account"
//                       name="editedPostAcc"
//                       value={editedPostAcc}
//                       onChange={(e) => setEditedPostAcc(e.target.value)}
//                     />
//                     <TextField
//                       required
//                       select
//                       id="editedApplyAs"
//                       sx={{ width: isMobile ? "auto" : "12vw" }}
//                       label="Apply As"
//                       name="editedApplyAs"
//                       value={editedApplyAs}
//                       onChange={(e) => setEditedApplyAs(e.target.value)}
//                     >
//                       {ApplyAsOptions.map((option) => (
//                         <MenuItem key={option.value} value={option.value}>
//                           {option.label}
//                         </MenuItem>
//                       ))}
//                     </TextField>
//                     <TextField
//                       required
//                       id="editedTaxValue"
//                       type="number"
//                       sx={{ width: isMobile ? "auto" : "12vw" }}
//                       label="Value"
//                       name="editedTaxValue"
//                       value={editedTaxValue}
//                       onChange={(e) => setEditedTaxValue(e.target.value)}
//                     />
//                     <Tooltip title="Config For Transactions">
//                       <Box
//                         onClick={() => setShowTransConfigModal(true)}
//                         display={"flex"}
//                         width={isMobile ? "auto" : "12vw"}
//                         sx={{
//                           border: `solid 1px ${Colortheme.background}`,
//                           borderRadius: "5px",
//                           alignItems: "center",
//                           justifyContent: "center",
//                           cursor: "pointer",
//                         }}
//                       >
//                         <p
//                           style={{
//                             color: Colortheme.background,
//                             fontWeight: "bold",
//                           }}
//                         >
//                           Txn Configuration
//                         </p>
//                       </Box>
//                     </Tooltip>
//                     <Tooltip title="Other Information">
//                       <Box
//                         onClick={() => setShowOtherInfoModal(true)}
//                         display={"flex"}
//                         width={isMobile ? "auto" : "12vw"}
//                         sx={{
//                           border: `solid 1px ${Colortheme.background}`,
//                           borderRadius: "5px",
//                           alignItems: "center",
//                           justifyContent: "center",
//                           cursor: "pointer",
//                         }}
//                       >
//                         <p
//                           style={{
//                             color: Colortheme.background,
//                             fontWeight: "bold",
//                           }}
//                         >
//                           Additional Info
//                         </p>
//                       </Box>
//                     </Tooltip>

//                     <FormControlLabel
//                       control={
//                         <Checkbox
//                           name="editedIsActive"
//                           checked={editedIsActive}
//                           onChange={handleEditedIsActiveChange}
//                         />
//                       }
//                       label="Active ?"
//                       sx={{ width: 170 }}
//                     />
//                     <FormControlLabel
//                       control={
//                         <Checkbox
//                           name="editedIsInstrumentChgHead"
//                           checked={editedIsInstrumentChgHead}
//                           onChange={handleEditedIsInstrumentChgHeadChange}
//                         />
//                       }
//                       label="Is Instrument Chg head ?"
//                       sx={{ width: 170 }}
//                     />
//                     <FormControlLabel
//                       control={
//                         <Checkbox
//                           name="editedInclInvoiceAmount"
//                           checked={editedIsInclInvoiceAmount}
//                           onChange={handleEditedisInclInvoiceAmountChange}
//                         />
//                       }
//                       label="Incl Invoice Amount"
//                       sx={{ width: 170 }}
//                     />
//                     <FormControlLabel
//                       control={
//                         <Checkbox
//                           name="editedRbiRefRate"
//                           checked={editedIsRbiRefRate}
//                           onChange={handleEditedIsRbiRefRateChange}
//                         />
//                       }
//                       label="RBI Ref Rate"
//                       sx={{ width: 170 }}
//                     />
//                     <FormControlLabel
//                       control={
//                         <Checkbox
//                           name="editedSlabWise"
//                           checked={editedIsSlab}
//                           onChange={handleEditedSlabCheckboxChange}
//                         />
//                       }
//                       label="Slab Wise"
//                       sx={{ width: 180 }}
//                     />
//                     {editedIsSlab && editSlabData && (
//                       <Tooltip title="Config For Transactions">
//                         <Box
//                           onClick={() => setShowSlabConfigModal(true)}
//                           display={"flex"}
//                           width={isMobile ? "auto" : "12vw"}
//                           sx={{
//                             border: `solid 1px ${Colortheme.background}`,
//                             borderRadius: "5px",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             cursor: "pointer",
//                           }}
//                         >
//                           <p
//                             style={{
//                               color: Colortheme.background,
//                               fontWeight: "bold",
//                             }}
//                           >
//                             Slab Configuration
//                           </p>
//                         </Box>
//                       </Tooltip>
//                     )}
//                   </Box>

//                   <Box display="flex" name="FooterSection" mt={4} gap={5}>
//                     <button
//                       onClick={handleBackOnEdit}
//                       className="FormFooterButton"
//                       style={{
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         gap: 5,
//                         width: isMobile ? "30vw" : "auto",
//                       }}
//                     >
//                       <KeyboardBackspaceIcon />
//                       Go Back
//                     </button>

//                     {/* <button className="FormFooterButton" type="reset">
//                     Cancel
//                   </button> */}
//                     <button
//                       className="FormFooterButton"
//                       type="submit"
//                       style={{ width: isMobile ? "30vw" : "auto" }}
//                     >
//                       Edit & Save
//                     </button>
//                   </Box>
//                 </>
//               )}
//             </Box>
//           </Box>
//         </AnimatePresence>
//       )}

//       {/* -------------------------EDIT END------------------------------- */}

//       <CustomAlertModalCurrency handleAction={() => TaxMasterDelete(rowid)} />
//       <TransConfigModal
//         showTransConfigModal={showTransConfigModal}
//         handleHideTransConfigModal={handleHideTransConfigModal}
//         onSaveTransConfig={handleSaveTransConfigData}
//         onSaveEditedTransConfig={handleSaveEditedTransConfigData}
//         isEdit={isEdit}
//         fetchedData={dataForEdit}
//       />
//       <SlabConfigModal
//         showSlabConfigModal={showSlabConfigModal}
//         handleHideSlabConfigModal={handleHideSlabConfigModal}
//         isCreate={iscreateForm}
//         isEdit={isEdit}
//         editSlabData={editSlabData}
//         onSaveSlab={handleSaveSlabs}
//         onEditSaveSlab={handleEditSaveSlabs}
//       />

//       <OtherInfo
//         showOtherInfoModal={showOtherInfoModal}
//         handleHideOtherInfoModal={handleHideOtherInfoModal}
//         onSaveOtherInfo={handleSaveOtherInfo}
//         onSaveEditedOtherInfo={handleSaveEditedOtherInfo}
//         isEdit={isEdit}
//         fetchedData={dataForEdit}
//       />
//     </MainContainerCompilation>
//   );
// };

// export default TaxMaster;

import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import MainContainerCompilation from "../../../components/global/MainContainerCompilation";
import { Box, Tooltip, useMediaQuery, useTheme } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import ThemeContext from "../../../contexts/ThemeContext";
import StyledButton from "../../../components/global/StyledButton";
import CustomTextField from "../../../components/global/CustomTextField";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { DataGrid } from "@mui/x-data-grid";
import LazyFallBack from "../../LazyFallBack";
import dayjs from "dayjs";

import { useToast } from "../../../contexts/ToastContext";
import CustomAlertModal from "../../../components/CustomAlertModal";
import { useBaseUrl } from "../../../contexts/BaseUrl";
import TaxMasterForm from "../../../components/global/FormConfig/Master/SystemSetup/TaxMasterForm";
import { apiClient } from "../../../services/apiClient";
const TaxMaster = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { Colortheme } = useContext(ThemeContext);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectionModel, setSelectionModel] = useState([]);
  const [rows, setRows] = useState([]);
  const [rowid, SetRowid] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { showAlertDialog, hideAlertDialog, showToast, hideToast } = useToast();
  const navigate = useNavigate();
  const { baseUrl } = useBaseUrl();

  useEffect(() => {
    setLoading(true);
    apiClient
      .get(`/pages/Master/SystemSetup/taxMaster`)
      .then((response) => {
        setRows(response.data.filter((row) => row.nTaxID));
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
        showToast("Error fetching data", "error");
        setTimeout(() => {
          hideToast();
        }, 2000);
      });
  }, []);

  const handleSelectionModelChange = (newSelection) => {
    setSelectionModel(newSelection);
  };

  const handleSearchChange = (event) => {
    setSearchKeyword(event.target.value);
  };

  const handleAdd = () => {
    setEditData(null);
    setShowForm(true);
  };

  const handleEdit = (row) => {
    setEditData(row);
    setShowForm(true);
  };

  const handleDeleteClick = (row) => {
    const rowid = row.nTaxID;
    console.log("Delete button clicked for ID:", row.nTaxID);
    showAlertDialog(`Delete the Product : ${row.DESCRIPTION} `, "", () =>
      DeleteFunc(rowid)
    );
  };

  const DeleteFunc = async (nTaxID) => {
    setLoading(true);
    try {
      const response = await apiClient.post(
        `/pages/Master/SystemSetup/taxMaster/delete`,
        { nTaxID: nTaxID }
      );
      console.log(response.data);
      setRows((prev) => prev.filter((row) => row.nTaxID !== nTaxID));
      setLoading(false);
      showToast("Successfully Deleted!", "success");
      setTimeout(() => {
        hideToast();
      }, 2000);
      hideAlertDialog();
      setSearchKeyword("");
    } catch (error) {
      console.log(error);
      setLoading(false);
      hideAlertDialog();
      showToast("Error deleting data", "error");
      setTimeout(() => {
        hideToast();
      }, 2000);
    }
  };

  const handleFormSubmit = (formData) => {
    setLoading(true);
    if (editData) {
      apiClient
        .put(`/pages/Master/SystemSetup/taxMaster`, formData)
        .then((response) => {
          setRows((prev) =>
            prev.map((row) =>
              row.nTaxID === editData.nTaxID ? response.data : row
            )
          );
          setShowForm(false);
          showToast("Successfully Edited!", "success");
          setTimeout(() => {
            hideToast();
          }, 2000);
          setSearchKeyword("");
          setLoading(false);
        })
        .catch((error) => {
          setLoading(false);
          setError(error);
          showToast("Error Editing data", "error");
          setTimeout(() => {
            hideToast();
          }, 2000);
        });
    } else {
      apiClient
        .post(`${baseUrl}/pages/Master/SystemSetup/taxMaster`, formData)
        .then((response) => {
          setRows((prev) => [...prev, response.data]);
          setShowForm(false);
          showToast("Successfully Inserted!", "success");
          setTimeout(() => {
            hideToast();
          }, 2000);
          setSearchKeyword("");
          setLoading(false);
        })
        .catch((error) => {
          setLoading(false);
          setError(error);
          showToast("Error Inserting data", "error");
          setTimeout(() => {
            hideToast();
          }, 2000);
        });
    }
  };

  if (loading) {
    return <LazyFallBack />;
  }

  // if (error) {
  //   return <div>Error fetching data: {error.message}</div>;
  // }

  const columns = [
    { field: "CODE", headerName: "Code", width: 200 },
    { field: "DESCRIPTION", headerName: "Name", width: 200 },
    {
      field: "ISACTIVE",
      headerName: "Status",
      width: 120,
      valueGetter: (params) => (params.row.ISACTIVE ? "Active" : "Inactive"),
    },

    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <Box display={"flex"} gap={2}>
          <StyledButton
            onClick={() => handleEdit(params.row)}
            bgColor={Colortheme.buttonBg}
            bgColorHover={Colortheme.buttonBgHover}
            style={{ width: 80, height: 30 }}
          >
            Edit
          </StyledButton>
          <StyledButton
            onClick={() => handleDeleteClick(params.row)}
            bgColor={Colortheme.buttonBg}
            bgColorHover={"red"}
            textColOnHover={"white"}
            style={{ width: 80, height: 30 }}
          >
            Delete
          </StyledButton>
        </Box>
      ),
    },
  ];

  const filteredRows = rows
    .filter((row) => row.nTaxID) // Ensure each row has a nTaxID
    .map((row) => {
      // Add any additional transformations needed for your data
      return row;
    })
    .filter((row) => {
      if (searchKeyword === "") {
        return true;
      }

      const lowerSearchKeyword = searchKeyword.toLowerCase();
      for (const column of columns) {
        const cellValue = row[column.field]
          ? row[column.field].toString().toLowerCase()
          : "";
        if (cellValue.includes(lowerSearchKeyword)) {
          return true;
        }
      }

      return false;
    });

  return (
    <MainContainerCompilation title={"Tax Master"}>
      {!showForm ? (
        <AnimatePresence>
          <Box
            component={motion.div}
            initial={{ x: -50 }}
            animate={{ x: 0 }}
            exit={{ x: -50 }}
            sx={{
              width: "95%",
              height: "80%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              backgroundColor: Colortheme.background,
              p: 5,
              borderRadius: 10,
            }}
            maxWidth={isMobile ? "60vw" : "90%"}
          >
            <Tooltip title="Go To Dashboard">
              <Box sx={{ alignSelf: "flex-start", mb: 2 }}>
                <StyledButton
                  onClick={() => navigate("/Dashboard")}
                  style={{
                    width: 100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <KeyboardBackspaceIcon style={{ fontSize: "30px" }} />
                </StyledButton>
              </Box>
            </Tooltip>

            <CustomTextField
              variant="outlined"
              placeholder="Search..."
              value={searchKeyword}
              onChange={handleSearchChange}
              style={{
                width: isMobile ? "80%" : "50%",
                marginTop: isMobile ? "10px" : "-50px",
              }}
            />

            <StyledButton
              onClick={handleAdd}
              bgColor={Colortheme.buttonBg}
              bgColorHover={Colortheme.buttonBgHover}
              style={{
                marginBottom: "20px",
                width: isMobile ? "80%" : "20%",
                marginTop: 29,
              }}
            >
              Add New
            </StyledButton>

            <DataGrid
              rows={filteredRows}
              columns={columns}
              pageSize={5}
              disableRowSelectionOnClick
              disableColumnFilter
              getRowId={(row) => row.nTaxID}
              rowSelectionModel={selectionModel}
              onRowSelectionModelChange={handleSelectionModelChange}
              sortModel={[
                {
                  field: "nTaxID",
                  sort: "asc",
                },
              ]}
              columnVisibilityModel={
                isMobile
                  ? {
                      dIntdate: false,
                      vName: false,
                      vBranchCode: false,
                      bActive: false,
                      nCREDITLIM: false,
                      nCREDITDAYS: false,
                    }
                  : { id: false }
              }
              onModelChange={(model) => {
                if (model.filterModel && model.filterModel.items.length > 0) {
                  setSearchKeyword(model.filterModel.items[0].value);
                } else {
                  setSearchKeyword("");
                }
              }}
              sx={{
                backgroundColor: Colortheme.background,
                p: isMobile ? "10px" : "20px",
                maxHeight: "50vh",
                width: isMobile ? "95vw" : "auto",
                maxWidth: isMobile ? "75vw" : "100%",
                border: "2px solid",
                borderColor: Colortheme.background,
                "& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnHeaderTitleContainer":
                  {
                    display: "none",
                  },
                "& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell": {
                  backgroundColor: Colortheme.background,
                  color: Colortheme.text,
                },
                "& .MuiDataGrid-root": {
                  color: Colortheme.text,
                },
                "& .MuiTablePagination-root": {
                  color: Colortheme.text,
                },
                "& .MuiSvgIcon-root": {
                  color: Colortheme.text,
                },
                "& .MuiDataGrid-toolbarContainer": {
                  color: Colortheme.text,
                },
                "& .MuiDataGrid-footerContainer": {
                  backgroundColor: Colortheme.background,
                },
                "& .MuiButtonBase-root": {
                  color: Colortheme.text,
                },
              }}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 5 },
                },
              }}
              pageSizeOptions={[5, 10]}
            />
          </Box>
        </AnimatePresence>
      ) : (
        <Box
          component={motion.div}
          overflow={isMobile ? "scroll" : "none"}
          initial={{ y: -5 }}
          animate={{ y: 0 }}
          exit={{ y: -50 }}
          sx={{
            width: "90vw",
            height: "70vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: Colortheme.background,
            p: 5,
            borderRadius: 10,
            overflowX: "hidden",
          }}
          maxWidth={isMobile ? "60vw" : "90%"}
        >
          <Box sx={{ alignSelf: "flex-start", mb: 2 }}>
            <StyledButton
              onClick={() => setShowForm(false)}
              style={{
                width: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <KeyboardBackspaceIcon style={{ fontSize: "30px" }} />
            </StyledButton>
          </Box>
          <Box marginTop={-10}>
            {editData ? (
              <h2 style={{ color: Colortheme.text }}>EDIT</h2>
            ) : (
              <h2 style={{ color: Colortheme.text }}>CREATE</h2>
            )}
          </Box>
          <TaxMasterForm
            initialData={editData}
            onSubmit={handleFormSubmit}
            onCancel={() => setShowForm(false)}
          />
        </Box>
      )}
      <CustomAlertModal />
    </MainContainerCompilation>
  );
};

export default TaxMaster;
