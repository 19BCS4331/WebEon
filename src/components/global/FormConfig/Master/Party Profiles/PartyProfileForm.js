import React, { useState, useEffect, useContext } from "react";
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
} from "@mui/material";
import dayjs from "dayjs";
import CustomTextField from "../../../CustomTextField";
import CustomDatePicker from "../../../CustomDatePicker";
import CustomCheckbox from "../../../CustomCheckbox";
import { useParams } from "react-router-dom";
import axios from "axios";
import ThemeContext from "../../../../../contexts/ThemeContext";
import styled from "styled-components";
import StyledButton from "../../../StyledButton";
import { useToast } from "../../../../../contexts/ToastContext";
import { useBaseUrl } from "../../../../../contexts/BaseUrl";

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
  &:hover {
    background-color: ${(props) => props.theme.text};
    color: ${(props) => props.theme.background};
    border-radius: 10px;
    font-size: 15px;
  }
`;

const PartyProfileForm = ({ initialData, onSubmit, onCancel }) => {
  const { vType } = useParams();
  const [groupOptions, setGroupOptions] = useState([]);
  const [entityOptions, setEntityOptions] = useState([]);
  const [bnOptions, setBNOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [MrktExecOptions, setMrktExecOptions] = useState([]);
  const [BranchOptions, setBranchOptions] = useState([]);
  const { Colortheme } = useContext(ThemeContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { showToast, hideToast } = useToast();
  const { baseUrl } = useBaseUrl();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (vType) {
      axios
        .get(
          `${baseUrl}/pages/Master/PartyProfiles/GroupOptions?vType=${vType}`,
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        )
        .then((response) => {
          setGroupOptions(response.data);
          // setLoading(false);
        })
        .catch((error) => {
          console.log(error);
          // setLoading(false);
        });
    }
  }, [vType]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (vType === "AD") {
      axios
        .get(`${baseUrl}/pages/Master/PartyProfiles/EntityOptions/AD`, {
          headers: {
            Authorization: "Bearer " + token,
          },
        })
        .then((response) => {
          setEntityOptions(response.data);
          // setLoading(false);
        })
        .catch((error) => {
          console.log(error);
          // setLoading(false);
        });
    } else {
      axios
        .get(`${baseUrl}/pages/Master/PartyProfiles/EntityOptions`, {
          headers: {
            Authorization: "Bearer " + token,
          },
        })
        .then((response) => {
          setEntityOptions(response.data);
          // setLoading(false);
        })
        .catch((error) => {
          console.log(error);
          // setLoading(false);
        });
    }
  }, [vType]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (vType) {
      axios
        .get(`${baseUrl}/pages/Master/PartyProfiles/BankNatureOptions`, {
          headers: {
            Authorization: "Bearer " + token,
          },
        })
        .then((response) => {
          setBNOptions(response.data);
          // setLoading(false);
        })
        .catch((error) => {
          console.log(error);
          // setLoading(false);
        });
    }
  }, [vType]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (vType) {
      axios
        .get(`${baseUrl}/pages/Master/PartyProfiles/StateOptions`, {
          headers: {
            Authorization: "Bearer " + token,
          },
        })
        .then((response) => {
          setStateOptions(response.data);
          // setLoading(false);
        })
        .catch((error) => {
          console.log(error);
          // setLoading(false);
        });
    }
  }, [vType]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (vType) {
      axios
        .get(`${baseUrl}/pages/Master/PartyProfiles/MrktExecOptions`, {
          headers: {
            Authorization: "Bearer " + token,
          },
        })
        .then((response) => {
          setMrktExecOptions(response.data);
          // setLoading(false);
        })
        .catch((error) => {
          console.log(error);
          // setLoading(false);
        });
    }
  }, [vType]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (vType) {
      axios
        .get(`${baseUrl}/pages/Master/PartyProfiles/BranchOptions`, {
          headers: {
            Authorization: "Bearer " + token,
          },
        })
        .then((response) => {
          setBranchOptions(response.data);
          // setLoading(false);
        })
        .catch((error) => {
          console.log(error);
          // setLoading(false);
        });
    }
  }, [vType]);

  const [formData, setFormData] = useState({
    nCodesID: "",
    vCode: "",
    vName: "",
    vBranchCode: "",
    dIntdate: null,
    bActive: false,
    bIND: false,
    vAddress1: "",
    vAddress2: "",
    vAddress3: "",
    vPinCode: "",
    vPhone: "",
    vFax: "",
    vEmail: "",
    vDesign: "",
    vGrpcode: "",
    vEntityType: "",
    vBusinessNature: "",
    bSaleParty: false,
    bPurchaseParty: false,
    bEEFCClient: false,
    bPrintAddress: false,
    vLocation: "",
    vWebsite: "",
    vCreditPolicy: "",
    nCREDITLIM: "",
    nCREDITDAYS: null,
    nAddCreditLimit: "",
    nAddCreditDays: null,
    nTxnSaleLimit: "",
    nTxnPurLimit: "",
    nChqTxnlimt: "",
    vKYCApprovalNumber: "",
    vKYCRiskCategory: "L",
    nHandlingCharges: "",
    bTDSDED: "",
    nTDSPER: "",
    vTDSGroup: "",
    bServiceTax: "",
    bIGSTOnly: "",
    cGSTNO: "",
    sGSTNO: "",
    iGSTNO: "",
    vState: "",
    AccHolderName: "",
    BankName: "",
    AccNumber: "",
    IFSCCode: "",
    BankAddress: "",
    CancelledChequecopy: "",
    vPanName: "",
    dPanDOB: null,
    vPan: "",
    nMrktExecutive: "",
    nBranchID: "",
    bEnableBlockDate: false,
    dBlockDate: null,
    dEstblishDate: null,
    Remarks: "",
    vRegno: "",
    dRegdate: null,
    bExportParty: false,
    bEnforcement: false,
    vType: vType,
  });
  const [openSectionDialog, setOpenSectionDialog] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nCodesID: initialData.nCodesID || "",
        vCode: initialData.vCode || "",
        vName: initialData.vName || "",
        vBranchCode: initialData.vBranchCode || "",
        dIntdate: initialData.dIntdate ? dayjs(initialData.dIntdate) : null,
        bActive: initialData.bActive || false,
        bIND: initialData.bIND || false,
        vAddress1: initialData.vAddress1 || "",
        vAddress2: initialData.vAddress2 || "",
        vAddress3: initialData.vAddress3 || "",
        vPinCode: initialData.vPinCode || "",
        vPhone: initialData.vPhone || "",
        vFax: initialData.vFax || "",
        vEmail: initialData.vEmail || "",
        vDesign: initialData.vDesign || "",
        vGrpcode: initialData.vGrpcode || "",
        vEntityType: initialData.vEntityType || "",
        vBusinessNature: initialData.vBusinessNature || "",
        bSaleParty: initialData.bSaleParty || false,
        bPurchaseParty: initialData.bPurchaseParty || false,
        bEEFCClient: initialData.bEEFCClient || false,
        bPrintAddress: initialData.bPrintAddress || false,
        vLocation: initialData.vLocation || "",
        vWebsite: initialData.vWebsite || "",
        vCreditPolicy: initialData.vCreditPolicy || "",
        nCREDITLIM: initialData.nCREDITLIM || "",
        nCREDITDAYS: initialData.nCREDITDAYS ?? 0,
        nAddCreditLimit: initialData.nAddCreditLimit || "",
        nAddCreditDays: initialData.nAddCreditDays ?? 0,
        nTxnSaleLimit: initialData.nTxnSaleLimit || "",
        nTxnPurLimit: initialData.nTxnPurLimit || "",
        nChqTxnlimt: initialData.nChqTxnlimt || "",
        vKYCApprovalNumber: initialData.vKYCApprovalNumber || "",
        vKYCRiskCategory: initialData.vKYCRiskCategory || "L",
        nHandlingCharges: initialData.nHandlingCharges || "",
        bTDSDED: initialData.bTDSDED || "",
        nTDSPER: initialData.nTDSPER || "",
        vTDSGroup: initialData.vTDSGroup || "",
        bServiceTax: initialData.bServiceTax || false,
        cGSTNO: initialData.cGSTNO || "",
        sGSTNO: initialData.sGSTNO || "",
        iGSTNO: initialData.iGSTNO || "",
        vState: initialData.vState || "",
        AccHolderName: initialData.AccHolderName || "",
        BankName: initialData.BankName || "",
        AccNumber: initialData.AccNumber || "",
        IFSCCode: initialData.IFSCCode || "",
        BankAddress: initialData.BankAddress || "",
        CancelledChequecopy: initialData.CancelledChequecopy || "",
        vPanName: initialData.vPanName || "",
        dPanDOB: initialData.dPanDOB ? dayjs(initialData.dPanDOB) : null,
        vPan: initialData.vPan || "",
        bIGSTOnly: initialData.bIGSTOnly || false,
        nMrktExecutive: initialData.nMrktExecutive || "",
        nBranchID: initialData.nBranchID || "",
        dBlockDate: initialData.dBlockDate || null,
        dEstblishDate: initialData.dEstblishDate || null,
        bEnableBlockDate:
          initialData.dBlockDate || initialData.dEstblishDate ? true : false,
        Remarks: initialData.Remarks || "",
        vRegno: initialData.vRegno || "",
        dRegdate: initialData.dRegdate ? dayjs(initialData.dRegdate) : null,
        bExportParty: initialData.bExportParty || false,
        bEnforcement: initialData.bEnforcement || false,
        vType: vType,
      });
    }
  }, [initialData]);

  // -----------------------------------------------SAVING WITH FIELD ERRORS AND VALIDATION START---------------------------------------------

  const [fieldErrors, setFieldErrors] = useState({
    vCode: false,
    vName: false,
    vBranchCode: false,
    dIntdate: false,
    bActive: false,
    bIND: false,
    vAddress1: false,
    vAddress2: false,
    vAddress3: false,
    vPinCode: false,
    vPhone: false,
    vFax: false,
    vEmail: false,
    vDesign: false,
    vGrpcode: false,
    vEntityType: false,
    vBusinessNature: false,
    bSaleParty: false,
    bPurchaseParty: false,
    bEEFCClient: false,
    bPrintAddress: false,
    vLocation: false,
    vWebsite: false,
    vCreditPolicy: false,
    nCREDITLIM: false,
    nCREDITDAYS: false,
    nAddCreditLimit: false,
    nAddCreditDays: false,
    nTxnSaleLimit: false,
    nTxnPurLimit: false,
    nChqTxnlimt: false,
    vKYCApprovalNumber: false,
    vKYCRiskCategory: false,
    nHandlingCharges: false,
    bTDSDED: false,
    nTDSPER: false,
    vTDSGroup: false,
    bServiceTax: false,
    bIGSTOnly: false,
    cGSTNO: false,
    sGSTNO: false,
    iGSTNO: false,
    vState: false,
    AccHolderName: false,
    BankName: false,
    AccNumber: false,
    IFSCCode: false,
    BankAddress: false,
    CancelledChequecopy: false,
    vPanName: false,
    dPanDOB: false,
    vPan: false,
    nMrktExecutive: false,
    nBranchID: false,
    bEnableBlockDate: false,
    dBlockDate: false,
    dEstblishDate: false,
    Remarks: false,
    vRegno: false,
    dRegdate: false,
    bExportParty: false,
    bEnforcement: false,
  });

  const validatePartyDetails = () => {
    let hasError = false;
    const errors = {};

    if (!formData.vCode.trim()) {
      errors.vCode = true;
      hasError = true;
    } else {
      errors.vCode = false;
    }

    if (!formData.vName.trim()) {
      errors.vName = true;
      hasError = true;
    } else {
      errors.vName = false;
    }

    if (formData.vPhone.trim().length > 10) {
      errors.vPhone = true;
      hasError = true;
    } else {
      errors.vPhone = false;
    }

    // Add more validations for Party Details section
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

    // Add more validations for Party Details section
    setFieldErrors(errors);
    return !hasError;
  };

  const validateAllFields = () => {
    let hasError = false;
    const newFieldErrors = {};

    if (formData.dIntdate === null) {
      newFieldErrors.dIntdate = true;
      hasError = true;
    } else {
      newFieldErrors.dIntdate = false;
    }

    // Validate Party Details section
    const partyDetailsErrors = validatePartyDetails();
    console.log("partyDetailsErrors", partyDetailsErrors);
    Object.assign(newFieldErrors, partyDetailsErrors);
    if (!partyDetailsErrors) {
      hasError = true;
    }

    const PANDetailsErrors = validatePANDetails();
    Object.assign(newFieldErrors, PANDetailsErrors);
    if (!PANDetailsErrors) {
      hasError = true;
    }

    // Set field errors state
    setFieldErrors(newFieldErrors);

    return !hasError;
  };

  const handleSavePartyDetails = () => {
    const isValid = validatePartyDetails();

    if (isValid) {
      // Proceed with save logic
      console.log("Saving Party Details:", formData);
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
      console.log("Saving Party Details:", formData);
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

  const handleDateChange = (date) => {
    setFormData((prevData) => ({
      ...prevData,
      dIntdate: date,
    }));
    setFieldErrors({
      ...fieldErrors,
      dIntdate: false,
    });
  };

  const handlePanDOBDateChange = (date) => {
    setFormData((prevData) => ({
      ...prevData,
      dPanDOB: date,
    }));
  };

  const handleBlockDateChange = (date) => {
    setFormData((prevData) => ({
      ...prevData,
      dBlockDate: date,
    }));
  };

  const handleEstblishDateChange = (date) => {
    setFormData((prevData) => ({
      ...prevData,
      dEstblishDate: date,
    }));
  };

  const handleRegDateChange = (date) => {
    setFormData((prevData) => ({
      ...prevData,
      dRegdate: date,
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

  const renderSectionFields = () => {
    switch (openSectionDialog) {
      case "Party Details":
        return (
          <>
            <CustomTextField
              name="vCode"
              label="Code"
              value={formData.vCode.toUpperCase()}
              onChange={handleChange}
              fullWidth
              error={fieldErrors.vCode}
              helperText={fieldErrors.vCode ? "Code Is Required!" : ""}
            />
            <CustomTextField
              name="vName"
              label="Name"
              value={formData.vName}
              onChange={handleChange}
              fullWidth
              error={fieldErrors.vName}
              helperText={fieldErrors.vName ? "Name Is Required!" : ""}
            />
            <CustomCheckbox
              name="bIND"
              label="Individual Category Customer (not a corporate client)"
              checked={formData.bIND}
              onChange={handleChange}
            />
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
              name="vPinCode"
              label="Pin Code"
              value={formData.vPinCode}
              onChange={handleChange}
              fullWidth
            />
            <CustomTextField
              name="vPhone"
              type="number"
              label="Phone Number"
              value={formData.vPhone}
              onChange={handleChange}
              error={fieldErrors.vPhone}
              fullWidth
              helperText={fieldErrors.vPhone ? "Enter A Valid Number!" : ""}
            />
            <CustomTextField
              name="vFax"
              label="Fax Number"
              value={formData.vFax}
              onChange={handleChange}
              fullWidth
            />
            <CustomTextField
              name="vEmail"
              label="Email"
              value={formData.vEmail}
              onChange={handleChange}
              fullWidth
            />
            <CustomTextField
              name="vDesign"
              label="Designation"
              value={formData.vDesign}
              onChange={handleChange}
              fullWidth
            />
            <CustomTextField
              select={true}
              name="vGrpcode"
              label="Group"
              value={formData.vGrpcode}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="" key="Select7">
                Select
              </MenuItem>
              {groupOptions &&
                groupOptions.map((item) => (
                  <MenuItem value={item.value} key={item.nMasterID}>
                    {item.label}
                  </MenuItem>
                ))}
            </CustomTextField>

            <CustomTextField
              select={true}
              name="vEntityType"
              label="Entity Type"
              value={formData.vEntityType}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="" key="Select">
                Select
              </MenuItem>
              {entityOptions &&
                entityOptions.map((item) => (
                  <MenuItem value={item.value} key={item.nMasterID}>
                    {item.label}
                  </MenuItem>
                ))}
            </CustomTextField>

            <CustomTextField
              select={true}
              name="vBusinessNature"
              label="Business Nature"
              value={formData.vBusinessNature}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="">Select</MenuItem>
              {bnOptions &&
                bnOptions.map((item) => (
                  <MenuItem value={item.value} key={item.nMasterID}>
                    {item.label}
                  </MenuItem>
                ))}
            </CustomTextField>

            <CustomTextField
              name="vLocation"
              label="Location"
              value={formData.vLocation}
              onChange={handleChange}
              fullWidth
            />

            <CustomTextField
              name="vWebsite"
              label="Website"
              value={formData.vWebsite}
              onChange={handleChange}
              fullWidth
            />

            <CustomTextField
              name="vKYCApprovalNumber"
              label="KYC Approval Number"
              value={formData.vKYCApprovalNumber}
              onChange={handleChange}
              fullWidth
            />
            <CustomTextField
              select={true}
              name="vKYCRiskCategory"
              label="KYC Risk Category"
              value={formData.vKYCRiskCategory}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="" key="Select2">
                Select
              </MenuItem>
              <MenuItem value="H" key="H">
                HIGH RISK CATEGORY
              </MenuItem>
              <MenuItem value="M" key="M">
                MEDIUM RISK CATEGORY
              </MenuItem>
              <MenuItem value="L" key="L">
                LOW RISK CATEGORY
              </MenuItem>
            </CustomTextField>

            <CustomCheckbox
              name="bSaleParty"
              label="Sale"
              checked={formData.bSaleParty}
              onChange={handleChange}
            />

            <CustomCheckbox
              name="bPurchaseParty"
              label="Purchase"
              checked={formData.bPurchaseParty}
              onChange={handleChange}
            />
            <CustomCheckbox
              name="bEEFCClient"
              label="EEFC Client"
              checked={formData.bEEFCClient}
              onChange={handleChange}
            />

            <CustomCheckbox
              name="bPrintAddress"
              label="Print Address"
              checked={formData.bPrintAddress}
              onChange={handleChange}
            />
          </>
        );
      case "Credit Details":
        return (
          <>
            <CustomTextField
              select={true}
              name="vCreditPolicy"
              label="Credit Policy"
              value={formData.vCreditPolicy}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="" key="Select3">
                Select
              </MenuItem>
              <MenuItem value="Branch" key="Branch">
                Branch
              </MenuItem>
              <MenuItem value="Company" key="Company">
                Company
              </MenuItem>
            </CustomTextField>

            <CustomTextField
              name="nCREDITLIM"
              label="Credit Limit"
              value={formData.nCREDITLIM}
              onChange={handleChange}
              fullWidth
            />

            <CustomTextField
              name="nCREDITDAYS"
              label="Credit Days"
              value={formData.nCREDITDAYS}
              onChange={handleChange}
              fullWidth
            />

            <CustomTextField
              name="nAddCreditLimit"
              label="Additional Credit Limit"
              value={formData.nAddCreditLimit}
              onChange={handleChange}
              fullWidth
            />

            <CustomTextField
              name="nAddCreditDays"
              label="Additional Credit Days"
              value={formData.nAddCreditDays}
              onChange={handleChange}
              fullWidth
            />

            <CustomTextField
              name="nTxnSaleLimit"
              label="Txn Limit (Sale)"
              value={formData.nTxnSaleLimit}
              onChange={handleChange}
              fullWidth
            />

            <CustomTextField
              name="nTxnPurLimit"
              label="Txn Limit (Purchase)"
              value={formData.nTxnPurLimit}
              onChange={handleChange}
              fullWidth
            />
            <CustomTextField
              name="nChqTxnlimt"
              label="Chq Txn Limit"
              value={formData.nChqTxnlimt}
              onChange={handleChange}
              fullWidth
            />
          </>
        );
      case "Tax & Charges Details":
        return (
          <>
            <CustomTextField
              name="nHandlingCharges"
              label="Handling Charges"
              value={formData.nHandlingCharges}
              onChange={handleChange}
              fullWidth
            />

            <CustomCheckbox
              name="bTDSDED"
              label="TDS Deducted ?"
              checked={formData.bTDSDED}
              onChange={handleChange}
            />

            <CustomTextField
              name="nTDSPER"
              label="TDS"
              value={formData.nTDSPER}
              onChange={handleChange}
              fullWidth
            />

            <CustomTextField
              select={true}
              name="vTDSGroup"
              label="TDS Group"
              value={formData.vTDSGroup}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="" key="Select4">
                Select
              </MenuItem>
              <MenuItem value="A" key="A">
                A
              </MenuItem>
            </CustomTextField>

            <CustomCheckbox
              name="bServiceTax"
              label="Apply Tax"
              checked={formData.bServiceTax}
              onChange={handleChange}
            />

            <CustomCheckbox
              name="bIGSTOnly"
              label="IGST Only"
              checked={formData.bIGSTOnly}
              onChange={handleChange}
            />

            <CustomTextField
              name="cGSTNO"
              label="CGST Number"
              value={formData.cGSTNO}
              onChange={handleChange}
              fullWidth
            />

            <CustomTextField
              name="sGSTNO"
              label="SGST Number"
              value={formData.sGSTNO}
              onChange={handleChange}
              fullWidth
            />

            <CustomTextField
              name="iGSTNO"
              label="IGST Number"
              value={formData.iGSTNO}
              onChange={handleChange}
              fullWidth
            />

            <CustomTextField
              select={true}
              name="vState"
              label="GST State"
              value={formData.vState}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="" key="Select5">
                Select
              </MenuItem>
              {stateOptions &&
                stateOptions.map((item) => (
                  <MenuItem value={item.value} key={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
            </CustomTextField>
          </>
        );
      case "Bank Details":
        return (
          <>
            <CustomTextField
              name="AccHolderName"
              label="Account Holder Name"
              value={formData.AccHolderName}
              onChange={handleChange}
              fullWidth
            />

            <CustomTextField
              name="BankName"
              label="Bank Name"
              value={formData.BankName}
              onChange={handleChange}
              fullWidth
            />

            <CustomTextField
              name="AccNumber"
              label="Account Number"
              value={formData.AccNumber}
              onChange={handleChange}
              fullWidth
            />

            <CustomTextField
              name="IFSCCode"
              label="IFSC Code"
              value={formData.IFSCCode}
              onChange={handleChange}
              fullWidth
            />

            <CustomTextField
              name="BankAddress"
              label="Bank Address"
              value={formData.BankAddress}
              onChange={handleChange}
              fullWidth
            />

            <CustomTextField
              name="CancelledChequecopy"
              label="Cancelled Cheque Copy"
              value={formData.CancelledChequecopy}
              onChange={handleChange}
              fullWidth
            />
          </>
        );
      case "PAN Details":
        return (
          <>
            <CustomTextField
              name="vPanName"
              label="PAN Name"
              value={formData.vPanName}
              onChange={handleChange}
              fullWidth
            />

            <CustomDatePicker
              name="dPanDOB"
              label="PAN DOB"
              value={formData.dPanDOB}
              onChange={handlePanDOBDateChange}
            />

            <CustomTextField
              name="vPan"
              label="PAN Number"
              value={formData.vPan.toUpperCase()}
              onChange={handleChange}
              fullWidth
              error={fieldErrors.vPan}
              helperText={fieldErrors.vPan ? "Enter Valid Pan Number!" : ""}
            />
          </>
        );
      default:
        return null;
    }
  };

  const handleClose = (event, reason) => {
    if (reason && reason === "backdropClick") return;
    handleDialogClose();
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
        <Box>
          <CustomDatePicker
            name="dIntdate"
            label="Intro Date"
            value={formData.dIntdate}
            onChange={handleDateChange}
            error={fieldErrors.dIntdate}
          />
        </Box>

        <Box>
          <BoxButton
            isMobile={isMobile}
            onClick={() => handleSectionEdit("Party Details")}
          >
            Party Details
          </BoxButton>
        </Box>

        <Box>
          <BoxButton
            isMobile={isMobile}
            onClick={() => handleSectionEdit("PAN Details")}
          >
            PAN Details
          </BoxButton>
        </Box>

        <Box>
          <BoxButton
            isMobile={isMobile}
            onClick={() => handleSectionEdit("Credit Details")}
          >
            Credit Details
          </BoxButton>
        </Box>

        <Box>
          <BoxButton
            isMobile={isMobile}
            onClick={() => handleSectionEdit("Tax & Charges Details")}
          >
            Tax & Charges Details
          </BoxButton>
        </Box>

        <Box>
          <BoxButton
            isMobile={isMobile}
            onClick={() => handleSectionEdit("Bank Details")}
          >
            Bank Details
          </BoxButton>
        </Box>

        <CustomTextField
          select={true}
          name="nMrktExecutive"
          label="Marketing Executive"
          value={formData.nMrktExecutive}
          onChange={handleChange}
          fullWidth
        >
          <MenuItem value="" key="Select6">
            Select
          </MenuItem>
          {MrktExecOptions &&
            MrktExecOptions.map((item) => (
              <MenuItem value={item.value} key={item.value}>
                {item.label}
              </MenuItem>
            ))}
        </CustomTextField>

        <CustomTextField
          select={true}
          name="nBranchID"
          label="Origin Branch"
          value={formData.nBranchID}
          onChange={handleChange}
          fullWidth
        >
          <MenuItem value={0}>ALL</MenuItem>
          {BranchOptions &&
            BranchOptions.map((item) => (
              <MenuItem value={item.value} key={item.value}>
                {item.label}
              </MenuItem>
            ))}
        </CustomTextField>

        <CustomCheckbox
          name="bEnableBlockDate"
          checked={formData.bEnableBlockDate}
          onChange={handleChange}
          label="Enable Block/Establishment Date"
        />

        <CustomDatePicker
          disabled={!formData.bEnableBlockDate}
          name="dBlockDate"
          label="Block From"
          value={formData.dBlockDate}
          onChange={handleBlockDateChange}
        />

        <CustomDatePicker
          disabled={!formData.bEnableBlockDate}
          name="dEstblishDate"
          label="Date Of Establishment"
          value={formData.dEstblishDate}
          onChange={handleEstblishDateChange}
        />

        {(vType === "FF" || vType === "BR") && (
          <CustomTextField
            name="vRegno"
            label="Reg Number"
            value={formData.vRegno}
            onChange={handleChange}
            fullWidth
          />
        )}

        {(vType === "FF" || vType === "BR") && (
          <CustomDatePicker
            name="dRegdate"
            label="Reg Date"
            value={formData.dRegdate}
            onChange={handleRegDateChange}
          />
        )}

        <CustomTextField
          name="Remarks"
          label="Remarks"
          value={formData.Remarks}
          onChange={handleChange}
          fullWidth
        />

        <CustomCheckbox
          name="bExportParty"
          checked={formData.bExportParty}
          onChange={handleChange}
          label="Export"
        />

        <CustomCheckbox
          name="bEnforcement"
          checked={formData.bEnforcement}
          onChange={handleChange}
          label="Enforcement"
        />

        <CustomCheckbox
          name="bActive"
          checked={formData.bActive}
          onChange={handleChange}
          label="Active"
        />
      </Box>
      <Box
        display={"flex"}
        justifyContent={"center"}
        marginTop={vType === "FF" || vType === "BR" ? 3 : 15}
      >
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
              marginTop: 2,
              border: `1px solid ${Colortheme.text}`,
              borderRadius: "10px",
              padding: 5,
              display: "grid",
              overflow: "initial",

              backgroundColor: Colortheme.background,
              gridTemplateColumns: isMobile
                ? "repeat(1, 1fr)"
                : "repeat(4, 1fr)",
              gridTemplateRows: "repeat(3, 1fr)",
              rowGap: "25px",
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
          }}
        >
          <StyledButton onClick={handleDialogClose}>Cancel</StyledButton>
          {openSectionDialog === "Party Details" && (
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

          {openSectionDialog === "Credit Details" && (
            <StyledButton
              onClick={handleCreditDetails}
              variant="contained"
              color="primary"
            >
              Save
            </StyledButton>
          )}

          {openSectionDialog === "Tax & Charges Details" && (
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
        </DialogActions>
      </Dialog>
    </form>
  );
};

export default PartyProfileForm;
