import React, { useState, useContext, useEffect, useRef } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ThemeContext } from "../../../../contexts/ThemeContext";
import { useToast } from "../../../../contexts/ToastContext";
import CustomBoxButton from "../../../../components/global/CustomBoxButton";
import CustomTextField from "../../../../components/global/CustomTextField";
import CustomAutocomplete from "../../../../components/global/CustomAutocomplete";
import CustomDatePicker from "../../../../components/global/CustomDatePicker";
import StyledButton from "../../../../components/global/StyledButton";
import { apiClient } from "../../../../services/apiClient";
import { useParams } from "react-router-dom";
import Alert from "@mui/material/Alert";
import { useSettings } from "../../../../contexts/SettingsContext";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import WarningIcon from "@mui/icons-material/Warning";

const ChargesAndRecPay = ({ data, onUpdate }) => {
  const isInitialized = useRef(false);
  const isInitializing = useRef(false);

  // TODO: FIX THE CASE WHERE HFEE IS NOT BEING PERSISTENT,CAUSING MISCALUCATION DURING RECPAY.

  useEffect(() => {
    console.log("data changed:", data);
    // console.log("what triggered the change:", JSON.stringify(data, null, 2));
  }, [data]);

  const { Type: vTrntype } = useParams();

  const { Colortheme } = useContext(ThemeContext);
  const { showToast, hideToast } = useToast();
  const { getSetting } = useSettings();

  // Modal states
  const [openChargesModal, setOpenChargesModal] = useState(false);
  const [openFeeTaxesModal, setOpenFeeTaxesModal] = useState(false);
  const [openRecPayModal, setOpenRecPayModal] = useState(false);
  const [openTaxModal, setOpenTaxModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalCharges, setOriginalCharges] = useState([]);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [hasUnsavedTaxChanges, setHasUnsavedTaxChanges] = useState(false);
  const [originalTaxData, setOriginalTaxData] = useState([]);
  const [showUnsavedTaxWarning, setShowUnsavedTaxWarning] = useState(false);

  // Charges modal states
  const [chargesData, setChargesData] = useState([]);
  const [accountOptions, setAccountOptions] = useState([]);

  // Initial empty row template
  const emptyRow = {
    account: null,
    operation: "+",
    value: "",
    othSGST: "",
    othCGST: "",
    othIGST: "0.00",
    OtherChargeGST: false,
    isModified: false,
  };

  // State for Tax Modal
  const [taxData, setTaxData] = useState([]);
  const [taxSlabData, setTaxSlabData] = useState({});
  const [totalTaxAmount, setTotalTaxAmount] = useState(0);
  const [amountAfterTax, setAmountAfterTax] = useState(0);
  const [fixedTaxAmounts, setFixedTaxAmounts] = useState({});
  const [originalFixedTaxAmounts, setOriginalFixedTaxAmounts] = useState({});

  // State for RecPay Modal
  const [recPayData, setRecPayData] = useState([]);
  const [codeOptions, setCodeOptions] = useState([]);
  const [chequeOptions, setChequeOptions] = useState([]);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editingSrno, setEditingSrno] = useState(null);
  const [hasUnsavedRecPayChanges, setHasUnsavedRecPayChanges] = useState(false);
  const [newRecPayRow, setNewRecPayRow] = useState({
    code: "",
    chequeNo: "",
    chequeDate: new Date(),
    drawnOn: "",
    branch: "",
    accountDate: new Date(),
    amount: "",
  });

  const [netAmount, setNetAmount] = useState(0);

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  // RecPay Modal effects
  // Add this effect to fetch code options
  useEffect(() => {
    const fetchCodeOptions = async () => {
      try {
        const response = await apiClient.get(
          "/pages/Transactions/getPaymentCodes"
        );
        // Format the options to have label and value properties
        const formattedOptions = response.data.map((option) => ({
          label: `${option.vCode} - ${option.vName}`, // Display code and name
          value: option.vCode,
          ...option, // Keep the original data
        }));
        setCodeOptions(formattedOptions);
      } catch (error) {
        console.error("Error fetching code options:", error);
      }
    };

    fetchCodeOptions();
  }, []);

  // Also update the recPayData when context changes
  useEffect(() => {
    if (data.RecPay && data.RecPay.length > 0) {
      setRecPayData(data.RecPay);
    }
  }, [data.RecPay]);

  const handleCloseRecPayModal = () => {
    if (hasUnsavedRecPayChanges) {
      return; // Don't close if there are unsaved changes
    }
    setOpenRecPayModal(false);
  };

  const handleSaveRecPay = () => {
    onUpdate({
      RecPay: recPayData,
      RecPayTotalAmount: recPayData.reduce(
        (sum, row) => sum + parseFloat(row.amount || 0),
        0
      ),
    });
    setHasUnsavedRecPayChanges(false);
    setOpenRecPayModal(false);
  };

  // Add this handler for discarding changes
  const handleDiscardRecPay = () => {
    setRecPayData(data.RecPay || []);

    // Reset remaining amount based on context data
    const totalPaid =
      data.RecPay?.reduce((sum, row) => sum + parseFloat(row.amount || 0), 0) ||
      0;
    const remaining = (amountAfterTax || 0) - totalPaid;
    setRemainingAmount(remaining);

    // Reset input row with correct remaining amount
    setNewRecPayRow((prev) => ({
      ...prev,
      amount: remaining,
    }));

    setHasUnsavedRecPayChanges(false);
    setOpenRecPayModal(false);
  };

  // Add this effect to fetch cheque options
  useEffect(() => {
    const fetchChequeOptions = async (bankCode) => {
      if (!bankCode) return;

      try {
        const response = await apiClient.get(
          `/pages/Transactions/cheque-options/${bankCode}`
        );
        if (response.data.success) {
          setChequeOptions(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching cheque options:", error);
      }
    };

    // Call fetchChequeOptions when bank code changes
    if (newRecPayRow.code) {
      fetchChequeOptions(newRecPayRow.code);
    }
  }, [newRecPayRow.code]);

  // useEffect(() => {
  //   setNewRecPayRow((prev) => ({
  //     ...prev,
  //     amount: amountAfterTax || 0,
  //   }));
  //   setRemainingAmount(amountAfterTax || 0);
  // }, [amountAfterTax]);

  // useEffect(() => {
  //   const totalPaid =
  //     data.RecPay?.reduce((sum, row) => sum + parseFloat(row.amount || 0), 0) ||
  //     0;
  //   const remaining = (amountAfterTax || 0) - totalPaid;

  //   setNewRecPayRow((prev) => ({
  //     ...prev,
  //     amount: remaining,
  //   }));
  //   setRemainingAmount(remaining);
  // }, [amountAfterTax, data.RecPay]);

  useEffect(() => {
    const totalPaid =
      data.RecPay?.reduce((sum, row) => sum + parseFloat(row.amount || 0), 0) ||
      0;

    // Parse and convert charges and tax amounts to positive numbers
    const chargesTotal = Math.abs(parseFloat(data.ChargesTotalAmount || 0));
    const taxTotal = Math.abs(parseFloat(data.TaxTotalAmount || 0));
    const totalDeductions = chargesTotal + taxTotal;

    const netAmount = (parseFloat(data.Amount) || 0) - totalDeductions;
    const remaining = netAmount - totalPaid;

    console.log("Total Paid:", totalPaid);
    console.log("Charges Total:", chargesTotal);
    console.log("Tax Total:", taxTotal);
    console.log("Total Deductions:", totalDeductions);
    console.log("Net Amount:", netAmount);
    console.log("Remaining Amount:", remaining);

    setNetAmount(netAmount);

    setNewRecPayRow((prev) => ({
      ...prev,
      amount: remaining,
    }));
    setRemainingAmount(remaining);
  }, [data.Amount, data.ChargesTotalAmount, data.TaxTotalAmount, data.RecPay]);

  //RecPay Modal handlers
  // Add these handlers

  const isValidRecPayInput = () => {
    return newRecPayRow.code && parseFloat(newRecPayRow.amount || 0) > 0;
  };

  const handleRecPayInputChange = (field, value) => {
    if (field === "code") {
      // If changing from CASH to another code, set chequeDate to current date
      // If changing to CASH, set chequeDate to null
      setNewRecPayRow((prev) => ({
        ...prev,
        [field]: value,
        chequeDate: value === "CASH" ? null : new Date(),
      }));
    } else if (field === "amount") {
      const numValue = parseFloat(value) || 0;

      // Check if amount exceeds total amount
      if (numValue > amountAfterTax) {
        showToast("Amount cannot exceed total amount", "error");
        setTimeout(() => {
          hideToast();
        }, 2500);
        return;
      }

      // Check if amount exceeds remaining amount when not in edit mode
      if (numValue > remainingAmount && !editMode) {
        showToast("Amount cannot exceed remaining amount", "error");
        setTimeout(() => {
          hideToast();
        }, 2500);
        return;
      }

      setNewRecPayRow((prev) => ({
        ...prev,
        [field]: value,
      }));
    } else {
      setNewRecPayRow((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleAddRecPayRow = () => {
    if (!isValidRecPayInput()) {
      showToast(
        "Please select a Code and enter an amount greater than 0",
        "error"
      );
      setTimeout(() => {
        hideToast();
      }, 3500);
      return;
    }
    // Check if code already exists in recPayData
    const isDuplicateCode = recPayData.some(
      (row) => row.code === newRecPayRow.code
    );

    if (isDuplicateCode) {
      showToast(
        "This payment method is already used. Please edit the existing row or use a different method.",
        "error"
      );
      setTimeout(() => {
        hideToast();
      }, 3500);
      return;
    }

    const newRow = {
      ...newRecPayRow,
      chequeDate: newRecPayRow.code === "CASH" ? null : newRecPayRow.chequeDate,
      srno: recPayData.length + 1,
    };

    setRecPayData((prev) => [...prev, newRow]);
    setHasUnsavedRecPayChanges(true);
    // Update remaining amount
    setRemainingAmount(
      (prev) => parseFloat(prev) - parseFloat(newRow.amount || 0)
    );

    // Reset the input row with remaining amount
    setNewRecPayRow({
      code: "",
      chequeNo: "",
      chequeDate: null,
      drawnOn: "",
      branch: "",
      accountDate: new Date(),
      amount: remainingAmount - parseFloat(newRow.amount || 0),
    });
  };

  // Add edit handler
  const handleEditRow = (row) => {
    setEditMode(true);
    setEditingSrno(row.srno);
    // Add back the amount to remaining amount temporarily
    setRemainingAmount(
      (prev) => parseFloat(prev) + parseFloat(row.amount || 0)
    );
    // Set the row data to input fields
    setNewRecPayRow({
      code: row.code,
      chequeNo: row.chequeNo,
      chequeDate: row.chequeDate,
      drawnOn: row.drawnOn,
      branch: row.branch,
      accountDate: row.accountDate,
      amount: row.amount,
    });
  };

  // Add save edit handler
  const handleSaveEdit = () => {
    if (!isValidRecPayInput()) {
      showToast(
        "Please select a Code and enter an amount greater than 0",
        "error"
      );
      setTimeout(() => {
        hideToast();
      }, 3500);
      return;
    }

    // Check for duplicates, excluding the row being edited
    const isDuplicateCode = recPayData.some(
      (row) => row.code === newRecPayRow.code && row.srno !== editingSrno
    );

    if (isDuplicateCode) {
      showToast(
        "This payment method is already used. Please use a different method.",
        "error"
      );
      setTimeout(() => {
        hideToast();
      }, 3500);
      return;
    }

    setRecPayData((prev) =>
      prev.map((row) => {
        if (row.srno === editingSrno) {
          return {
            ...newRecPayRow,
            srno: row.srno,
            chequeDate:
              newRecPayRow.code === "CASH" ? null : newRecPayRow.chequeDate,
          };
        }
        return row;
      })
    );

    setHasUnsavedRecPayChanges(true);

    // Update remaining amount with new amount
    setRemainingAmount(
      (prev) => parseFloat(prev) - parseFloat(newRecPayRow.amount || 0)
    );

    // Reset edit mode
    setEditMode(false);
    setEditingSrno(null);

    // Reset input fields with remaining amount
    setNewRecPayRow({
      code: "",
      chequeNo: "",
      chequeDate: null,
      drawnOn: "",
      branch: "",
      accountDate: new Date(),
      amount: remainingAmount - parseFloat(newRecPayRow.amount || 0),
    });
  };

  const handleDeleteRecPayRow = (srno) => {
    // Find the row being deleted to get its amount
    const deletedRow = recPayData.find((row) => row.srno === srno);

    // Filter out the row with matching srno
    setRecPayData((prev) => {
      const filteredData = prev.filter((row) => row.srno !== srno);
      // Reorder srno for remaining rows
      return filteredData.map((row, index) => ({
        ...row,
        srno: index + 1,
      }));
    });
    setHasUnsavedRecPayChanges(true);

    // Add back the deleted amount to remaining amount
    setRemainingAmount(
      (prev) => parseFloat(prev) + parseFloat(deletedRow?.amount || 0)
    );

    // Update the input row amount with new remaining amount
    setNewRecPayRow((prev) => ({
      ...prev,
      amount: parseFloat(remainingAmount) + parseFloat(deletedRow?.amount || 0),
    }));
  };

  useEffect(() => {
    if (data.Charges?.length > 0) {
      setChargesData(
        data.Charges.map((charge) => ({ ...charge, isModified: false }))
      );
    } else {
      setChargesData([{ ...emptyRow }]);
    }
  }, [data.Charges]);

  const checkUnsavedChanges = () => {
    // If there's only one empty row and no original charges, there are no changes
    if (
      chargesData.length === 1 &&
      !chargesData[0].account &&
      originalCharges.length === 0
    ) {
      return false;
    }

    // If lengths are different, there are changes
    if (chargesData.length !== originalCharges.length) {
      return true;
    }

    // Compare each row
    return chargesData.some((row, index) => {
      const originalRow = originalCharges[index];

      // If row has no account and is empty, treat it as unchanged
      if (!row.account && !row.value && !row.operation) {
        return false;
      }

      // Check if the row is different from original
      return (
        !originalRow ||
        row.account?.value !== originalRow.account?.value ||
        row.value !== originalRow.value ||
        row.operation !== originalRow.operation
      );
    });
  };

  const handleModalOpen = () => {
    setOriginalCharges([
      ...chargesData.map((charge) => ({ ...charge, isModified: false })),
    ]);
    setHasUnsavedChanges(false);
    setOpenChargesModal(true);
  };

  const handleChargesModalClose = () => {
    const hasChanges = checkUnsavedChanges();
    if (hasChanges) {
      setShowUnsavedWarning(true);
    } else {
      setShowUnsavedWarning(false);
      setOpenChargesModal(false);
    }
  };

  const handleConfirmClose = () => {
    setShowUnsavedWarning(false);
    // If original charges is empty, ensure we have at least one empty row
    const revertData =
      originalCharges.length > 0 ? [...originalCharges] : [{ ...emptyRow }];
    setChargesData(revertData);

    // Calculate charges total only once
    const additionalCharges = revertData.reduce((sum, charge) => {
      if (charge.value && charge.account) {
        const value = parseFloat(charge.value || 0);
        const igst = parseFloat(charge.othIGST || 0);
        const total = value + igst;

        return charge.operation === "+" ? sum + total : sum - total;
      }
      return sum;
    }, 0);

    // Update the context with the reverted data
    onUpdate({
      Charges:
        revertData.length === 1 && !revertData[0].account ? [] : revertData,
      ChargesTotalAmount: parseFloat(additionalCharges).toFixed(2),
    });

    setOpenChargesModal(false);
  };

  const handleSaveCharges = () => {
    // Map charges to OthChgID and OthAmt fields
    const chargesMapping = {};

    chargesData.forEach((charge, index) => {
      const idKey = `OthChgID${index + 1}`;
      const amtKey = `OthAmt${index + 1}`;

      if (index < 5) {
        // Only process first 5 charges
        // Calculate total amount for this charge including value and IGST only
        const chargeTotal =
          charge.value && charge.account
            ? parseFloat(charge.value || 0) + parseFloat(charge.othIGST || 0)
            : 0;

        chargesMapping[idKey] = charge.account?.value || "";
        // Apply operation (+ or -) to the total
        chargesMapping[amtKey] =
          charge.operation === "-"
            ? parseFloat(-chargeTotal).toFixed(2)
            : parseFloat(chargeTotal).toFixed(2);
      }
    });

    // Fill remaining slots with empty/zero values
    for (let i = chargesData.length + 1; i <= 5; i++) {
      chargesMapping[`OthChgID${i}`] = "";
      chargesMapping[`OthAmt${i}`] = 0;
    }

    // Calculate total charges considering operation and including only value and IGST
    const chargesTotal = chargesData.reduce((sum, charge) => {
      if (charge.value && charge.account) {
        const value = parseFloat(charge.value || 0);
        const igst = parseFloat(charge.othIGST || 0);
        const total = value + igst;

        return charge.operation === "+" ? sum + total : sum - total;
      }
      return sum;
    }, 0);

    onUpdate({
      Charges: chargesData, // Keep original charges array for reference
      ChargesTotalAmount: parseFloat(chargesTotal).toFixed(2),
      ...chargesMapping, // Spread the OthChgID and OthAmt mappings
    });

    setShowUnsavedWarning(false);
    setOpenChargesModal(false);
  };

  const fetchAccountOptions = async () => {
    try {
      const response = await apiClient.get(
        "/pages/Transactions/getOtherChargeAccounts"
      );
      setAccountOptions(response.data);
    } catch (error) {
      console.error("Error fetching account options:", error);
      showToast("Error fetching account options", "error");
      setTimeout(() => {
        hideToast();
      }, 2000);
    }
  };

  useEffect(() => {
    fetchAccountOptions();
  }, []);

  const handleAddChargeRow = () => {
    const newData = [...chargesData, { ...emptyRow, isModified: true }];
    setChargesData(newData);
    calculateTotalWithCharges(newData);
    setHasUnsavedChanges(true);
  };

  const handleChargeChange = (index, field, value) => {
    const newData = [...chargesData];
    newData[index] = { ...newData[index], [field]: value, isModified: true };

    if (field === "account") {
      newData[index].OtherChargeGST = value?.OtherChargeGST;
      newData[index].othIGST = "0.00";
      if (newData[index].value && value?.OtherChargeGST) {
        const numValue = parseFloat(newData[index].value || 0);
        newData[index].othIGST = (numValue * 0.18).toFixed(2);
      }
    }

    if (field === "value") {
      const numValue = parseFloat(value || 0);
      const selectedAccount = accountOptions.find(
        (acc) => acc.value === newData[index].account?.value
      );
      if (selectedAccount?.OtherChargeGST) {
        newData[index].othIGST = (numValue * 0.18).toFixed(2);
      } else {
        newData[index].othIGST = "0.00";
      }
    }

    setChargesData(newData);

    // Get the calculated values from the new implementation
    const { additionalCharges } = calculateTotalWithCharges(newData);

    // Update with the new charges
    onUpdate({
      Charges: newData,
      ChargesTotalAmount: parseFloat(additionalCharges).toFixed(2),
    });

    setHasUnsavedChanges(true);
  };

  const handleDeleteChargeRow = (index) => {
    const newData = chargesData.filter((_, i) => i !== index);
    // Only add empty row if we're not discarding changes
    if (newData.length === 0 && !showUnsavedWarning) {
      newData.push({ ...emptyRow });
    }
    setChargesData(newData);
    calculateTotalWithCharges(newData);
    setHasUnsavedChanges(true);
  };

  // const calculateTotalWithCharges = (charges) => {
  //   let baseAmount = parseFloat(data.Amount || 0);

  //   const additionalCharges = charges.reduce((sum, charge) => {
  //     if (charge.value && charge.account) {
  //       const value = parseFloat(charge.value || 0);
  //       const igst = parseFloat(charge.othIGST || 0);
  //       const total = value + igst;

  //       return charge.operation === "+" ? sum + total : sum - total;
  //     }
  //     return sum;
  //   }, 0);

  //   const newTotal = baseAmount + additionalCharges;
  //   onUpdate({ ChargesTotalAmount: parseFloat(newTotal).toFixed(2) });
  //   return newTotal;
  // };

  // const calculateTotalWithCharges = (charges) => {
  //   const additionalCharges = charges.reduce((sum, charge) => {
  //     if (charge.value && charge.account) {
  //       const value = parseFloat(charge.value || 0);
  //       const igst = parseFloat(charge.othIGST || 0);
  //       const total = value + igst;

  //       return charge.operation === "+" ? sum + total : sum - total;
  //     }
  //     return sum;
  //   }, 0);

  //   // Only update with the additional charges, not including baseAmount
  //   onUpdate({ ChargesTotalAmount: parseFloat(additionalCharges).toFixed(2) });
  //   return parseFloat(data.Amount || 0) + additionalCharges;
  // };

  const calculateTotalWithCharges = (charges) => {
    const additionalCharges = charges.reduce((sum, charge) => {
      if (charge.value && charge.account) {
        const value = parseFloat(charge.value || 0);
        const igst = parseFloat(charge.othIGST || 0);
        const total = value + igst;

        return charge.operation === "+" ? sum + total : sum - total;
      }
      return sum;
    }, 0);

    // Return both values instead of calling onUpdate
    return {
      additionalCharges,
      total: parseFloat(data.Amount || 0) + additionalCharges,
    };
  };

  // Effect to fetch tax data
  useEffect(() => {
    if (data.Amount) {
      fetchTaxData();
    }
  }, [data.Amount]);

  // Fetch tax data
  const fetchTaxData = async () => {
    try {
      const response = await apiClient.get("/pages/Transactions/getTaxData", {
        params: { vTrntype: vTrntype },
      });
      const taxes = response.data.taxes.map((tax) => ({
        ...tax,
        currentSign: vTrntype === "B" ? tax.RETAILBUYSIGN : tax.RETAILSELLSIGN,
      }));

      // Create ordered tax array
      let orderedTaxes = [];

      // 1. Find and add GST18%
      const gst18Tax = taxes.find((tax) => tax.CODE === "gst18%");
      if (gst18Tax) {
        orderedTaxes.push(gst18Tax);
      }

      // 2. Add TAXROFF if it exists
      const taxRoff = taxes.find((tax) => tax.CODE === "TAXROFF");
      if (taxRoff) {
        orderedTaxes.push(taxRoff);
      }

      // 3. Find and add HFEE
      const hfeeTax = taxes.find((tax) => tax.CODE === "HFEE");
      if (hfeeTax) {
        orderedTaxes.push(hfeeTax);

        // 4. Add HFEEIGST right after HFEE
        orderedTaxes.push({
          nTaxID: Math.max(...orderedTaxes.map(t => t.nTaxID)) + 1,
          CODE: "HFEEIGST",
          DESCRIPTION: "HFEE GST",
          APPLYAS: "%",
          VALUE: 18,
          SLABWISETAX: false,
          currentSign: hfeeTax.currentSign,
          isAutoCalculated: true,
        });
      }

      // Add any remaining taxes
      taxes.forEach((tax) => {
        if (!["gst18%", "TAXROFF", "HFEE"].includes(tax.CODE)) {
          orderedTaxes.push(tax);
        }
      });

      // Set state
      setTaxData(orderedTaxes);
      setOriginalTaxData(JSON.parse(JSON.stringify(orderedTaxes)));
      setTaxSlabData(response.data.taxSlabs);
      setFixedTaxAmounts({});
      setOriginalFixedTaxAmounts({});
    } catch (error) {
      console.error("Error fetching tax data:", error);
      showToast("Error fetching tax data", "error");
      setTimeout(() => {
        hideToast();
      }, 2000);
    }
  };

  // Combined effect for initialization and calculation
  useEffect(() => {
    console.log("=== Combined Tax Effect Triggered ===");
    // Only initialize once when we have taxes
    if (data.Taxes?.length > 0 && !isInitialized.current) {
      console.log("Initializing tax data...");
      isInitializing.current = true;

      // Deep clone the tax data to avoid reference issues
      let newTaxData = JSON.parse(JSON.stringify(data.Taxes));

      // Find HFEE and HFEEIGST
      const existingHFEE = newTaxData.find((tax) => tax.CODE === "HFEE");
      const existingHFEEIGST = newTaxData.find((tax) => tax.CODE === "HFEEIGST");

      console.log("Found taxes:", {
        HFEE: existingHFEE,
        HFEEIGST: existingHFEEIGST,
        allTaxes: newTaxData,
      });

      // Initialize fixed amounts starting with existing HFEE
      const newFixedAmounts = {};

      // First handle HFEE since other calculations depend on it
      if (existingHFEE) {
        const hfeeAmount = parseFloat(existingHFEE.amount);
        if (!isNaN(hfeeAmount)) {
          newFixedAmounts[existingHFEE.nTaxID] = hfeeAmount;
          existingHFEE.amount = parseFloat(hfeeAmount.toFixed(2));
          existingHFEE.lineTotal = parseFloat(
            (hfeeAmount * (existingHFEE.currentSign === "+" ? 1 : -1)).toFixed(2)
          );
        }
      }

      // Then handle HFEEIGST
      if (existingHFEE) {
        const hfeeAmount = newFixedAmounts[existingHFEE.nTaxID] || 0;
        const hfeeigstAmount = parseFloat((hfeeAmount * 0.18).toFixed(2));

        if (!existingHFEEIGST) {
          const hfeeigst = {
            nTaxID: Math.max(...newTaxData.map(t => t.nTaxID)) + 1,
            CODE: "HFEEIGST",
            DESCRIPTION: "HFEE GST",
            APPLYAS: "%",
            VALUE: 18,
            SLABWISETAX: false,
            currentSign: existingHFEE.currentSign,
            isAutoCalculated: true,
            amount: parseFloat(hfeeigstAmount.toFixed(2)),
            lineTotal: parseFloat(
              (hfeeigstAmount * (existingHFEE.currentSign === "+" ? 1 : -1)).toFixed(2)
            ),
          };
          newTaxData.push(hfeeigst);
        } else {
          existingHFEEIGST.amount = parseFloat(hfeeigstAmount.toFixed(2));
          existingHFEEIGST.lineTotal = parseFloat(
            (hfeeigstAmount * (existingHFEEIGST.currentSign === "+" ? 1 : -1)).toFixed(2)
          );
        }
        newFixedAmounts[existingHFEE.nTaxID + 2] = hfeeigstAmount;
      }

      // Format all other tax amounts
      newTaxData = newTaxData.map((tax) => {
        if (tax.CODE !== "HFEE" && tax.CODE !== "HFEEIGST") {
          const amount = parseFloat(tax.amount) || 0;
          return {
            ...tax,
            amount: parseFloat(amount.toFixed(2)),
            lineTotal: parseFloat(
              (amount * (tax.currentSign === "+" ? 1 : -1)).toFixed(2)
            ),
          };
        }
        return tax;
      });

      console.log("Setting initial state:", {
        taxData: newTaxData,
        fixedAmounts: newFixedAmounts,
      });

      // Set all states at once
      setFixedTaxAmounts(newFixedAmounts);
      setOriginalFixedTaxAmounts(newFixedAmounts);
      setTaxData(newTaxData);
      setOriginalTaxData(newTaxData);
      isInitialized.current = true;

      // Calculate total with properly formatted numbers
      const total = parseFloat(
        newTaxData.reduce((sum, tax) => sum + (tax.lineTotal || 0), 0).toFixed(2)
      );
      setTotalTaxAmount(total);
      setAmountAfterTax(
        parseFloat((parseFloat(data.Amount) || 0) + total).toFixed(2)
      );

      // Clear initialization flag after a small delay to ensure states are set
      setTimeout(() => {
        isInitializing.current = false;
      }, 100);
    }
    // Calculate taxes only if we have all required data and something has changed
    if (
      taxData.length > 0 &&
      taxSlabData &&
      data.Amount &&
      !isInitializing.current // Add this check
    ) {
      const timeoutId = setTimeout(() => {
        // Store previous values for comparison
        const prevTaxes = JSON.stringify(taxData);
        const prevTotal = totalTaxAmount;

        const { updatedTaxes, total } = calculateTotalTaxAmount(
          taxData,
          fixedTaxAmounts
        );

        // Only update if values have actually changed
        const hasChanged =
          JSON.stringify(updatedTaxes) !== prevTaxes || total !== prevTotal;

        if (hasChanged) {
          console.log("Values changed, updating state:", {
            prevTotal,
            newTotal: total,
            fixedAmounts: fixedTaxAmounts,
          });

          setTaxData(updatedTaxes);
          setTotalTaxAmount(total);
          setAmountAfterTax(parseFloat(data.Amount || 0) + total);

          onUpdate({
            Taxes: updatedTaxes,
            TaxTotalAmount: parseFloat(total).toFixed(2),
          });
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [data.Taxes, data.Amount, taxSlabData, fixedTaxAmounts, totalTaxAmount]);

  // Reset initialization when modal closes
  useEffect(() => {
    if (!openTaxModal) {
      isInitialized.current = false;
    }
  }, [openTaxModal]);

  const calculateRawGst18Amount = (exchangeAmount, gst18Tax) => {
    if (!gst18Tax) return 0;

    if (gst18Tax.SLABWISETAX) {
      const slabs = taxSlabData[gst18Tax.nTaxID] || [];
      const slab = slabs.find(
        (s) =>
          parseFloat(exchangeAmount) >= parseFloat(s.FROMAMT) &&
          parseFloat(exchangeAmount) <= parseFloat(s.TOAMT)
      );

      if (slab) {
        // Check if slab has BASEVALUE
        if (parseFloat(slab.BASEVALUE) > 0) {
          return parseFloat(slab.BASEVALUE);
        }

        // If no BASEVALUE, proceed with percentage calculation
        const amount = exchangeAmount * (parseFloat(slab.VALUE) / 100);
        return amount;
      }
    } else {
      const amount = exchangeAmount * (parseFloat(gst18Tax.VALUE) / 100);
      return amount;
    }
    return 0;
  };

  const calculateTaxAmount = (
    tax,
    exchangeAmount,
    currentFixedAmounts = fixedTaxAmounts
  ) => {
    if (!exchangeAmount) {
      return 0;
    }

    // For HFEEIGST, calculate based on HFEE amount
    if (tax.CODE === "HFEEIGST") {
      const hfeeTax = taxData.find((t) => t.CODE === "HFEE");
      if (hfeeTax) {
        const hfeeAmount = currentFixedAmounts[hfeeTax.nTaxID] || 0;
        const amount = hfeeAmount * (parseFloat(tax.VALUE) / 100);
        return amount;
      }
      return 0;
    }

    // For TAXROFF, calculate based on raw GST18% amount
    if (tax.CODE === "TAXROFF") {
      const gst18Tax = taxData.find((tax) => tax.CODE === "gst18%");
      const rawGst18Amount = calculateRawGst18Amount(exchangeAmount, gst18Tax);
      const decimalPart = rawGst18Amount % 1;
      const amount = decimalPart >= 0.5 ? 1 - decimalPart : -decimalPart;
      return amount;
    }

    // For GST18%, keep decimal value
    if (tax.CODE === "gst18%") {
      const amount = calculateRawGst18Amount(exchangeAmount, tax);
      return amount;
    }

    if (tax.APPLYAS === "F") {
      const amount = currentFixedAmounts[tax.nTaxID] || 0;
      return parseFloat(amount) || 0;
    }

    if (tax.SLABWISETAX) {
      const slabs = taxSlabData[tax.nTaxID] || [];
      console.log("slabs", slabs);
      const slab = slabs.find(
        (s) =>
          parseFloat(exchangeAmount) >= parseFloat(s.FROMAMT) &&
          parseFloat(exchangeAmount) <= parseFloat(s.TOAMT)
      );

      if (slab) {
        console.log("slab", slab);
        // Check if slab has BASEVALUE
        if (parseFloat(slab.BASEVALUE) > 0) {
          return parseFloat(slab.BASEVALUE);
        }

        // If no BASEVALUE, proceed with normal calculation
        if (tax.APPLYAS === "%") {
          const amount = exchangeAmount * (parseFloat(slab.VALUE) / 100);
          return amount;
        } else {
          const amount = parseFloat(slab.VALUE);
          return amount;
        }
      }
      return 0;
    } else {
      if (tax.APPLYAS === "%") {
        const amount = exchangeAmount * (parseFloat(tax.VALUE) / 100);
        return amount;
      } else {
        const amount = parseFloat(tax.VALUE);
        return amount;
      }
    }
  };

  //TODO: REMOVE THIS EFFECT

  const calculateTotalTaxAmount = (
    taxList = taxData,
    currentFixedAmounts = fixedTaxAmounts
  ) => {
    console.log("calculateTotalTaxAmount called:");
    console.log("- Input taxList:", taxList);
    console.log("- Input currentFixedAmounts:", currentFixedAmounts);

    // Create a new tax list preserving the existing amounts for fixed taxes
    const updatedTaxes = taxList.map((tax) => {
      let amount;

      if (tax.CODE === "HFEE") {
        // For HFEE, use the existing amount from tax object if no fixed amount is provided
        amount =
          currentFixedAmounts[tax.nTaxID] !== undefined
            ? currentFixedAmounts[tax.nTaxID]
            : parseFloat(tax.amount) || 0;
      } else if (tax.CODE === "HFEEIGST") {
        // For HFEEIGST, calculate based on HFEE
        const hfeeTax = taxList.find((t) => t.CODE === "HFEE");
        const hfeeAmount = hfeeTax
          ? (currentFixedAmounts[hfeeTax.nTaxID] !== undefined
              ? currentFixedAmounts[hfeeTax.nTaxID]
              : parseFloat(hfeeTax.amount)) || 0
          : 0;
        amount = parseFloat((hfeeAmount * 0.18).toFixed(2));
      } else {
        // For other taxes, use normal calculation
        amount = calculateTaxAmount(
          tax,
          parseFloat(data.Amount) || 0,
          currentFixedAmounts
        );
      }

      // Handle NaN values
      if (isNaN(amount)) {
        console.warn(`Amount is NaN for tax ${tax.CODE}, resetting to 0`);
        amount = 0;
      }

      const sign = tax.currentSign === "+" ? 1 : -1;
      const lineTotal = parseFloat((amount * sign).toFixed(2));

      return {
        ...tax,
        amount: amount,
        lineTotal: lineTotal,
      };
    });

    const total = parseFloat(
      updatedTaxes
        .reduce((sum, tax) => sum + (tax.lineTotal || 0), 0)
        .toFixed(2)
    );

    return { updatedTaxes, total };
  };

  const handleFixedTaxAmountChange = (taxId, amount) => {
    let validAmount = parseFloat(amount) || 0;

    // Find the tax object using nTaxID
    const tax = taxData.find((t) => t.nTaxID === taxId);

    // Check HFEE max value
    if (tax?.CODE === "HFEE") {
      const maxHfeeValue = parseFloat(
        getSetting("HFEEMAXVALUE", "advanced", "0")
      );
      if (validAmount > maxHfeeValue) {
        showToast(`HFEE cannot exceed ${maxHfeeValue}`, "error");
        setTimeout(() => {
          hideToast();
        }, 2000);
        validAmount = maxHfeeValue;
      }
    }

    // Update fixed amounts
    const newFixedTaxAmounts = {
      ...fixedTaxAmounts,
      [taxId]: validAmount,
    };

    // If this is HFEE, also update HFEEIGST amount
    if (tax?.CODE === "HFEE") {
      const hfeeigstAmount = parseFloat((validAmount * 0.18).toFixed(2));
      newFixedTaxAmounts[taxData.find((t) => t.CODE === "HFEEIGST").nTaxID] =
        hfeeigstAmount;
    }

    // Update the tax data
    const updatedTaxData = taxData.map((t) => {
      if (t.nTaxID === taxId) {
        return {
          ...t,
          amount: validAmount,
          lineTotal: validAmount * (t.currentSign === "+" ? 1 : -1),
        };
      }
      if (tax?.CODE === "HFEE" && t.CODE === "HFEEIGST") {
        const hfeeigstAmount = parseFloat((validAmount * 0.18).toFixed(2));
        return {
          ...t,
          amount: hfeeigstAmount,
          lineTotal: hfeeigstAmount * (t.currentSign === "+" ? 1 : -1),
        };
      }
      return t;
    });

    // Calculate new total
    const { total } = calculateTotalTaxAmount(
      updatedTaxData,
      newFixedTaxAmounts
    );

    // Update all states
    setFixedTaxAmounts(newFixedTaxAmounts);
    setTaxData(updatedTaxData);
    setTotalTaxAmount(total);
    setHasUnsavedTaxChanges(true);

    // // Update parent immediately
    // onUpdate({
    //   Taxes: updatedTaxData,
    //   TaxTotalAmount: parseFloat(total).toFixed(2),
    // });
  };

  // Handle sign change
  const handleSignChange = (taxId, newSign) => {
    const updatedTaxData = taxData.map((tax) => {
      if (tax.nTaxID === taxId) {
        return { ...tax, currentSign: newSign };
      }
      // Update HFEEIGST sign if HFEE sign changes
      if (tax.CODE === "HFEE" && newSign && taxId === tax.nTaxID) {
        const hfeeigstIndex = taxData.findIndex((t) => t.CODE === "HFEEIGST");
        if (hfeeigstIndex !== -1) {
          taxData[hfeeigstIndex] = {
            ...taxData[hfeeigstIndex],
            currentSign: newSign,
          };
        }
      }
      return tax;
    });
    setTaxData(updatedTaxData);
    setHasUnsavedTaxChanges(true);
    calculateTotalTaxAmount(updatedTaxData);
  };

  // Handle tax modal close
  const handleTaxModalClose = () => {
    if (hasUnsavedTaxChanges) {
      setShowUnsavedTaxWarning(true);
    } else {
      setShowUnsavedTaxWarning(false);
      setOpenTaxModal(false);
    }
  };

  // Handle discarding tax changes
  const handleDiscardTaxChanges = () => {
    // Revert to original data
    setTaxData(JSON.parse(JSON.stringify(originalTaxData)));
    setFixedTaxAmounts(JSON.parse(JSON.stringify(originalFixedTaxAmounts)));

    // Recalculate with original data
    const { updatedTaxes, total } = calculateTotalTaxAmount(
      originalTaxData,
      originalFixedTaxAmounts
    );

    // Update state
    setTaxData(updatedTaxes);
    setTotalTaxAmount(total);
    setAmountAfterTax(parseFloat(data.Amount || 0) + total);

    // Clear flags
    setHasUnsavedTaxChanges(false);
    setShowUnsavedTaxWarning(false);

    // Update context with reverted data
    onUpdate({
      Taxes: updatedTaxes,
      TaxTotalAmount: parseFloat(total).toFixed(2),
    });

    setOpenTaxModal(false);
  };

  // Handle saving tax changes
  // const handleSaveTaxChanges = () => {
  //   // Calculate final tax amounts before saving
  //   const { updatedTaxes, total } = calculateTotalTaxAmount(
  //     taxData,
  //     fixedTaxAmounts
  //   );

  //   // Update state
  //   setTaxData(updatedTaxes);
  //   setTotalTaxAmount(total);
  //   setAmountAfterTax(parseFloat(data.Amount || 0) + total);

  //   // Update original data to match current state
  //   setOriginalTaxData(JSON.parse(JSON.stringify(updatedTaxes)));
  //   setOriginalFixedTaxAmounts(JSON.parse(JSON.stringify(fixedTaxAmounts)));

  //   // Clear flags
  //   setHasUnsavedTaxChanges(false);
  //   setShowUnsavedTaxWarning(false);

  //   // Update context with final tax data
  //   onUpdate({
  //     Taxes: updatedTaxes,
  //     TaxTotalAmount: parseFloat(total).toFixed(2),
  //   });

  //   setOpenTaxModal(false);
  // };

  // Handle saving tax changes
  const handleSaveTaxChanges = () => {
    console.log("handleSaveTaxChanges started");

    // Create updated tax data with current fixed amounts
    const updatedTaxData = taxData.map((tax) => {
      if (tax.CODE === "HFEE") {
        const amount = fixedTaxAmounts[tax.nTaxID] || 0;
        return {
          ...tax,
          amount: amount, // This will be used when coming back to the step
          lineTotal: amount * (tax.currentSign === "+" ? 1 : -1),
        };
      }
      if (tax.CODE === "HFEEIGST") {
        const hfeeTax = taxData.find((t) => t.CODE === "HFEE");
        const hfeeAmount = fixedTaxAmounts[hfeeTax?.nTaxID] || 0;
        const amount = parseFloat((hfeeAmount * 0.18).toFixed(2));
        return {
          ...tax,
          amount: amount, // This will be used when coming back to the step
          lineTotal: amount * (tax.currentSign === "+" ? 1 : -1),
        };
      }
      return tax;
    });

    // Calculate final total
    const total = updatedTaxData.reduce(
      (sum, tax) => sum + (tax.lineTotal || 0),
      0
    );

    // Update all states
    setTaxData(updatedTaxData);
    setOriginalTaxData(updatedTaxData);
    setTotalTaxAmount(total);
    setAmountAfterTax(parseFloat(data.Amount || 0) + total);

    // Ensure fixed amounts are preserved
    setOriginalFixedTaxAmounts({ ...fixedTaxAmounts });

    // Update parent with the tax data - the amounts are now stored in the tax objects
    onUpdate({
      Taxes: updatedTaxData,
      TaxTotalAmount: parseFloat(total).toFixed(2),
    });

    setHasUnsavedTaxChanges(false);
    setShowUnsavedTaxWarning(false);
    setOpenTaxModal(false);
  };

  // Tax Modal JSX
  const renderTaxModal = () => (
    <Dialog
      open={openTaxModal}
      onClose={handleTaxModalClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        style: {
          backgroundColor: Colortheme.background,
          width: "90%",
          maxWidth: "none",
          borderRadius: "20px",
          padding: 5,
          border: `1px solid ${Colortheme.text}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: Colortheme.background,
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: Colortheme.text,
            fontFamily: "Poppins",
          }}
        >
          Tax Details {hasUnsavedTaxChanges && "(Unsaved Changes)"}
        </Typography>
        <IconButton
          onClick={handleTaxModalClose}
          sx={{ color: Colortheme.text }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ backgroundColor: Colortheme.background, p: 2 }}>
        {showUnsavedTaxWarning ? (
          <Box
            sx={{
              display: "flex",
              mb: 2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Alert severity="warning">
              You have unsaved changes. Would you like to save them before
              closing?
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  justifyContent: "center",
                  gap: 5,
                }}
              >
                <StyledButton
                  onClick={handleSaveTaxChanges}
                  Colortheme={Colortheme}
                  sx={{ mr: 1 }}
                >
                  Save Changes
                </StyledButton>
                <StyledButton
                  onClick={handleDiscardTaxChanges}
                  Colortheme={Colortheme}
                >
                  Discard Changes
                </StyledButton>
              </Box>
            </Alert>
          </Box>
        ) : null}

        <Box sx={{ mb: 2 }}>
          <Typography
            sx={{
              color: Colortheme.text,
              fontFamily: "Poppins",
            }}
          >
            Exchange Amount: ₹{parseFloat(data.Amount || 0).toFixed(2)}
          </Typography>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: Colortheme.text }}>
                <TableCell
                  sx={{ color: Colortheme.background, fontFamily: "Poppins" }}
                >
                  Tax Code
                </TableCell>
                <TableCell
                  sx={{ color: Colortheme.background, fontFamily: "Poppins" }}
                >
                  Apply As
                </TableCell>
                <TableCell
                  sx={{ color: Colortheme.background, fontFamily: "Poppins" }}
                >
                  Value
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ color: Colortheme.background, fontFamily: "Poppins" }}
                >
                  Sign
                </TableCell>
                <TableCell
                  sx={{ color: Colortheme.background, fontFamily: "Poppins" }}
                >
                  Tax Amount
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {taxData.map((tax) => (
                <TableRow
                  sx={{ backgroundColor: Colortheme.secondaryBG }}
                  key={tax.nTaxID}
                >
                  <TableCell
                    sx={{ color: Colortheme.text, fontFamily: "Poppins" }}
                  >
                    {tax.CODE}
                  </TableCell>
                  <TableCell
                    sx={{ color: Colortheme.text, fontFamily: "Poppins" }}
                  >
                    {tax.APPLYAS}
                  </TableCell>
                  <TableCell
                    sx={{ color: Colortheme.text, fontFamily: "Poppins" }}
                  >
                    {tax.VALUE}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: Colortheme.text, fontFamily: "Poppins" }}
                  >
                    <CustomTextField
                      select
                      value={tax.currentSign}
                      onChange={(e) =>
                        handleSignChange(tax.nTaxID, e.target.value)
                      }
                      style={{ width: "70px" }}
                      disabled={
                        tax.CODE === "TAXROFF" || tax.CODE === "HFEEIGST"
                      }
                    >
                      <MenuItem value="+">+</MenuItem>
                      <MenuItem value="-">-</MenuItem>
                    </CustomTextField>
                  </TableCell>
                  <TableCell>
                    {tax.APPLYAS === "F" ? (
                      <CustomTextField
                        value={
                          tax.CODE === "HFEE"
                            ? fixedTaxAmounts[2] || tax.amount || "0.00"
                            : fixedTaxAmounts[tax.nTaxID] ||
                              tax.amount ||
                              "0.00"
                        }
                        onChange={(e) =>
                          handleFixedTaxAmountChange(
                            tax.nTaxID,
                            parseFloat(e.target.value) || 0
                          )
                        }
                        type="number"
                        style={{ width: "100%" }}
                      />
                    ) : (
                      <CustomTextField
                        value={
                          tax.CODE === "HFEEIGST"
                            ? fixedTaxAmounts[4] || tax.amount || "0.00"
                            : tax.amount
                            ? parseFloat(tax.amount).toFixed(2)
                            : "0.00"
                        }
                        disabled
                        style={{ width: "100%" }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            alignItems: "flex-end",
          }}
        >
          <Typography
            sx={{
              color: Colortheme.text,
              fontFamily: "Poppins",
              fontWeight: "bold",
              textAlign: "right",
            }}
          >
            Total Tax Amount: ₹{parseFloat(totalTaxAmount).toFixed(2)}
          </Typography>
          <Box
            sx={{
              width: "100%",
              height: "1px",
              backgroundColor: Colortheme.text,
              opacity: 0.2,
            }}
          />
          <Typography
            sx={{
              color: Colortheme.text,
              fontFamily: "Poppins",
              fontWeight: "bold",
              textAlign: "right",
            }}
          >
            Amount After Tax: ₹{parseFloat(amountAfterTax).toFixed(2)}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          backgroundColor: Colortheme.background,
          justifyContent: "center",
          gap: 5,
        }}
      >
        {hasUnsavedTaxChanges && (
          <StyledButton
            onClick={handleSaveTaxChanges}
            Colortheme={Colortheme}
            sx={{ mr: 1 }}
          >
            Save Changes
          </StyledButton>
        )}
        <StyledButton onClick={handleTaxModalClose} Colortheme={Colortheme}>
          Close
        </StyledButton>
      </DialogActions>
    </Dialog>
  );

  // RecPay Modal Render function
  const renderRecPayModal = () => {
    const isCashSelected = newRecPayRow.code === "CASH";

    return (
      <Dialog
        open={openRecPayModal}
        onClose={(event, reason) => {
          if (hasUnsavedRecPayChanges && reason === "backdropClick") {
            return; // Prevent closing on backdrop click if there are unsaved changes
          }
          handleCloseRecPayModal();
        }}
        disableEscapeKeyDown={hasUnsavedRecPayChanges}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: Colortheme.background,
            width: "90%",
            maxWidth: "none",
            borderRadius: "20px",
            padding: 5,
            border: `1px solid ${Colortheme.text}`,
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: Colortheme.background,
            color: Colortheme.text,
            fontFamily: "Poppins",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Receipt/Payment Details
          <IconButton
            onClick={handleCloseRecPayModal}
            sx={{ color: Colortheme.text }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: Colortheme.background, p: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                color: Colortheme.text,
                fontFamily: "Poppins",
              }}
            >
              Total Amount: ₹
              {parseFloat(netAmount || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>
            <Typography
              sx={{
                color: Colortheme.text,
                fontFamily: "Poppins",
                mt: 1,
              }}
            >
              Remaining Amount: ₹{parseFloat(remainingAmount || 0).toFixed(2)}
            </Typography>
          </Box>

          {/* Input Row */}
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <CustomAutocomplete
              options={codeOptions}
              value={
                codeOptions.find(
                  (option) => option.value === newRecPayRow.code
                ) || null
              }
              onChange={(_, value) =>
                handleRecPayInputChange("code", value?.value || "")
              }
              label="Code"
              getOptionLabel={(option) => option.label || ""}
              disabled={remainingAmount <= 0}
            />
            <CustomAutocomplete
              options={chequeOptions}
              value={
                chequeOptions.find(
                  (option) => option.value === newRecPayRow.chequeNo
                ) || null
              }
              onChange={(_, value) =>
                handleRecPayInputChange("chequeNo", value?.value || "")
              }
              label="Cheque No"
              getOptionLabel={(option) =>
                option?.label ? String(option.label) : ""
              }
              disabled={remainingAmount <= 0 || isCashSelected}
            />
            <CustomDatePicker
              value={newRecPayRow.chequeDate}
              onChange={(date) => handleRecPayInputChange("chequeDate", date)}
              label="Cheque Date"
              disabled={isCashSelected || remainingAmount <= 0}
            />
            <CustomTextField
              value={newRecPayRow.drawnOn}
              onChange={(e) =>
                handleRecPayInputChange("drawnOn", e.target.value)
              }
              label="Drawn On"
              disabled={isCashSelected || remainingAmount <= 0}
            />
            <CustomTextField
              value={newRecPayRow.branch}
              onChange={(e) =>
                handleRecPayInputChange("branch", e.target.value)
              }
              label="Branch"
              disabled={isCashSelected || remainingAmount <= 0}
            />
            <CustomDatePicker
              value={newRecPayRow.accountDate}
              onChange={(date) => handleRecPayInputChange("accountDate", date)}
              label="Account Date"
              disabled={remainingAmount <= 0}
            />
            <CustomTextField
              value={newRecPayRow.amount}
              onChange={(e) =>
                handleRecPayInputChange("amount", e.target.value)
              }
              label="Amount"
              type="number"
              disabled={remainingAmount <= 0}
            />
            <StyledButton
              style={{ width: 150, height: 50 }}
              onClick={editMode ? handleSaveEdit : handleAddRecPayRow}
              addIcon={!editMode}
              disabled={remainingAmount <= 0 && !editMode}
            >
              {editMode ? "Save" : "Add"}
            </StyledButton>
          </Box>

          {/* Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: Colortheme.text }}>
                  <TableCell
                    sx={{ color: Colortheme.background, fontFamily: "Poppins" }}
                  >
                    Sr No
                  </TableCell>
                  <TableCell
                    sx={{ color: Colortheme.background, fontFamily: "Poppins" }}
                  >
                    Code
                  </TableCell>
                  <TableCell
                    sx={{ color: Colortheme.background, fontFamily: "Poppins" }}
                  >
                    Cheque No
                  </TableCell>
                  <TableCell
                    sx={{ color: Colortheme.background, fontFamily: "Poppins" }}
                  >
                    Cheque Date
                  </TableCell>
                  <TableCell
                    sx={{ color: Colortheme.background, fontFamily: "Poppins" }}
                  >
                    Drawn On
                  </TableCell>
                  <TableCell
                    sx={{ color: Colortheme.background, fontFamily: "Poppins" }}
                  >
                    Branch
                  </TableCell>
                  <TableCell
                    sx={{ color: Colortheme.background, fontFamily: "Poppins" }}
                  >
                    Account Date
                  </TableCell>
                  <TableCell
                    sx={{ color: Colortheme.background, fontFamily: "Poppins" }}
                  >
                    Amount
                  </TableCell>
                  <TableCell
                    sx={{ color: Colortheme.background, fontFamily: "Poppins" }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recPayData.map((row) => (
                  <TableRow
                    sx={{ backgroundColor: Colortheme.secondaryBG }}
                    key={row.srno}
                  >
                    <TableCell
                      sx={{ color: Colortheme.text, fontFamily: "Poppins" }}
                    >
                      {row.srno}
                    </TableCell>
                    <TableCell
                      sx={{ color: Colortheme.text, fontFamily: "Poppins" }}
                    >
                      {row.code}
                    </TableCell>
                    <TableCell
                      sx={{ color: Colortheme.text, fontFamily: "Poppins" }}
                    >
                      {row.chequeNo}
                    </TableCell>
                    <TableCell
                      sx={{ color: Colortheme.text, fontFamily: "Poppins" }}
                    >
                      {formatDate(row.chequeDate)}
                    </TableCell>
                    <TableCell
                      sx={{ color: Colortheme.text, fontFamily: "Poppins" }}
                    >
                      {row.drawnOn}
                    </TableCell>
                    <TableCell
                      sx={{ color: Colortheme.text, fontFamily: "Poppins" }}
                    >
                      {row.branch}
                    </TableCell>
                    <TableCell
                      sx={{ color: Colortheme.text, fontFamily: "Poppins" }}
                    >
                      {formatDate(row.accountDate)}
                    </TableCell>
                    <TableCell
                      sx={{ color: Colortheme.text, fontFamily: "Poppins" }}
                    >
                      ₹{parseFloat(row.amount).toFixed(2)}
                    </TableCell>
                    <TableCell
                      sx={{ color: Colortheme.text, fontFamily: "Poppins" }}
                    >
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          onClick={() => handleEditRow(row)}
                          sx={{ color: Colortheme.text }}
                          disabled={editMode && editingSrno !== row.srno}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteRecPayRow(row.srno)}
                          sx={{ color: Colortheme.text }}
                          disabled={editMode}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {hasUnsavedRecPayChanges && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: "warning.light",
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <WarningIcon color={"warning"} />
              <Typography color="white">
                You have unsaved changes. Click Save to keep your changes or
                Close to discard them.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 5 }}>
          {hasUnsavedRecPayChanges ? (
            <>
              <StyledButton onClick={handleSaveRecPay}>
                Save Changes
              </StyledButton>
              <StyledButton onClick={handleDiscardRecPay}>
                Discard Changes
              </StyledButton>
            </>
          ) : (
            <StyledButton onClick={handleCloseRecPayModal}>Close</StyledButton>
          )}
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box sx={{ width: "95%", mt: 2 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 1, sm: 2 },
          mb: 3,
          "& > button": {
            width: { xs: "100%", sm: "auto" },
          },
        }}
      >
        <CustomBoxButton
          onClick={handleModalOpen}
          icon={null}
          Colortheme={Colortheme}
        >
          Charges
        </CustomBoxButton>
        <CustomBoxButton
          onClick={() => setOpenTaxModal(true)}
          icon={null}
          Colortheme={Colortheme}
        >
          Tax
        </CustomBoxButton>
        <CustomBoxButton
          onClick={() => setOpenRecPayModal(true)}
          icon={null}
          Colortheme={Colortheme}
        >
          Rec/Pay
        </CustomBoxButton>
      </Box>

      {/* Charges Modal */}
      <Dialog
        open={openChargesModal}
        onClose={handleChargesModalClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: Colortheme.background,
            width: "90%",
            maxWidth: "none",
            borderRadius: "20px",
            padding: 5,
            border: `1px solid ${Colortheme.text}`,
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: Colortheme.background,
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: Colortheme.text,
              fontFamily: "Poppins",
            }}
          >
            Charges
          </Typography>
          <IconButton
            onClick={handleChargesModalClose}
            sx={{ color: Colortheme.text }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ backgroundColor: Colortheme.background }}>
          <Box sx={{ mb: 3, mt: 2 }}>
            <Typography
              sx={{
                color: Colortheme.text,
                fontFamily: "Poppins",
              }}
            >
              Amount: ₹{parseFloat(data.Amount || 0).toFixed(2)}
            </Typography>
          </Box>

          <TableContainer
            component={Paper}
            sx={{
              backgroundColor: Colortheme.secondaryBG,
              "& .MuiTableCell-root": {
                color: Colortheme.background,
                borderColor: `${Colortheme.text}`,
              },
              "& .MuiTableHead-root .MuiTableCell-root": {
                backgroundColor: Colortheme.text,
                borderColor: `${Colortheme.text}`,
                fontWeight: "bold",
              },
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: "200px", fontFamily: "Poppins" }}>
                    Account
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ width: "80px", fontFamily: "Poppins" }}
                  >
                    +/-
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ width: "150px", fontFamily: "Poppins" }}
                  >
                    Value
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ width: "150px", fontFamily: "Poppins" }}
                  >
                    Oth.SGST
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ width: "150px", fontFamily: "Poppins" }}
                  >
                    Oth.CGST
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ width: "150px", fontFamily: "Poppins" }}
                  >
                    Oth.IGST
                  </TableCell>
                  <TableCell sx={{ width: "80px", fontFamily: "Poppins" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {chargesData.map((row, index) => {
                  const isModified =
                    showUnsavedWarning &&
                    originalCharges.length > 0 &&
                    (!originalCharges[index] ||
                      JSON.stringify(row) !==
                        JSON.stringify(originalCharges[index]));

                  return (
                    <TableRow
                      key={index}
                      sx={{
                        backgroundColor: isModified
                          ? "rgba(255, 193, 7, 0.1)"
                          : "inherit",
                        "&:hover": {
                          backgroundColor: isModified
                            ? "rgba(255, 193, 7, 0.2)"
                            : "rgba(0, 0, 0, 0.04)",
                        },
                      }}
                    >
                      <TableCell>
                        {/* <CustomAutocomplete
                          options={accountOptions}
                          label="Select Account"
                          value={row.account}
                          onChange={(e, value) =>
                            handleChargeChange(index, "account", value)
                          }
                          getOptionLabel={(option) => option?.label || ""}
                          style={{ width: "100%" }}
                          styleTF={{ width: "100%" }}
                        /> */}
                        <CustomAutocomplete
                          options={accountOptions}
                          label="Select Account"
                          value={row.account}
                          onChange={(e, value) =>
                            handleChargeChange(index, "account", value)
                          }
                          getOptionLabel={(option) => option?.label || ""}
                          isOptionEqualToValue={(option, value) =>
                            option?.value === value?.value ||
                            option?.code === value?.code
                          }
                          style={{ width: "100%" }}
                          styleTF={{ width: "100%" }}
                        />
                        {isModified && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: "warning.main",
                              display: "block",
                              mt: 0.5,
                            }}
                          >
                            Unsaved changes
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <CustomTextField
                          select
                          value={row.operation}
                          onChange={(e) =>
                            handleChargeChange(
                              index,
                              "operation",
                              e.target.value
                            )
                          }
                          style={{ width: "70px" }}
                        >
                          <MenuItem value="+">+</MenuItem>
                          <MenuItem value="-">-</MenuItem>
                        </CustomTextField>
                      </TableCell>
                      <TableCell>
                        <CustomTextField
                          type="number"
                          value={row.value}
                          onChange={(e) =>
                            handleChargeChange(index, "value", e.target.value)
                          }
                          style={{ width: "100%" }}
                        />
                      </TableCell>
                      <TableCell>
                        <CustomTextField
                          value={row.othSGST}
                          disabled
                          onChange={(e) =>
                            handleChargeChange(index, "othSGST", e.target.value)
                          }
                          style={{ width: "100%" }}
                        />
                      </TableCell>
                      <TableCell>
                        <CustomTextField
                          disabled
                          value={row.othCGST}
                          onChange={(e) =>
                            handleChargeChange(index, "othCGST", e.target.value)
                          }
                          style={{ width: "100%" }}
                        />
                      </TableCell>
                      <TableCell>
                        <CustomTextField
                          value={row.othIGST}
                          disabled
                          style={{ width: "100%" }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleDeleteChargeRow(index)}
                          size="small"
                          sx={{
                            color: Colortheme.text,
                            "&:hover": {
                              backgroundColor: `${Colortheme.text}20`,
                            },
                          }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            sx={{
              mt: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <StyledButton
              onClick={handleAddChargeRow}
              addIcon
              style={{ width: "150px" }}
            >
              Add Row
            </StyledButton>
            <Typography
              variant="h6"
              sx={{
                color: Colortheme.text,
                fontFamily: "Poppins",
              }}
            >
              Total Amount: ₹
              {(
                parseFloat(data.Amount || 0) +
                parseFloat(data.ChargesTotalAmount || 0)
              ).toFixed(2)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            p: 2,
            backgroundColor: Colortheme.background,
            justifyContent: "center",
          }}
        >
          {showUnsavedWarning ? (
            <>
              <Typography
                variant="body2"
                sx={{
                  color: "warning.main",
                  flex: 1,
                }}
              >
                You have unsaved changes. Do you want to save before closing?
              </Typography>
              <StyledButton onClick={handleSaveCharges} Colortheme={Colortheme}>
                Save & Close
              </StyledButton>
              <StyledButton
                onClick={handleConfirmClose}
                Colortheme={Colortheme}
                sx={{ ml: 1 }}
              >
                Discard Changes
              </StyledButton>
            </>
          ) : (
            <StyledButton onClick={handleSaveCharges} Colortheme={Colortheme}>
              Save
            </StyledButton>
          )}
        </DialogActions>
      </Dialog>
      {renderTaxModal()}
      {renderRecPayModal()}
    </Box>
  );
};

export default ChargesAndRecPay;
