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

const ChargesAndRecPay = ({ data, onUpdate }) => {

  const { Colortheme } = useContext(ThemeContext);
  const { showToast, hideToast } = useToast();

  // Modal states
  const [openChargesModal, setOpenChargesModal] = useState(false);
  const [openFeeTaxesModal, setOpenFeeTaxesModal] = useState(false);
  const [openRecPayModal, setOpenRecPayModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalCharges, setOriginalCharges] = useState([]);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

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

  useEffect(() => {
    if (data.Charges?.length > 0) {
      setChargesData(data.Charges.map(charge => ({ ...charge, isModified: false })));
    } else {
      setChargesData([{ ...emptyRow }]);
    }
  }, [data.Charges]);

  const checkUnsavedChanges = () => {
    return chargesData.some(row => {
      const originalRow = originalCharges.find(orig => 
        orig.account?.value === row.account?.value
      );
      return !originalRow || JSON.stringify(row) !== JSON.stringify(originalRow);
    });
  };

  const handleModalOpen = () => {
    setOriginalCharges([...chargesData.map(charge => ({ ...charge, isModified: false }))]);
    setHasUnsavedChanges(false);
    setOpenChargesModal(true);
  };

  const handleModalClose = () => {
    const hasModifications = checkUnsavedChanges();
    if (hasModifications) {
      setShowUnsavedWarning(true);
      showToast("Please review unsaved changes", "warning");
      setTimeout(() => {
        hideToast();
      }, 2000);
    } else {
      setShowUnsavedWarning(false);
      // If we're closing without modifications and have no rows, add an empty one
      if (chargesData.length === 0) {
        setChargesData([{ ...emptyRow }]);
      }
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
      ChargesTotalAmount: parseFloat(calculateTotalWithCharges(revertData)).toFixed(2)
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
      const response = await apiClient.get("/pages/Transactions/getOtherChargeAccounts");
      console.log("Account options:", response.data);
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
      console.log("Selected account:", value);
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
          onClick={() => setOpenFeeTaxesModal(true)}
          icon={null}
          Colortheme={Colortheme}
        >
          Fee/Taxes
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
        onClose={handleModalClose}
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
            onClick={handleModalClose}
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
                  const isModified = showUnsavedWarning && originalCharges.length > 0 && (
                    !originalCharges[index] || 
                    JSON.stringify(row) !== JSON.stringify(originalCharges[index])
                  );
                  
                  return (
                    <TableRow 
                      key={index}
                      sx={{
                        backgroundColor: isModified ? 'rgba(255, 193, 7, 0.1)' : 'inherit',
                        '&:hover': {
                          backgroundColor: isModified ? 'rgba(255, 193, 7, 0.2)' : 'rgba(0, 0, 0, 0.04)',
                        },
                      }}
                    >
                      <TableCell>
                        <CustomAutocomplete
                          options={accountOptions}
                          label="Select Account"
                          value={row.account}
                          onChange={(e, value) => handleChargeChange(index, "account", value)}
                          getOptionLabel={(option) => option?.label || ""}
                          style={{ width: "100%" }}
                          styleTF={{ width: "100%" }}
                        />
                        {isModified && (
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'warning.main',
                              display: 'block',
                              mt: 0.5 
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
                            handleChargeChange(index, "operation", e.target.value)
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
              Total Amount: ₹{parseFloat(data.ChargesTotalAmount || 0).toFixed(2)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, backgroundColor: Colortheme.background, justifyContent:'center' }}>
          {showUnsavedWarning ? (
            <>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'warning.main',
                  flex: 1 
                }}
              >
                You have unsaved changes. Do you want to save before closing?
              </Typography>
              <StyledButton
                onClick={handleSaveCharges}
                Colortheme={Colortheme}
              >
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
            <StyledButton
              onClick={handleSaveCharges}
              Colortheme={Colortheme}
            >
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
    </Box>
  );
};

export default ChargesAndRecPay;
