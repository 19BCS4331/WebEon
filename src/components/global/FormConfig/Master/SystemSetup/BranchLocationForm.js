import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  Box,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme,
  useMediaQuery,
  Tooltip,
  TextField,
} from "@mui/material";
import dayjs from "dayjs";
import CustomTextField from "../../../CustomTextField";
import CustomDatePicker from "../../../CustomDatePicker";
import CustomCheckbox from "../../../CustomCheckbox";
import ThemeContext from "../../../../../contexts/ThemeContext";
import styled from "styled-components";
import StyledButton from "../../../StyledButton";
import { useToast } from "../../../../../contexts/ToastContext";
import { useBaseUrl } from "../../../../../contexts/BaseUrl";
import CustomAutocomplete from "../../../CustomAutocomplete";
import { DataGrid } from "@mui/x-data-grid";
import { AuthContext } from "../../../../../contexts/AuthContext";
import { apiClient } from "../../../../../services/apiClient";

const BoxButton = styled.div`
  width: ${(props) =>
    props.isMobile ? "50vw" : "12vw"}; /* Adjust width based on isMobile */
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.3s;
  border-radius: 5px;
  height: 55px;
  cursor: pointer;
  border: 1px solid ${(props) => props.theme.text};
  color: ${(props) => props.theme.text};
  text-align: center;
  font-size: 16px;
  padding: 2px;
  &:hover {
    background-color: ${(props) => props.theme.text};
    color: ${(props) => props.theme.background};
    border-radius: 10px;
    font-size: 15px;
  }
`;
const BoxButtonLink = styled.div`
  width: ${(props) =>
    props.isMobile ? "50vw" : "12vw"}; /* Adjust width based on isMobile */
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.3s;
  border-radius: 5px;
  height: 55px;
  cursor: pointer;
  border: 1px solid lightblue;
  //   ${(props) => props.theme.text};
  color: ${(props) => props.theme.text};
  &:hover {
    background-color: lightblue;
    // ${(props) => props.theme.text};
    color: ${(props) => props.theme.background};
    border-radius: 10px;
    font-size: 15px;
  }
`;

const BranchLocationForm = ({ initialData, onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [companyRecordOption, setCompanyRecordOption] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [locationTypeOptions, setLocationTypeOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const { Colortheme } = useContext(ThemeContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { showToast, hideToast } = useToast();
  const { baseUrl } = useBaseUrl();
  const [bcRows, setBCRows] = useState([]);
  const [pendingBCChanges, setPendingBCChanges] = useState([]);
  const [pendingBpChanges, setPendingBpChanges] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [bpRows, setBPRows] = useState([]);
  const { token } = useContext(AuthContext);

  const OperationalGrpOptions = [
    { value: "City Location", label: "CITY LOCATION" },
    { value: "Rural Location", label: "RURAL LOCATION" },
    { value: "Airport Location", label: "AIRPORT LOCATION" },
  ];

  useEffect(() => {
    setLoading(true);
    apiClient
      .get(`/pages/Master/SystemSetup/CompanyRecordOptions`)
      .then((response) => {
        setCompanyRecordOption(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setLoading(true);

    apiClient
      .get(`/pages/Master/SystemSetup/LocationOptions`)
      .then((response) => {
        setLocationOptions(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    apiClient
      .get(`/pages/Master/SystemSetup/CityOptions`)
      .then((response) => {
        setCityOptions(response.data);

        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setLoading(true);

    apiClient
      .get(`/pages/Master/SystemSetup/LocationTypeOptions`)
      .then((response) => {
        setLocationTypeOptions(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    apiClient
      .get(`/pages/Master/SystemSetup/LocationTypeOptions`)
      .then((response) => {
        setLocationTypeOptions(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    apiClient
      .get(`/pages/Master/SystemSetup/BranchOptions`)
      .then((response) => {
        setBranchOptions(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, []);

  const [formData, setFormData] = useState({
    nCompID: 1,
    vBranchCode: "",
    nBranchID: "",
    vAddress1: "",
    vAddress2: "",
    vAddress3: "",
    vOperationalGrp: "",
    vLocation: "",
    vCity: null,
    vPinCode: "",
    STDCode: "",
    vTelNo1: "",
    vTelNo2: "",
    vFaxNo1: "",
    vFaxNo2: "",
    vEmailID: "",
    nLocationType: "",
    vContactPerson: "",
    vContactPersonNo: "",
    nOperationalUserID: "",
    nAccountUSERID: "",
    vAIINO: "",
    vWUAIINo: "",
    bServiceTaxApplicable: false,
    vServiceTaxRegNo: "",
    vRBILicenseNo: "",
    dRBIRegDate: null,
    vAuthorizedSignatory: "",
    nReportingBranchID: "",
    nWUBranchID: "",
    nCashLimit: "",
    vIBMNo1: "",
    vIBMNo2: "",
    bActive: false,
    nBranchIBMID: "",
    bHasShifts: false,
    nLastTCSettRefNo: "",
    nCurrencyLimit: "",
    ntempCashLimit: "",
    ntempCurrencyLimit: "",
    nAttachedToBranchID: "",
  });
  const [openSectionDialog, setOpenSectionDialog] = useState(null);

  const matchedCity = useMemo(() => {
    if (initialData && typeof initialData.vCity === "string") {
      const city = cityOptions.find(
        (city) => city.value.toLowerCase() === initialData.vCity.toLowerCase()
      );
      console.log("Matched City:", city); // Debug log
      return city || null;
    }
    return initialData ? initialData.vCity : null;
  }, [initialData, cityOptions]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nCompID: initialData.nCompID || "",
        vBranchCode: initialData.vBranchCode || "",
        nBranchID: initialData.nBranchID || "",
        vAddress1: initialData.vAddress1 || "",
        vAddress2: initialData.vAddress2 || "",
        vAddress3: initialData.vAddress3 || "",
        vOperationalGrp: initialData.vOperationalGrp || "",
        vLocation: initialData.vLocation || "",
        // vCity: initialData.vCity || "",
        vCity: matchedCity,
        vPinCode: initialData.vPinCode || "",
        STDCode: initialData.STDCode || "",
        vTelNo1: initialData.vTelNo1 || "",
        vTelNo2: initialData.vTelNo2 || "",
        vFaxNo1: initialData.vFaxNo1 || "",
        vFaxNo2: initialData.vFaxNo2 || "",
        vEmailID: initialData.vEmailID || "",
        nLocationType: initialData.nLocationType || "",
        vContactPerson: initialData.vContactPerson || "",
        vContactPersonNo: initialData.vContactPersonNo || "",
        nOperationalUserID: initialData.nOperationalUserID || "",
        nAccountUSERID: initialData.nAccountUSERID || "",
        vAIINO: initialData.vAIINO || "",
        vWUAIINo: initialData.vWUAIINo || "",
        bServiceTaxApplicable: initialData.bServiceTaxApplicable || false,
        vServiceTaxRegNo: initialData.vServiceTaxRegNo || "",
        vRBILicenseNo: initialData.vRBILicenseNo || "",
        dRBIRegDate: initialData.dRBIRegDate
          ? dayjs(initialData.dRBIRegDate)
          : null,
        vAuthorizedSignatory: initialData.vAuthorizedSignatory || "",
        nReportingBranchID: initialData.nReportingBranchID || "",
        nWUBranchID: initialData.nWUBranchID || "",
        nCashLimit: initialData.nCashLimit || "",
        vIBMNo1: initialData.vIBMNo1 || "",
        vIBMNo2: initialData.vIBMNo2 || "",
        bActive: initialData.bActive || false,
        nBranchIBMID: initialData.nBranchIBMID || "",
        bHasShifts: initialData.bHasShifts || false,
        nLastTCSettRefNo: initialData.nLastTCSettRefNo || "",
        nCurrencyLimit: initialData.nCurrencyLimit || "",
        ntempCashLimit: initialData.ntempCashLimit || "",
        ntempCurrencyLimit: initialData.ntempCurrencyLimit || "",
        nAttachedToBranchID: initialData.nAttachedToBranchID || "",
      });
    }
  }, [initialData, matchedCity]);

  // -----------------------------------------------SAVING WITH FIELD ERRORS AND VALIDATION START---------------------------------------------

  const [fieldErrors, setFieldErrors] = useState({
    nCompID: false,
    vBranchCode: false,
    nBranchID: false,
    vAddress1: false,
    vAddress2: false,
    vAddress3: false,
    vOperationalGrp: false,
    vLocation: false,
    vCity: false,
    vPinCode: false,
    STDCode: false,
    vTelNo1: false,
    vTelNo2: false,
    vFaxNo1: false,
    vFaxNo2: false,
    vEmailID: false,
    nLocationType: false,
    vContactPerson: false,
    vContactPersonNo: false,
    nOperationalUserID: false,
    nAccountUSERID: false,
    vAIINO: false,
    vWUAIINo: false,
    bServiceTaxApplicable: false,
    vServiceTaxRegNo: false,
    vRBILicenseNo: false,
    dRBIRegDate: false,
    vAuthorizedSignatory: false,
    nReportingBranchID: false,
    nWUBranchID: false,
    nCashLimit: false,
    vIBMNo1: false,
    vIBMNo2: false,
    bActive: false,
    nBranchIBMID: false,
    bHasShifts: false,
    nLastTCSettRefNo: false,
    nCurrencyLimit: false,
    ntempCashLimit: false,
    ntempCurrencyLimit: false,
  });

  const validatePartyDetails = () => {
    let hasError = false;
    const errors = {};

    if (!formData.vBranchCode.trim()) {
      errors.vBranchCode = true;
      hasError = true;
    } else {
      errors.vBranchCode = false;
    }

    if (!formData.vAddress1.trim()) {
      errors.vAddress1 = true;
      hasError = true;
    } else {
      errors.vAddress1 = false;
    }

    if (formData.vTelNo1.trim().length > 10) {
      errors.vPhone = true;
      hasError = true;
    } else {
      errors.vTelNo1 = false;
    }

    // Add more validations for Location / Contact Details section
    setFieldErrors(errors);
    return !hasError;
  };

  const validatePANDetails = () => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    let hasError = false;
    const errors = {};

    // Validate PAN number
    if (!panRegex.test(formData.vPan)) {
      errors.vPan = true;
      hasError = true;
    } else {
      errors.vPan = false;
    }

    // Add more validations for Location / Contact Details section
    setFieldErrors(errors);
    return !hasError;
  };

  const validateAllFields = () => {
    let hasError = false;
    const newFieldErrors = {};

    // if (formData.dIntdate === null) {
    //   newFieldErrors.dIntdate = true;
    //   hasError = true;
    // } else {
    //   newFieldErrors.dIntdate = false;
    // }

    // Validate Location / Contact Details section
    const partyDetailsErrors = validatePartyDetails();
    console.log("partyDetailsErrors", partyDetailsErrors);
    Object.assign(newFieldErrors, partyDetailsErrors);
    if (!partyDetailsErrors) {
      hasError = true;
    }

    // const PANDetailsErrors = validatePANDetails();
    // Object.assign(newFieldErrors, PANDetailsErrors);
    // if (!PANDetailsErrors) {
    //   hasError = true;
    // }

    // Set field errors state
    setFieldErrors(newFieldErrors);

    return !hasError;
  };

  const handleSavePartyDetails = () => {
    const isValid = validatePartyDetails();

    if (isValid) {
      // Proceed with save logic
      console.log("Saving Location / Contact Details:", formData);
      handleDialogClose();
      // Example: saveFormDataToBackend(formData);
    } else {
      console.log("Form has errors. Cannot save.");
      // Optionally handle errors or display a message
    }
  };

  const handlePANDetails = () => {
    const isValid = validatePANDetails();

    if (isValid) {
      // Proceed with save logic
      console.log("Saving Location / Contact Details:", formData);
      // Example: saveFormDataToBackend(formData);
      handleDialogClose();
    } else {
      console.log("Form has errors. Cannot save.");
      // Optionally handle errors or display a message
    }
  };

  const handleCreditDetails = () => {
    console.log("Credit Save");
    handleDialogClose();
  };

  const handleTaxDetails = () => {
    console.log("Tax Save");
    handleDialogClose();
  };

  const handleBankDetails = () => {
    console.log("Bank Save");
    handleDialogClose();
  };

  // -----------------------------------------------FIELD ERRORS AND VALIDATION END---------------------------------------------

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
    setFieldErrors({
      ...fieldErrors,
      [name]: false,
    });
  };

  const handleRBIRegDateChange = (date) => {
    setFormData((prevData) => ({
      ...prevData,
      dRBIRegDate: date,
    }));
  };

  const handleSectionEdit = (section) => {
    setOpenSectionDialog(section);
  };

  const handleDialogClose = () => {
    setOpenSectionDialog(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isValid = validateAllFields();
    if (isValid) {
      onSubmit(formData);
    } else {
      console.log("ERROR IN FORM DETAILS");
      showToast("Enter All Required Details!", "fail");
      setTimeout(() => {
        hideToast();
      }, 2000);
    }
  };

  useEffect(() => {
    if (openSectionDialog === "Counter Link") {
      const fetchBC = async () => {
        try {
          const response = await apiClient.post(
            `/pages/Master/SystemSetup/BranchCounterLink`,
            { nBranchID: initialData.nBranchID }
          );
          const data = response.data.map((row, index) => ({
            id: row.nCounterID, // use nCounterID as unique identifier
            ...row,
          }));
          setBCRows(data);
        } catch (error) {
          console.error("Error fetching data", error);
        }
      };
      fetchBC();
    }
  }, [openSectionDialog]);

  // useEffect(() => {
  //   if (openSectionDialog === "Product Link") {
  //     const fetchBP = async () => {
  //       try {
  //         const response = await apiClient.post(
  //           `/pages/Master/SystemSetup/BranchProductLink`,
  //           { nBranchID: initialData.nBranchID }

  //         );
  //         const data = response.data.map((row, index) => ({
  //           id: index, // unique identifier for the row
  //           ...row,
  //         }));
  //         setBPRows(data);
  //       } catch (error) {
  //         console.error("Error fetching data", error);
  //       }
  //     };
  //     fetchBP();
  //   }
  // }, [openSectionDialog]);

  useEffect(() => {
    if (openSectionDialog === "Product Link") {
      const fetchProducts = async () => {
        try {
          // Get all products
          const productsResponse = await apiClient.get(
            "/pages/Master/SystemSetup/BranchProducts"
          );
          const branchResponse = await apiClient.post(
            "/pages/Master/SystemSetup/BranchProductLink",
            { nBranchID: initialData.nBranchID }
          );

          const products = productsResponse.data.map((product) => ({
            ...product,
            id: product.nProductID,
            bActive: false,
            bRevEffect: false,
          }));

          // Mark products that are linked to the branch
          branchResponse.data.forEach((branchProduct) => {
            const product = products.find(
              (p) => p.PRODUCTCODE === branchProduct.vProductCode
            );
            if (product) {
              product.bActive = branchProduct.bActive;
              product.bRevEffect = branchProduct.bRevEffect;
              product.nBranchProductLinkID = branchProduct.nBranchProductLinkID;
            }
          });

          setAllProducts(products);
          setBPRows(branchResponse.data);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchProducts();
    }
  }, [openSectionDialog, initialData]);

  const renderSectionFields = () => {
    switch (openSectionDialog) {
      case "Location / Contact Details":
        return (
          <>
            <CustomTextField
              name="vAddress1"
              label="Address 1"
              value={formData.vAddress1}
              onChange={handleChange}
              fullWidth
            />
            <CustomTextField
              name="vAddress2"
              label="Address 2"
              value={formData.vAddress2}
              onChange={handleChange}
              fullWidth
            />
            <CustomTextField
              name="vAddress3"
              label="Address 3"
              value={formData.vAddress3}
              onChange={handleChange}
              fullWidth
            />
            <CustomTextField
              select={true}
              name="vOperationalGrp"
              label="Operational Group"
              value={formData.vOperationalGrp}
              onChange={handleChange}
              fullWidth
              style={{ width: isMobile ? "64vw" : "12vw" }}
            >
              <MenuItem value="" key="Select7">
                Select
              </MenuItem>
              {OperationalGrpOptions &&
                OperationalGrpOptions.map((item) => (
                  <MenuItem value={item.value} key={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
            </CustomTextField>

            <CustomTextField
              // select={true}
              name="vLocation"
              label="Location"
              value={formData.vLocation}
              onChange={handleChange}
              fullWidth
              style={{ width: isMobile ? "64vw" : "12vw" }}
            ></CustomTextField>

            <CustomAutocomplete
              id="CitySelect"
              getOptionKey={(option) => option.key}
              options={cityOptions}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) =>
                option.value === value.value
              }
              value={formData.vCity}
              onChange={(event, newValue) => {
                console.log("Selected City:", newValue.value); // Debug log
                setFormData((prevData) => ({
                  ...prevData,
                  vCity: newValue,
                }));
              }}
              styleTF={{ width: isMobile ? "64vw" : "12vw" }}
              label="City"
            />

            <CustomTextField
              name="vPinCode"
              label="Pin Code"
              value={formData.vPinCode}
              onChange={handleChange}
              fullWidth
              style={{ width: isMobile ? "64vw" : "12vw" }}
            />

            <CustomTextField
              name="STDCode"
              label="STD Code"
              value={formData.STDCode}
              onChange={handleChange}
              fullWidth
              style={{ width: isMobile ? "64vw" : "12vw" }}
            />
            <CustomTextField
              name="vTelNo1"
              label="Phone Number 1"
              value={formData.vTelNo1}
              onChange={handleChange}
              fullWidth
              style={{ width: isMobile ? "64vw" : "12vw" }}
            />
            <CustomTextField
              name="vTelNo2"
              label="Phone Number 2"
              value={formData.vTelNo2}
              onChange={handleChange}
              fullWidth
              style={{ width: isMobile ? "64vw" : "12vw" }}
            />

            <CustomTextField
              name="vFaxNo1"
              label="Fax Number 1"
              value={formData.vFaxNo1}
              onChange={handleChange}
              fullWidth
              style={{ width: isMobile ? "64vw" : "12vw" }}
            />

            <CustomTextField
              name="vFaxNo2"
              label="Fax Number 2"
              value={formData.vFaxNo2}
              onChange={handleChange}
              fullWidth
              style={{ width: isMobile ? "64vw" : "12vw" }}
            />

            <CustomTextField
              name="vEmailID"
              label="Email ID"
              value={formData.vEmailID}
              onChange={handleChange}
              fullWidth
              style={{ width: isMobile ? "64vw" : "12vw" }}
            />

            <CustomTextField
              select={true}
              name="nLocationType"
              label="Location Type"
              value={formData.nLocationType}
              onChange={handleChange}
              fullWidth
              style={{ width: isMobile ? "64vw" : "12vw" }}
            >
              <MenuItem value="" key="Select7">
                Select
              </MenuItem>
              {locationTypeOptions &&
                locationTypeOptions.map((item) => (
                  <MenuItem value={item.value} key={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
            </CustomTextField>

            <CustomTextField
              name="vContactPerson"
              label="Contact Person"
              value={formData.vContactPerson}
              onChange={handleChange}
              fullWidth
              style={{ width: isMobile ? "64vw" : "12vw" }}
            />
            <CustomTextField
              name="vContactPersonNo"
              label="Contact Person Number"
              value={formData.vContactPersonNo}
              onChange={handleChange}
              fullWidth
              style={{ width: isMobile ? "64vw" : "12vw" }}
            />
          </>
        );
      case "Settings":
        return (
          <>
            <CustomTextField
              select={true}
              name="nOperationalUserID"
              label="Operational User"
              value={formData.nOperationalUserID}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="" key="Select7">
                Select
              </MenuItem>
              {userOptions &&
                userOptions.map((item) => (
                  <MenuItem value={item.value} key={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
            </CustomTextField>

            <CustomTextField
              select={true}
              name="nAccountUSERID"
              label="A/C User Incharge"
              value={formData.nAccountUSERID}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="" key="Select7">
                Select
              </MenuItem>
              {userOptions &&
                userOptions.map((item) => (
                  <MenuItem value={item.value} key={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
            </CustomTextField>

            <CustomTextField
              name="vAIINO"
              label="A-II Number"
              value={formData.vAIINO}
              onChange={handleChange}
              fullWidth
            />

            <CustomTextField
              name="vWUAIINo"
              label="WU A-II Number"
              value={formData.vWUAIINo}
              onChange={handleChange}
              fullWidth
            />
            <CustomCheckbox
              name="bServiceTaxApplicable"
              checked={formData.bServiceTaxApplicable}
              onChange={handleChange}
              label="Service Tax Applicable"
            />
            <CustomTextField
              disabled={formData.bServiceTaxApplicable === false}
              name="vServiceTaxRegNo"
              label="Service Tax Reg Number"
              value={formData.vServiceTaxRegNo}
              onChange={handleChange}
              fullWidth
            />

            <CustomTextField
              select={true}
              name="nAttachedToBranchID"
              label="Branch Attached To"
              value={formData.nAttachedToBranchID}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="" key="Select8">
                Select
              </MenuItem>
              {branchOptions &&
                branchOptions.map((item) => (
                  <MenuItem value={item.value} key={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
            </CustomTextField>
            <CustomTextField
              select={true}
              name="nWUBranchID"
              label="WU A/c Branch Posting"
              value={formData.nWUBranchID}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="" key="Select9">
                Select
              </MenuItem>
              {branchOptions &&
                branchOptions.map((item) => (
                  <MenuItem value={item.value} key={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
            </CustomTextField>

            <CustomTextField
              name="nCashLimit"
              label="Cash Limit"
              value={formData.nCashLimit}
              onChange={handleChange}
              fullWidth
            />
            <CustomTextField
              name="nCurrencyLimit"
              label="Currency Limit"
              value={formData.nCurrencyLimit}
              onChange={handleChange}
              fullWidth
            />

            <CustomTextField
              name="ntempCashLimit"
              label="Temp Cash Limit"
              value={formData.ntempCashLimit}
              onChange={handleChange}
              fullWidth
            />

            <CustomTextField
              name="ntempCurrencyLimit"
              label="Temp Currency Limit"
              value={formData.ntempCurrencyLimit}
              onChange={handleChange}
              fullWidth
            />

            <CustomCheckbox
              name="bHasShifts"
              checked={formData.bHasShifts}
              onChange={handleChange}
              label="Branch Has Shifts"
            />
          </>
        );
      case "IBM Details":
        return (
          <>
            <CustomTextField
              name="vIBMNo1"
              label="IBM HO 1"
              value={formData.vIBMNo1}
              onChange={handleChange}
              fullWidth
            />

            <CustomTextField
              name="vIBMNo2"
              label="IBM HO 2"
              value={formData.vIBMNo2}
              onChange={handleChange}
              fullWidth
            />

            <CustomTextField
              select={true}
              name="nBranchIBMID"
              label="IBM Branch"
              value={formData.nBranchIBMID}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="" key="Select9">
                Select
              </MenuItem>
              {branchOptions &&
                branchOptions.map((item) => (
                  <MenuItem value={item.value} key={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
            </CustomTextField>
          </>
        );

      case "Counter Link":
        return (
          <Box width={"100%"}>
            <Box display={"flex"} flexDirection={"column"}>
              <p style={{ color: Colortheme.text }}>
                Branch : {initialData.vBranchCode}
              </p>
              <p style={{ color: Colortheme.text }}>
                (Check the box to link the respective counter)
              </p>
            </Box>
            <DataGrid
              rows={bcRows}
              columns={bcColumns}
              pageSize={5}
              disableRowSelectionOnClick
              disableColumnFilter
              getRowId={(row) => row.id}
              sortModel={[
                {
                  field: "id",
                  sort: "asc",
                },
              ]}
              sx={{
                backgroundColor: Colortheme.background,
                width: isMobile ? "95vw" : "100%",
                height: "auto",
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
        );

      case "Product Link":
        return (
          <Box width={"100%"}>
            <Box display={"flex"} flexDirection={"column"}>
              <p style={{ color: Colortheme.text }}>
                Branch : {initialData.vBranchCode}
              </p>
              <p style={{ color: Colortheme.text }}>
                (Check the box to link the respective Product)
              </p>
            </Box>
            <DataGrid
              rows={allProducts}
              columns={bpColumns}
              pageSize={5}
              disableRowSelectionOnClick
              disableColumnFilter
              getRowId={(row) => row.id}
              sortModel={[
                {
                  field: "PRODUCTCODE",
                  sort: "asc",
                },
              ]}
              sx={{
                backgroundColor: Colortheme.background,
                // p: isMobile ? "10px" : "20px",
                width: isMobile ? "95vw" : "100%",
                height: "auto",
                // maxWidth: isMobile ? "75vw" : "100%",
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
        );

      // case "Division Link":
      //   return (
      //     <Box width={"100%"}>
      //       <Box display={"flex"} flexDirection={"column"}>
      //         <p style={{ color: Colortheme.text }}>
      //           Branch : {initialData.vBranchCode}
      //         </p>
      //         <p style={{ color: Colortheme.text }}>
      //           (Check the box to link the respective Product)
      //         </p>
      //       </Box>
      //       <DataGrid
      //         rows={bpRows}
      //         columns={bpColumns}
      //         pageSize={5}
      //         disableRowSelectionOnClick
      //         disableColumnFilter
      //         getRowId={(row) => row.id}
      //         sortModel={[
      //           {
      //             field: "id",
      //             sort: "asc",
      //           },
      //         ]}
      //         sx={{
      //           backgroundColor: Colortheme.background,
      //           // p: isMobile ? "10px" : "20px",
      //           width: isMobile ? "95vw" : "70vw",
      //           height: "auto",
      //           // maxWidth: isMobile ? "75vw" : "100%",
      //           border: "2px solid",
      //           borderColor: Colortheme.background,
      //           "& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnHeaderTitleContainer":
      //             {
      //               display: "none",
      //             },
      //           "& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell": {
      //             backgroundColor: Colortheme.background,
      //             color: Colortheme.text,
      //           },
      //           "& .MuiDataGrid-root": {
      //             color: Colortheme.text,
      //           },
      //           "& .MuiTablePagination-root": {
      //             color: Colortheme.text,
      //           },
      //           "& .MuiSvgIcon-root": {
      //             color: Colortheme.text,
      //           },
      //           "& .MuiDataGrid-toolbarContainer": {
      //             color: Colortheme.text,
      //           },
      //           "& .MuiDataGrid-footerContainer": {
      //             backgroundColor: Colortheme.background,
      //           },
      //           "& .MuiButtonBase-root": {
      //             color: Colortheme.text,
      //           },
      //         }}
      //         initialState={{
      //           pagination: {
      //             paginationModel: { page: 0, pageSize: 5 },
      //           },
      //         }}
      //         pageSizeOptions={[5, 10]}
      //       />
      //     </Box>
      //   );

      default:
        return null;
    }
  };

  const handleClose = (event, reason) => {
    if (reason && reason === "backdropClick") return;
    handleDialogClose();
  };

  const bcColumns = [
    { field: "nCounterID", headerName: "Counter ID", width: 150 },
    // { field: "vCounterName", headerName: "Counter Name", width: 150 },
    {
      field: "bIsActive",
      headerName: "Active",
      width: 120,
      renderCell: (params) => (
        <CustomCheckbox
          checked={params.value}
          onChange={(event) => handleBcCheckboxChange(params, event)}
        />
      ),
    },
  ];

  // const bpColumns = [
  //   { field: "vProductCode", headerName: "Product", width: 150 },
  //   {
  //     field: "bActive",
  //     headerName: "Active",
  //     width: 120,
  //     renderCell: (params) => (
  //       <CustomCheckbox
  //         checked={params.value}
  //         onChange={(event) => handleBpCheckboxChange(params, event)}
  //       />
  //     ),
  //   },
  //   {
  //     field: "bRevEffect",
  //     headerName: "Reversal Effect",
  //     width: 120,
  //     renderCell: (params) => (
  //       <CustomCheckbox
  //         checked={params.value}
  //         onChange={(event) => handleBpRevCheckboxChange(params, event)}
  //       />
  //     ),
  //   },
  // ];

  const bpColumns = [
    {
      field: "PRODUCTCODE", // Changed from vProductCode to match the new data structure
      headerName: "Product",
      width: 150,
    },
    {
      field: "bActive",
      headerName: "Active",
      width: 120,
      renderCell: (params) => (
        <CustomCheckbox
          checked={params.value || false}
          onChange={(event) => handleBpCheckboxChange(params, event)}
        />
      ),
    },
    {
      field: "bRevEffect",
      headerName: "Reversal Effect",
      width: 120,
      renderCell: (params) => (
        <CustomCheckbox
          checked={params.value || false}
          onChange={(event) => handleBpRevCheckboxChange(params, event)}
        />
      ),
    },
  ];

  // const handleBcCheckboxChange = async (params, event) => {
  //   const newIsActive = !params.row.bIsActive;
  //   try {
  //     // Update the state
  //     setBCRows((prevRows) =>
  //       prevRows.map((row) =>
  //         row.id === params.id ? { ...row, bIsActive: newIsActive } : row
  //       )
  //     );

  //     // Send update request to the backend
  //     await apiClient.put(
  //       `${baseUrl}/pages/Master/SystemSetup/BranchCounterLink`,
  //       {
  //         nCounterID: params.row.nCounterID,
  //         nBranchID: params.row.nBranchID,
  //         bIsActive: newIsActive,
  //       },
  //       {
  //         headers: {
  //           Authorization: "Bearer " + token,
  //         },
  //       }
  //     );
  //   } catch (error) {
  //     console.error("Error updating data", error);
  //   }
  // };

  // const handleBcCheckboxChange = async (params, event) => {
  //   const newIsActive = !params.row.bIsActive;
  //   try {
  //     // Update the state
  //     setBCRows((prevRows) =>
  //       prevRows.map((row) =>
  //         row.id === params.id ? { ...row, bIsActive: newIsActive } : row
  //       )
  //     );

  //     // Send update request to the backend
  //     await apiClient.put(
  //       `${baseUrl}/pages/Master/SystemSetup/BranchCounterLink`,
  //       {
  //         nCounterID: params.row.nCounterID,
  //         nBranchID: initialData.nBranchID,
  //         bIsActive: newIsActive,
  //       },
  //       {
  //         headers: {
  //           Authorization: "Bearer " + token,
  //         },
  //       }
  //     );
  //   } catch (error) {
  //     console.error("Error updating data", error);
  //   }
  // };

  // Function to handle checkbox state change
  const handleBcCheckboxChange = (params, event) => {
    const newIsActive = !params.row.bIsActive;

    // Update the state
    setBCRows((prevRows) =>
      prevRows.map((row) =>
        row.id === params.id ? { ...row, bIsActive: newIsActive } : row
      )
    );

    // Add the change to the pending changes list
    setPendingBCChanges((prevChanges) => [
      ...prevChanges,
      {
        nCounterID: params.row.nCounterID,
        nBranchID: initialData.nBranchID,
        bIsActive: newIsActive,
      },
    ]);
  };

  // Function to save the changes to the database
  const saveBCChanges = async () => {
    try {
      await Promise.all(
        pendingBCChanges.map((change) =>
          apiClient.put(`/pages/Master/SystemSetup/BranchCounterLink`, change)
        )
      );

      // Clear the pending changes after successful save
      setPendingBCChanges([]);
      console.log("Changes saved successfully");
      showToast("Changes saved successfully", "success");
      setTimeout(() => {
        hideToast();
      }, 2000);
    } catch (error) {
      console.error("Error saving changes", error);
      showToast("Error saving changes", "error");
      setTimeout(() => {
        hideToast();
      }, 2000);
    }
  };

  const handleBpCheckboxChange = (params, event) => {
    const newIsActive = event.target.checked;

    // Update allProducts state
    setAllProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === params.row.id
          ? { ...product, bActive: newIsActive }
          : product
      )
    );

    // Add or update the change in the pending changes list
    setPendingBpChanges((prevChanges) => {
      const existingChangeIndex = prevChanges.findIndex(
        (change) => change.PRODUCTCODE === params.row.PRODUCTCODE
      );

      const changeData = {
        nBranchProductLinkID: params.row.nBranchProductLinkID || null,
        PRODUCTCODE: params.row.PRODUCTCODE,
        bActive: newIsActive,
        bRevEffect: params.row.bRevEffect || false,
        vBranchCode: initialData.vBranchCode,
        nBranchID: initialData.nBranchID,
      };

      if (existingChangeIndex !== -1) {
        // Update existing change
        const updatedChanges = [...prevChanges];
        updatedChanges[existingChangeIndex] = {
          ...updatedChanges[existingChangeIndex],
          ...changeData,
        };
        return updatedChanges;
      }

      // Add new change
      return [...prevChanges, changeData];
    });
  };

  const handleBpRevCheckboxChange = (params, event) => {
    const newRevEffect = event.target.checked;

    // Update allProducts state
    setAllProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === params.row.id
          ? { ...product, bRevEffect: newRevEffect }
          : product
      )
    );

    // Add or update the change in the pending changes list
    setPendingBpChanges((prevChanges) => {
      const existingChangeIndex = prevChanges.findIndex(
        (change) => change.PRODUCTCODE === params.row.PRODUCTCODE
      );

      const changeData = {
        nBranchProductLinkID: params.row.nBranchProductLinkID || null,
        PRODUCTCODE: params.row.PRODUCTCODE,
        bActive: params.row.bActive || false,
        bRevEffect: newRevEffect,
        vBranchCode: initialData.vBranchCode,
        nBranchID: initialData.nBranchID,
      };

      if (existingChangeIndex !== -1) {
        // Update existing change
        const updatedChanges = [...prevChanges];
        updatedChanges[existingChangeIndex] = {
          ...updatedChanges[existingChangeIndex],
          ...changeData,
        };
        return updatedChanges;
      }

      // Add new change
      return [...prevChanges, changeData];
    });
  };

  const saveBpChanges = async () => {
    try {
      await Promise.all(
        pendingBpChanges.map(async (change) => {
          if (change.nBranchProductLinkID) {
            // Update existing record
            return apiClient.put(
              `/pages/Master/SystemSetup/BranchProductLink`,
              change
            );
          } else {
            // Insert new record
            return apiClient.post(
              `/pages/Master/SystemSetup/BranchProductLink/new`,
              change
            );
          }
        })
      );

      // Refresh the data after saving
      if (openSectionDialog === "Product Link") {
        const productsResponse = await apiClient.get(
          "/pages/Master/SystemSetup/BranchProducts"
        );
        const branchResponse = await apiClient.post(
          "/pages/Master/SystemSetup/BranchProductLink",
          { nBranchID: initialData.nBranchID }
        );

        const products = productsResponse.data.map((product) => ({
          ...product,
          id: product.nProductID,
          bActive: false,
          bRevEffect: false,
        }));

        // Update active status based on branch response
        branchResponse.data.forEach((branchProduct) => {
          const product = products.find(
            (p) => p.PRODUCTCODE === branchProduct.vProductCode
          );
          if (product) {
            product.bActive = branchProduct.bActive;
            product.bRevEffect = branchProduct.bRevEffect;
            product.nBranchProductLinkID = branchProduct.nBranchProductLinkID;
          }
        });

        setAllProducts(products);
        setBPRows(branchResponse.data);
      }

      // Clear the pending changes after successful save
      setPendingBpChanges([]);
      showToast("Changes saved successfully", "success");
      setTimeout(() => {
        hideToast();
      }, 2000);

      console.log("Branch product link changes saved successfully");
    } catch (error) {
      showToast("Error saving changes", "error");
      setTimeout(() => {
        hideToast();
      }, 2000);
      console.error("Error saving branch product link changes", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box
        display={"grid"}
        sx={{
          overflowX: "hidden",
          backgroundColor: Colortheme.background,
        }}
        gridTemplateColumns={isMobile ? "repeat(1, 1fr)" : "repeat(4, 1fr)"}
        gridTemplateRows={"repeat(3, 1fr)"}
        columnGap={"60px"}
        rowGap={"40px"}
        p={2}
      >
        <CustomTextField
          select={true}
          name="nCompID"
          label="Company Name"
          value={formData.nCompID}
          onChange={handleChange}
          fullWidth
          disabled
        >
          <MenuItem value="" key="companyRecordOption">
            Select
          </MenuItem>
          {companyRecordOption &&
            companyRecordOption.map((item) => (
              <MenuItem value={item.value} key={item.value}>
                {item.label}
              </MenuItem>
            ))}
        </CustomTextField>

        <CustomTextField
          name="vBranchCode"
          label="Branch Code"
          value={formData.vBranchCode}
          onChange={handleChange}
          fullWidth
          // style={isMobile ? { width: "100%" } : {}}
        />

        {initialData && (
          <CustomTextField
            disabled
            name="nBranchID"
            label="Branch Number"
            value={formData.nBranchID}
            onChange={handleChange}
            fullWidth
            // style={isMobile ? { width: "100%" } : {}}
          />
        )}

        <BoxButton
          isMobile={isMobile}
          onClick={() => handleSectionEdit("Location / Contact Details")}
          // style={{ width: isMobile ? "100%" : 200 }}
        >
          Location / Contact Details
        </BoxButton>

        <BoxButton
          isMobile={isMobile}
          onClick={() => handleSectionEdit("Settings")}
          // style={{ width: isMobile ? "100%" : 200 }}
        >
          Settings
        </BoxButton>

        <BoxButton
          isMobile={isMobile}
          onClick={() => handleSectionEdit("IBM Details")}
          // style={{ width: isMobile ? "100%" : 200 }}
        >
          IBM Details
        </BoxButton>

        <CustomTextField
          name="vRBILicenseNo"
          label="RBI License Number"
          value={formData.vRBILicenseNo}
          onChange={handleChange}
          fullWidth
          // style={isMobile ? { width: "100%" } : {}}
        />

        <CustomDatePicker
          name="dRBIRegDate"
          label="RBI Reg Date"
          value={formData.dRBIRegDate}
          onChange={handleRBIRegDateChange}
        />

        <CustomTextField
          name="nLastTCSettRefNo"
          label="Last Settlement Ref"
          value={formData.nLastTCSettRefNo}
          onChange={handleChange}
          fullWidth
          // style={isMobile ? { width: "100%" } : {}}
        />

        <CustomTextField
          name="vAuthorizedSignatory"
          label="Authorized Signatory"
          value={formData.vAuthorizedSignatory}
          onChange={handleChange}
          fullWidth
          // style={isMobile ? { width: "100%" } : {}}
        />

        {initialData && (
          <>
            <BoxButtonLink
              isMobile={isMobile}
              onClick={() => handleSectionEdit("Counter Link")}
              // style={{ width: isMobile ? "100%" : 200 }}
            >
              Counter Link
            </BoxButtonLink>

            <BoxButtonLink
              isMobile={isMobile}
              onClick={() => handleSectionEdit("Product Link")}
              // style={{ width: isMobile ? "100%" : 200 }}
            >
              Product Link
            </BoxButtonLink>

            {/* <Box>
              <BoxButtonLink
                isMobile={isMobile}
                onClick={() => handleSectionEdit("Division Link")}
                style={{ width: isMobile ? "100%" : 200 }}
              >
                Division Link
              </BoxButtonLink>
            </Box> */}
          </>
        )}

        <CustomCheckbox
          name="bActive"
          checked={formData.bActive}
          onChange={handleChange}
          label="Active"
        />
      </Box>
      <Box display={"flex"} justifyContent={"center"} marginTop={5}>
        <Box
          display={"flex"}
          width={isMobile ? "100%" : "60%"}
          gap={5}
          justifyContent={"center"}
        >
          <StyledButton onClick={onCancel}>Cancel</StyledButton>
          <StyledButton type="submit" variant="contained" color="primary">
            Submit
          </StyledButton>
        </Box>
      </Box>

      <Dialog
        open={!!openSectionDialog}
        onClose={handleClose}
        maxWidth={false}
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            padding: 2,
            width: "80vw",
            backgroundColor: Colortheme.background,
            overflowX: "hidden",
            border: `1px solid ${Colortheme.text}`,
            borderRadius: "15px",
          },
        }}
      >
        <DialogTitle
          sx={{
            width: isMobile ? "80%" : "95%",
            alignSelf: "center",
            display: "flex",
            justifyContent: "center",
            color: Colortheme.text,
            border: `1px solid ${Colortheme.text}`,
            borderRadius: "10px",
            fontFamily: "Poppins",
            fontWeight: 400,
          }}
        >
          {openSectionDialog ? `Edit ${openSectionDialog}` : openSectionDialog}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              // height: '60vh',
              marginTop: 2,
              border: isMobile ? "none" : `1px solid ${Colortheme.text}`,
              borderRadius: "10px",
              padding: 5,
              width: isMobile ? "100%" : "auto",

              paddingLeft: isMobile ? 0 : 5,
              display: isMobile ? "flex" : "grid",
              flexDirection: "column",
              overflow: "initial",

              backgroundColor: Colortheme.background,
              gridTemplateColumns:
                openSectionDialog === "Counter Link" ||
                openSectionDialog === "Product Link"
                  ? "none"
                  : isMobile
                  ? "repeat(1, 1fr)"
                  : "repeat(4, 1fr)",
              rowGap: 3,
            }}
          >
            {renderSectionFields()}
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            alignSelf: "center",
            display: "flex",
            justifyContent: "center",
            width: isMobile ? "100%" : "50%",
            gap: isMobile ? 3 : 10,
            marginTop: 2,
          }}
        >
          {/* <StyledButton onClick={handleDialogClose}>Cancel</StyledButton> */}

          <StyledButton onClick={handleDialogClose}>
            {openSectionDialog === "Counter Link" ||
            openSectionDialog === "Division Link" ||
            openSectionDialog === "Product Link"
              ? "Close"
              : "Cancel"}
          </StyledButton>

          {openSectionDialog === "Location / Contact Details" && (
            <StyledButton
              onClick={handleSavePartyDetails}
              variant="contained"
              color="primary"
            >
              Save
            </StyledButton>
          )}

          {openSectionDialog === "PAN Details" && (
            <StyledButton
              onClick={handlePANDetails}
              variant="contained"
              color="primary"
            >
              Save
            </StyledButton>
          )}

          {openSectionDialog === "Settings" && (
            <StyledButton
              onClick={handleCreditDetails}
              variant="contained"
              color="primary"
            >
              Save
            </StyledButton>
          )}

          {openSectionDialog === "IBM Details" && (
            <StyledButton
              onClick={handleTaxDetails}
              variant="contained"
              color="primary"
            >
              Save
            </StyledButton>
          )}

          {openSectionDialog === "Bank Details" && (
            <StyledButton
              onClick={handleBankDetails}
              variant="contained"
              color="primary"
            >
              Save
            </StyledButton>
          )}

          {openSectionDialog === "Counter Link" && (
            <StyledButton
              onClick={saveBCChanges}
              variant="contained"
              color="primary"
            >
              Save
            </StyledButton>
          )}

          {openSectionDialog === "Product Link" && (
            <StyledButton
              onClick={saveBpChanges}
              variant="contained"
              color="primary"
            >
              Save
            </StyledButton>
          )}
        </DialogActions>
      </Dialog>
    </form>
  );
};

export default BranchLocationForm;
