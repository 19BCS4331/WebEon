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

const ChargesAndRecPay = ({ data, onUpdate, isEditMode }) => {
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
  const [openRecPayModal, setOpenRecPayModal] = useState(false);
  const [openTaxModal, setOpenTaxModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalCharges, setOriginalCharges] = useState([]);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  // Tax related states
  const [taxData, setTaxData] = useState([]);
  const [taxSlabData, setTaxSlabData] = useState({});
  const [totalTaxAmount, setTotalTaxAmount] = useState(0);
  const [amountAfterTax, setAmountAfterTax] = useState(0);
  const [hasUnsavedTaxChanges, setHasUnsavedTaxChanges] = useState(false);
  const [originalTaxData, setOriginalTaxData] = useState([]);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const amountRef = useRef(0);
  const isInitialMountRef = useRef(true);

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

  useEffect(() => {
    if (isEditMode) {
      setTaxData(data.Taxes);
    }
  }, [isEditMode]);

  // Function to calculate tax amounts
  const calculateTaxAmounts = (taxes, slabs, amount, preserveHFEE = false) => {
    // First calculate GST18% without rounding
    const gst18Tax = isEditMode
      ? taxes.find((t) => t.code === "GST18%")
      : taxes.find((t) => t.CODE === "gst18%");
    let gst18Amount = 0;
    let roundOffAmount = 0;

    if (gst18Tax) {
      if (gst18Tax.SLABWISETAX) {
        const taxSlabs = slabs[gst18Tax.nTaxID] || [];
        const applicableSlab = taxSlabs.find(
          (slab) =>
            amount >= parseFloat(slab.FROMAMT) &&
            amount <= parseFloat(slab.TOAMT)
        );

        if (applicableSlab) {
          if (parseFloat(applicableSlab.BASEVALUE) > 0) {
            gst18Amount = parseFloat(applicableSlab.BASEVALUE);
          } else {
            gst18Amount = amount * (parseFloat(applicableSlab.VALUE) / 100);
          }
        }
      }

      // Calculate round off amount to nearest rupee
      const wholeNumber = Math.round(gst18Amount);
      roundOffAmount = wholeNumber - gst18Amount;
    }

    return taxes.map((tax) => {
      let taxAmount = 0;

      if (isEditMode ? tax.code === "GST18%" : tax.CODE === "gst18%") {
        taxAmount = gst18Amount;
      } else if (tax.CODE === "TAXROFF") {
        taxAmount = roundOffAmount;
      } else if (tax.CODE === "HFEE") {
        // Preserve HFEE amount only if flag is true
        taxAmount = preserveHFEE ? parseFloat(tax.amount || 0) : 0;
      } else if (tax.CODE === "HFEEIGST") {
        // Calculate HFEEIGST based on current HFEE
        const hfeeTax = taxes.find((t) => t.CODE === "HFEE");
        const hfeeAmount = preserveHFEE ? parseFloat(hfeeTax?.amount || 0) : 0;
        taxAmount = parseFloat((hfeeAmount * 0.18).toFixed(2));
      } else if (tax.SLABWISETAX) {
        // Handle other slab-based taxes
        const taxSlabs = slabs[tax.nTaxID] || [];
        const applicableSlab = taxSlabs.find(
          (slab) =>
            amount >= parseFloat(slab.FROMAMT) &&
            amount <= parseFloat(slab.TOAMT)
        );

        if (applicableSlab) {
          if (parseFloat(applicableSlab.BASEVALUE) > 0) {
            taxAmount = parseFloat(applicableSlab.BASEVALUE);
          } else {
            taxAmount = amount * (parseFloat(applicableSlab.VALUE) / 100);
          }
        }
      } else {
        // Handle fixed or percentage based tax
        if (tax.APPLYAS === "F") {
          // For fixed taxes, preserve if flag is true
          taxAmount = preserveHFEE ? parseFloat(tax.amount || 0) : 0;
        } else if (tax.APPLYAS === "%") {
          taxAmount = amount * (parseFloat(tax.VALUE) / 100);
        }
      }

      return {
        ...tax,
        amount: parseFloat(taxAmount.toFixed(2)),
        lineTotal: parseFloat(
          (taxAmount * (tax.currentSign === "+" ? 1 : -1)).toFixed(2)
        ),
      };
    });
  };

  // Calculate taxes with proper preservation logic
  const calculateAndUpdateTaxes = (
    amount,
    taxes,
    slabs,
    shouldPreserveHFEE
  ) => {
    if (!isEditMode) {
      console.log(
        "Calculating taxes with amount:",
        amount,
        "preserve HFEE:",
        shouldPreserveHFEE
      );

      // Reset non-HFEE taxes or all taxes based on preservation flag
      const resetTaxes = taxes.map((tax) => {
        if (
          shouldPreserveHFEE &&
          (tax.CODE === "HFEE" || tax.CODE === "HFEEIGST")
        ) {
          // Preserve HFEE and HFEEIGST if flag is true
          return tax;
        }
        return {
          ...tax,
          amount: 0,
          lineTotal: 0,
        };
      });

      const calculatedTaxes = calculateTaxAmounts(
        resetTaxes,
        slabs,
        parseFloat(amount),
        shouldPreserveHFEE
      );

      const total = calculatedTaxes.reduce(
        (sum, tax) => sum + tax.lineTotal,
        0
      );

      setTaxData(calculatedTaxes);
      setOriginalTaxData(calculatedTaxes);
      setTotalTaxAmount(total);
      setAmountAfterTax(parseFloat(amount) + total);

      onUpdate({
        Taxes: data.vTrnwith === "P" ? calculatedTaxes : null,
        TaxTotalAmount: data.vTrnwith === "P" ? total.toFixed(2) : 0,
      });

      return calculatedTaxes;
    }
  };

  // Handle data prop changes
  useEffect(() => {
    if (!isEditMode) {
      const newAmount = parseFloat(data.Amount || 0);
      const prevAmount = parseFloat(amountRef.current || 0);

      if (newAmount !== prevAmount) {
        // If this is the initial mount and we have an amount, preserve HFEE
        if (isInitialMountRef.current && newAmount > 0) {
          console.log("Initial mount with amount:", newAmount);
          calculateAndUpdateTaxes(newAmount, taxData, taxSlabData, true);
        }
        // If amount changed from TransactionDetails (exchangeData update)
        else if (data.exchangeData && data.exchangeData.length > 0) {
          console.log("Amount changed from TransactionDetails:", newAmount);
          calculateAndUpdateTaxes(newAmount, taxData, taxSlabData, false);
        }
        // For other amount changes (like manual updates), preserve HFEE
        else {
          console.log("Amount changed from other source:", newAmount);
          calculateAndUpdateTaxes(newAmount, taxData, taxSlabData, true);
        }
      }

      // Update the ref after processing
      amountRef.current = newAmount;
      isInitialMountRef.current = false;
    }
  }, [data.Amount, data.exchangeData, taxData, taxSlabData]);

  // Handle amount changes from user input
  const handleAmountChange = (newAmount) => {
    console.log("User changed amount to:", newAmount);
    // Trigger the data update which will be caught by the effect above
    onUpdate({
      ...data,
      Amount: newAmount,
    });
  };

  // Handle initial mount and tax data loading
  useEffect(() => {
    if (!isEditMode) {
      const fetchTaxData = async () => {
        try {
          const response = await apiClient.get(
            "/pages/Transactions/getTaxData",
            {
              params: { vTrntype },
            }
          );

          const { taxes, taxSlabs } = response.data;

          // Add currentSign based on transaction type
          let taxesWithSign = taxes.map((tax) => ({
            ...tax,
            currentSign:
              vTrntype === "B" ? tax.RETAILBUYSIGN : tax.RETAILSELLSIGN,
            amount: 0,
            lineTotal: 0,
          }));

          // Add HFEEIGST if not present
          if (
            taxesWithSign.find((t) => t.CODE === "HFEE") &&
            !taxesWithSign.find((t) => t.CODE === "HFEEIGST")
          ) {
            const hfeeTax = taxesWithSign.find((t) => t.CODE === "HFEE");
            taxesWithSign.push({
              nTaxID: Math.max(...taxesWithSign.map((t) => t.nTaxID)) + 1,
              CODE: "HFEEIGST",
              DESCRIPTION: "HFEE GST",
              APPLYAS: "%",
              VALUE: "18.0000",
              SLABWISETAX: false,
              currentSign: hfeeTax.currentSign,
              amount: 0,
              lineTotal: 0,
            });
          }

          // Sort taxes in specific order: GST18%, TAXROFF, HFEE, HFEEIGST, others
          taxesWithSign = taxesWithSign.sort((a, b) => {
            const order = { "gst18%": 1, TAXROFF: 2, HFEE: 3, HFEEIGST: 4 };
            return (order[a.CODE] || 5) - (order[b.CODE] || 5);
          });

          // If we have existing tax data, use it
          if (data.Taxes && data.Taxes.length > 0) {
            taxesWithSign = taxesWithSign.map((tax) => {
              const existingTax = data.Taxes.find((t) => t.CODE === tax.CODE);
              if (existingTax) {
                return {
                  ...tax,
                  amount: existingTax.amount,
                  lineTotal: existingTax.lineTotal,
                };
              }
              return tax;
            });
          }

          setTaxData(taxesWithSign);
          setOriginalTaxData(taxesWithSign);
          setTaxSlabData(taxSlabs);

          // Calculate initial tax amounts if we have an amount
          if (data.Amount) {
            // Preserve HFEE if we have existing tax data
            const shouldPreserveHFEE = data.Taxes && data.Taxes.length > 0;
            const calculatedTaxes = calculateTaxAmounts(
              taxesWithSign,
              taxSlabs,
              parseFloat(data.Amount),
              shouldPreserveHFEE
            );
            const total = calculatedTaxes.reduce(
              (sum, tax) => sum + tax.lineTotal,
              0
            );

            setTaxData(calculatedTaxes);
            setOriginalTaxData(calculatedTaxes);
            setTotalTaxAmount(total);
            setAmountAfterTax(parseFloat(data.Amount) + total);

            // Update parent
            onUpdate({
              Taxes: data.vTrnwith === "P" ? calculatedTaxes : null,
              TaxTotalAmount: data.vTrnwith === "P" ? total.toFixed(2) : 0,
            });
          }
        } catch (error) {
          console.error("Error fetching tax data:", error);
        }
      };

      fetchTaxData();
    }
  }, [vTrntype]); // Only run on mount and vTrntype change

  // Add a debug effect to track data changes
  useEffect(() => {
    console.log("data prop changed:", data);
    if (data.Amount) {
      console.log("Amount in data changed to:", data.Amount);
    }
  }, [data]);

  const handleTaxAmountChange = (taxId, value) => {
    const tax = taxData.find((t) => t.nTaxID === taxId);
    let amount = parseFloat(value) || 0;

    // Validate HFEE amount if this is HFEE tax
    if (isEditMode ? tax?.code === "HFEE" : tax?.CODE === "HFEE") {
      const maxHfeeValue = parseFloat(
        getSetting("HFEEMAXVALUE", "advanced", "0")
      );
      if (amount > maxHfeeValue) {
        showToast(`HFEE cannot exceed ${maxHfeeValue}`, "error");
        setTimeout(() => {
          hideToast();
        }, 2000);
        amount = maxHfeeValue;
      }
    }

    const updatedTaxes = taxData.map((tax) => {
      if (tax.nTaxID === taxId) {
        return {
          ...tax,
          amount,
          lineTotal: amount * (tax.currentSign === "+" ? 1 : -1),
        };
      }
      // If we're updating HFEE, also update HFEEIGST
      if (
        tax.CODE === "HFEEIGST" &&
        taxId === taxData.find((t) => t.CODE === "HFEE")?.nTaxID
      ) {
        const hfeeigstAmount = parseFloat((amount * 0.18).toFixed(2));
        return {
          ...tax,
          amount: hfeeigstAmount,
          lineTotal: hfeeigstAmount * (tax.currentSign === "+" ? 1 : -1),
        };
      }
      if (
        isEditMode &&
        tax.code === "HFEEIGST" &&
        taxId === taxData.find((t) => t.code === "HFEE")?.nTaxID
      ) {
        const hfeeigstAmount = parseFloat((amount * 0.18).toFixed(2));
        return {
          ...tax,
          amount: hfeeigstAmount,
          lineTotal: hfeeigstAmount * (tax.currentSign === "+" ? 1 : -1),
        };
      }
      return tax;
    });

    setTaxData(updatedTaxes);
    setHasUnsavedTaxChanges(true);
  };

  // Handle save tax changes
  const handleSaveTaxChanges = () => {
    const total = isEditMode
      ? taxData.reduce((sum, tax) => sum + tax.amount, 0)
      : taxData.reduce((sum, tax) => sum + tax.lineTotal, 0);
    setTotalTaxAmount(total);
    setAmountAfterTax(parseFloat(data.Amount) + total);
    setOriginalTaxData([...taxData]);
    setHasUnsavedTaxChanges(false);

    onUpdate({
      Taxes: data.vTrnwith === "P" ? taxData : null,
      TaxTotalAmount: data.vTrnwith === "P" ? total.toFixed(2) : 0,
    });

    setOpenTaxModal(false);
  };

  // Handle discard tax changes
  const handleDiscardTaxChanges = () => {
    if (isEditMode) {
      // In edit mode, simply revert to original tax data
      setTaxData([...data.Taxes]);
      const total = data.Taxes.reduce((sum, tax) => {
        // Handle both lowercase and uppercase property names
        const amount = parseFloat(tax.amount || tax.AMOUNT || 0);
        const sign = tax.currentSign || (vTrntype === "B" ? "-" : "+");
        return sum + (sign === "+" ? 1 : -1) * amount;
      }, 0);

      setTotalTaxAmount(total);
      setAmountAfterTax(parseFloat(data.Amount) + total);
      setHasUnsavedTaxChanges(false);

      onUpdate({
        Taxes: data.vTrnwith === "P" ? data.Taxes : null,
        TaxTotalAmount: data.vTrnwith === "P" ? total.toFixed(2) : 0,
      });
    } else {
      // In new mode, recalculate taxes
      const calculatedTaxes = calculateTaxAmounts(
        originalTaxData,
        taxSlabData,
        parseFloat(data.Amount)
      );
      const total = calculatedTaxes.reduce(
        (sum, tax) => sum + tax.lineTotal,
        0
      );

      setTaxData(calculatedTaxes);
      setTotalTaxAmount(total);
      setAmountAfterTax(parseFloat(data.Amount) + total);
      setHasUnsavedTaxChanges(false);

      onUpdate({
        Taxes: data.vTrnwith === "P" ? calculatedTaxes : null,
        TaxTotalAmount: data.vTrnwith === "P" ? total.toFixed(2) : 0,
      });
    }

    setOpenTaxModal(false);
  };

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
              variant="subtitle1"
              sx={{
                color: Colortheme.text,
                fontFamily: "Poppins",
                fontWeight: "bold",
                mb: 1,
              }}
            >
              Amount Breakdown:
            </Typography>
            <Box sx={{ pl: 2, mb: 2 }}>
              <Typography
                sx={{
                  color: Colortheme.text,
                  fontFamily: "Poppins",
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <span>Base Amount:</span>
                <span>
                  ₹
                  {parseFloat(data.Amount || 0).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </Typography>
              <Typography
                sx={{
                  color: Colortheme.text,
                  fontFamily: "Poppins",
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <span>Charges:</span>
                <span>
                  - ₹
                  {Math.abs(
                    parseFloat(data.ChargesTotalAmount || 0)
                  ).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </Typography>
              <Typography
                sx={{
                  color: Colortheme.text,
                  fontFamily: "Poppins",
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <span>Taxes:</span>
                <span>
                  - ₹
                  {Math.abs(
                    parseFloat(data.TaxTotalAmount || 0)
                  ).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </Typography>
              <Box
                sx={{
                  borderTop: `1px solid ${Colortheme.text}`,
                  mt: 1,
                  pt: 1,
                }}
              >
                <Typography
                  sx={{
                    color: Colortheme.text,
                    fontFamily: "Poppins",
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: "bold",
                  }}
                >
                  <span>Net Amount:</span>
                  <span>
                    ₹
                    {parseFloat(netAmount || 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </Typography>
              </Box>
            </Box>
            <Typography
              sx={{
                color: Colortheme.text,
                fontFamily: "Poppins",
                mt: 1,
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "bold",
                borderTop: `1px solid ${Colortheme.text}`,
                pt: 1,
              }}
            >
              <span>Remaining Amount:</span>
              <span>
                ₹
                {parseFloat(remainingAmount || 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
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

        {data.vTrnwith === "P" && (
          <CustomBoxButton
            onClick={() => setOpenTaxModal(true)}
            icon={null}
            Colortheme={Colortheme}
          >
            Tax
          </CustomBoxButton>
        )}

        <CustomBoxButton
          label="Rec/Pay"
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
      {renderRecPayModal()}
      {data.vTrnwith === "P" && (
        <Dialog
          open={openTaxModal}
          onClose={() => setOpenTaxModal(false)}
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
              Tax
            </Typography>
            <IconButton
              onClick={() => setOpenTaxModal(false)}
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
                      Tax Name
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ width: "150px", fontFamily: "Poppins" }}
                    >
                      Amount
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ width: "150px", fontFamily: "Poppins" }}
                    >
                      Tax Amount
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {taxData.map((tax, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography
                          sx={{
                            color: Colortheme.text,
                            fontFamily: "Poppins",
                          }}
                        >
                          {isEditMode ? tax.code : tax.DESCRIPTION}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {/* {tax.APPLYAS === "F" ? ( */}
                        <CustomTextField
                          type="number"
                          value={tax.amount || ""}
                          onChange={(e) =>
                            handleTaxAmountChange(tax.nTaxID, e.target.value)
                          }
                          disabled={
                            tax.CODE === "TAXROFF" ||
                            tax.CODE === "HFEEIGST" ||
                            tax.CODE === "gst18%"
                          }
                          sx={{
                            width: "100%",
                            "& .MuiInputBase-input.Mui-disabled": {
                              WebkitTextFillColor: "gray  ",
                            },
                          }}
                        />
                        {/* ) : (
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "Poppins",
                            color: "black",
                          }}
                        >
                          {tax.amount}
                        </Typography>
                      )} */}
                      </TableCell>
                      <TableCell align="center">
                        <Typography
                          sx={{
                            color: Colortheme.text,
                            fontFamily: "Poppins",
                          }}
                        >
                          ₹{isEditMode ? tax.amount : tax.lineTotal.toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box
              sx={{
                mt: 3,
                mr: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: Colortheme.text,
                  fontFamily: "Poppins",
                }}
              >
                Total Tax Amount: ₹
                {isEditMode ? data.TaxTotalAmount : totalTaxAmount.toFixed(2)}
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  color: Colortheme.text,
                  fontFamily: "Poppins",
                }}
              >
                Amount After Tax: ₹
                {isEditMode
                  ? (
                      parseFloat(data.Amount) +
                      (data.Taxes[0].currentSign === "+" ? 1 : -1) *
                        parseFloat(data.TaxTotalAmount)
                    ).toFixed(2)
                  : amountAfterTax.toFixed(2)}
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
            {hasUnsavedTaxChanges ? (
              <>
                <StyledButton
                  onClick={handleSaveTaxChanges}
                  Colortheme={Colortheme}
                >
                  Save & Close
                </StyledButton>
                <StyledButton
                  onClick={handleDiscardTaxChanges}
                  Colortheme={Colortheme}
                  sx={{ ml: 1 }}
                >
                  Discard Changes
                </StyledButton>
              </>
            ) : (
              <StyledButton
                onClick={() => setOpenTaxModal(false)}
                Colortheme={Colortheme}
              >
                Close
              </StyledButton>
            )}
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default ChargesAndRecPay;
