import React, { useState, useEffect, useContext, useMemo } from "react";
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
import CustomDatePicker from "../CustomDatePicker";
import { apiClient } from "../../../services/apiClient";
import CustomDataGrid from "../CustomDataGrid";
import ButtonGrid from "../ButtonGrid";

const MainFormComponent = ({ 
  formConfig, 
  formDataID, 
  editFieldTitle, 
  actionButtons,
  onRefresh
}) => {
  const { token, branch,counter } = useContext(AuthContext);
  const theme = useTheme();
  const { Colortheme } = useContext(ThemeContext);
  const { showAlertDialog, hideAlertDialog, showToast, hideToast } = useToast();

  const [formData, setFormData] = useState({});
  const [disabledFields, setDisabledFields] = useState({});
  const [rows, setRows] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectionModel, setSelectionModel] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({});
  const [selectAPIOptions, setSelectAPIOptions] = useState({});

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isSmallDesktop = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up("lg"));

  const navigation = useNavigate();

  const getGridTemplateColumns = () => {
    if (isMobile) return "repeat(1, 1fr)";
    if (isTablet) return "repeat(2, 1fr)";
    if (isSmallDesktop) return "repeat(4, 1fr)";
    if (isLargeDesktop) return "repeat(5, 1fr)";
    return "repeat(5, 1fr)";
  };

  useEffect(() => {
    const initialFormData = {};
    const initialDisabledFields = {};

    // First pass: Set initial values and handle explicitly disabled fields
    formConfig.fields.forEach((field) => {
      switch (field.type) {
        case "text":
          initialFormData[field.name] = "";
          break;
        case "autocomplete":
          initialFormData[field.name] = "";
          break;
        case "checkbox":
          initialFormData[field.name] = false;
          break;
        default:
          initialFormData[field.name] = "";
          break;
      }
      initialDisabledFields[field.name] = field.disabled || false;
    });

    // Second pass: Handle dependencies and enableWhen conditions
    formConfig.fields.forEach((field) => {
      // Handle regular dependencies
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

      // Handle enableWhen conditions
      if (field.enableWhen) {
        const { field: controllingField, value: requiredValue, operator } =
          field.enableWhen;
        const controllingValue = initialFormData[controllingField];
        if (operator === "=") {
          initialDisabledFields[field.name] = controllingValue !== requiredValue;
        } else if (operator === "!=") {
          initialDisabledFields[field.name] = controllingValue === requiredValue;
        } else if (operator === ">") {
          initialDisabledFields[field.name] = controllingValue <= requiredValue;
        } else if (operator === ">=") {
          initialDisabledFields[field.name] = controllingValue < requiredValue;
        } else if (operator === "<") {
          initialDisabledFields[field.name] = controllingValue >= requiredValue;
        } else if (operator === "<=") {
          initialDisabledFields[field.name] = controllingValue > requiredValue;
        }
        else{
          initialDisabledFields[field.name] = controllingValue !== requiredValue;
        }
      }
    });

    // Set initial states
    setFormData(initialFormData);
    setDisabledFields(initialDisabledFields);

    // Fetch options for non-dependent fields
    formConfig.fields.forEach((field) => {
      if (
        !field.dependsOn &&
        !field.fetchNotNeeded &&
        field.type === "autocomplete"
      ) {
        fetchIndependantOptions(field);
      }
      if (
        !field.dependsOn &&
        !field.fetchNotNeeded &&
        field.type === "select" &&
        field.isApi
      ) {
        fetchIndependantSelectOptions(field);
      }
    });
  }, [formConfig]);

  useEffect(() => {
    const updatedDisabledFields = { ...disabledFields };

    if (formData[formDataID]) {
      formConfig.fields.forEach((field) => {
        if (field.enableWhen) {
          // Handle enableWhen conditions
          const { field: controllingField, value: requiredValue, operator } =
            field.enableWhen;
          const controllingValue = formData[controllingField];
          updatedDisabledFields[field.name] =
            operator === "==" ? controllingValue !== requiredValue :
            operator === "!=" ? controllingValue === requiredValue :
            operator === ">" ? controllingValue < requiredValue :
            operator === ">=" ? controllingValue <= requiredValue :
            operator === "<" ? controllingValue > requiredValue :
            operator === "<=" ? controllingValue >= requiredValue : controllingValue === requiredValue;
        } else if (field.dependsOn) {
          // Handle dependsOn conditions
          const parentValue = formData[field.dependsOn];
          updatedDisabledFields[field.name] = !parentValue;
        }
        setDisabledFields(updatedDisabledFields);
      });
    }
  }, [formData[formDataID]]);

  useEffect(() => {
    if (formData[formDataID]) {
      formConfig.fields.forEach((field) => {
        if (field.dependsOn && field.type === "autocomplete") {
          const parentValue = formData[field.dependsOn];

          if (parentValue) {
            fetchOptions(field, parentValue); // Assuming fetchOptions fetches based on parent value
          }
        }

        if (field.dependsOn && field.type === "select" && field.isApi) {
          const parentValue = formData[field.dependsOn];

          if (parentValue) {
            fetchSelectOptions(field, parentValue);
          }
        }
      });
    }
  }, [formData]); // Run after formData is set in edit mode

  const fetchIndependantSelectOptions = async (field) => {
    try {
      const response = await apiClient.get(field.fetchOptions);

      if (response.status < 200 || response.status >= 300) {
        const errorMessage = `Error ${response.status}: ${response.statusText}`;
        console.error(errorMessage);
        setTimeout(() => {
          hideToast();
        }, 2000);
        return;
      }

      const result = response.data;

      if (Array.isArray(result)) {
        // Create default option
        const defaultOption = {
          value: "",
          label: `Select ${field.label}`, // or just field.label if you prefer
        };

        // Combine default option with API results
        const optionsWithDefault = [
          defaultOption,
          ...result.map((item) => ({
            value: item.value,
            label: item.label,
          })),
        ];

        setSelectAPIOptions((prevOptions) => ({
          ...prevOptions,
          [field.name]: optionsWithDefault,
        }));
      } else {
        console.error("API response is not in the expected format:", result);
        showToast("Invalid data format received from server", "fail");
      }
    } catch (error) {
      console.error("Error fetching options for Select:", error);
      const errorMessage = error.response?.status
        ? `Error ${error.response.status}: ${error.response.statusText}`
        : "Network error or server unreachable";
      setTimeout(() => {
        hideToast();
      }, 2000);
    }
  };

  const fetchIndependantOptions = async (field) => {
    let response;
    try {
      if (field.fetchMethod === "GET" || field.fetchMethod === undefined || !field.fetchMethod) {
        response = await apiClient.get(field.fetchOptions);
      } else {
        // Create a dynamic request body that includes context data
        const dynamicBody = {
          ...(field.fetchBody || {}),
          // Include branch and counter data from AuthContext if available
          branch: branch ? {
            vBranchCode: branch.vBranchCode,
            nBranchID: branch.nBranchID
          } : undefined,
          counter: counter ? {
            nCounterID: counter.nCounterID,
            vCounterID: counter.vCounterID
          } : undefined
        };
        
        response = await apiClient.post(field.fetchOptions, dynamicBody);
      }

      if (response.status < 200 || response.status >= 300) {
        const errorMessage = `Error ${response.status}: ${response.statusText}`;
        console.error(errorMessage);
        setTimeout(() => {
          hideToast();
        }, 2000);
        return;
      }

      const result = response.data;
      console.log("response INDEPED", result);

      // Ensure options are in { value, label } format
      const formattedOptions = result.map((item) =>
        typeof item === "object" && item.value && item.label
          ? item
          : { value: item, label: item }
      );

      setOptions((prevOptions) => ({
        ...prevOptions,
        [field.name]: formattedOptions,
      }));
    } catch (error) {
      console.error("Error fetching options:", error);
      const errorMessage = error.response?.status
        ? `Error ${error.response.status}: ${error.response.statusText}`
        : "Network error or server unreachable";
      setTimeout(() => {
        hideToast();
      }, 2000);
    }
  };

  const fetchOptions = async (field, value) => {
    try {
      const url = field.dependent && value && field.fetchOptions;

      const response = await apiClient.post(url, { [field.dependsOn]: value });

      // Axios does not have an 'ok' property, so we check the status code
      if (response.status < 200 || response.status >= 300) {
        const errorMessage = `Error ${response.status}: ${response.statusText}`;
        console.error(errorMessage);
        setTimeout(() => {
          hideToast();
        }, 2000);
        return;
      }

      const result = await response.data;
      if (Array.isArray(result)) {
        // Create default option
        const defaultOption = {
          value: "",
          label: `Select ${field.label}`, // or just field.label if you prefer
        };

        // Combine default option with API results
        const optionsWithDefault = [
          defaultOption,
          ...result.map((item) => ({
            value: item.value,
            label: item.label,
          })),
        ];

        setSelectAPIOptions((prevOptions) => ({
        ...prevOptions,
          [field.name]: optionsWithDefault,
      }));
      } else {
        console.error("API response is not in the expected format:", result);
        showToast("Invalid data format received from server", "fail");
      }
    } catch (error) {
      console.error("Error fetching options:", error);
      const errorMessage = error.response?.status
        ? `Error ${error.response.status}: ${error.response.statusText}`
        : "Network error or server unreachable";
      setTimeout(() => {
        hideToast();
      }, 2000);
    }
  };

  const fetchSelectOptions = async (field, value) => {
    try {
      const url = field.dependent && value && field.fetchOptions;

      const response = await apiClient.post(url, { [field.dependsOn]: value });

      // Axios does not have an 'ok' property, so we check the status code
      if (response.status < 200 || response.status >= 300) {
        const errorMessage = `Error ${response.status}: ${response.statusText}`;
        console.error(errorMessage);
        // showToast(errorMessage, "fail");
        setTimeout(() => {
          hideToast();
        }, 2000);
        return;
      }

      const result = await response.data;
      if (Array.isArray(result)) {
        // Create default option
        const defaultOption = {
          value: "",
          label: `Select ${field.label}`, // or just field.label if you prefer
        };

        // Combine default option with API results
        const optionsWithDefault = [
          defaultOption,
          ...result.map((item) => ({
            value: item.value,
            label: item.label,
          })),
        ];

        setSelectAPIOptions((prevOptions) => ({
        ...prevOptions,
          [field.name]: optionsWithDefault,
      }));
      } else {
        console.error("API response is not in the expected format:", result);
        showToast("Invalid data format received from server", "fail");
      }
    } catch (error) {
      console.error("Error fetching options:", error);
      const errorMessage = error.response?.status
        ? `Error ${error.response.status}: ${error.response.statusText}`
        : "Network error or server unreachable";
      // showToast(errorMessage, "fail");
      setTimeout(() => {
        hideToast();
      }, 2000);
    }
  };

  const handleChange = (field, value) => {
    // Update the form data for the changed field
    setFormData((prevData) => ({
      ...prevData,
      [field.name]: value,
    }));

    // Handle calculations for fields that depend on this field
    const calculatedFields = formConfig.fields.filter(
      (f) => f.calculated && f.dependsOn && f.dependsOn.includes(field.name)
    );

    if (calculatedFields.length > 0) {
      // Get the latest form data with the current field's new value
      const updatedFormData = { ...formData, [field.name]: value };
      
      // Update all calculated fields
      calculatedFields.forEach((calcField) => {
        if (typeof calcField.formula === 'function') {
          try {
            // Calculate the new value using the formula
            const calculatedValue = calcField.formula(updatedFormData);
            
            // Update the form data with the calculated value
            setFormData((prevData) => ({
              ...prevData,
              [calcField.name]: calculatedValue,
            }));
          } catch (error) {
            console.error(`Error calculating field ${calcField.name}:`, error);
          }
        }
      });
    }

    // Handle dependencies
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

        // Update disabled state for dependencies
        setDisabledFields((prev) => ({
          ...prev,
          [dependentField.name]: !isValidValue,
        }));

        // If parent has valid value, fetch new options
        if (isValidValue) {
          if (dependentField.type === "autocomplete") {
            fetchOptions(dependentField, value);
          }
          if (dependentField.type === "select") {
            fetchSelectOptions(dependentField, value);
          }
        }

        // Handle nested dependencies
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
            [nestedField.name]: true,
          }));
        });
      });
    }

    // Handle enableWhen conditions for all fields
    formConfig.fields.forEach((formField) => {
      if (formField.enableWhen) {
        // Handle single condition
        if (!Array.isArray(formField.enableWhen.conditions)) {
          // Only process fields that depend on the currently changed field
          if (formField.enableWhen.field === field.name) {
            // Check which operator to use
            const operator = formField.enableWhen.operator || "=";
            
            if (operator === "=" || !operator) {
              setDisabledFields((prev) => ({
                ...prev,
                [formField.name]: value !== formField.enableWhen.value,
              }));
            } else if (operator === "!=") {
              setDisabledFields((prev) => ({
                ...prev,
                [formField.name]: value === formField.enableWhen.value,
              }));
            } else if (operator === ">") {
              setDisabledFields((prev) => ({
                ...prev,
                [formField.name]: value <= formField.enableWhen.value,
              }));
            } else if (operator === ">=") {
              setDisabledFields((prev) => ({
                ...prev,
                [formField.name]: value < formField.enableWhen.value,
              }));
            } else if (operator === "<") {
              setDisabledFields((prev) => ({
                ...prev,
                [formField.name]: value >= formField.enableWhen.value,
              }));
            } else if (operator === "<=") {
              setDisabledFields((prev) => ({
                ...prev,
                [formField.name]: value > formField.enableWhen.value,
              }));
            }
          }
        }
        // Handle multiple conditions
        else {
          const conditions = formField.enableWhen.conditions;
          const operator = formField.enableWhen.operator || "AND";

          // Only update if the changed field is part of the conditions
          if (conditions.some((condition) => condition.field === field.name)) {
            setDisabledFields((prev) => ({
              ...prev,
              [formField.name]: evaluateConditions(
                conditions,
                operator,
                { ...formData, [field.name]: value } // Include the new value
              ),
            }));
          }
        }
      }
    });
  };

  // Helper function to evaluate multiple conditions
  const evaluateConditions = (conditions, operator, currentFormData) => {
    const results = conditions.map(
      (condition) => currentFormData[condition.field] === condition.value
    );

    if (operator === "AND") {
      return !results.every((result) => result);
    } else if (operator === "OR") {
      return !results.some((result) => result);
    }
    return true; // Default to disabled if operator is invalid
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(formConfig.endpoint);
      const result = await response.data;
      setRows(result.filter((row) => row[formDataID]));
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setTimeout(() => {
        hideToast();
      }, 2000);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  useEffect(() => {
    if (onRefresh && typeof onRefresh === 'function') {
      onRefresh(fetchData);
    }
  }, [onRefresh]);

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    const method = formData[formDataID] ? "PUT" : "POST";
    const endpoint = formConfig.endpoint;

    // Create a new object with only the enabled fields
    const enabledFields = Object.keys(formData).filter(
      (key) => !disabledFields[key]
    );
    const enabledFormData = enabledFields.reduce((obj, key) => {
      obj[key] = formData[key];
      return obj;
    }, {});

    // Add branch code and ID from auth context
    if (branch?.vBranchCode) {
      enabledFormData.vBranchCode = branch.vBranchCode;
      enabledFormData.nBranchID = branch.nBranchID;
      enabledFormData.nCounterID = counter.nCounterID;
    }

    try {
      const response = await apiClient({
        url: endpoint,
        method: method,
        data: enabledFormData,
      });

      const result = await response.data;

      if (response.status >= 200 && response.status < 300) {
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
        setTimeout(() => {
          hideToast();
        }, 2000);
        setIsLoading(false);
        showToast("Error Occurred!", "fail");
      }
    } catch (error) {
      console.error("Error:", error);
      setTimeout(() => {
        hideToast();
      }, 2000);
      setIsLoading(false);
      showToast("Error Occurred!", "fail");
    }
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(formConfig.endpoint);
      const result = await response.data;

      // Filter out any invalid rows (rows that don't have a formDataID)
      const validRows = result.filter((row) => row[formDataID]);

      setRows(validRows);
      setIsFormVisible(false);
      setIsLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setTimeout(() => {
        hideToast();
      }, 2000);
      setIsLoading(false);
      showToast("Error Occurred!", "fail");
    }
  };

  // Memoized Columns
  const columns = useMemo(() => {
    const dynamicColumns = formConfig.columns.map((field) => ({
      field: field.field,
      headerName: field.headerName,
      width: field.width || 150,
      renderCell: field.renderCell,
      valueGetter: field.valueGetter,
    }));

    return [
      ...dynamicColumns,
      {
        field: "actions",
        headerName: "Actions",
        width: 200,
        renderCell: (params) => (
          <Box display="flex" gap={2}>
            <StyledButton
              onClick={() => handleEdit(params.row)}
              bgColor={Colortheme.buttonBg}
              bgColorHover={Colortheme.buttonBgHover}
              style={{ width: 80, height: 30 }}
            >
              Edit
            </StyledButton>
            <StyledButton
              onClick={() => handleDeleteClick(params.row[formDataID])}
              bgColor={Colortheme.buttonBg}
              bgColorHover="red"
              textColOnHover="white"
              style={{ width: 80, height: 30 }}
            >
              Delete
            </StyledButton>
          </Box>
        ),
      },
    ];
  }, [formConfig.columns, Colortheme, formDataID]);

  const handleEdit = (row) => {
    setFormData(row);
    setIsFormVisible(true);
    setSearchKeyword("");
  };

  const handleDeleteClick = (row) => {
    console.log("Delete button clicked for ID:", row);
    showAlertDialog(`Delete the record`, "", () =>
      handleDelete(row)
    );
  };


  const handleDelete = async (idToDelete) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post(`${formConfig.endpoint}/delete`, {
        idToDelete,
      });
      const result = await response.data;
      if (response.status >= 200 && response.status < 300) {
        console.log(result.message);
        setRows((prevRows) =>
          prevRows.filter((row) => row[formDataID] !== idToDelete)
        );
        setSearchKeyword("");
        setIsLoading(false);

        showToast("Data Deleted Successfully!", "success");
        hideAlertDialog();
        setTimeout(() => {
          hideToast();
        }, 2000);
      } else {
        console.error(result.error);
        setIsLoading(false);
        showToast("Error Occurred!", "fail");
        hideAlertDialog();
        setTimeout(() => {
          hideToast();
        }, 2000);
      }
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
      showToast("Error Occurred!", "fail");
      hideAlertDialog();
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
                alignItems={"center"}
                display={"flex"}
                width={"100%"}
              >
                {/* Form container with grid layout */}
                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "25px",
                    backgroundColor: Colortheme.background,
                    pl: isMobile ? 5 : 10,
                    pr: isMobile ? 5 : 10,
                    pb: 5,
                    borderRadius: 5,
                    maxHeight: isMobile
                      ? "calc(100vh - 200px)"
                      : "calc(100vh - 100px)",
                    width: "100%",
                  }}
                >
                  <Box display={"flex"} alignItems={"center"}>
                    {!formData[formDataID] && isFormVisible && !isMobile && (
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
                          width: isMobile ? 80 : 100,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <KeyboardBackspaceIcon
                          style={{ fontSize: isMobile ? "20px" : "30px" }}
                        />
                      </StyledButton>
                    )}
                    {formData[formDataID] && isFormVisible && (
                      <h1
                        style={{
                          color: Colortheme.text,
                          marginLeft: isMobile ? "10%" : "35%",
                        }}
                      >
                        Edit
                      </h1>
                    )}
                    {!formData[formDataID] && isFormVisible && (
                      <h1
                        style={{
                          color: Colortheme.text,
                          marginLeft: isMobile ? "25%" : "35%",
                        }}
                      >
                        Create
                      </h1>
                    )}
                  </Box>

                  {/* Grid container for form fields */}
                  <Box
                    mt={isMobile ? -4 : 0}
                    display={"grid"}
                    overflow={isMobile ? "scroll" : "none"}
                    sx={{
                      overflowX: "hidden",
                    }}
                    gridTemplateColumns={getGridTemplateColumns()}
                    gridTemplateRows={"repeat(3, 1fr)"}
                    columnGap={"60px"}
                    rowGap={"40px"}
                    pt={1}
                    pr={2}
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
                            style={isMobile ? { width: "100%" } : {}}
                          />
                        ) : field.type === "autocomplete" ? (
                          <CustomAutocomplete
                            options={options[field.name] || []}
                            label={field.label}
                            name={field.name}
                            value={
                              options[field.name]?.find(
                                (opt) => opt.value === formData[field.name]
                              ) || null
                            } // Select the option by its value
                            onChange={
                              (e, newValue) =>
                                handleChange(
                                  field,
                                  newValue ? newValue.value : ""
                                ) // Store value in formData
                            }
                            getOptionLabel={(option) => option.label || ""} // Display the label in dropdown
                            isOptionEqualToValue={(option, value) =>
                              option.value === value.value
                            } // Match by value
                            required={field.required}
                            disabled={disabledFields[field.name]}
                            styleTF={isMobile ? { width: "100%" } : {}}
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
                        ) : field.type === "select" && !field.isApi ? (
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
                            style={isMobile ? { width: "100%" } : {}}
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
                        ) : field.type === "select" && field.isApi ? (
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
                            style={isMobile ? { width: "100%" } : {}}
                          >
                            {selectAPIOptions[field.name]?.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </CustomTextField>
                        ) : field.type === "date" ? (
                          <CustomDatePicker
                            label={field.label}
                            value={formData[field.name]}
                            onChange={(newValue) =>
                              handleChange(field, newValue)
                            }
                            name={field.name}
                            required={field.required}
                            disablePast={false} // Change this to true if you want to disable past dates
                            disabled={disabledFields[field.name]}
                          />
                        ) : null}
                      </div>
                    ))}
                  </Box>

                  {/* Buttons container outside the grid */}
                  <Box
                    mt={2}
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
             
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: Colortheme.background,
                p: isMobile ? 2 : 5,
                borderRadius: 10,
                overflow: "hidden",
                maxWidth: "80vw",
              }}
              maxHeight={
                isMobile ? "calc(100vh - 200px)" : "calc(100vh - 250px)"
              }
            >
              <Box sx={{ alignSelf: "flex-start", mb: 2 }}>
                <StyledButton
                  onClick={handleBack}
                  style={{
                    width: isMobile ? 80 : 100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <KeyboardBackspaceIcon
                    style={{ fontSize: isMobile ? "20px" : "30px" }}
                  />
                </StyledButton>
              </Box>
              <CustomTextField
                variant="outlined"
                placeholder="Search..."
                value={searchKeyword}
                onChange={handleSearchChange}
                style={{
                  marginBottom: "20px",
                  width: isMobile ? "80%" : "50%",
                }}
              />
              
              {/* Action Buttons Grid */}
              {actionButtons && actionButtons.length > 0 && (
                <ButtonGrid 
                  buttons={actionButtons}
                  columns={Math.min(actionButtons.length, 3)}
                  minWidth="180px"
                  autoSize={true}
                  gap="1rem"
                  style={{
                    // padding: '1rem', 
                    marginBottom: '20px'
                  }}
                />
              )}
              
              <CustomDataGrid
                rows={filteredRows}
                columns={columns}
                selectionModel={selectionModel}
                getRowId={(row) => row[formDataID]}
                columnVisibilityModel={isMobile ? { id: false } : { id: false }}
                sortModel={[
                  {
                    field: formDataID,
                    sort: "asc",
                  },
                ]}
                onSelectionModelChange={handleSelectionModelChange}
                searchKeyword={searchKeyword}
                setSearchKeyword={setSearchKeyword}
                Colortheme={Colortheme}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default MainFormComponent;
