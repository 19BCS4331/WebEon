import React, { useState, useEffect, useContext } from "react";
import { Box, MenuItem, useMediaQuery, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import CustomAutocomplete from "../CustomAutocomplete";
import CustomTextField from "../CustomTextField";
import CustomCheckbox from "../CustomCheckbox";
import StyledButton from "../StyledButton";
import ThemeContext from "../../../contexts/ThemeContext";
import { AuthContext } from "../../../contexts/AuthContext";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { useToast } from "../../../contexts/ToastContext";
import { MutatingDots } from "react-loader-spinner";
import { AnimatePresence, motion } from "framer-motion";
import { Home } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const MainFormComponent = ({ formConfig, formDataID, editFieldTitle }) => {
  const { token } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { Colortheme } = useContext(ThemeContext);
  const { showToast, hideToast } = useToast();

  const [formData, setFormData] = useState({});
  const [disabledFields, setDisabledFields] = useState({});
  const [rows, setRows] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectionModel, setSelectionModel] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({});

  const navigation = useNavigate();

  // useEffect(() => {
  //   const initialFormData = {};
  //   const initialDisabledFields = {};
  //   formConfig.fields.forEach((field) => {
  //     initialFormData[field.name] = "";
  //     if (field.disabled) initialDisabledFields[field.name] = true;
  //   });
  //   setFormData(initialFormData);
  //   setDisabledFields(initialDisabledFields);

  //   formConfig.fields.forEach((field) => {
  //     if (!field.dependent && field.type === "autocomplete") {
  //       fetchOptions(field);
  //     }
  //   });
  // }, [formConfig]);

  useEffect(() => {
    const initialFormData = {};
    const initialDisabledFields = {};

    // First pass: Set initial values and handle explicitly disabled fields
    formConfig.fields.forEach((field) => {
      initialFormData[field.name] = "";
      initialDisabledFields[field.name] = field.disabled || false;
    });

    // Second pass: Handle dependencies
    formConfig.fields.forEach((field) => {
      if (field.dependsOn) {
        const parentField = formConfig.fields.find(
          (f) => f.name === field.dependsOn
        );
        if (parentField) {
          const parentValue = initialFormData[parentField.name];
          const isParentEmpty =
            parentValue === null ||
            parentValue === "" ||
            parentValue === undefined;
          initialDisabledFields[field.name] = isParentEmpty;
        }
      }
    });

    // Set initial states
    setFormData(initialFormData);
    setDisabledFields(initialDisabledFields);

    // Fetch initial options for non-dependent autocomplete fields
    formConfig.fields.forEach((field) => {
      if (!field.dependsOn && field.type === "autocomplete") {
        fetchOptions(field);
      }
    });
  }, [formConfig]);

  const fetchOptions = async (field, value) => {
    try {
      const url = field.dependent && value && field.fetchOptions;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [field.dependsOn]: value }),
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

  // const handleChange = (field, value) => {
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     [field.name]: value,
  //   }));

  //   // Enable or disable dependent fields and reset the selected value
  //   formConfig.fields.forEach((f) => {
  //     if (f.dependsOn === field.name) {
  //       // Reset the value of the dependent field
  //       setFormData((prevData) => ({
  //         ...prevData,
  //         [f.name]: "", // Clear the dependent field's value
  //       }));

  //       const isValidValue =
  //         value !== null && value !== "" && value !== undefined;

  //       // Enable or disable the dependent field
  //       setDisabledFields((prev) => ({
  //         ...prev,
  //         [f.name]: !isValidValue, // Disable if the parent field doesn't have a valid value
  //       }));

  //       // If the parent field has a valid value, fetch new options for the dependent field
  //       if (isValidValue) {
  //         fetchOptions(f, value); // Fetch new options for the dependent field
  //       }
  //     }
  //   });
  // };

  const handleChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field.name]: value,
    }));

    // Find all fields that depend on the current field
    const dependentFields = formConfig.fields.filter(
      (f) => f.dependsOn === field.name
    );

    if (dependentFields.length > 0) {
      const isValidValue =
        value !== null && value !== "" && value !== undefined;

      // Update all dependent fields
      dependentFields.forEach((dependentField) => {
        // Clear dependent field values
        setFormData((prevData) => ({
          ...prevData,
          [dependentField.name]: "",
        }));

        // Update disabled state
        setDisabledFields((prev) => ({
          ...prev,
          [dependentField.name]: !isValidValue,
        }));

        // If parent has valid value, fetch new options
        if (isValidValue && dependentField.type === "autocomplete") {
          fetchOptions(dependentField, value);
        }

        // Additionally handle nested dependencies
        const nestedDependents = formConfig.fields.filter(
          (f) => f.dependsOn === dependentField.name
        );
        nestedDependents.forEach((nestedField) => {
          setFormData((prevData) => ({
            ...prevData,
            [nestedField.name]: "",
          }));
          setDisabledFields((prev) => ({
            ...prev,
            [nestedField.name]: true, // Always disable nested dependents when parent changes
          }));
        });
      });
    }
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
      setRows(result.filter((row) => row[formDataID]));
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
    const method = formData[formDataID] ? "PUT" : "POST";
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
        if (!formData[formDataID]) {
          setRows((prevRows) => [...prevRows, result]);
        } else {
          setRows((prevRows) =>
            prevRows.map((row) =>
              row[formDataID] === result[formDataID] ? result : row
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

      // Filter out any invalid rows (rows that don't have a formDataID)
      const validRows = result.filter((row) => row[formDataID]);

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

  const generateColumns = (dynamicFields) => {
    // Map the dynamic fields to the column structure
    const dynamicColumns = dynamicFields.map((field) => ({
      field: field.field,
      headerName: field.headerName,
      width: field.width || 150, // Default width if not specified
    }));

    return [
      ...dynamicColumns,
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
              onClick={() => handleDelete(params.row[formDataID])}
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
  };

  const columns = generateColumns(formConfig.columns);

  //   const columns = [
  //     { field: "vSubFinCode", headerName: "Sub Fin Code", width: 150 },
  //     { field: "vSubFinName", headerName: "Sub Fin Name", width: 150 },
  //     { field: "vFinCode", headerName: "Fin Code", width: 150 },

  //     // Add other columns as needed
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
  //             onClick={() => handleDelete(params.row[formDataID])}
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

  const handleEdit = (row) => {
    setFormData(row);
    setIsFormVisible(true);
    setSearchKeyword("");
  };

  const handleDelete = async (formDataID) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${formConfig.endpoint}/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ formDataID }),
      });
      const result = await response.json();
      if (response.ok) {
        console.log(result.message);
        setRows((prevRows) =>
          prevRows.filter((row) => row[formDataID] !== formDataID)
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
    .filter((row) => row[formDataID]) // Ensure each row has a formDataID
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

  const navHome = () => {
    navigation("/dashboard");
  };

  return (
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
          {isFormVisible ? (
            <AnimatePresence>
              <Box
                component={motion.div}
                initial={{ x: 50 }}
                animate={{ x: 0 }}
              >
                {/* Form container with grid layout */}
                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "40px",
                    backgroundColor: Colortheme.background,
                    pl: 10,
                    pr: 10,
                    pb: 10,
                    borderRadius: 5,
                  }}
                >
                  <Box display={"flex"} alignItems={"center"}>
                    {!formData[formDataID] && isFormVisible && (
                      <StyledButton
                        onClick={navHome}
                        style={{
                          width: 85,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Home style={{ fontSize: "27px" }} />
                      </StyledButton>
                    )}
                    {formData[formDataID] && isFormVisible && (
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
                    {formData[formDataID] && isFormVisible && (
                      <h1 style={{ color: Colortheme.text, marginLeft: "35%" }}>
                        Edit : {formData[editFieldTitle]}
                      </h1>
                    )}
                    {!formData[formDataID] && isFormVisible && (
                      <h1 style={{ color: Colortheme.text, marginLeft: "35%" }}>
                        Create
                      </h1>
                    )}
                  </Box>

                  {/* Grid container for form fields */}
                  <Box
                    display={"grid"}
                    overflow={isMobile ? "scroll" : "none"}
                    sx={{
                      overflowX: "hidden",
                    }}
                    gridTemplateColumns={
                      isMobile ? "repeat(1, 1fr)" : "repeat(4, 1fr)"
                    }
                    gridTemplateRows={"repeat(3, 1fr)"}
                    columnGap={"60px"}
                    rowGap={"40px"}
                    pt={1}
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
                  </Box>

                  {/* Buttons container outside the grid */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <StyledButton
                      type="submit"
                      bgColor={Colortheme.buttonBg}
                      bgColorHover={Colortheme.buttonBgHover}
                    >
                      {formData[formDataID] ? "Save" : "Create"}
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
                getRowId={(row) => row[formDataID]}
                rowSelectionModel={selectionModel}
                onRowSelectionModelChange={handleSelectionModelChange}
                sortModel={[
                  {
                    field: "formDataID",
                    sort: "asc",
                  },
                ]}
                columnVisibilityModel={isMobile ? { id: false } : { id: false }}
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
  );
};

export default MainFormComponent;
