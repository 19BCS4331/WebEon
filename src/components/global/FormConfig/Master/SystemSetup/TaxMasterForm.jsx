import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Tooltip,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import dayjs from "dayjs";
import CustomTextField from "../../../CustomTextField";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import CustomDatePicker from "../../../CustomDatePicker";
import CustomCheckbox from "../../../CustomCheckbox";
import { useParams } from "react-router-dom";
import axios from "axios";
import ThemeContext from "../../../../../contexts/ThemeContext";
import styled from "styled-components";
import StyledButton from "../../../StyledButton";
import { useToast } from "../../../../../contexts/ToastContext";
import { useBaseUrl } from "../../../../../contexts/BaseUrl";
import { DataGrid } from "@mui/x-data-grid";
import CircularProgress from "@mui/material/CircularProgress";
import { AuthContext } from "../../../../../contexts/AuthContext";
import CustomAutocomplete from "../../../CustomAutocomplete";
import { apiClient } from "../../../../../services/apiClient";

const BoxButton = styled.div`
  ${(props) => {
    return `
      width: ${props.width || (props.isMobile ? "50vw" : "12vw")};
      display: flex;
      justify-content: center;
      align-items: center;
      transition: 0.3s;
      border-radius: ${props.borderRadius || "5px"};
      height: 55px;
      cursor: pointer;
      border: 1px solid ${props.borderColor || props.theme.text};
      color: ${props.color || props.theme.text};
      text-align: center;
      &:hover {
        background-color: ${props.hoverBgColor || props.theme.text};
        color: ${props.hoverColor || props.theme.background};
        border-radius: ${props.hoverBorderRadius || "10px"};
        font-size: 15px;
        border: 1px solid ${props.borderColorHover || props.theme.text};
      }
    `;
  }}
`;

const CustomScrollbarBox = styled(Box)`
  /* Custom Scrollbar Styles */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.text};
    border-radius: 8px;
  }

  &::-webkit-scrollbar-track {
    background-color: ${({ theme }) => theme.secondaryBG};
  }
`;

const CustomScrollbarDialogContent = styled(DialogContent)`
  /* Custom Scrollbar Styles */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.text};
    border-radius: 8px;
  }

  &::-webkit-scrollbar-track {
    background-color: ${({ theme }) => theme.secondaryBG};
  }
`;

const TaxMasterForm = ({ initialData, onSubmit, onCancel,setTaxSlabs,taxSlabs }) => {
  const { Colortheme } = useContext(ThemeContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isSmallDesktop = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const { showToast, hideToast } = useToast();
  const { baseUrl } = useBaseUrl();
  const { token } = useContext(AuthContext);
  const [postingAcOptions ,setPostingAcOptions] = useState([]);

  // const [taxSlabs, setTaxSlabs] = useState([]);
  const [editingSlab, setEditingSlab] = useState(null);
  // Add this near your other state declarations
const [newSlabForm, setNewSlabForm] = useState({
  FROMAMT: '',
  TOAMT: '',
  VALUE: '',
  BASEVALUE: ''
});
  const [slabForm, setSlabForm] = useState({
    SRNO: '',
    FROMAMT: '',
    TOAMT: '',
    VALUE: '',
    BASEVALUE: ''
  });
  // Add a counter for temporary IDs
  const [tempSlabId, setTempSlabId] = useState(-1);


// ================== SLAB =======================

const fetchTaxSlabs = async () => {
  try {
    if (initialData?.nTaxID) {
      const response = await apiClient.get(`/pages/Master/SystemSetup/taxMaster/taxSlabs?nTaxID=${initialData.nTaxID}`);
      setTaxSlabs(response.data);
    } else {
      // If no tax ID (new form), start with empty slabs
      setTaxSlabs([]);
    }
  } catch (error) {
    console.error('Error fetching tax slabs:', error);
    showToast('Error fetching tax slabs', 'error');
  }
};

useEffect(() => {
  if (initialData?.nTaxID) {
    fetchTaxSlabs();
  } else {
    setTaxSlabs([]); // Clear slabs for new form
  }
}, [initialData]);

// Remove fetchTaxSlabs since we're managing state locally
const handleEditSlab = (slab) => {
  setEditingSlab(slab);
  setSlabForm({
    ...slab
  });
};

const handleDeleteSlab = (nTaxIdD) => {
  setTaxSlabs(prev => prev.filter(slab => slab.nTaxIdD !== nTaxIdD));
};

const handleSlabFormChange = (e) => {
  const { name, value } = e.target;
  setSlabForm(prev => ({
    ...prev,
    [name]: value
  }));
};

const handleNewSlabFormChange = (e) => {
  const { name, value } = e.target;
  setNewSlabForm(prev => ({
    ...prev,
    [name]: value
  }));
};

// const handleSaveSlabForm = () => {
//   if (editingSlab) {
//     // Update existing slab
//     setTaxSlabs(prev => prev.map(slab => 
//       slab.nTaxIdD === editingSlab.nTaxIdD 
//         ? { ...slabForm, nTaxIdD: editingSlab.nTaxIdD }
//         : slab
//     ));
//   } else {
//     // Add new slab
//     const nextSrNo = taxSlabs.length > 0 
//       ? Math.max(...taxSlabs.map(slab => Number(slab.SRNO))) + 1 
//       : 1;
    
//     setTaxSlabs(prev => [...prev, {
//       ...slabForm,
//       SRNO: nextSrNo,
//       nTaxIdD: tempSlabId // Use temporary ID for new slabs
//     }]);
//     setTempSlabId(prev => prev - 1); // Decrement temp ID counter
//   }
  
//   // Reset form and editing state
//   setEditingSlab(null);
//   setSlabForm({
//     SRNO: '',
//     FROMAMT: '',
//     TOAMT: '',
//     VALUE: '',
//     BASEVALUE: ''
//   });
// };

const handleSaveSlabForm = () => {
  if (editingSlab) {
    // Update existing slab
    setTaxSlabs(prev => prev.map(slab => 
      slab.nTaxIdD === editingSlab.nTaxIdD 
        ? { ...slabForm, nTaxIdD: editingSlab.nTaxIdD }
        : slab
    ));
    setEditingSlab(null);
    setSlabForm({
      SRNO: '',
      FROMAMT: '',
      TOAMT: '',
      VALUE: '',
      BASEVALUE: ''
    });
  }
};

const handleAddNewSlab = () => {
  // Validate all required fields
  if (!newSlabForm.FROMAMT || !newSlabForm.TOAMT || !newSlabForm.VALUE) {
    showToast("Please fill in all required fields", "error");
    setTimeout(() => {
      hideToast();
    }, 3000);
    return;
  }

  // Add new slab
  const nextSrNo = taxSlabs.length > 0 
    ? Math.max(...taxSlabs.map(slab => Number(slab.SRNO))) + 1 
    : 1;
  
  setTaxSlabs(prev => [...prev, {
    ...newSlabForm,
    SRNO: nextSrNo,
    nTaxIdD: tempSlabId // Use temporary ID for new slabs
  }]);
  setTempSlabId(prev => prev - 1); // Decrement temp ID counter
  
  // Reset new slab form
  setNewSlabForm({
    FROMAMT: '',
    TOAMT: '',
    VALUE: '',
    BASEVALUE: ''
  });
};


// ================== SLAB =======================

  const [loading, setLoading] = useState(false);

  const applyAsOptions = [
    { value: "", label: "Select A Value" },
    { value: "%", label: "Percentage" },
    { value: "F", label: "Fixed Value" },
  ];

  const taxChargedOnOptions = [
    { value: "", label: "Select A Value" },
    { value: "E", label: "Exchange" },
    { value: "T", label: "Tax" },
    { value: "G", label: "Gross" },
  ];

  const signOptions = [
    { value: "", label: "Select A Value" },
    { value: "+", label: "+" },
    { value: "-", label: "-" },
  ];

  useEffect(() => {
    const fetchACOptions = async () => {
      try {
        const response = await apiClient.get(
          `/pages/Master/SystemSetup/taxMaster/postingAccOptions`
        );
        const data = response.data.map((row) => ({
          key: row.nAccID,
          value: row.nAccID,
          label: `${row.vCode} - ${row.vName}`,
        }));
        setPostingAcOptions(data);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    fetchACOptions();
  }, [initialData]);



  const getGridTemplateColumns = () => {
    if (isMobile) return "repeat(1, 1fr)";
    if (isTablet) return "repeat(2, 1fr)";
    if (isSmallDesktop) return "repeat(3, 1fr)";
    if (isLargeDesktop) return "repeat(4, 1fr)";
    return "repeat(5, 1fr)";
  };

  const [formData, setFormData] = useState({
    nTaxID: "",
    CODE: "",
    DESCRIPTION: "",
    APPLYAS: "",
    VALUE: "",
    RETAILBUY: false,
    RETAILSELL: false,
    BULKBUY: false,
    BULKSELL: false,
    EEFCPRD: "",
    EEFCCN: "",
    ISACTIVE: false,
    RETAILBUYSIGN: "",
    RETAILSELLSIGN: "",
    BULKBUYSIGN: "",
    BULKSELLSIGN: "",
    ROUNDOFF: "",
    BIFURCATE: false,
    FROMDT: null,
    TILLDT: null,
    TAXCHARGEDON: "",
    ONTAXCODE: "",
    tcSettlement: false,
    prdSettlement: false,
    tcSettlementSign: "",
    prdSettlementSign: "",
    SLABWISETAX: false,
    ISINSTRUMENTCHG: false,
    PRODUCTCODE: "",
    nAccID: "",
    RBIREFERENCERATE: "",
    TXNROUNDOFF: "",
    INVOICEAMT: "",
    IsFeeHead: false,
    nTrackingID: "",
    nCreatedBy: "",
    dCreatedDate: null,
    nLastUpdatedby: "",
    dLastUpdatedDate: null,
    bIsVerified: false,
    nVerifiedby: "",
    dVerifiedDate: null,
    bIsDeleted: false,
    nDeletedBy: "",
    dDeletedDate: null,
  });

  const [openSectionDialog, setOpenSectionDialog] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nTaxID: initialData.nTaxID || "",
        CODE: initialData.CODE || "",
        DESCRIPTION: initialData.DESCRIPTION || "",
        APPLYAS: initialData.APPLYAS || "",
        VALUE: initialData.VALUE || "",
        RETAILBUY: initialData.RETAILBUY || false,
        RETAILSELL: initialData.RETAILSELL || false,
        BULKBUY: initialData.BULKBUY || false,
        BULKSELL: initialData.BULKSELL || false,
        EEFCPRD: initialData.EEFCPRD || "",
        EEFCCN: initialData.EEFCCN || "",
        ISACTIVE: initialData.ISACTIVE || false,
        RETAILBUYSIGN: initialData.RETAILBUYSIGN || "",
        RETAILSELLSIGN: initialData.RETAILSELLSIGN || "",
        BULKBUYSIGN: initialData.BULKBUYSIGN || "",
        BULKSELLSIGN: initialData.BULKSELLSIGN || "",
        ROUNDOFF: initialData.ROUNDOFF || "",
        BIFURCATE: initialData.BIFURCATE || false,
        FROMDT: initialData.FROMDT ? dayjs(initialData.FROMDT) : null,
        TILLDT: initialData.TILLDT ? dayjs(initialData.TILLDT) : null,
        TAXCHARGEDON: initialData.TAXCHARGEDON || "",
        ONTAXCODE: initialData.ONTAXCODE || "",
        tcSettlement: initialData.tcSettlement || false,
        prdSettlement: initialData.prdSettlement || false,
        tcSettlementSign: initialData.tcSettlementSign || "",
        prdSettlementSign: initialData.prdSettlementSign || "",
        SLABWISETAX: initialData.SLABWISETAX || false,
        ISINSTRUMENTCHG: initialData.ISINSTRUMENTCHG || false,
        PRODUCTCODE: initialData.PRODUCTCODE || "",
        nAccID: initialData.nAccID || "",
        RBIREFERENCERATE: initialData.RBIREFERENCERATE || "",
        TXNROUNDOFF: initialData.TXNROUNDOFF || "",
        INVOICEAMT: initialData.INVOICEAMT || "",
        IsFeeHead: initialData.IsFeeHead || false,
        nTrackingID: initialData.nTrackingID || "",
        nCreatedBy: initialData.nCreatedBy || "",
        dCreatedDate: initialData.dCreatedDate
          ? dayjs(initialData.dCreatedDate)
          : null,
        nLastUpdatedby: initialData.nLastUpdatedby || "",
        dLastUpdatedDate: initialData.dLastUpdatedDate
          ? dayjs(initialData.dLastUpdatedDate)
          : null,
        bIsVerified: initialData.bIsVerified || false,
        nVerifiedby: initialData.nVerifiedby || "",
        dVerifiedDate: initialData.dVerifiedDate
          ? dayjs(initialData.dVerifiedDate)
          : null,
        bIsDeleted: initialData.bIsDeleted || false,
        nDeletedBy: initialData.nDeletedBy || "",
        dDeletedDate: initialData.dDeletedDate
          ? dayjs(initialData.dDeletedDate)
          : null,
      });
    }
  }, [initialData]);

  // -----------------------------------------------SAVING WITH FIELD ERRORS AND VALIDATION START---------------------------------------------

  const [fieldErrors, setFieldErrors] = useState({
    nTaxID: false,
    CODE: false,
    DESCRIPTION: false,
    APPLYAS: false,
    VALUE: false,
    RETAILBUY: false,
    RETAILSELL: false,
    BULKBUY: false,
    BULKSELL: false,
    EEFCPRD: false,
    EEFCCN: false,
    ISACTIVE: false,
    RETAILBUYSIGN: false,
    RETAILSELLSIGN: false,
    BULKBUYSIGN: false,
    BULKSELLSIGN: false,
    ROUNDOFF: false,
    BIFURCATE: false,
    FROMDT: false,
    TILLDT: false,
    TAXCHARGEDON: false,
    ONTAXCODE: false,
    tcSettlement: false,
    prdSettlement: false,
    tcSettlementSign: false,
    prdSettlementSign: false,
    SLABWISETAX: false,
    ISINSTRUMENTCHG: false,
    PRODUCTCODE: false,
    nAccID: false,
    RBIREFERENCERATE: false,
    TXNROUNDOFF: false,
    INVOICEAMT: false,
    IsFeeHead: false,
    nTrackingID: false,
    nCreatedBy: false,
    dCreatedDate: false,
    nLastUpdatedby: false,
    dLastUpdatedDate: false,
    bIsVerified: false,
    nVerifiedby: false,
    dVerifiedDate: false,
    bIsDeleted: false,
    nDeletedBy: false,
    dDeletedDate: false,
  });

  const handleSaveControlDetails = () => {
    // Proceed with save logic
    console.log("Saving Control Details:", formData);
    handleDialogClose();
    // Example: saveFormDataToBackend(formData);
  };

  // -----------------------------------------------FIELD ERRORS AND VALIDATION END---------------------------------------------

  // const handleChange = (e) => {
  //   const { name, value, type, checked } = e.target;
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     [name]: type === "checkbox" ? checked : value,
  //   }));
  //   setFieldErrors({
  //     ...fieldErrors,
  //     [name]: false,
  //   });
  // };

  const handleChangeAutoComplete = (name, value) => {
    // Update the form data for the changed field
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDateChange = (name, date) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: date,
    }));
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prevData) => {
      const updatedData = {
        ...prevData,
        [name]: type === "checkbox" ? checked : value,
      };

      return updatedData;
    });

    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      [name]: false,
    }));
  };

  const handleSectionEdit = (section) => {
    setOpenSectionDialog(section);
  };

  const handleDialogClose = () => {
    setOpenSectionDialog(null);
  };

  //   Create a function to validate all fields in the form
  const validateAllFields = () => {
    const requiredKeys = ["CODE", "DESCRIPTION"];
    let allFieldsValid = true;
    requiredKeys.forEach((key) => {
      if (formData[key] === "" || formData[key] === null) {
        allFieldsValid = false;
      }
    });
    return allFieldsValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isValid = validateAllFields();
    if (isValid) {
      onSubmit(formData);
      // onSubmitSlabs(taxSlabs);
    } else {
      console.log("ERROR IN FORM DETAILS");
      showToast("Enter All Required Details!", "fail");
      setTimeout(() => {
        hideToast();
      }, 2000);
    }
  };

  useEffect(() => {
    if (formData.nTaxID) {
      fetchTaxSlabs();
    }
  }, [formData.nTaxID]);

  const renderSectionFields = () => {
    switch (openSectionDialog) {
      case "Other Related Information":
        return (
          <Box
            display={"grid"}
            gridTemplateColumns={getGridTemplateColumns()}
            gap={2}
          >
            <CustomDatePicker
              name="FROMDT"
              label="From Date"
              value={formData.FROMDT}
              onChange={(e) => handleDateChange("FROMDT", e)}
            />
            <Tooltip
              title="If there is no date of expiry, leave the 'To Date' field blank"
              placement="top-start"
            >
              <Box sx={{ width: "100%" }}>
                <CustomDatePicker
                  name="TILLDT"
                  label="To Date"
                  value={formData.TILLDT}
                  onChange={(e) => handleDateChange("TILLDT", e)}
                  tooltipEnabled={true}
                  tooltipTitle={
                    "If there is no date of expiry, leave the 'To Date' field blank"
                  }
                />
              </Box>
            </Tooltip>

            <CustomTextField
              name="TAXCHARGEDON"
              label="Apply Tax On"
              value={formData.TAXCHARGEDON}
              onChange={handleChange}
              fullWidth
              select
              required
              error={fieldErrors.TAXCHARGEDON}
              helperText={fieldErrors.TAXCHARGEDON ? "Select Value!" : ""}
            >
              {taxChargedOnOptions.map((item) => (
                <MenuItem key={item} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </CustomTextField>

            <CustomTextField
              label="Tax Code"
              name="ONTAXCODE"
              value={formData.ONTAXCODE}
              onChange={handleChange}
              disabled={formData.TAXCHARGEDON !== "T"}
            />

            <CustomCheckbox
              name="TXNROUNDOFF"
              label="Tax Round Off"
              checked={formData.TXNROUNDOFF}
              onChange={handleChange}
            />

            <CustomCheckbox
              name="BIFURCATE"
              label="Bifurcate Cess etc (in print)"
              checked={formData.BIFURCATE}
              onChange={handleChange}
            />

            <CustomCheckbox
              name="EEFCPRD"
              label="EEFC (Products) Txn"
              checked={formData.EEFCPRD}
              onChange={handleChange}
            />

            <CustomCheckbox
              name="EEFCCN"
              label="EEFC,CN Portion"
              checked={formData.EEFCCN}
              onChange={handleChange}
            />
          </Box>
        );
      case "Transactions Configuration":
        return (
          <>
            <TableContainer sx={{ maxHeight: 400, overflow: "auto" }}>
              <Table aria-label="simple table" size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: Colortheme.text, fontSize: 17 }}>
                      Applicable in
                    </TableCell>
                    <TableCell sx={{ color: Colortheme.text, fontSize: 17 }}>
                      Sign
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow sx={{ height: 40 }}>
                    <TableCell>
                      <CustomCheckbox
                        name="RETAILBUY"
                        label="Retail Buy"
                        checked={formData.RETAILBUY}
                        onChange={handleChange}
                      />
                    </TableCell>
                    <TableCell>
                      <CustomTextField
                        select
                        name="RETAILBUYSIGN"
                        value={formData.RETAILBUYSIGN}
                        onChange={handleChange}
                        label="Sign"
                        disabled={!formData.RETAILBUY}
                        size="small"
                      >
                        {signOptions.map((item) => (
                          <MenuItem key={item} value={item.value}>
                            {item.label}
                          </MenuItem>
                        ))}
                      </CustomTextField>
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ height: 40 }}>
                    <TableCell>
                      <CustomCheckbox
                        name="RETAILSELL"
                        label="Retail Sell"
                        checked={formData.RETAILSELL}
                        onChange={handleChange}
                      />
                    </TableCell>
                    <TableCell>
                      <CustomTextField
                        select
                        name="RETAILSELLSIGN"
                        value={formData.RETAILSELLSIGN}
                        onChange={handleChange}
                        label="Sign"
                        disabled={!formData.RETAILSELL}
                        size="small"
                      >
                        {signOptions.map((item) => (
                          <MenuItem key={item} value={item.value}>
                            {item.label}
                          </MenuItem>
                        ))}
                      </CustomTextField>
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ height: 40 }}>
                    <TableCell>
                      <CustomCheckbox
                        name="BULKBUY"
                        label="Bulk Buy"
                        checked={formData.BULKBUY}
                        onChange={handleChange}
                      />
                    </TableCell>
                    <TableCell>
                      <CustomTextField
                        select
                        name="BULKBUYSIGN"
                        value={formData.BULKBUYSIGN}
                        onChange={handleChange}
                        label="Sign"
                        disabled={!formData.BULKBUY}
                        size="small"
                      >
                        {signOptions.map((item) => (
                          <MenuItem key={item} value={item.value}>
                            {item.label}
                          </MenuItem>
                        ))}
                      </CustomTextField>
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ height: 40 }}>
                    <TableCell>
                      <CustomCheckbox
                        name="BULKSELL"
                        label="Bulk Sell"
                        checked={formData.BULKSELL}
                        onChange={handleChange}
                      />
                    </TableCell>
                    <TableCell>
                      <CustomTextField
                        select
                        name="BULKSELLSIGN"
                        value={formData.BULKSELLSIGN}
                        onChange={handleChange}
                        label="Sign"
                        disabled={!formData.BULKSELL}
                        size="small"
                      >
                        {signOptions.map((item) => (
                          <MenuItem key={item} value={item.value}>
                            {item.label}
                          </MenuItem>
                        ))}
                      </CustomTextField>
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ height: 40 }}>
                    <TableCell>
                      <CustomCheckbox
                        name="tcSettlement"
                        label="TC Settlement"
                        checked={formData.tcSettlement}
                        onChange={handleChange}
                      />
                    </TableCell>
                    <TableCell>
                      <CustomTextField
                        select
                        name="tcSettlementSign"
                        value={formData.tcSettlementSign}
                        onChange={handleChange}
                        label="Sign"
                        disabled={!formData.tcSettlement}
                        size="small"
                      >
                        {signOptions.map((item) => (
                          <MenuItem key={item} value={item.value}>
                            {item.label}
                          </MenuItem>
                        ))}
                      </CustomTextField>
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ height: 40 }}>
                    <TableCell>
                      <CustomCheckbox
                        name="prdSettlement"
                        label="PRD Settlement"
                        checked={formData.prdSettlement}
                        onChange={handleChange}
                      />
                    </TableCell>
                    <TableCell>
                      <CustomTextField
                        select
                        name="prdSettlementSign"
                        value={formData.prdSettlementSign}
                        onChange={handleChange}
                        label="Sign"
                        disabled={!formData.prdSettlement}
                        size="small"
                      >
                        {signOptions.map((item) => (
                          <MenuItem key={item} value={item.value}>
                            {item.label}
                          </MenuItem>
                        ))}
                      </CustomTextField>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </>
        );

        case "Slab Config":
  return (
    <>
      <Box>
      <TableContainer>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell sx={{ backgroundColor: Colortheme.text, color: Colortheme.background }}>Sr.No</TableCell>
        <TableCell sx={{ backgroundColor: Colortheme.text, color: Colortheme.background }}>From</TableCell>
        <TableCell sx={{ backgroundColor: Colortheme.text, color: Colortheme.background }}>To</TableCell>
        <TableCell sx={{ backgroundColor: Colortheme.text, color: Colortheme.background }}>Value</TableCell>
        <TableCell sx={{ backgroundColor: Colortheme.text, color: Colortheme.background }}>Actions</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {taxSlabs?.map((slab) => (
        <TableRow key={slab.nTaxIdD} sx={{ '&:hover': { backgroundColor: Colortheme.background } }}>
          <TableCell sx={{ color: Colortheme.text }}>{slab.SRNO}</TableCell>
          <TableCell sx={{ color: Colortheme.text }}>
            {editingSlab?.nTaxIdD === slab.nTaxIdD ? (
              <CustomTextField
                name="FROMAMT"
                value={slabForm.FROMAMT}
                onChange={handleSlabFormChange}
                type="number"
                size="small"
                fullWidth
              />
            ) : (
              slab.FROMAMT
            )}
          </TableCell>
          <TableCell sx={{ color: Colortheme.text }}>
            {editingSlab?.nTaxIdD === slab.nTaxIdD ? (
              <CustomTextField
                name="TOAMT"
                value={slabForm.TOAMT}
                onChange={handleSlabFormChange}
                type="number"
                size="small"
                fullWidth
              />
            ) : (
              slab.TOAMT
            )}
          </TableCell>
          <TableCell sx={{ color: Colortheme.text }}>
            {editingSlab?.nTaxIdD === slab.nTaxIdD ? (
              <CustomTextField
                name="VALUE"
                value={slabForm.VALUE}
                onChange={handleSlabFormChange}
                type="number"
                size="small"
                fullWidth
              />
            ) : (
              slab.VALUE
            )}
          </TableCell>
          <TableCell>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {editingSlab?.nTaxIdD === slab.nTaxIdD ? (
                <>
                  <StyledButton
                    onClick={handleSaveSlabForm}
                    style={{ minWidth: 'auto', padding: '8px' }}
                  >
                    Save
                  </StyledButton>
                  <StyledButton
                    onClick={() => setEditingSlab(null)}
                     style={{ minWidth: '80px', padding: '8px' }}
                  >
                    Cancel
                  </StyledButton>
                </>
              ) : (
                <>
                  <StyledButton
                    onClick={() => handleEditSlab(slab)}
                     style={{ minWidth: '80px', padding: '8px' }}
                  >
                    Edit
                  </StyledButton>
                  <StyledButton
                    onClick={() => handleDeleteSlab(slab.nTaxIdD)}
                     style={{ minWidth: '80px', padding: '8px' }}
                    color="error"
                  >
                    Delete
                  </StyledButton>
                </>
              )}
            </Box>
          </TableCell>
        </TableRow>
      ))}
      {/* New Slab Row */}
<TableRow sx={{ '&:hover': { backgroundColor: Colortheme.background } }}>
  <TableCell sx={{ color: Colortheme.text }}>
    {taxSlabs.length > 0 ? Math.max(...taxSlabs.map(slab => Number(slab.SRNO))) + 1 : 1}
  </TableCell>
  <TableCell>
    <CustomTextField
      name="FROMAMT"
      value={newSlabForm.FROMAMT}
      onChange={handleNewSlabFormChange}
      type="number"
      size="small"
      fullWidth
    />
  </TableCell>
  <TableCell>
    <CustomTextField
      name="TOAMT"
      value={newSlabForm.TOAMT}
      onChange={handleNewSlabFormChange}
      type="number"
      size="small"
      fullWidth
    />
  </TableCell>
  <TableCell>
    <CustomTextField
      name="VALUE"
      value={newSlabForm.VALUE}
      onChange={handleNewSlabFormChange}
      type="number"
      size="small"
      fullWidth
    />
  </TableCell>
  <TableCell>
    <StyledButton
      onClick={handleAddNewSlab}
      style={{ minWidth: '80px', padding: '8px' }}
    >
      Add
    </StyledButton>
  </TableCell>
</TableRow>
    </TableBody>
  </Table>
</TableContainer>
      </Box>
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

  // Define the function to get the appropriate sx
  const getCustomScrollbarBoxStyles = (
    openSectionDialog,
    isMobile,
    Colortheme
  ) => {
    switch (openSectionDialog) {
      case "Retail Transaction Configuration":
        return {
          //   padding: 5,
          //   border: `1px solid ${Colortheme.text}`,
          //   borderRadius: "10px",
          //   marginTop: 2,
          marginTop: 2,
          border: `1px solid ${Colortheme.text}`,
          borderRadius: "10px",
          padding: 5,
          display: "grid",
          overflow: "initial",
          backgroundColor: Colortheme.background,
          gridTemplateColumns: isMobile ? "repeat(1, 1fr)" : "repeat(5, 1fr)",
          gridTemplateRows: "auto",
          gap: 2,
        };
      case "Transactions Configuration":
        return {
          // marginTop: 2,
          // border: `1px solid ${Colortheme.text}`,
          // borderRadius: "10px",
          // padding: 5,
          // display: "grid",
          // overflow: "initial",
          // backgroundColor: Colortheme.background,
          // gridTemplateColumns: getGridTemplateColumns(),
          // gridTemplateRows: "auto",
          // rowGap: "25px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          padding: 5,
          border: `1px solid ${Colortheme.text}`,
          borderRadius: "10px",
          marginTop: 2,
        };

      case "Other Related Information":
        return {
          display: "flex",
          flexDirection: "column",
          gap: 2,
          padding: 5,
          border: `1px solid ${Colortheme.text}`,
          borderRadius: "10px",
          marginTop: 2,
        };
      // Add more cases as needed
      default:
        return {
          marginTop: 2,
          border: `1px solid ${Colortheme.text}`,
          borderRadius: "10px",
          padding: 5,
          display: "grid",
          overflow: "initial",
          backgroundColor: Colortheme.background,
          gridTemplateColumns: isMobile ? "repeat(1, 1fr)" : "repeat(4, 1fr)",
          gridTemplateRows: "auto",
          rowGap: "25px",
        };
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CustomScrollbarBox
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
        <>
          <CustomTextField
            name="CODE"
            label="Code"
            value={formData.CODE}
            onChange={handleChange}
            fullWidth
            error={fieldErrors.CODE}
            helperText={fieldErrors.CODE ? "Enter Valid Code!" : ""}
            required
          />

          <CustomTextField
            name="DESCRIPTION"
            label="Name"
            value={formData.DESCRIPTION}
            onChange={handleChange}
            fullWidth
            error={fieldErrors.DESCRIPTION}
            helperText={fieldErrors.DESCRIPTION ? "Enter Valid Name!" : ""}
            required
          />

          <CustomCheckbox
            name="ROUNDOFF"
            label="Round Off"
            checked={formData.ROUNDOFF}
            onChange={handleChange}
          />

          <CustomCheckbox
            name="IsFeeHead"
            label="Fee Head"
            checked={formData.IsFeeHead}
            onChange={handleChange}
          />

          <CustomAutocomplete
            getOptionKey={(option) => option.value || ""}
            options={postingAcOptions || []}
            label={"Posting A/C"}
            name={"nAccID"}
            value={
              postingAcOptions?.find((opt) => opt.value === formData.nAccID) ||
              null
            } // Select the option by its value
            onChange={
              (e, newValue) =>
                handleChangeAutoComplete(
                  "nAccID",
                  newValue ? newValue.value : ""
                ) // Store value in formData
            }
            getOptionLabel={(option) => option.label || ""} // Display the label in dropdown
            isOptionEqualToValue={(option, value) =>
              option.value === value.value
            } // Match by value
            required
            get
            styleTF={isMobile ? { width: "100%" } : {}}
          />

          <CustomTextField
            name="APPLYAS"
            label="Apply As"
            value={formData.APPLYAS}
            onChange={handleChange}
            fullWidth
            select
            required
            error={fieldErrors.APPLYAS}
            helperText={fieldErrors.APPLYAS ? "Select Apply As!" : ""}
            disabled={formData.ROUNDOFF}
          >
            {applyAsOptions.map((item) => (
              <MenuItem key={item} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </CustomTextField>

          <CustomTextField
            name="VALUE"
            label="Value"
            value={formData.VALUE}
            onChange={handleChange}
            fullWidth
            error={fieldErrors.VALUE}
            helperText={fieldErrors.VALUE ? "Enter Valid Value!" : ""}
            disabled={formData.ROUNDOFF}
            required
          />

          <CustomCheckbox
            name="ISACTIVE"
            label="Is Active?"
            checked={formData.ISACTIVE}
            onChange={handleChange}
          />

          <CustomCheckbox
            name="ISINSTRUMENTCHG"
            label="Is Instrument Chg head ?"
            checked={formData.ISINSTRUMENTCHG}
            onChange={handleChange}
          />

          <CustomCheckbox
            name="INVOICEAMT"
            label="Incl Invoice Amount ?"
            checked={formData.INVOICEAMT}
            onChange={handleChange}
          />

          <CustomCheckbox
            name="RBIREFERENCERATE"
            label="RBI Ref Rate ?"
            checked={formData.RBIREFERENCERATE}
            onChange={handleChange}
          />

          <CustomScrollbarBox>
            <BoxButton
              isMobile={isMobile}
              onClick={() => handleSectionEdit("Other Related Information")}
            >
              Other Related Information
            </BoxButton>
          </CustomScrollbarBox>

          <CustomScrollbarBox>
            <BoxButton
              isMobile={isMobile}
              onClick={() => handleSectionEdit("Transactions Configuration")}
            >
              Transactions Configuration
            </BoxButton>
          </CustomScrollbarBox>

          

          <CustomCheckbox
            name="SLABWISETAX"
            label="Slab Wise ?"
            checked={formData.SLABWISETAX}
            onChange={handleChange}
          />
          {formData.SLABWISETAX && (
            <CustomScrollbarBox>
              <BoxButton
                isMobile={isMobile}
                onClick={() => handleSectionEdit("Slab Config")}
              >
                Slab Config
              </BoxButton>
            </CustomScrollbarBox>
          )}
        </>
      </CustomScrollbarBox>
      <CustomScrollbarBox
        display={"flex"}
        justifyContent={"center"}
        marginTop={5}
      >
        <CustomScrollbarBox
          display={"flex"}
          width={isMobile ? "100%" : "60%"}
          gap={5}
          justifyContent={"center"}
        >
          <StyledButton onClick={onCancel}>Cancel</StyledButton>
          <StyledButton type="submit" variant="contained" color="primary">
            Submit
          </StyledButton>
        </CustomScrollbarBox>
      </CustomScrollbarBox>

      <Dialog
        open={!!openSectionDialog}
        onClose={handleClose}
        maxWidth={false}
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            padding: 2,
            width: "90vw",
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
        <CustomScrollbarDialogContent>
          <CustomScrollbarBox
            sx={getCustomScrollbarBoxStyles(
              openSectionDialog,
              isMobile,
              Colortheme
            )}
          >
            {renderSectionFields()}
          </CustomScrollbarBox>
        </CustomScrollbarDialogContent>
        <DialogActions
          sx={{
            alignSelf: "center",
            display: "flex",
            justifyContent: "center",
            width: isMobile ? "100%" : "50%",
            gap: isMobile ? 3 : 10,
            marginBottom: 2, // Add some margin to ensure proper spacing
          }}
        >
          <StyledButton onClick={handleDialogClose}>
            {openSectionDialog !== "Issuer Link"
              ? // ||
                // openSectionDialog === "Division Link" ||
                // openSectionDialog === "Product Link"
                "Close"
              : "Cancel"}
          </StyledButton>

         
        </DialogActions>
      </Dialog>
    </form>
  );
};

export default TaxMasterForm;
