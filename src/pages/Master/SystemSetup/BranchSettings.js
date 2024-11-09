import React, { useState, useEffect, useContext } from "react";
import MainContainerCompilation from "../../../components/global/MainContainerCompilation";
import axios from "axios";
import {
  Grid,
  Box,
  Paper,
  useMediaQuery,
  useTheme,
  Modal,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useToast } from "../../../contexts/ToastContext";
import { useBaseUrl } from "../../../contexts/BaseUrl";
import CustomTextField from "../../../components/global/CustomTextField";
import ThemeContext from "../../../contexts/ThemeContext";
import CustomDatePicker from "../../../components/global/CustomDatePicker";
import StyledButton from "../../../components/global/StyledButton";
import CustomCheckbox from "../../../components/global/CustomCheckbox";
import styled from "styled-components";
import CloseIcon from "@mui/icons-material/Close";
import * as MaterialIcons from "@mui/icons-material";

const BUTTONS = styled.button`
  border: none;
  color: ${({ theme }) => theme.text};
  background-color: ${({ theme }) => theme.secondaryBG};
  border-radius: 15px;
  width: 100%;
  height: 6vh;
  margin-bottom: 10px;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    opacity: 0.7;
    color: ${(props) => props.textColOnHover || props.theme.background};
    font-size: 15px;
    background-color: ${(props) => props.bgColorHover || props.theme.text};
    border-radius: 20px;
    box-shadow: 0px 1px 11px -3px rgba(255, 255, 255, 1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LeftBox = styled(Box)`
  max-height: 70vh;
  overflow-y: auto;
  padding: 10px;
  /* Custom Scrollbar Styles */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.text};
    border-radius: 8px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: ${({ theme }) => theme.text};
  }

  &::-webkit-scrollbar-track {
    background-color: ${({ theme }) => theme.secondaryBG};
  }
`;

const RightBox = styled(Box)`
  max-height: 70vh;
  overflow-y: auto;
  padding: 10px;
  /* Custom Scrollbar Styles */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.text};
    border-radius: 8px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: ${({ theme }) => theme.text};
  }

  &::-webkit-scrollbar-track {
    background-color: ${({ theme }) => theme.secondaryBG};
  }
`;

const BranchSettings = () => {
  const { Colortheme } = useContext(ThemeContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { showToast, hideToast } = useToast();
  const { baseUrl } = useBaseUrl();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [settingsData, setSettingsData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("TRANSACTIONS");
  const [filteredSettings, setFilteredSettings] = useState([]);
  const [formData, setFormData] = useState({});
  const [initialFormData, setInitialFormData] = useState({}); // To track original data
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

  // New state for search inputs
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [settingsSearchQuery, setSettingsSearchQuery] = useState("");

  const handleSettingsButtonClick = (category) => {
    setSelectedCategory(category);

    if (isMobile) {
      setIsModalOpen(true);
    }
    setSettingsSearchQuery("");
  };

  const handleCloseModal = () => setIsModalOpen(false);

  useEffect(() => {
    if (settingsData.length > 0) {
      const initialFormData = settingsData.reduce((acc, setting) => {
        acc[setting.DATACODE] = setting.DATAVALUE;
        return acc;
      }, {});
      setFormData(initialFormData);
      setInitialFormData(initialFormData); // Store the initial state
    }
  }, [settingsData]);

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const Branch = JSON.parse(localStorage.getItem("branch"));

    axios
      .post(
        `${baseUrl}/pages/Master/SystemSetup/advSettings`,
        {
          nBranchID: Branch.nBranchID,
        },
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      )
      .then((response) => {
        setSettingsData(response.data);
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

  // Filter categories by search
  const filteredCategories = Array.from(
    new Set(settingsData.map((item) => item.SETTINGCATEGORY))
  ).filter(
    (category) =>
      category &&
      category.toLowerCase().includes(categorySearchQuery.toLowerCase())
  );

  // Filter settings within selected category by search
  useEffect(() => {
    if (selectedCategory) {
      const filtered = settingsData.filter(
        (setting) =>
          setting.SETTINGCATEGORY === selectedCategory &&
          setting.DATADISPLAY.toLowerCase().includes(
            settingsSearchQuery.toLowerCase()
          )
      );
      setFilteredSettings(filtered);
    }
  }, [selectedCategory, settingsData, settingsSearchQuery]);

  const handleInputChange = (e, setting) => {
    const { name, checked, type } = e.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? (checked ? "Yes" : "No") : e.target.value,
    }));
  };

  const handleSubmit = () => {
    // Get changes only
    const updatedData = filteredSettings.reduce((acc, setting) => {
      const currentValue = formData[setting.DATACODE];
      const initialValue = initialFormData[setting.DATACODE];
      if (currentValue !== initialValue) {
        acc.push({
          DATACODE: setting.DATACODE,
          DATAVALUE: currentValue,
        });
      }
      return acc;
    }, []);

    // Only proceed if there are changes
    if (updatedData.length > 0) {
      const token = localStorage.getItem("token");
      const Branch = JSON.parse(localStorage.getItem("branch"));
      axios
        .post(
          `${baseUrl}/pages/Master/SystemSetup/advUpdate`,
          {
            nBranchID: Branch.nBranchID,
            settings: updatedData, // Send only the changed settings
          },
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        )
        .then(() => {
          showToast("Settings updated successfully!", "success");
          setTimeout(() => {
            hideToast();
          }, 2000);
          // Update initialFormData with the new values
          setInitialFormData((prevState) => ({
            ...prevState,
            ...formData,
          }));
        })
        .catch((error) => {
          showToast("Error updating settings", "error");
          setTimeout(() => {
            hideToast();
          }, 2000);
        });
    } else {
      showToast("No changes to save", "info");
      setTimeout(() => {
        hideToast();
      }, 2000);
    }
  };

  const columns = [
    { field: "DATADISPLAY", headerName: "Description", flex: 1 },
    {
      field: "DATAVALUE",
      headerName: "Value",
      flex: 1,
      renderCell: (params) => {
        const setting = params.row;
        // Determine checkbox state based on DATAVALUE
        const isChecked = formData[setting.DATACODE] === "Yes";
        return (
          <>
            {setting.DATATYPE === "B" && (
              <CustomCheckbox
                name={setting.DATACODE}
                checked={isChecked}
                onChange={(e) => handleInputChange(e, setting)}
                label={isChecked ? "Yes" : "No"}
              />
            )}
            {setting.DATATYPE === "V" && (
              <CustomTextField
                name={setting.DATACODE}
                variant="outlined"
                fullWidth
                value={formData[setting.DATACODE] || ""}
                onChange={(e) => handleInputChange(e, setting)}
              />
            )}
            {setting.DATATYPE === "N" && (
              <CustomTextField
                name={setting.DATACODE}
                variant="outlined"
                fullWidth
                value={formData[setting.DATACODE] || ""}
                onChange={(e) => handleInputChange(e, setting)}
                type="number"
              />
            )}
            {setting.DATATYPE === "D" && (
              <CustomDatePicker
                name={setting.DATACODE}
                label={setting.DATACODE}
                value={formData[setting.DATACODE] || null} // Set a default value or null for DatePicker
                onChange={(date) =>
                  setFormData((prevState) => ({
                    ...prevState,
                    [setting.DATACODE]: date,
                  }))
                }
              />
            )}
          </>
        );
      },
    },
  ];

  return (
    <MainContainerCompilation
      title={"Branch Advanced Settings"}
      loading={loading}
    >
      <Grid
        container
        spacing={isMobile ? 0 : 2}
        width={isMobile ? "95%" : "80%"}
        maxHeight={"80vh"}
        sx={{
          backgroundColor: Colortheme.background,
          p: 2,
          borderRadius: 5,
        }}
      >
        <Grid item xs={12} sm={3}>
          <LeftBox>
            <CustomTextField
              placeholder="Search Categories..."
              value={categorySearchQuery}
              onChange={(e) => setCategorySearchQuery(e.target.value)}
              fullWidth
              // sx={{ marginBottom: 2 }}
              style={{ width: "100%", marginBottom: 20 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MaterialIcons.Search
                      sx={{
                        width: 25,
                        height: 25,
                        color: "#141619",
                      }}
                    />
                  </InputAdornment>
                ),
              }}
            />
            {/* {Array.from(
              new Set(
                settingsData.map(
                  (item) =>
                    item.SETTINGCATEGORY !== null && item.SETTINGCATEGORY
                )
              )
            ) */}
            {filteredCategories.map((category, index) => (
              <BUTTONS
                id={index}
                key={index}
                onClick={() => handleSettingsButtonClick(category)}
              >
                {category}
              </BUTTONS>
            ))}
          </LeftBox>
        </Grid>

        {isMobile ? (
          <>
            <Modal
              open={isModalOpen}
              onClose={handleCloseModal}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Paper
                sx={{
                  width: "75vw",
                  height: "75vh",
                  backgroundColor: Colortheme.background,
                  overflow: "auto",
                  p: 2,
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <IconButton
                  onClick={handleCloseModal}
                  sx={{ position: "absolute", top: 8, right: 8 }}
                >
                  <CloseIcon sx={{ color: Colortheme.text }} />
                </IconButton>
                <Typography
                  variant="h6"
                  color={Colortheme.text}
                  align="center"
                  fontFamily={"Poppins"}
                >
                  {selectedCategory}
                </Typography>

                <CustomTextField
                  placeholder="Search Settings..."
                  value={settingsSearchQuery}
                  onChange={(e) => setSettingsSearchQuery(e.target.value)}
                  fullWidth
                  style={{ width: "100%", marginTop: 20 }}
                  // sx={{ marginBottom: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MaterialIcons.Search
                          sx={{
                            width: 25,
                            height: 25,
                            color: "#141619",
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
                <DataGrid
                  rows={filteredSettings}
                  columns={columns}
                  getRowId={(row) => row.ID}
                  checkboxSelection={false}
                  disableSelectionOnClick
                  rowHeight={70}
                  // hideFooterSelectedRowCount={true}
                  sx={{
                    backgroundColor: Colortheme.background,
                    p: isMobile ? "10px" : "20px",
                    maxHeight: "70vh",
                    width: isMobile ? "95vw" : "auto",
                    maxWidth: isMobile ? "75vw" : "100%",
                    borderRadius: 0,

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
                    // Custom Scrollbar Styling
                    "& .MuiDataGrid-virtualScroller::-webkit-scrollbar": {
                      width: "8px",
                      height: "8px",
                    },
                    "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb": {
                      backgroundColor: Colortheme.text,
                      borderRadius: "8px",
                    },
                    "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-track": {
                      backgroundColor: Colortheme.secondaryBG,
                    },
                  }}
                  autoPageSize
                  // pagination
                  // pageSizeOptions={[5, 10, 20]}
                />
                {filteredSettings.length > 0 && (
                  <Box
                    width={"100%"}
                    display={"flex"}
                    justifyContent={"center"}
                    mt={2}
                  >
                    <StyledButton
                      onClick={handleSubmit}
                      style={{ width: "100%" }}
                    >
                      Save Settings
                    </StyledButton>
                  </Box>
                )}
              </Paper>
              {/* <Box display="flex" justifyContent="center" mt={2}>
                <StyledButton onClick={handleSubmit}>
                  Save Settings
                </StyledButton>
              </Box> */}
            </Modal>
          </>
        ) : (
          <Grid item xs={12} sm={9}>
            <RightBox>
              <Box
                display={"flex"}
                justifyContent={"center"}
                height={40}
                alignItems={"center"}
                marginTop={"-15px"}
                sx={{ backgroundColor: Colortheme.background }}
              >
                <h3 style={{ color: Colortheme.text, fontSize: 18 }}>
                  {selectedCategory}
                </h3>
              </Box>
              {/* Search bar for filtering settings */}
              <CustomTextField
                placeholder="Search Settings..."
                value={settingsSearchQuery}
                onChange={(e) => setSettingsSearchQuery(e.target.value)}
                fullWidth
                style={{ width: "100%", marginTop: 20 }}
                // sx={{ marginBottom: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MaterialIcons.Search
                        sx={{
                          width: 25,
                          height: 25,
                          color: "#141619",
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
              <Paper sx={{ height: "90%", width: "100%", boxShadow: "none" }}>
                <DataGrid
                  rows={filteredSettings}
                  columns={columns}
                  getRowId={(row) => row.ID}
                  checkboxSelection={false}
                  disableSelectionOnClick
                  rowHeight={70}
                  hideFooterSelectedRowCount={true}
                  sx={{
                    backgroundColor: Colortheme.background,
                    p: isMobile ? "10px" : "20px",
                    maxHeight: "50vh",
                    width: isMobile ? "95vw" : "auto",
                    maxWidth: isMobile ? "75vw" : "100%",
                    borderRadius: 0,

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
                    // Custom Scrollbar Styling
                    "& .MuiDataGrid-virtualScroller::-webkit-scrollbar": {
                      width: "8px",
                      height: "8px",
                    },
                    "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb": {
                      backgroundColor: Colortheme.text,
                      borderRadius: "8px",
                    },
                    "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-track": {
                      backgroundColor: Colortheme.secondaryBG,
                    },
                  }}
                  pageSize={10}
                />
              </Paper>
              <Box display="flex" justifyContent="center">
                <StyledButton onClick={handleSubmit}>
                  Save Settings
                </StyledButton>
              </Box>
            </RightBox>
          </Grid>
        )}
      </Grid>
    </MainContainerCompilation>
  );
};

export default BranchSettings;
