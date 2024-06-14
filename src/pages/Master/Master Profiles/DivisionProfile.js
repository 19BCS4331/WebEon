import React, { useState, useEffect, useContext } from "react";
import { Box, MenuItem, useMediaQuery, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import CustomAutocomplete from "../../../components/global/CustomAutocomplete";
import CustomTextField from "../../../components/global/CustomTextField";
import CustomCheckbox from "../../../components/global/CustomCheckbox";
import StyledButton from "../../../components/global/StyledButton";
import ThemeContext from "../../../contexts/ThemeContext";
import MainContainerCompilation from "../../../components/global/MainContainerCompilation";
import { formConfigs } from "../../../components/global/FormConfig/Master/Master Profiles/formConfig";
import { AuthContext } from "../../../contexts/AuthContext";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { useToast } from "../../../contexts/ToastContext";
import { MutatingDots } from "react-loader-spinner";
import { AnimatePresence, motion } from "framer-motion";

const DivisionProfile = () => {
  const { token } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { Colortheme } = useContext(ThemeContext);
  const { showToast, hideToast } = useToast();
  const formConfig = formConfigs.divisionProfileForm;

  const [formData, setFormData] = useState({});
  const [disabledFields, setDisabledFields] = useState({});
  const [rows, setRows] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectionModel, setSelectionModel] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({});

  useEffect(() => {
    const initialFormData = {};
    const initialDisabledFields = {};
    formConfig.fields.forEach((field) => {
      initialFormData[field.name] = "";
      if (field.disabled) initialDisabledFields[field.name] = true;
    });
    setFormData(initialFormData);
    setDisabledFields(initialDisabledFields);

    formConfig.fields.forEach((field) => {
      if (!field.dependent && field.type === "autocomplete") {
        fetchOptions(field);
      }
    });
  }, [formConfig]);

  const fetchOptions = async (field, value) => {
    try {
      const url = field.fetchOptions;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorMessage = `Error ${response.status}: ${response.statusText}`;
        console.error(errorMessage);
        showToast(errorMessage, "fail");
        setTimeout(() => {
          hideToast();
        }, 2000);
        return;
      }

      const result = await response.json();
      setOptions((prevOptions) => ({
        ...prevOptions,
        [field.name]: result,
      }));
    } catch (error) {
      console.error("Error fetching options:", error);
      const errorMessage = error.response?.status
        ? `Error ${error.response.status}: ${error.response.statusText}`
        : "Network error or server unreachable";
      showToast(errorMessage, "fail");
      setTimeout(() => {
        hideToast();
      }, 2000);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field.name]: value,
    }));

    // Handle dependencies
    formConfig.fields.forEach((f) => {
      if (f.dependencies && f.dependencies.includes(field.name)) {
        setDisabledFields((prev) => ({
          ...prev,
          [f.name]: !value,
        }));
      }
    });

    // Fetch options for dependent fields
    formConfig.fields.forEach((f) => {
      if (f.dependsOn === field.name) {
        fetchOptions(f, value);
      }
    });
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(formConfig.endpoint, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      setRows(result.filter((row) => row.nDivisionID));
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast("Error Occurred!", "fail");
      setTimeout(() => {
        hideToast();
      }, 2000);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    const method = formData.nDivisionID ? "PUT" : "POST";
    const endpoint = formConfig.endpoint;

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        console.log(result.message);
        // Refresh data grid or perform other actions
        if (!formData.nDivisionID) {
          setRows((prevRows) => [...prevRows, result]);
        } else {
          setRows((prevRows) =>
            prevRows.map((row) =>
              row.nDivisionID === result.nDivisionID ? result : row
            )
          );
        }

        setIsFormVisible(false);
        fetchData();
        setFormData({});
        setIsLoading(false);
        method === "PUT"
          ? showToast("Data Edited Successfully!", "success")
          : showToast("Data Inserted Successfully!", "success");
        setTimeout(() => {
          hideToast();
        }, 2000);
      } else {
        console.error(result.error);
        showToast("Error Occurred!", "fail");
        setTimeout(() => {
          hideToast();
        }, 2000);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("Error Occurred!", "fail");
      setTimeout(() => {
        hideToast();
      }, 2000);
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(formConfig.endpoint, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();

      // Filter out any invalid rows (rows that don't have a nDivisionID)
      const validRows = result.filter((row) => row.nDivisionID);

      setRows(validRows);
      setIsFormVisible(false);
      setIsLoading(false);
    } catch (error) {
      console.error("Error:", error);
      showToast("Error Occurred!", "fail");
      setTimeout(() => {
        hideToast();
      }, 2000);
      setIsLoading(false);
    }
  };

  const columns = [
    { field: "vDivCode", headerName: "Division Code", width: 150 },
    { field: "vDivName", headerName: "Division Name", width: 200 },
    { field: "vBranchCode", headerName: "Controlling Branch", width: 150 },

    // Add other columns as needed
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
            onClick={() => handleDelete(params.row.nDivisionID)}
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

  const handleEdit = (row) => {
    setFormData(row);
    setIsFormVisible(true);
    setSearchKeyword("");
  };

  const handleDelete = async (nDivisionID) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${formConfig.endpoint}/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nDivisionID }),
      });
      const result = await response.json();
      if (response.ok) {
        console.log(result.message);
        setRows((prevRows) =>
          prevRows.filter((row) => row.nDivisionID !== nDivisionID)
        );
        setSearchKeyword("");
        setIsLoading(false);
        showToast("Data Deleted Successfully!", "success");
        setTimeout(() => {
          hideToast();
        }, 2000);
      } else {
        console.error(result.error);
        setIsLoading(false);
        showToast("Error Occurred!", "fail");
        setTimeout(() => {
          hideToast();
        }, 2000);
      }
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
      showToast("Error Occurred!", "fail");
      setTimeout(() => {
        hideToast();
      }, 2000);
    }
  };

  const handleSelectionModelChange = (newSelection) => {
    setSelectionModel(newSelection);
  };

  const handleSearchChange = (event) => {
    setSearchKeyword(event.target.value);
  };

  const filteredRows = rows
    .filter((row) => row.nDivisionID) // Ensure each row has a nDivisionID
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

  const handleBack = () => {
    setIsFormVisible(true);
    setSearchKeyword("");
  };

  const handleBackOnForm = () => {
    setSearchKeyword("");
    setFormData({});
    setIsFormVisible(false);
    // setTimeout(() => {
    //   setIsFormVisible(true);
    // }, 50);
  };

  return (
    <MainContainerCompilation title="Division Profile">
      <Box>
        {isLoading ? (
          <MutatingDots
            visible={true}
            height="100"
            width="100"
            color={Colortheme.text}
            secondaryColor={Colortheme.text}
            radius="12.5"
            ariaLabel="mutating-dots-loading"
          />
        ) : (
          <>
            <Box display={"flex"} alignItems={"center"}>
              {formData.nDivisionID && isFormVisible && (
                <StyledButton
                  onClick={handleBackOnForm}
                  style={{
                    width: 100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <KeyboardBackspaceIcon style={{ fontSize: "30px" }} />
                </StyledButton>
              )}
              {formData.nDivisionID && isFormVisible && (
                <h1 style={{ color: Colortheme.text, marginLeft: "35%" }}>
                  Edit : {formData.vDivCode}
                </h1>
              )}
              {!formData.nDivisionID && isFormVisible && (
                <h1 style={{ color: Colortheme.text, marginLeft: "45%" }}>
                  Create
                </h1>
              )}
            </Box>

            {isFormVisible ? (
              <AnimatePresence>
                <Box
                  component={motion.div}
                  initial={{ x: 50 }}
                  animate={{ x: 0 }}
                >
                  <Box
                    component="form"
                    onSubmit={handleSubmit}
                    display={"grid"}
                    overflow={isMobile ? "scroll" : "none"}
                    sx={{
                      overflowX: "hidden",
                      backgroundColor: Colortheme.background,
                    }}
                    gridTemplateColumns={
                      isMobile ? "repeat(1, 1fr)" : "repeat(4, 1fr)"
                    }
                    gridTemplateRows={"repeat(3, 1fr)"}
                    columnGap={"60px"}
                    rowGap={"40px"}
                    p={10}
                    borderRadius={5}
                  >
                    {formConfig.fields.map((field) => (
                      <div key={field.name}>
                        {field.type === "text" ? (
                          <CustomTextField
                            label={field.label}
                            name={field.name}
                            value={formData[field.name]}
                            onChange={(e) =>
                              handleChange(field, e.target.value)
                            }
                            required={field.required}
                            disabled={disabledFields[field.name]}
                          />
                        ) : field.type === "autocomplete" ? (
                          <CustomAutocomplete
                            options={options[field.name] || []}
                            label={field.label}
                            name={field.name}
                            value={formData[field.name]}
                            onChange={(e, newValue) =>
                              handleChange(field, newValue)
                            }
                            required={field.required}
                            disabled={disabledFields[field.name]}
                          />
                        ) : field.type === "checkbox" ? (
                          <CustomCheckbox
                            name={field.name}
                            label={field.label}
                            checked={formData[field.name]}
                            onChange={(e) =>
                              handleChange(field, e.target.checked)
                            }
                            disabled={disabledFields[field.name]}
                          />
                        ) : field.type === "button" ? (
                          <StyledButton
                            onClick={field.onClick}
                            bgColor={Colortheme.buttonBg}
                            bgColorHover={Colortheme.buttonBgHover}
                          >
                            {field.label}
                          </StyledButton>
                        ) : field.type === "select" ? (
                          <CustomTextField
                            label={field.label}
                            select
                            name={field.name}
                            value={formData[field.name]}
                            onChange={(e) =>
                              handleChange(field, e.target.value)
                            }
                            required={field.required}
                            disabled={disabledFields[field.name]}
                          >
                            {field.options &&
                              field.options.map((option) => (
                                <MenuItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </MenuItem>
                              ))}
                          </CustomTextField>
                        ) : null}
                      </div>
                    ))}
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <StyledButton
                        type="submit"
                        bgColor={Colortheme.buttonBg}
                        bgColorHover={Colortheme.buttonBgHover}
                      >
                        {formData.nDivisionID ? "Save" : "Create"}
                      </StyledButton>
                      <StyledButton
                        type="button"
                        onClick={handleSearch}
                        bgColor={Colortheme.buttonBg}
                        bgColorHover={Colortheme.buttonBgHover}
                      >
                        Search
                      </StyledButton>
                    </Box>
                  </Box>
                </Box>
              </AnimatePresence>
            ) : (
              <Box
                component={motion.div}
                initial={{ x: -50 }}
                animate={{ x: 0 }}
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  backgroundColor: Colortheme.background,
                  p: 5,
                  borderRadius: 10,
                }}
              >
                <Box sx={{ alignSelf: "flex-start", mb: 2 }}>
                  <StyledButton
                    onClick={handleBack}
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
                <CustomTextField
                  variant="outlined"
                  placeholder="Search..."
                  value={searchKeyword}
                  onChange={handleSearchChange}
                  style={{ marginBottom: "20px", width: "50%" }}
                />
                <DataGrid
                  rows={filteredRows}
                  columns={columns}
                  pageSize={5}
                  disableRowSelectionOnClick
                  disableColumnFilter
                  getRowId={(row) => row.nDivisionID}
                  rowSelectionModel={selectionModel}
                  onRowSelectionModelChange={handleSelectionModelChange}
                  sortModel={[
                    {
                      field: "nDivisionID",
                      sort: "asc",
                    },
                  ]}
                  columnVisibilityModel={
                    isMobile ? { id: false } : { id: false }
                  }
                  onModelChange={(model) => {
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
                    backgroundColor: Colortheme.background,
                    p: isMobile ? "10px" : "20px",
                    maxHeight: "60vh",
                    width: isMobile ? "70vw" : "50vw",
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
            )}
          </>
        )}
      </Box>
    </MainContainerCompilation>
  );
};

export default DivisionProfile;
