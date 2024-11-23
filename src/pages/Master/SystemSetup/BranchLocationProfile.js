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
import { useToast } from "../../../contexts/ToastContext";
import CustomAlertModal from "../../../components/CustomAlertModal";
import { useBaseUrl } from "../../../contexts/BaseUrl";
import BranchLocationForm from "../../../components/global/FormConfig/Master/SystemSetup/BranchLocationForm";
import { apiClient } from "../../../services/apiClient";
import CustomDataGrid from "../../../components/global/CustomDataGrid";

const BranchLocationProfile = () => {
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

  const title = "Branch Profile";

  useEffect(() => {
    setLoading(true);
    apiClient
      .get(`/pages/Master/SystemSetup/branchProfile`)
      .then((response) => {
        setRows(response.data.filter((row) => row.nBranchID));
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
    const rowid = row.nBranchID;
    console.log("Delete button clicked for ID:", row.nBranchID);
    showAlertDialog(`Delete the record : ${row.vBranchCode} `, "", () =>
      DeleteFunc(rowid)
    );
  };

  const DeleteFunc = async (nBranchID) => {
    setLoading(true);
    try {
      const response = await apiClient.post(
        `/pages/Master/SystemSetup/branchProfileDelete`,
        { nBranchID: nBranchID }
      );
      console.log(response.data);
      setRows((prev) => prev.filter((row) => row.nBranchID !== nBranchID));
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
      apiClient
        .put(`/pages/Master/SystemSetup/branchProfile`, formData)
        .then((response) => {
          setRows((prev) =>
            prev.map((row) =>
              row.nBranchID === editData.nBranchID ? response.data : row
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
        .post(`/pages/Master/SystemSetup/branchProfile`, formData)
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
    { field: "vBranchCode", headerName: "Branch Code", width: 120 },
    { field: "vLocation", headerName: "Location", width: 300 },
    {
      field: "bActive",
      headerName: "Status",
      width: 120,
      valueGetter: (params) => (params.row.bActive ? "Active" : "Inactive"),
    },
    { field: "nCashLimit", headerName: "Cash Limit", width: 120 },

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
    .filter((row) => row.nBranchID) // Ensure each row has a nBranchID
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
              width: "70%",
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

            <CustomDataGrid
              rows={filteredRows}
              columns={columns}
              selectionModel={selectionModel}
              getRowId={(row) => row.nBranchID}
              sortModel={[
                {
                  field: "nBranchID",
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
              onSelectionModelChange={handleSelectionModelChange}
              searchKeyword={searchKeyword}
              setSearchKeyword={setSearchKeyword}
              Colortheme={Colortheme}
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
            // width: "85%",
            // height: "85%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: Colortheme.background,
            p: 5,
            borderRadius: 10,
            overflowX: "hidden",
            "&::-webkit-scrollbar": {
              width: "8px",
              height: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: Colortheme.text,
              borderRadius: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: Colortheme.secondaryBG,
            },
          }}
          maxWidth={isMobile ? "60vw" : "90%"}
        >
          <Box sx={{ alignSelf: "flex-start", mb: 2 }}>
            <StyledButton
              onClick={() => setShowForm(false)}
              style={{
                width: isMobile ? 80 : 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <KeyboardBackspaceIcon style={{ fontSize: "30px" }} />
            </StyledButton>
          </Box>

          <Box marginTop={isMobile ? -5 : -10}>
            {editData ? (
              <h2 style={{ color: Colortheme.text }}>EDIT</h2>
            ) : (
              <h2 style={{ color: Colortheme.text }}>CREATE</h2>
            )}
          </Box>
          <BranchLocationForm
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

export default BranchLocationProfile;
