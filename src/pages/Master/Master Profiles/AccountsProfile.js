// import React, { useContext, useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import axios from "axios";
// import MainContainerCompilation from "../../../components/global/MainContainerCompilation";
// import { Box, Tooltip, useMediaQuery, useTheme } from "@mui/material";
// import { AnimatePresence, motion } from "framer-motion";
// import ThemeContext from "../../../contexts/ThemeContext";
// import StyledButton from "../../../components/global/StyledButton";
// import CustomTextField from "../../../components/global/CustomTextField";
// import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
// import { DataGrid } from "@mui/x-data-grid";
// import LazyFallBack from "../../LazyFallBack";
// import dayjs from "dayjs";
// import PartyProfileForm from "../../../components/global/FormConfig/Master/Party Profiles/PartyProfileForm";
// import { useToast } from "../../../contexts/ToastContext";
// import CustomAlertModal from "../../../components/CustomAlertModal";
// import { useBaseUrl } from "../../../contexts/BaseUrl";
// import AccountsProfileForm from "../../../components/global/FormConfig/Master/Master Profiles/AccountsProfileForm";

// const AccountsProfile = () => {
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const { Colortheme } = useContext(ThemeContext);
//   const [searchKeyword, setSearchKeyword] = useState("");
//   const [selectionModel, setSelectionModel] = useState([]);
//   const [rows, setRows] = useState([]);
//   const [rowid, SetRowid] = useState(null);
//   const [showForm, setShowForm] = useState(false);
//   const [editData, setEditData] = useState(null);
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
//   const { showAlertDialog, hideAlertDialog, showToast, hideToast } = useToast();
//   const navigate = useNavigate();
//   const { baseUrl } = useBaseUrl();

//   // Get the title based on the vType parameter
//   const title = "Accounts Profile";

//   useEffect(() => {
//     setLoading(true);
//     const token = localStorage.getItem("token");
//     axios
//       .get(`${baseUrl}/pages/Master/MasterProfiles/accountsProfile`, {
//         headers: {
//           Authorization: "Bearer " + token,
//         },
//       })
//       .then((response) => {
//         setRows(response.data.filter((row) => row.nAccID));
//         setLoading(false);
//       })
//       .catch((error) => {
//         setError(error);
//         setLoading(false);
//         showToast("Error fetching data", "error");
//         setTimeout(() => {
//           hideToast();
//         }, 2000);
//       });
//   }, []);

//   const handleSelectionModelChange = (newSelection) => {
//     setSelectionModel(newSelection);
//   };

//   const handleSearchChange = (event) => {
//     setSearchKeyword(event.target.value);
//   };

//   const handleAdd = () => {
//     setEditData(null);
//     setShowForm(true);
//   };

//   const handleEdit = (row) => {
//     setEditData(row);
//     setShowForm(true);
//   };

//   const handleDeleteClick = (row) => {
//     const rowid = row.nAccID;
//     console.log("Delete button clicked for ID:", row.nAccID);
//     showAlertDialog(`Delete the record : ${row.vCode} `, "", () =>
//       DeleteFunc(rowid)
//     );
//   };

//   const DeleteFunc = async (nAccID) => {
//     setLoading(true);
//     const token = localStorage.getItem("token");
//     try {
//       const response = await axios.post(
//         `${baseUrl}/pages/Master/MasterProfiles/accountsProfile/delete`,
//         { nAccID: nAccID },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       console.log(response.data);
//       setRows((prev) => prev.filter((row) => row.nAccID !== nAccID));
//       setLoading(false);
//       showToast("Successfully Deleted!", "success");
//       setTimeout(() => {
//         hideToast();
//       }, 2000);
//       hideAlertDialog();
//       setSearchKeyword("");
//     } catch (error) {
//       console.log(error);
//       setLoading(false);
//       hideAlertDialog();
//       showToast("Error deleting data", "error");
//       setTimeout(() => {
//         hideToast();
//       }, 2000);
//     }
//   };

//   const handleFormSubmit = (formData) => {
//     const token = localStorage.getItem("token");
//     setLoading(true);
//     if (editData) {
//       axios
//         .put(
//           `${baseUrl}/pages/Master/MasterProfiles/accountsProfile`,
//           formData,
//           {
//             headers: {
//               Authorization: "Bearer " + token,
//             },
//           }
//         )
//         .then((response) => {
//           setRows((prev) =>
//             prev.map((row) =>
//               row.nAccID === editData.nAccID ? response.data : row
//             )
//           );
//           setShowForm(false);
//           showToast("Successfully Edited!", "success");
//           setTimeout(() => {
//             hideToast();
//           }, 2000);
//           setSearchKeyword("");
//           setLoading(false);
//         })
//         .catch((error) => {
//           setLoading(false);
//           setError(error);
//           showToast("Error Editing data", "error");
//           setTimeout(() => {
//             hideToast();
//           }, 2000);
//         });
//     } else {
//       axios
//         .post(
//           `${baseUrl}/pages/Master/MasterProfiles/accountsProfile`,
//           formData,
//           {
//             headers: {
//               Authorization: "Bearer " + token,
//             },
//           }
//         )
//         .then((response) => {
//           setRows((prev) => [...prev, response.data]);
//           setShowForm(false);
//           showToast("Successfully Inserted!", "success");
//           setTimeout(() => {
//             hideToast();
//           }, 2000);
//           setSearchKeyword("");
//           setLoading(false);
//         })
//         .catch((error) => {
//           setLoading(false);
//           setError(error);
//           showToast("Error Inserting data", "error");
//           setTimeout(() => {
//             hideToast();
//           }, 2000);
//         });
//     }
//   };

//   if (loading) {
//     return <LazyFallBack />;
//   }

//   const columns = [
//     { field: "vCode", headerName: "Code", width: 120 },
//     { field: "vName", headerName: "Name", width: 400 },
//     {
//       field: "bActive",
//       headerName: "Status",
//       width: 120,
//       valueGetter: (params) => (params.row.bActive ? "Active" : "Inactive"),
//     },
//     {
//       field: "actions",
//       headerName: "Actions",
//       width: 200,
//       renderCell: (params) => (
//         <Box display={"flex"} gap={2}>
//           <StyledButton
//             onClick={() => handleEdit(params.row)}
//             bgColor={Colortheme.buttonBg}
//             bgColorHover={Colortheme.buttonBgHover}
//             style={{ width: 80, height: 30 }}
//           >
//             Edit
//           </StyledButton>
//           <StyledButton
//             onClick={() => handleDeleteClick(params.row)}
//             bgColor={Colortheme.buttonBg}
//             bgColorHover={"red"}
//             textColOnHover={"white"}
//             style={{ width: 80, height: 30 }}
//           >
//             Delete
//           </StyledButton>
//         </Box>
//       ),
//     },
//   ];

//   const filteredRows = rows
//     .filter((row) => row.nAccID) // Ensure each row has a nAccID
//     .map((row) => {
//       // Add any additional transformations needed for your data
//       return row;
//     })
//     .filter((row) => {
//       if (searchKeyword === "") {
//         return true;
//       }

//       const lowerSearchKeyword = searchKeyword.toLowerCase();
//       for (const column of columns) {
//         const cellValue = row[column.field]
//           ? row[column.field].toString().toLowerCase()
//           : "";
//         if (cellValue.includes(lowerSearchKeyword)) {
//           return true;
//         }
//       }

//       return false;
//     });

//   return (
//     <MainContainerCompilation title={title}>
//       {!showForm ? (
//         <AnimatePresence>
//           <Box
//             component={motion.div}
//             initial={{ x: -50 }}
//             animate={{ x: 0 }}
//             exit={{ x: -50 }}
//             sx={{
//               width: "60%",
//               height: "80%",
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               backgroundColor: Colortheme.background,
//               p: 5,
//               borderRadius: 10,
//             }}
//             maxWidth={isMobile ? "60vw" : "90%"}
//           >
//             <Tooltip title="Go To Dashboard">
//               <Box sx={{ alignSelf: "flex-start", mb: 2 }}>
//                 <StyledButton
//                   onClick={() => navigate("/Dashboard")}
//                   style={{
//                     width: 100,
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                   }}
//                 >
//                   <KeyboardBackspaceIcon style={{ fontSize: "30px" }} />
//                 </StyledButton>
//               </Box>
//             </Tooltip>

//             <CustomTextField
//               variant="outlined"
//               placeholder="Search..."
//               value={searchKeyword}
//               onChange={handleSearchChange}
//               style={{
//                 width: isMobile ? "80%" : "50%",
//                 marginTop: isMobile ? "10px" : "-50px",
//               }}
//             />

//             <StyledButton
//               onClick={handleAdd}
//               bgColor={Colortheme.buttonBg}
//               bgColorHover={Colortheme.buttonBgHover}
//               style={{
//                 marginBottom: "20px",
//                 width: isMobile ? "80%" : "20%",
//                 marginTop: 29,
//               }}
//             >
//               Add New Profile
//             </StyledButton>

//             <DataGrid
//               rows={filteredRows}
//               columns={columns}
//               pageSize={5}
//               disableRowSelectionOnClick
//               disableColumnFilter
//               getRowId={(row) => row.nAccID}
//               rowSelectionModel={selectionModel}
//               onRowSelectionModelChange={handleSelectionModelChange}
//               sortModel={[
//                 {
//                   field: "nAccID",
//                   sort: "asc",
//                 },
//               ]}
//               columnVisibilityModel={
//                 isMobile
//                   ? {
//                       dIntdate: false,
//                       vName: false,
//                       vBranchCode: false,
//                       bActive: false,
//                       nCREDITLIM: false,
//                       nCREDITDAYS: false,
//                     }
//                   : { id: false }
//               }
//               onModelChange={(model) => {
//                 if (model.filterModel && model.filterModel.items.length > 0) {
//                   setSearchKeyword(model.filterModel.items[0].value);
//                 } else {
//                   setSearchKeyword("");
//                 }
//               }}
//               sx={{
//                 backgroundColor: Colortheme.background,
//                 p: isMobile ? "10px" : "20px",
//                 maxHeight: "50vh",
//                 width: isMobile ? "95vw" : "auto",
//                 maxWidth: isMobile ? "75vw" : "100%",
//                 border: "2px solid",
//                 borderColor: Colortheme.background,
//                 "& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnHeaderTitleContainer":
//                   {
//                     display: "none",
//                   },
//                 "& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell": {
//                   backgroundColor: Colortheme.background,
//                   color: Colortheme.text,
//                 },
//                 "& .MuiDataGrid-root": {
//                   color: Colortheme.text,
//                 },
//                 "& .MuiTablePagination-root": {
//                   color: Colortheme.text,
//                 },
//                 "& .MuiSvgIcon-root": {
//                   color: Colortheme.text,
//                 },
//                 "& .MuiDataGrid-toolbarContainer": {
//                   color: Colortheme.text,
//                 },
//                 "& .MuiDataGrid-footerContainer": {
//                   backgroundColor: Colortheme.background,
//                 },
//                 "& .MuiButtonBase-root": {
//                   color: Colortheme.text,
//                 },
//               }}
//               initialState={{
//                 pagination: {
//                   paginationModel: { page: 0, pageSize: 5 },
//                 },
//               }}
//               pageSizeOptions={[5, 10]}
//             />
//           </Box>
//         </AnimatePresence>
//       ) : (
//         <Box
//           component={motion.div}
//           overflow={isMobile ? "scroll" : "none"}
//           initial={{ y: -5 }}
//           animate={{ y: 0 }}
//           exit={{ y: -50 }}
//           sx={{
//             width: "90vw",
//             height: "70vh",
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             backgroundColor: Colortheme.background,
//             p: 5,
//             borderRadius: 10,
//             overflowX: "hidden",
//           }}
//           maxWidth={isMobile ? "60vw" : "90%"}
//         >
//           <Box sx={{ alignSelf: "flex-start", mb: 2 }}>
//             <StyledButton
//               onClick={() => setShowForm(false)}
//               style={{
//                 width: 100,
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//               }}
//             >
//               <KeyboardBackspaceIcon style={{ fontSize: "30px" }} />
//             </StyledButton>
//           </Box>
//           <Box marginTop={-10}>
//             {editData ? (
//               <h2 style={{ color: Colortheme.text }}>EDIT</h2>
//             ) : (
//               <h2 style={{ color: Colortheme.text }}>CREATE</h2>
//             )}
//           </Box>
//           <AccountsProfileForm
//             initialData={editData}
//             onSubmit={handleFormSubmit}
//             onCancel={() => setShowForm(false)}
//           />
//         </Box>
//       )}
//       <CustomAlertModal />
//     </MainContainerCompilation>
//   );
// };

// export default AccountsProfile;

import React from "react";
import MainContainerCompilation from "../../../components/global/MainContainerCompilation";
import { formConfigs } from "../../../components/global/FormConfig/Master/Master Profiles/formConfig";
import MainFormComponent from "../../../components/global/Form/MainFormComponent";

const AccountsProfile = () => {
  const formConfig = formConfigs.accountsProfileForm;

  return (
    <MainContainerCompilation title="Accounts Profile">
      <MainFormComponent
        formConfig={formConfig}
        formDataID={"nAccID"}
        editFieldTitle={"vCode"}
      />
    </MainContainerCompilation>
  );
};

export default AccountsProfile;
