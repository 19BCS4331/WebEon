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

const CurrencyProfile = () => {
  const { token } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { Colortheme } = useContext(ThemeContext);
  const { showToast, hideToast } = useToast();
  const formConfig = formConfigs.currencyForm;

  const [formData, setFormData] = useState({});
  const [disabledFields, setDisabledFields] = useState({});
  const [rows, setRows] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectionModel, setSelectionModel] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [countryOptions, setCountryOptions] = useState([]);
  // const [groupOptions, setGroupOptions] = useState([]);

  useEffect(() => {
    const initialFormData = {};
    const initialDisabledFields = {};
    formConfig.fields.forEach((field) => {
      initialFormData[field.name] = "";
      if (field.disabled) initialDisabledFields[field.name] = true;
    });
    setFormData(initialFormData);
    setDisabledFields(initialDisabledFields);
  }, [formConfig]);

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
  };

  useEffect(() => {
    const fetchAutocompleteOptions = async () => {
      try {
        const response = await fetch(
          formConfig.fields.find((f) => f.name === "vCountryName").fetchOptions,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const result = await response.json();
        setCountryOptions(result); // Adjust this based on the structure of the response
      } catch (error) {
        console.error("Error fetching country options:", error);
        showToast("Error Fetching Countries!", "fail");
        setTimeout(() => {
          hideToast();
        }, 2000);
      }

      // try {
      //   const response = await fetch(formConfig.fields.find(f => f.name === 'nCurrencyGroupID').fetchOptions, {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //     },
      //   });
      //   const result = await response.json();
      //   setGroupOptions(result); // Adjust this based on the structure of the response
      // } catch (error) {
      //   console.error('Error fetching group options:', error);
      // }
    };

    fetchAutocompleteOptions();
  }, [token]);

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
      setRows(result.filter((row) => row.nCurrencyID));
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
    const method = formData.nCurrencyID ? "PUT" : "POST";
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
        if (!formData.nCurrencyID) {
          setRows((prevRows) => [...prevRows, result]);
        } else {
          setRows((prevRows) =>
            prevRows.map((row) =>
              row.nCurrencyID === result.nCurrencyID ? result : row
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

      // Filter out any invalid rows (rows that don't have a nCurrencyID)
      const validRows = result.filter((row) => row.nCurrencyID);

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
    { field: "vCncode", headerName: "Currency Code", width: 150 },
    { field: "vCnName", headerName: "Currency Name", width: 150 },
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
            onClick={() => handleDelete(params.row.nCurrencyID)}
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

  const handleDelete = async (nCurrencyID) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${formConfig.endpoint}/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nCurrencyID }),
      });
      const result = await response.json();
      if (response.ok) {
        console.log(result.message);
        setRows((prevRows) =>
          prevRows.filter((row) => row.nCurrencyID !== nCurrencyID)
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
    .filter((row) => row.nCurrencyID) // Ensure each row has a nCurrencyID
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
    <MainContainerCompilation title="Currency Profile">
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
              {formData.nCurrencyID && isFormVisible && (
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
              {formData.nCurrencyID && isFormVisible && (
                <h1 style={{ color: Colortheme.text, marginLeft: "35%" }}>
                  Edit : {formData.vCncode}
                </h1>
              )}
              {!formData.nCurrencyID && isFormVisible && (
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
                            label={field.label}
                            name={field.name}
                            value={formData[field.name]}
                            onChange={(e, newValue) =>
                              handleChange(field, newValue)
                            }
                            required={field.required}
                            disabled={disabledFields[field.name]}
                            options={countryOptions.map((item) => item.vCode)}
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
                        {formData.nCurrencyID ? "Save" : "Create"}
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
                  getRowId={(row) => row.nCurrencyID}
                  rowSelectionModel={selectionModel}
                  onRowSelectionModelChange={handleSelectionModelChange}
                  sortModel={[
                    {
                      field: "nCurrencyID",
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

export default CurrencyProfile;
