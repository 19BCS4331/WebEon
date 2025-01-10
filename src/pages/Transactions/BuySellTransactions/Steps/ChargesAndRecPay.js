import React, { useState, useContext, useEffect } from "react";
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
import StyledButton from "../../../../components/global/StyledButton";
import { apiClient } from "../../../../services/apiClient";
import { useParams } from "react-router-dom";
import Alert from "@mui/material/Alert";

const ChargesAndRecPay = ({ data, onUpdate }) => {
  const { Type: vTrntype } = useParams();

  const { Colortheme } = useContext(ThemeContext);
  const { showToast, hideToast } = useToast();

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
  const [totalAmount, setTotalAmount] = useState(0);

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

  // Initial useEffect for data initialization
  useEffect(() => {
    // Initialize ChargesTotalAmount with exchangeTotalAmount only if no charges exist
    if (
      data.exchangeTotalAmount &&
      !data.Charges?.length &&
      !data.ChargesTotalAmount
    ) {
      onUpdate({
        ChargesTotalAmount: parseFloat(data.exchangeTotalAmount).toFixed(2),
      });
    }
  }, []); // Only run once on mount

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
    if (chargesData.length === 1 && !chargesData[0].account && originalCharges.length === 0) {
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
      return !originalRow || 
        row.account?.value !== originalRow.account?.value ||
        row.value !== originalRow.value ||
        row.operation !== originalRow.operation;
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
    const revertData = originalCharges.length > 0 ? [...originalCharges] : [{ ...emptyRow }];
    setChargesData(revertData);
    calculateTotalWithCharges(revertData);
    // Update the context with the reverted data
    onUpdate({
      Charges: revertData.length === 1 && !revertData[0].account ? [] : revertData,
      ChargesTotalAmount: parseFloat(calculateTotalWithCharges(revertData)).toFixed(2),
    });
    setOpenChargesModal(false);
  };

  const handleSaveCharges = () => {
    const finalAmount = calculateTotalWithCharges(chargesData);
    onUpdate({
      Charges: chargesData,
      ChargesTotalAmount: parseFloat(finalAmount).toFixed(2),
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
    calculateTotalWithCharges(newData);
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
    let baseAmount = parseFloat(data.exchangeTotalAmount || 0);

    const additionalCharges = charges.reduce((sum, charge) => {
      if (charge.value && charge.account) {
        const value = parseFloat(charge.value || 0);
        const igst = parseFloat(charge.othIGST || 0);
        const total = value + igst;

        return charge.operation === "+" ? sum + total : sum - total;
      }
      return sum;
    }, 0);

    const newTotal = baseAmount + additionalCharges;
    onUpdate({ ChargesTotalAmount: parseFloat(newTotal).toFixed(2) });
    return newTotal;
  };

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
          nTaxID: "HFEEIGST",
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

  // Effect to handle tax data initialization
  useEffect(() => {
    if (data.Taxes?.length > 0) {
      // Find HFEE and HFEEIGST in existing taxes
      const existingHFEE = data.Taxes.find(tax => tax.CODE === "HFEE");
      const existingHFEEIGST = data.Taxes.find(tax => tax.CODE === "HFEEIGST");
      
      // If we have HFEE but no HFEEIGST, add it
      if (existingHFEE && !existingHFEEIGST) {
        const hfeeigst = {
          nTaxID: "HFEEIGST",
          CODE: "HFEEIGST",
          DESCRIPTION: "HFEE GST",
          APPLYAS: "%",
          VALUE: 18,
          SLABWISETAX: false,
          currentSign: existingHFEE.currentSign,
          isAutoCalculated: true,
          amount: existingHFEE.amount * 0.18,
          lineTotal: (existingHFEE.amount * 0.18) * (existingHFEE.currentSign === "+" ? 1 : -1)
        };
        
        setTaxData([...data.Taxes, hfeeigst]);
        setOriginalTaxData([...data.Taxes, hfeeigst]);
      } else {
        setTaxData([...data.Taxes]);
        setOriginalTaxData([...data.Taxes]);
      }

      // Initialize fixed amounts from existing tax data
      const fixedAmounts = {};
      data.Taxes.forEach(tax => {
        if (tax.APPLYAS === "F" || tax.CODE === "HFEEIGST") {
          fixedAmounts[tax.nTaxID] = tax.amount || 0;
        }
      });
      setFixedTaxAmounts(fixedAmounts);
      setOriginalFixedTaxAmounts(fixedAmounts);
    }
  }, [data.Taxes]);

  // Effect to fetch tax data
  useEffect(() => {
    if (data.exchangeTotalAmount) {
      fetchTaxData();
    }
  }, [data.exchangeTotalAmount]);

  // Effect to calculate taxes when data is ready
  useEffect(() => {
    if (taxData.length > 0 && taxSlabData && data.exchangeTotalAmount) {
      const { updatedTaxes, total } = calculateTotalTaxAmount(
        taxData,
        fixedTaxAmounts
      );

      // Batch our state updates
      setTaxData(updatedTaxes);
      setTotalTaxAmount(total);
      setAmountAfterTax(parseFloat(data.exchangeTotalAmount || 0) + total);

      // Update context with tax data including amounts
      onUpdate({
        Taxes: updatedTaxes,
        TaxTotalAmount: parseFloat(total).toFixed(2),
      });
    }
  }, [taxData.length, taxSlabData, data.exchangeTotalAmount]); // Only depend on length to avoid re-renders

  // Calculate raw GST18% amount without rounding
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
        const amount = exchangeAmount * (parseFloat(slab.VALUE) / 100);

        return amount;
      }
    } else {
      const amount = exchangeAmount * (parseFloat(gst18Tax.VALUE) / 100);

      return amount;
    }
    return 0;
  };

  // Calculate tax amount based on type and slabs
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
      const slab = slabs.find(
        (s) =>
          parseFloat(exchangeAmount) >= parseFloat(s.FROMAMT) &&
          parseFloat(exchangeAmount) <= parseFloat(s.TOAMT)
      );
      

      if (slab) {
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

  // Calculate total tax amount
  const calculateTotalTaxAmount = (
    taxList = taxData,
    currentFixedAmounts = fixedTaxAmounts
  ) => {
    // First, calculate HFEE if it exists
    const hfeeTax = taxList.find(tax => tax.CODE === "HFEE");
    const hfeeAmount = hfeeTax ? calculateTaxAmount(hfeeTax, data.exchangeTotalAmount || 0, currentFixedAmounts) : 0;

    // Calculate HFEEIGST based on HFEE amount if HFEE exists
    const hfeeigstTax = taxList.find(tax => tax.CODE === "HFEEIGST");
    if (hfeeigstTax && hfeeTax) {
      currentFixedAmounts = {
        ...currentFixedAmounts,
        [hfeeigstTax.nTaxID]: hfeeAmount * 0.18
      };
    }

    const updatedTaxes = taxList.map((tax) => {
      let amount;
      if (tax.CODE === "HFEEIGST" && hfeeTax) {
        // For HFEEIGST, use the calculated amount based on HFEE
        amount = hfeeAmount * 0.18;
      } else {
        amount = calculateTaxAmount(tax, data.exchangeTotalAmount || 0, currentFixedAmounts);
      }
      
      const sign = tax.currentSign === "+" ? 1 : -1;
      const lineTotal = amount * sign;

      return {
        ...tax,
        amount: amount,
        lineTotal: lineTotal,
      };
    });

    const total = updatedTaxes.reduce((sum, tax) => sum + tax.lineTotal, 0);

    return { updatedTaxes, total };
  };

  // Handle fixed tax amount change
  const handleFixedTaxAmountChange = (taxId, amount) => {
    const newFixedTaxAmounts = {
      ...fixedTaxAmounts,
      [taxId]: parseFloat(amount) || 0,
    };
    
    setFixedTaxAmounts(newFixedTaxAmounts);
    setHasUnsavedTaxChanges(true);

    // Calculate new tax amounts
    const { updatedTaxes, total } = calculateTotalTaxAmount(taxData, newFixedTaxAmounts);

    // Update states
    setTaxData(updatedTaxes);
    setTotalTaxAmount(total);
    setAmountAfterTax(parseFloat(data.exchangeTotalAmount || 0) + total);
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
    const { updatedTaxes, total } = calculateTotalTaxAmount(originalTaxData, originalFixedTaxAmounts);
    
    // Update state
    setTaxData(updatedTaxes);
    setTotalTaxAmount(total);
    setAmountAfterTax(parseFloat(data.exchangeTotalAmount || 0) + total);
    
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
  const handleSaveTaxChanges = () => {
    // Calculate final tax amounts before saving
    const { updatedTaxes, total } = calculateTotalTaxAmount(taxData, fixedTaxAmounts);
    
    // Update state
    setTaxData(updatedTaxes);
    setTotalTaxAmount(total);
    setAmountAfterTax(parseFloat(data.exchangeTotalAmount || 0) + total);
    
    // Update original data to match current state
    setOriginalTaxData(JSON.parse(JSON.stringify(updatedTaxes)));
    setOriginalFixedTaxAmounts(JSON.parse(JSON.stringify(fixedTaxAmounts)));
    
    // Clear flags
    setHasUnsavedTaxChanges(false);
    setShowUnsavedTaxWarning(false);

    // Update context with final tax data
    onUpdate({
      Taxes: updatedTaxes,
      TaxTotalAmount: parseFloat(total).toFixed(2),
    });

    setOpenTaxModal(false);
  };

  // Tax Modal JSX
  const renderTaxModal = () => (
    <Dialog
      open={openTaxModal}
      onClose={handleTaxModalClose}
      maxWidth="lg"
      fullWidth
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
            Exchange Amount: ₹
            {parseFloat(data.exchangeTotalAmount || 0).toFixed(2)}
          </Typography>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tax Code</TableCell>
                <TableCell>Apply As</TableCell>
                <TableCell>Value</TableCell>
                <TableCell align="center">Sign</TableCell>
                <TableCell>Tax Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {taxData.map((tax) => {
                const taxAmount = calculateTaxAmount(
                  tax,
                  data.exchangeTotalAmount
                );
                return (
                  <TableRow key={tax.nTaxID}>
                    <TableCell>{tax.CODE}</TableCell>
                    <TableCell>{tax.APPLYAS}</TableCell>
                    <TableCell>{tax.VALUE}</TableCell>
                    <TableCell align="center">
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
                          value={fixedTaxAmounts[tax.nTaxID] || ""}
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
                          value={parseFloat(tax.amount).toFixed(2)}
                          disabled
                          style={{ width: "100%" }}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
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

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 2,
          mb: 3,
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
              Amount: ₹{parseFloat(data.exchangeTotalAmount || 0).toFixed(2)}
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
                        <CustomAutocomplete
                          options={accountOptions}
                          label="Select Account"
                          value={row.account}
                          onChange={(e, value) =>
                            handleChargeChange(index, "account", value)
                          }
                          getOptionLabel={(option) => option?.label || ""}
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
              {parseFloat(data.ChargesTotalAmount || 0).toFixed(2)}
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

      {/* Fee/Taxes Modal - To be implemented */}
      <Dialog
        open={openFeeTaxesModal}
        onClose={() => setOpenFeeTaxesModal(false)}
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
            color: Colortheme.text,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "Poppins",
          }}
        >
          <Box display="flex" alignItems="center">
            <Typography variant="h6" sx={{ color: Colortheme.text }}>
              Fee/Taxes
            </Typography>
          </Box>
          <IconButton
            onClick={() => setOpenFeeTaxesModal(false)}
            sx={{ color: Colortheme.text }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: Colortheme.background }}>
          {/* Fee/Taxes content will be implemented later */}
        </DialogContent>
      </Dialog>

      {/* Rec/Pay Modal - To be implemented */}
      <Dialog
        open={openRecPayModal}
        onClose={() => setOpenRecPayModal(false)}
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
            color: Colortheme.text,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "Poppins",
          }}
        >
          <Box display="flex" alignItems="center">
            <Typography variant="h6" sx={{ color: Colortheme.text }}>
              Rec/Pay
            </Typography>
          </Box>
          <IconButton
            onClick={() => setOpenRecPayModal(false)}
            sx={{ color: Colortheme.text }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: Colortheme.background }}>
          {/* Rec/Pay content will be implemented later */}
        </DialogContent>
      </Dialog>

      {renderTaxModal()}
    </Box>
  );
};

export default ChargesAndRecPay;
