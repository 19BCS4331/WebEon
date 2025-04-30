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

} from "@mui/material";
import dayjs from "dayjs";
import CustomTextField from "../../../CustomTextField";
import CustomCheckbox from "../../../CustomCheckbox";
import ThemeContext from "../../../../../contexts/ThemeContext";
import styled from "styled-components";
import StyledButton from "../../../StyledButton";
import { useToast } from "../../../../../contexts/ToastContext";
import { useBaseUrl } from "../../../../../contexts/BaseUrl";
import { AuthContext } from "../../../../../contexts/AuthContext";
import { apiClient } from "../../../../../services/apiClient";
import CustomDataGrid from "../../../CustomDataGrid";

const BoxButton = styled.div`
  ${(props) => {
    console.log("Props:", props);
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

const ProductProfileForm = ({ initialData, onSubmit, onCancel }) => {
  const { Colortheme } = useContext(ThemeContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isSmallDesktop = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const { showToast, hideToast } = useToast();
  const { baseUrl } = useBaseUrl();
  const { token } = useContext(AuthContext);
  const [piRows, setPIRows] = useState([]);
  const [pendingPIChanges, setPendingPIChanges] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPI = async () => {
      try {
        const response = await apiClient.post(
          `/pages/Master/SystemSetup/ProductIssuerLink`,
          { PRODUCTCODE: initialData.PRODUCTCODE },
       
        );
        const data = response.data.map((row, index) => ({
          id: row.nCodesID, // use nCounterID as unique identifier
          ...row,
        }));
        setPIRows(data);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    fetchPI();
  }, [initialData]);

  const piColumns = [
    {
      field: "nCodesID",
      headerName: "Issuer ID",
      width: 150,
    },
    { field: "vCode", headerName: "Issuer Name", width: isMobile ? 150 : 200 },
    {
      field: "bIsActive",
      headerName: "Active",
      width: 120,
      renderCell: (params) => (
        <CustomCheckbox
          checked={params.value}
          onChange={(event) => handlePiCheckboxChange(params, event)}
        />
      ),
    },
  ];

  const handlePiCheckboxChange = (params, event) => {
    const newIsActive = !params.row.bIsActive;

    // Update the state
    setPIRows((prevRows) =>
      prevRows.map((row) =>
        row.id === params.id ? { ...row, bIsActive: newIsActive } : row
      )
    );

    // Add the change to the pending changes list
    setPendingPIChanges((prevChanges) => [
      ...prevChanges,
      {
        PRODUCTCODE: initialData.PRODUCTCODE,
        nIssuerID: params.row.id,
        bIsActive: newIsActive,
      },
    ]);
  };

  // Function to save the changes to the database
  const savePIChanges = async () => {
    try {
      await Promise.all(
        pendingPIChanges.map((change) =>
          apiClient.put(
            `/pages/Master/SystemSetup/ProductIssuerLink`,
            change
          )
        )
      );

      // Clear the pending changes after successful save
      setPendingPIChanges([]);
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

  const getGridTemplateColumns = () => {
    if (isMobile) return "repeat(1, 1fr)";
    if (isTablet) return "repeat(2, 1fr)";
    if (isSmallDesktop) return "repeat(3, 1fr)";
    if (isLargeDesktop) return "repeat(4, 1fr)";
    return "repeat(5, 1fr)";
  };

  const [formData, setFormData] = useState({
    nProductID: "",
    PRODUCTCODE: "",
    DESCRIPTION: "",
    retailBuy: false,
    retailBuySeries: false,
    retailSell: false,
    retailSellSeries: false,
    bulkBuy: false,
    bulkBuySeries: false,
    bulkSell: false,
    bulkSellSeries: false,
    IssuerRequire: false,
    blankStock: false,
    blankStockDeno: false,
    isSettlement: false,
    vProfitAccountCode: "",
    vIssuerAccountCode: "",
    vCommAccountCode: "",
    vOpeningAccountCode: "",
    vClosingAccountCode: "",
    vExportAccountCode: "",
    vPurchaseAccountCode: "",
    vSaleAccountCode: "",
    vFakeAccountcode: "",
    isActive: false,
    Priority: "",
    vBulkPurchaseAccountCode: "",
    vBulkSaleAccountCode: "",
    vBulkProfitAccountCode: "",
    vPurRetCanAccountCode: "",
    vPurBlkCanAccountCode: "",
    vSaleRetCanAccountCode: "",
    vSaleBlkCanAccountCode: "",
    vPurchaseBranchAccountCode: "",
    vSaleBranchAccountCode: "",
    reverseProfit: false,
    vBrnProfitAccountCode: "",
    AUTOSTOCK: false,
    allowFractions: false,
    AllowMultiCard: false,
    RetailFees: "",
    COMMPERCENT: "",
    COMMAMT: "",
    AUTOSETTRATE: false,
    passSeparateSett: false,
    saleAvgSett: false,
    BulkFees: "",
    stockSplit: false,
    stockDenoChange: false,
    bReload: false,
    AllAddOn: false,
    bAskReference: false,
    IsAllowCancellation: false,
    nTrackingID: "",
    nCreatedBY: "",
    dCreatedDate: null,
    nLastUpdatedBy: "",
    dLastUpdatedDate: null,
    bIsDeleted: false,
    nDeletedBy: "",
    dDeletedDate: null,
    vSaleEEFCAccountCode: "",
    vSaleProfitEEFCAccountCode: "",
    vPurchaseEEFCAccountCode: "",
    vEEFCAccountCode: "",
  });

  const [openSectionDialog, setOpenSectionDialog] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nProductID: initialData.nProductID || "",
        PRODUCTCODE: initialData.PRODUCTCODE || "",
        DESCRIPTION: initialData.DESCRIPTION || "",
        retailBuy: initialData.retailBuy || false,
        retailBuySeries: initialData.retailBuySeries || false,
        retailSell: initialData.retailSell || false,
        retailSellSeries: initialData.retailSellSeries || false,
        bulkBuy: initialData.bulkBuy || false,
        bulkBuySeries: initialData.bulkBuySeries || false,
        bulkSell: initialData.bulkSell || false,
        bulkSellSeries: initialData.bulkSellSeries || false,
        IssuerRequire: initialData.IssuerRequire || false,
        blankStock: initialData.blankStock || false,
        blankStockDeno: initialData.blankStockDeno || false,
        isSettlement: initialData.isSettlement || false,
        vProfitAccountCode: initialData.vProfitAccountCode || "",
        vIssuerAccountCode: initialData.vIssuerAccountCode || "",
        vCommAccountCode: initialData.vCommAccountCode || "",
        vOpeningAccountCode: initialData.vOpeningAccountCode || "",
        vClosingAccountCode: initialData.vClosingAccountCode || "",
        vExportAccountCode: initialData.vExportAccountCode || "",
        vPurchaseAccountCode: initialData.vPurchaseAccountCode || "",
        vSaleAccountCode: initialData.vSaleAccountCode || "",
        vFakeAccountcode: initialData.vFakeAccountcode || "",
        isActive: initialData.isActive || false,
        Priority: initialData.Priority || "",
        vBulkPurchaseAccountCode: initialData.vBulkPurchaseAccountCode || "",
        vBulkSaleAccountCode: initialData.vBulkSaleAccountCode || "",
        vBulkProfitAccountCode: initialData.vBulkProfitAccountCode || "",
        vPurRetCanAccountCode: initialData.vPurRetCanAccountCode || "",
        vPurBlkCanAccountCode: initialData.vPurBlkCanAccountCode || "",
        vSaleRetCanAccountCode: initialData.vSaleRetCanAccountCode || "",
        vSaleBlkCanAccountCode: initialData.vSaleBlkCanAccountCode || "",
        vPurchaseBranchAccountCode:
          initialData.vPurchaseBranchAccountCode || "",
        vSaleBranchAccountCode: initialData.vSaleBranchAccountCode || "",
        reverseProfit: initialData.reverseProfit || false,
        vBrnProfitAccountCode: initialData.vBrnProfitAccountCode || "",
        AUTOSTOCK: initialData.AUTOSTOCK || false,
        allowFractions: initialData.allowFractions || false,
        AllowMultiCard: initialData.AllowMultiCard || false,
        RetailFees: initialData.RetailFees || "",
        COMMPERCENT: initialData.COMMPERCENT || "",
        COMMAMT: initialData.COMMAMT || "",
        AUTOSETTRATE: initialData.AUTOSETTRATE || false,
        passSeparateSett: initialData.passSeparateSett || false,
        saleAvgSett: initialData.saleAvgSett || false,
        BulkFees: initialData.BulkFees || "",
        stockSplit: initialData.stockSplit || false,
        stockDenoChange: initialData.stockDenoChange || false,
        bReload: initialData.bReload || false,
        AllAddOn: initialData.AllAddOn || false,
        bAskReference: initialData.bAskReference || false,
        IsAllowCancellation: initialData.IsAllowCancellation || false,
        nTrackingID: initialData.nTrackingID || "",
        nCreatedBY: initialData.nCreatedBY || "",
        dCreatedDate: initialData.dCreatedDate
          ? dayjs(initialData.dCreatedDate)
          : null,
        nLastUpdatedBy: initialData.nLastUpdatedBy || "",
        dLastUpdatedDate: initialData.dLastUpdatedDate
          ? dayjs(initialData.dLastUpdatedDate)
          : null,
        bIsDeleted: initialData.bIsDeleted || false,
        nDeletedBy: initialData.nDeletedBy || "",
        dDeletedDate: initialData.dDeletedDate
          ? dayjs(initialData.dDeletedDate)
          : null,
        vSaleEEFCAccountCode: initialData.vSaleEEFCAccountCode || "",
        vSaleProfitEEFCAccountCode:
          initialData.vSaleProfitEEFCAccountCode || "",
        vPurchaseEEFCAccountCode: initialData.vPurchaseEEFCAccountCode || "",
        vEEFCAccountCode: initialData.vEEFCAccountCode || "",
      });
    }
  }, [initialData]);

  // -----------------------------------------------SAVING WITH FIELD ERRORS AND VALIDATION START---------------------------------------------

  const [fieldErrors, setFieldErrors] = useState({
    nProductID: false,
    PRODUCTCODE: false,
    DESCRIPTION: false,
    retailBuy: false,
    retailBuySeries: false,
    retailSell: false,
    retailSellSeries: false,
    bulkBuy: false,
    bulkBuySeries: false,
    bulkSell: false,
    bulkSellSeries: false,
    IssuerRequire: false,
    blankStock: false,
    blankStockDeno: false,
    isSettlement: false,
    vProfitAccountCode: false,
    vIssuerAccountCode: false,
    vCommAccountCode: false,
    vOpeningAccountCode: false,
    vClosingAccountCode: false,
    vExportAccountCode: false,
    vPurchaseAccountCode: false,
    vSaleAccountCode: false,
    vFakeAccountcode: false,
    isActive: false,
    Priority: false,
    vBulkPurchaseAccountCode: false,
    vBulkSaleAccountCode: false,
    vBulkProfitAccountCode: false,
    vPurRetCanAccountCode: false,
    vPurBlkCanAccountCode: false,
    vSaleRetCanAccountCode: false,
    vSaleBlkCanAccountCode: false,
    vPurchaseBranchAccountCode: false,
    vSaleBranchAccountCode: false,
    reverseProfit: false,
    vBrnProfitAccountCode: false,
    AUTOSTOCK: false,
    allowFractions: false,
    AllowMultiCard: false,
    RetailFees: false,
    COMMPERCENT: false,
    COMMAMT: false,
    AUTOSETTRATE: false,
    passSeparateSett: false,
    saleAvgSett: false,
    BulkFees: false,
    stockSplit: false,
    stockDenoChange: false,
    bReload: false,
    AllAddOn: false,
    bAskReference: false,
    IsAllowCancellation: false,
    nTrackingID: false,
    nCreatedBY: false,
    dCreatedDate: false,
    nLastUpdatedBy: false,
    dLastUpdatedDate: false,
    bIsDeleted: false,
    nDeletedBy: false,
    dDeletedDate: false,
    vSaleEEFCAccountCode: false,
    vSaleProfitEEFCAccountCode: false,
    vPurchaseEEFCAccountCode: false,
    vEEFCAccountCode: false,
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
    const requiredKeys = ["PRODUCTCODE", "DESCRIPTION"];
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
      case "Retail Transaction Configuration":
        return (
          <>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              border="1px solid #ddd"
              borderRadius="8px"
              p={2}
              mb={2}
            >
              <CustomCheckbox
                name="retailBuy"
                label="Retail Buy"
                checked={formData.retailBuy}
                onChange={handleChange}
              />
              <Box ml={4} display="flex" alignItems="center">
                <Box width="20px" height="20px" position="relative">
                  <Box
                    position="absolute"
                    top="50%"
                    left="0"
                    width="10px"
                    height="2px"
                    bgcolor="#ccc"
                    transform="translateY(-50%) rotate(45deg)"
                  />
                  <Box
                    position="absolute"
                    top="50%"
                    left="0"
                    width="10px"
                    height="2px"
                    bgcolor="#ccc"
                    transform="translateY(-50%) rotate(-45deg)"
                  />
                </Box>
                <CustomCheckbox
                  name="retailBuySeries"
                  label="Series"
                  checked={formData.retailBuySeries}
                  onChange={handleChange}
                  disabled={!formData.retailBuy}
                />
              </Box>
            </Box>

            <Box
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              border="1px solid #ddd"
              borderRadius="8px"
              p={2}
              mb={2}
            >
              <CustomCheckbox
                name="retailSell"
                label="Retail Sell"
                checked={formData.retailSell}
                onChange={handleChange}
              />
              <Box ml={4} display="flex" alignItems="center">
                <Box width="20px" height="20px" position="relative">
                  <Box
                    position="absolute"
                    top="50%"
                    left="0"
                    width="10px"
                    height="2px"
                    bgcolor="#ccc"
                    transform="translateY(-50%) rotate(45deg)"
                  />
                  <Box
                    position="absolute"
                    top="50%"
                    left="0"
                    width="10px"
                    height="2px"
                    bgcolor="#ccc"
                    transform="translateY(-50%) rotate(-45deg)"
                  />
                </Box>
                <CustomCheckbox
                  name="retailSellSeries"
                  label="Series"
                  checked={formData.retailSellSeries}
                  onChange={handleChange}
                  disabled={!formData.retailSell}
                />
              </Box>
            </Box>

            <Box
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              border="1px solid #ddd"
              borderRadius="8px"
              p={2}
              mb={2}
            >
              <CustomCheckbox
                name="bulkBuy"
                label="Bulk Buy"
                checked={formData.bulkBuy}
                onChange={handleChange}
              />
              <Box ml={4} display="flex" alignItems="center">
                <Box width="20px" height="20px" position="relative">
                  <Box
                    position="absolute"
                    top="50%"
                    left="0"
                    width="10px"
                    height="2px"
                    bgcolor="#ccc"
                    transform="translateY(-50%) rotate(45deg)"
                  />
                  <Box
                    position="absolute"
                    top="50%"
                    left="0"
                    width="10px"
                    height="2px"
                    bgcolor="#ccc"
                    transform="translateY(-50%) rotate(-45deg)"
                  />
                </Box>
                <CustomCheckbox
                  name="bulkBuySeries"
                  label="Series"
                  checked={formData.bulkBuySeries}
                  onChange={handleChange}
                  disabled={!formData.bulkBuy}
                />
              </Box>
            </Box>

            <Box
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              border="1px solid #ddd"
              borderRadius="8px"
              p={2}
              mb={2}
            >
              <CustomCheckbox
                name="bulkSell"
                label="Bulk Sell"
                checked={formData.bulkSell}
                onChange={handleChange}
              />
              <Box ml={4} display="flex" alignItems="center">
                <Box width="20px" height="20px" position="relative">
                  <Box
                    position="absolute"
                    top="50%"
                    left="0"
                    width="10px"
                    height="2px"
                    bgcolor="#ccc"
                    transform="translateY(-50%) rotate(45deg)"
                  />
                  <Box
                    position="absolute"
                    top="50%"
                    left="0"
                    width="10px"
                    height="2px"
                    bgcolor="#ccc"
                    transform="translateY(-50%) rotate(-45deg)"
                  />
                </Box>
                <CustomCheckbox
                  name="bulkSellSeries"
                  label="Series"
                  checked={formData.bulkSellSeries}
                  onChange={handleChange}
                  disabled={!formData.bulkSell}
                />
              </Box>
            </Box>

            <Box
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              border="1px solid #ddd"
              borderRadius="8px"
              p={2}
              mb={2}
            >
              <CustomCheckbox
                name="blankStock"
                label="Blank Stock"
                checked={formData.blankStock}
                onChange={handleChange}
              />
              <Box ml={4} display="flex" alignItems="center">
                <Box width="20px" height="20px" position="relative">
                  <Box
                    position="absolute"
                    top="50%"
                    left="0"
                    width="10px"
                    height="2px"
                    bgcolor="#ccc"
                    transform="translateY(-50%) rotate(45deg)"
                  />
                  <Box
                    position="absolute"
                    top="50%"
                    left="0"
                    width="10px"
                    height="2px"
                    bgcolor="#ccc"
                    transform="translateY(-50%) rotate(-45deg)"
                  />
                </Box>
                <CustomCheckbox
                  name="blankStockDeno"
                  label="Denomination"
                  checked={formData.blankStockDeno}
                  onChange={handleChange}
                  disabled={!formData.blankStock}
                />
              </Box>
            </Box>

            <CustomCheckbox
              name="AllAddOn"
              label="All Add On"
              checked={formData.AllAddOn}
              onChange={handleChange}
            />

            <CustomCheckbox
              name="IsAllowCancellation"
              label="Is Allow Cancellation?"
              checked={formData.IsAllowCancellation}
              onChange={handleChange}
            />
            <CustomCheckbox
              name="IssuerRequire"
              label="Issuing Authority Required?"
              checked={formData.IssuerRequire}
              onChange={handleChange}
            />
          </>
        );
      case "Accounting Configuration":
        return (
          <>
            <Box
              display={"grid"}
              gridTemplateColumns={getGridTemplateColumns()}
              gap={2}
            >
              <CustomTextField
                label="Issuer A/C Code"
                name="vIssuerAccountCode"
                value={formData.vIssuerAccountCode}
                onChange={handleChange}
              />
              <CustomTextField
                label="Commission A/C Code"
                name="vCommAccountCode"
                value={formData.vCommAccountCode}
                onChange={handleChange}
              />
              <CustomTextField
                label="Fake A/C Code"
                name="vFakeAccountcode"
                value={formData.vFakeAccountcode}
                onChange={handleChange}
              />

              <CustomTextField
                label="Opening A/C Code"
                name="vOpeningAccountCode"
                value={formData.vOpeningAccountCode}
                onChange={handleChange}
              />
              <CustomTextField
                label="Closing A/C Code"
                name="vClosingAccountCode"
                value={formData.vClosingAccountCode}
                onChange={handleChange}
              />
              <CustomTextField
                label="Export A/C Code"
                name="vExportAccountCode"
                value={formData.vExportAccountCode}
                onChange={handleChange}
              />
              <CustomTextField
                label="Purchase A/C Code"
                name="vPurchaseAccountCode"
                value={formData.vPurchaseAccountCode}
                onChange={handleChange}
              />
              <CustomTextField
                label="Sale A/C Code"
                name="vSaleAccountCode"
                value={formData.vSaleAccountCode}
                onChange={handleChange}
              />
              <CustomTextField
                label="Profit A/C Code"
                name="vProfitAccountCode"
                value={formData.vProfitAccountCode}
                onChange={handleChange}
              />
              <CustomTextField
                label="Bulk Purchase A/C Code"
                name="vBulkPurchaseAccountCode"
                value={formData.vBulkPurchaseAccountCode}
                onChange={handleChange}
              />
              <CustomTextField
                label="Bulk Sale A/C Code"
                name="vBulkSaleAccountCode"
                value={formData.vBulkSaleAccountCode}
                onChange={handleChange}
              />
              <CustomTextField
                label="Bulk Profit A/C Code"
                name="vBulkProfitAccountCode"
                value={formData.vBulkProfitAccountCode}
                onChange={handleChange}
              />
              <CustomTextField
                label="Purchase Return Can A/C Code"
                name="vPurRetCanAccountCode"
                value={formData.vPurRetCanAccountCode}
                onChange={handleChange}
              />
              <CustomTextField
                label="Purchase Bulk Cancel A/C Code"
                name="vPurBlkCanAccountCode"
                value={formData.vPurBlkCanAccountCode}
                onChange={handleChange}
              />
              <CustomTextField
                label="Sale Return Can A/C Code"
                name="vSaleRetCanAccountCode"
                value={formData.vSaleRetCanAccountCode}
                onChange={handleChange}
              />
              <CustomTextField
                label="Sale Bulk Cancel A/C Code"
                name="vSaleBlkCanAccountCode"
                value={formData.vSaleBlkCanAccountCode}
                onChange={handleChange}
              />
              <CustomTextField
                label="Purchase Branch A/C Code"
                name="vPurchaseBranchAccountCode"
                value={formData.vPurchaseBranchAccountCode}
                onChange={handleChange}
              />
              <CustomTextField
                label="Sale Branch A/C Code"
                name="vSaleBranchAccountCode"
                value={formData.vSaleBranchAccountCode}
                onChange={handleChange}
              />

              <CustomTextField
                label="Branch Profit A/C Code"
                name="vBrnProfitAccountCode"
                value={formData.vBrnProfitAccountCode}
                onChange={handleChange}
              />
            </Box>
            <Box
              mt={2}
              display={"flex"}
              flexDirection={isMobile ? "column" : "row"}
              sx={{
                gap: 2,
                border: "1px solid #ddd",
                borderRadius: "8px",
                p: 2,
                width: isMobile ? "85%" : "60%",
              }}
            >
              <CustomTextField
                label="Retail Fees"
                name="RetailFees"
                value={formData.RetailFees}
                onChange={handleChange}
                inputMode={"numeric"}
                type={"number"}
              />
              <CustomTextField
                label="Bulk Fees"
                name="BulkFees"
                value={formData.BulkFees}
                onChange={handleChange}
                inputMode={"numeric"}
                type={"number"}
              />
              <CustomTextField
                label="Commision Percent"
                name="COMMPERCENT"
                value={formData.COMMPERCENT}
                onChange={handleChange}
                inputMode={"numeric"}
                type={"number"}
              />
              <CustomTextField
                label="Commision Amount"
                name="COMMAMT"
                value={formData.COMMAMT}
                onChange={handleChange}
                inputMode={"numeric"}
                type={"number"}
              />
            </Box>
          </>
        );

      case "Product Details":
        return (
          <>
            <CustomCheckbox
              name="saleAvgSett"
              label="Sale Average Sett"
              checked={formData.saleAvgSett}
              onChange={handleChange}
            />
            <CustomCheckbox
              name="stockSplit"
              label="Stock Split"
              checked={formData.stockSplit}
              onChange={handleChange}
            />
            <CustomCheckbox
              name="AUTOSTOCK"
              label="Auto Stock"
              checked={formData.AUTOSTOCK}
              onChange={handleChange}
            />
            <CustomCheckbox
              name="stockDenoChange"
              label="Stock Denomination Change"
              checked={formData.stockDenoChange}
              onChange={handleChange}
            />
            <CustomCheckbox
              name="allowFractions"
              label="Allow Fractions"
              checked={formData.allowFractions}
              onChange={handleChange}
            />
            <CustomCheckbox
              name="bReload"
              label="Reload"
              checked={formData.bReload}
              onChange={handleChange}
            />
            <CustomCheckbox
              name="AUTOSETTRATE"
              label="Auto Settle Rate"
              checked={formData.AUTOSETTRATE}
              onChange={handleChange}
            />
            <CustomCheckbox
              name="isSettlement"
              label="Settlement"
              checked={formData.isSettlement}
              onChange={handleChange}
            />
            <CustomCheckbox
              name="reverseProfit"
              label="Reverse Profit"
              checked={formData.reverseProfit}
              onChange={handleChange}
            />
            <CustomCheckbox
              name="AllowMultiCard"
              label="Allow Multi Card"
              checked={formData.AllowMultiCard}
              onChange={handleChange}
            />
            <CustomCheckbox
              name="passSeparateSett"
              label="Pass Separate Settlement"
              checked={formData.passSeparateSett}
              onChange={handleChange}
            />
            <CustomCheckbox
              name="isActive"
              label="Active"
              checked={formData.isActive}
              onChange={handleChange}
            />
            <CustomTextField
              label="Priority"
              name="Priority"
              value={formData.Priority}
              onChange={handleChange}
            />
            <CustomCheckbox
              name="bAskReference"
              label="Ask Reference"
              checked={formData.bAskReference}
              onChange={handleChange}
            />
          </>
        );

      case "Issuer Link":
        return (
          <Box>
            <Box display={"flex"} flexDirection={"column"}>
              <p style={{ color: Colortheme.text }}>
                Product : {initialData.DESCRIPTION}
              </p>
              <p style={{ color: Colortheme.text }}>
                (Check the box to link the respective Issuer)
              </p>
            </Box>
            <CustomDataGrid
              rows={piRows}
              columns={piColumns}
            
              getRowId={(row) => row.id}
              loading={loading}
              sortModel={[
                {
                  field: "nCodesID",
                  sort: "asc",
                },
              ]}
              
              Colortheme={Colortheme}
            />
            
          </Box>
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
      case "Accounting Configuration":
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

        case "Issuer Link":
        return {
          display: "flex",
          flexDirection: "column",
          gap: 2,
          padding: 5,
          border: `1px solid ${Colortheme.text}`,
          borderRadius: "10px",
          marginTop: 2,
          minHeight: "60vh",
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
            name="PRODUCTCODE"
            label="Code"
            value={formData.PRODUCTCODE}
            onChange={handleChange}
            fullWidth
            error={fieldErrors.PRODUCTCODE}
            helperText={fieldErrors.PRODUCTCODE ? "Enter Valid Code!" : ""}
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

          <CustomScrollbarBox>
            <BoxButton
              isMobile={isMobile}
              onClick={() =>
                handleSectionEdit("Retail Transaction Configuration")
              }
            >
              Retail Transaction Configuration
            </BoxButton>
          </CustomScrollbarBox>

          <CustomScrollbarBox>
            <BoxButton
              isMobile={isMobile}
              onClick={() => handleSectionEdit("Accounting Configuration")}
            >
              Accounting Configuration
            </BoxButton>
          </CustomScrollbarBox>

          <CustomScrollbarBox>
            <BoxButton
              isMobile={isMobile}
              onClick={() => handleSectionEdit("Product Details")}
            >
              Product Details
            </BoxButton>
          </CustomScrollbarBox>

          {initialData && (
            <CustomScrollbarBox>
              <BoxButton
                isMobile={isMobile}
                onClick={() => handleSectionEdit("Issuer Link")}
                borderColor={"#00d3ff"}
                borderRadius="8px" // Custom border radius
              >
                Issuer Link
              </BoxButton>
            </CustomScrollbarBox>
          )}
        </>
      </CustomScrollbarBox>
      <CustomScrollbarBox
        display={"flex"}
        justifyContent={"center"}
        marginTop={15}
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

          {openSectionDialog === "Issuer Link" && (
            <StyledButton
              onClick={savePIChanges}
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

export default ProductProfileForm;
