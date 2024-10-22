import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
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
import PartyProfileForm from "../../../components/global/FormConfig/Master/Party Profiles/PartyProfileForm";
import { useToast } from "../../../contexts/ToastContext";
import CustomAlertModal from "../../../components/CustomAlertModal";
import { useBaseUrl } from "../../../contexts/BaseUrl";

const IndexPartyProfiles = () => {
  const { vType } = useParams();
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

  const titleMapping = {
    CC: "Corporate Client Profile",
    AD: "Banks Profile (A.D)",
    FF: "FFMC Profile",
    RM: "RMC Profile",
    FR: "Franchisee Profile",
    EX: "Foreign Correspondants Profile",
    TA: "Agents Profile",
    MS: "Miscellaneous Supplier Profile",
    TC: "TC Issuer Profile",
    IN: "Insurance Profile",
    ME: "Marketing Executive Profile",
    BR: "Branch Profile",
    // Add other mappings as needed
  };

  // Get the title based on the vType parameter
  const title = titleMapping[vType] || "Default Profile Title";

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (vType) {
      axios
        .get(
          `${baseUrl}/pages/Master/PartyProfiles/PartyProfilesIndex?vType=${vType}`,
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        )
        .then((response) => {
          setRows(response.data.filter((row) => row.nCodesID));
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
    }
  }, [vType]);

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
    const rowid = row.nCodesID;
    console.log("Delete button clicked for ID:", row.nCodesID);
    showAlertDialog(`Delete the record : ${row.vCode} `, "", () =>
      DeleteFunc(rowid)
    );
  };

  const DeleteFunc = async (nCodesID) => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `${baseUrl}/pages/Master/PartyProfiles/PartyProfileDelete`,
        { nCodesID: nCodesID },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
      setRows((prev) => prev.filter((row) => row.nCodesID !== nCodesID));
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
    const token = localStorage.getItem("token");
    setLoading(true);
    if (editData) {
      axios
        .put(`${baseUrl}/pages/Master/PartyProfiles/PartyProfiles`, formData, {
          headers: {
            Authorization: "Bearer " + token,
          },
        })
        .then((response) => {
          setRows((prev) =>
            prev.map((row) =>
              row.nCodesID === editData.nCodesID ? response.data : row
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
      axios
        .post(`${baseUrl}/pages/Master/PartyProfiles/PartyProfiles`, formData, {
          headers: {
            Authorization: "Bearer " + token,
          },
        })
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
    {
      field: "dIntdate",
      headerName: "Intro Date",
      width: 110,
      valueFormatter: (params) => {
        if (!params.value) {
          return "";
        }
        return dayjs(params.value).format("DD/MM/YYYY");
      },
    },
    { field: "vCode", headerName: "Code", width: 120 },
    { field: "vName", headerName: "Name", width: 400 },
    { field: "vBranchCode", headerName: "Branch", width: 120 },
    {
      field: "bActive",
      headerName: "Status",
      width: 120,
      valueGetter: (params) => (params.row.bActive ? "Active" : "Inactive"),
    },
    { field: "nCREDITLIM", headerName: "Credit Limit", width: 120 },
    { field: "nCREDITDAYS", headerName: "Credit Days", width: 120 },
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
    .filter((row) => row.nCodesID) // Ensure each row has a nCodesID
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
    <MainContainerCompilation title={title}>
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
              Add New Profile
            </StyledButton>

            <DataGrid
              rows={filteredRows}
              columns={columns}
              pageSize={5}
              disableRowSelectionOnClick
              disableColumnFilter
              getRowId={(row) => row.nCodesID}
              rowSelectionModel={selectionModel}
              onRowSelectionModelChange={handleSelectionModelChange}
              sortModel={[
                {
                  field: "nCodesID",
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
          <PartyProfileForm
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

export default IndexPartyProfiles;
