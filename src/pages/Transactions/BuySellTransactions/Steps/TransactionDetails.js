import React, { useContext, useEffect, useState } from "react";
import {
  Grid,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CustomTextField from "../../../../components/global/CustomTextField";
import CustomAutocomplete from "../../../../components/global/CustomAutocomplete";
import CustomDataGrid from "../../../../components/global/CustomDataGrid";
import { useTransaction } from "../../../../contexts/TransactionContext";
import { apiClient } from "../../../../services/apiClient";
import { useParams } from "react-router-dom";
import StyledButton from "../../../../components/global/StyledButton";
import { AuthContext } from "../../../../contexts/AuthContext";
import { useToast } from "../../../../contexts/ToastContext";

const TransactionDetails = ({ data, onUpdate, Colortheme }) => {
  const { Type: vTrntype } = useParams();
  const { showToast, hideToast, showInfoModal } = useToast();
  const { branch } = useContext(AuthContext);
  const { setError, clearError } = useTransaction();
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [issuers, setIssuers] = useState([]);
  const [rows, setRows] = useState([]);
  const [currentRow, setCurrentRow] = useState({
    currencyCode: "",
    type: "",
    issuer: "",
    feAmount: "",
    rate: "",
    commissionType: "",
    commissionValue: "",
    commissionAmount: "",
    amount: "",
    roundOff: "",
  });
  const [editIndex, setEditIndex] = useState(-1);
  const [openModal, setOpenModal] = useState(false);

  const commissionTypeOptions = [
    { value: "P", label: "Percent" },
    { value: "F", label: "Paise" },
  ];

  useEffect(() => {
    fetchCurrencies();
    fetchProductTypes();
  }, []);

  const fetchCurrencies = async () => {
    try {
      const response = await apiClient.get("/pages/Transactions/getCurrencies");
      setCurrencyOptions(response.data);
    } catch (error) {
      console.error("Error fetching currencies:", error);
      setError("currency", "Failed to load currencies");
    }
  };

  const fetchProductTypes = async () => {
    try {
      const response = await apiClient.get(
        "/pages/Transactions/getProductTypes",
        {
          params: {
            vTrnType: vTrntype,
          },
        }
      );
      setProductTypes(response.data);
    } catch (error) {
      console.error("Error fetching product types:", error);
      setError("type", "Failed to load product types");
    }
  };

  const fetchIssuers = async (type) => {
    if (!type) return;
    try {
      const response = await apiClient.get("/pages/Transactions/getIssuers", {
        params: { type },
      });
      setIssuers(response.data);
    } catch (error) {
      console.error("Error fetching issuers:", error);
      setError("issuer", "Failed to load issuers");
    }
  };

  const fetchRate = async (currencyCode, type, issuer) => {
    try {
      if (!currencyCode || !type) return;

      const response = await apiClient.get(
        "/pages/Transactions/getRateWithMargin",
        {
          params: {
            currencyCode: currencyCode.value,
            productType: type,
            branchId: branch.nBranchID,
            trnType: vTrntype,
            issCode: issuer,
          },
        }
      );

      if (response.data.success) {
        const { finalRate } = response.data.data;
        setCurrentRow((prev) => ({
          ...prev,
          rate: finalRate,
        }));
      }
    } catch (error) {
      console.error("Error fetching rate:", error);
      // You might want to show an error message to the user
    }
  };

  useEffect(() => {
    if (currentRow.currencyCode && currentRow.type) {
      // For CN product type, fetch rate without waiting for issuer
      if (currentRow.type === "CN") {
        fetchRate(currentRow.currencyCode, currentRow.type, "");
      }
      // For other product types, wait for issuer
      else if (currentRow.issuer) {
        fetchRate(currentRow.currencyCode, currentRow.type, currentRow.issuer);
      }
    }
  }, [currentRow.currencyCode, currentRow.type, currentRow.issuer]);

  useEffect(() => {
    if (currentRow.rate && currentRow.feAmount) {
      setCurrentRow((prev) => ({
        ...prev,
        amount: calculateAmount(prev.feAmount, prev.rate),
        roundOff: calculateRoundOff(prev.feAmount, prev.rate),
        commissionAmount: calculateCommissionAmount(
          prev.feAmount,
          prev.rate,
          prev.commissionType,
          prev.commissionValue
        ),
      }));
    }
  }, [currentRow.rate]);

  useEffect(() => {
    if (data.exchangeData?.length > 0) {
      const formattedRows = data.exchangeData.map((item, index) => ({
        id: index + 1,
        currencyCode: item.CNCodeID,
        currencyLabel: item.CNCodeID,
        type: item.ExchType,
        issuer: item.ISSCodeID,
        feAmount: item.FEAmount,
        rate: item.Rate,
        commissionType: item.CommType,
        commissionValue: item.CommRate,
        commissionAmount: item.CommAmt,
        amount: item.Amount,
        roundOff: item.Round,
        srNo: index + 1,
      }));
      setRows(formattedRows);
    }
  }, [data.exchangeData]);

  // const updateExchangeData = (updatedRows) => {
  //   const exchangeFormat = updatedRows.map((row) => ({
  //     CNCodeID: row.currencyCode,
  //     ExchType: row.type,
  //     ISSCodeID: row.issuer || "",
  //     FEAmount: parseFloat(row.feAmount).toFixed(5),
  //     Rate: parseFloat(row.rate).toFixed(6),
  //     Per: "1",
  //     Amount: parseFloat(row.amount).toFixed(2),
  //     Round: parseFloat(row.roundOff).toFixed(2),
  //     CommType: row.commissionType || "F",
  //     CommRate: (parseFloat(row.commissionValue) || 0).toFixed(2),
  //     CommAmt: (parseFloat(row.commissionAmount) || 0).toFixed(2),
  //   }));
  //   onUpdate({
  //     exchangeData: exchangeFormat,
  //     exchangeTotalAmount: exchangeFormat?.reduce(
  //       (sum, row) => sum + parseFloat(row.Amount || 0),
  //       0
  //     ),
  //   });
  // };

  const updateExchangeData = (updatedRows) => {
    const exchangeFormat = updatedRows.map((row) => ({
      CNCodeID: row.currencyCode,
      ExchType: row.type,
      ISSCodeID: row.issuer || "",
      FEAmount: parseFloat(row.feAmount).toFixed(5),
      Rate: parseFloat(row.rate).toFixed(6),
      Per: "1",
      Amount: parseFloat(row.amount).toFixed(2),
      Round: parseFloat(row.roundOff).toFixed(2),
      CommType: row.commissionType || "F",
      CommRate: (parseFloat(row.commissionValue) || 0).toFixed(2),
      CommAmt: (parseFloat(row.commissionAmount) || 0).toFixed(2),
    }));

    const totalAmount = exchangeFormat?.reduce(
      (sum, row) => sum + parseFloat(row.Amount || 0),
      0
    );
    const agentCommAmount = exchangeFormat?.reduce(
      (sum, row) => sum + parseFloat(row.CommAmt || 0),
      0
    );

    onUpdate({
      exchangeData: exchangeFormat,
      Amount: totalAmount, // Changed from exchangeTotalAmount to Amount
      agentCommCN: agentCommAmount,
    });
  };

  const calculateCommissionAmount = (feAmount, rate, commType, commValue) => {
    if (!feAmount || !rate || !commType || !commValue) return "";
    const baseAmount = feAmount * rate;

    if (commType === "P") {
      return (baseAmount * (commValue / 100)).toFixed(2);
    } else {
      return (feAmount * commValue).toFixed(2);
    }
  };

  const calculateAmount = (feAmount, rate) => {
    if (!feAmount || !rate) return "";
    return Math.round(feAmount * rate);
  };

  const calculateRoundOff = (feAmount, rate) => {
    if (!feAmount || !rate) return "";
    const exactAmount = feAmount * rate;
    const roundedAmount = Math.round(exactAmount);
    return (roundedAmount - exactAmount).toFixed(2);
  };

  const handleInputChange = (field, value) => {
    setCurrentRow((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === "currencyCode") {
        // fetchRate(value);
      }

      if (field === "type") {
        fetchIssuers(value);
        updated.issuer = "";
      }

      // Recalculate dependent fields
      if (["feAmount", "rate"].includes(field)) {
        updated.amount = calculateAmount(
          field === "feAmount" ? value : prev.feAmount,
          field === "rate" ? value : prev.rate
        );
        updated.roundOff = calculateRoundOff(
          field === "feAmount" ? value : prev.feAmount,
          field === "rate" ? value : prev.rate
        );
      }

      if (
        ["feAmount", "rate", "commissionType", "commissionValue"].includes(
          field
        )
      ) {
        updated.commissionAmount = calculateCommissionAmount(
          field === "feAmount" ? value : prev.feAmount,
          field === "rate" ? value : prev.rate,
          field === "commissionType" ? value : prev.commissionType,
          field === "commissionValue" ? value : prev.commissionValue
        );
      }

      return updated;
    });
  };

  const handleAddRow = () => {
    // Validation
    if (!currentRow.currencyCode?.value) {
      showToast("Please select a currency", "fail");
      setTimeout(() => {
        hideToast();
      }, 2000);
      return;
    }
    if (!currentRow.type) {
      showToast("Please select a type", "fail");
      setTimeout(() => {
        hideToast();
      }, 2000);
      return;
    }

    // Check for duplicate currency and type combination
    const isDuplicate = rows.some(
      (row, index) =>
        index !== editIndex && // Skip checking the row being edited
        row.currencyCode === currentRow.currencyCode.value &&
        row.type === currentRow.type
    );

    if (isDuplicate) {
      showInfoModal(
        "Duplicate Product and Currency",
        "Row with the same currency and product cannot be added, either change the product or edit the amount for already added currency"
      );
      return;
    }

    if (
      !currentRow.feAmount ||
      isNaN(currentRow.feAmount) ||
      parseFloat(currentRow.feAmount) <= 0
    ) {
      showToast("Please enter a valid FE amount", "fail");
      setTimeout(() => {
        hideToast();
      }, 2000);
      return;
    }
    if (
      !currentRow.rate ||
      isNaN(currentRow.rate) ||
      parseFloat(currentRow.rate) <= 0
    ) {
      showToast("Please enter a valid rate", "fail");
      setTimeout(() => {
        hideToast();
      }, 2000);
      return;
    }

    if (currentRow.type !== "CN" && !currentRow.issuer) {
      showToast("Please select an issuer", "fail");
      setTimeout(() => {
        hideToast();
      }, 2000);
      return;
    }

    clearError();

    const newRow = {
      id: Date.now(),
      currencyCode: currentRow.currencyCode?.value || "",
      currencyLabel: currentRow.currencyCode?.label || "",
      type: currentRow.type,
      issuer: currentRow.issuer,
      feAmount: parseFloat(currentRow.feAmount),
      rate: parseFloat(currentRow.rate),
      commissionType: currentRow.commissionType || "F",
      commissionValue: parseFloat(currentRow.commissionValue) || 0,
      commissionAmount: parseFloat(currentRow.commissionAmount) || 0,
      amount: parseFloat(currentRow.amount) || 0,
      roundOff: parseFloat(currentRow.roundOff) || 0,
      srNo: editIndex >= 0 ? editIndex + 1 : rows.length + 1,
    };

    let updatedRows;
    if (editIndex >= 0) {
      updatedRows = [...rows];
      updatedRows[editIndex] = newRow;
      setRows(updatedRows);
      setEditIndex(-1);
    } else {
      updatedRows = [...rows, newRow];
      setRows(updatedRows);
    }

    // Update context with exchange data
    updateExchangeData(updatedRows);

    // Reset form
    setCurrentRow({
      currencyCode: "",
      type: "",
      issuer: "",
      feAmount: "",
      rate: "",
      commissionType: "",
      commissionValue: "",
      commissionAmount: "",
      amount: "",
      roundOff: "",
    });
  };

  const handleEdit = (index) => {
    const row = rows[index];
    setEditIndex(index);
    setOpenModal(false);
    // Remove the row being edited from the view
    setRows((prevRows) => prevRows.filter((_, i) => i !== index));

    // First fetch issuers for the row's type
    if (row.type && row.type !== "CN") {
      fetchIssuers(row.type);
    }

    // Then set the current row values
    setCurrentRow({
      currencyCode: { value: row.currencyCode, label: row.currencyLabel },
      type: row.type,
      issuer: row.issuer,
      feAmount: row.feAmount,
      rate: row.rate,
      commissionType: row.commissionType,
      commissionValue: row.commissionValue,
      commissionAmount: row.commissionAmount,
      amount: row.amount,
      roundOff: row.roundOff,
    });
  };

  const handleDelete = (index) => {
    const updatedRows = rows
      .filter((_, i) => i !== index)
      .map((row, i) => ({ ...row, srNo: i + 1 }));
    setRows(updatedRows);
    // Update context when row is deleted
    updateExchangeData(updatedRows);
    // Close modal if no rows remain
    if (updatedRows.length === 0) {
      setOpenModal(false);
    }
  };

  const getColumns = () => {
    const baseColumns = [
      { field: "srNo", headerName: "Sr.No", width: 70 },
      {
        field: "currencyCode",
        headerName: "Currency Code",
        width: 120,
        renderCell: (params) => params.row.currencyCode || params.value,
      },
      { field: "type", headerName: "Type", width: 100 },
      {
        field: "feAmount",
        headerName: "Fe Amount",
        width: 130,
        type: "number",
      },
      {
        field: "rate",
        headerName: "Rate",
        width: 100,
        type: "number",
      },

      {
        field: "amount",
        headerName: "Amount",
        width: 130,
        type: "number",
      },
      {
        field: "roundOff",
        headerName: "RoundOff",
        width: 130,
        type: "number",
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 130,
        renderCell: (params) => (
          <Box>
            <IconButton
              onClick={() => handleEdit(params.row.srNo - 1)}
              size="small"
            >
              <EditIcon />
            </IconButton>
            <IconButton
              onClick={() => handleDelete(params.row.srNo - 1)}
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ),
      },
    ];

    // Only add issuer column if not all rows are type "CN"
    if (!rows.every((row) => row.type === "CN")) {
      baseColumns.splice(3, 0, {
        field: "issuer",
        headerName: "Issuer",
        width: 130,
      });
    }

    // Only add commission column if agentCode is present
    if (
      data.agentCode !== "" &&
      data.agentCode !== null &&
      data.agentCode !== "0"
    ) {
      baseColumns.splice(5, 0, {
        field: "commissionType",
        headerName: "Comm Type",
        width: 120,
      });

      baseColumns.splice(6, 0, {
        field: "commissionValue",
        headerName: "Comm Value",
        width: 120,
        type: "number",
      });

      baseColumns.splice(7, 0, {
        field: "commissionAmount",
        headerName: "Comm Amount",
        width: 130,
        type: "number",
      });
    }

    return baseColumns;
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <Grid
        container
        sx={{
          pt: 1,
          width: "100%",
          "& .MuiGrid-item": {
            mb: 3,
            px: { xs: 0, md: 1.5 },
          },
        }}
      >
        {/* First Row */}
        <Grid item xs={12} md={2}>
          {/* <CustomAutocomplete
            options={currencyOptions}
            value={currentRow.currencyCode}
            onChange={(_, value) => handleInputChange("currencyCode", value)}
            label="Currency Code"
            required
          /> */}
          <CustomAutocomplete
            options={currencyOptions}
            value={
              typeof currentRow.currencyCode === "object"
                ? currentRow.currencyCode
                : currencyOptions.find(
                    (option) => option.value === currentRow.currencyCode
                  ) || null
            }
            onChange={(_, value) => handleInputChange("currencyCode", value)}
            label="Currency Code"
            required
            getOptionLabel={(option) => option?.label || ""}
            isOptionEqualToValue={(option, value) => {
              // Handle both cases where value might be the full object or just the value
              const valueToCompare =
                typeof value === "object" ? value?.value : value;
              return option?.value === valueToCompare;
            }}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <CustomTextField
            select
            label="Type"
            value={currentRow.type}
            onChange={(e) => handleInputChange("type", e.target.value)}
            required
          >
            {productTypes.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </CustomTextField>
        </Grid>
        <Grid item xs={12} md={2}>
          <CustomTextField
            select
            label="Issuer"
            value={currentRow.issuer}
            onChange={(e) => handleInputChange("issuer", e.target.value)}
            options={issuers}
            disabled={currentRow.type === "CN" || !currentRow.type}
            required
          >
            {issuers.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </CustomTextField>
        </Grid>
        <Grid item xs={12} md={2}>
          <CustomTextField
            label="Fe Amount"
            type="number"
            value={currentRow.feAmount}
            onChange={(e) => handleInputChange("feAmount", e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <CustomTextField
            label="Rate"
            type="number"
            value={currentRow.rate}
            onChange={(e) => handleInputChange("rate", e.target.value)}
            disabled
            required
          />
        </Grid>

        {data.agentCode !== "" &&
          data.agentCode !== null &&
          data.agentCode !== "0" && (
            <>
              <Grid item xs={12} md={2}>
                <CustomTextField
                  select
                  label="Comm Type"
                  value={currentRow.commissionType}
                  onChange={(e) =>
                    handleInputChange("commissionType", e.target.value)
                  }
                  required
                >
                  {commissionTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </Grid>

              {/* Second Row */}
              <Grid item xs={12} md={2}>
                <CustomTextField
                  label="Comm Value"
                  type="number"
                  value={currentRow.commissionValue}
                  onChange={(e) =>
                    handleInputChange("commissionValue", e.target.value)
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <CustomTextField
                  label="Comm Amount"
                  value={currentRow.commissionAmount}
                  disabled
                />
              </Grid>
            </>
          )}

        <Grid item xs={12} md={2}>
          <CustomTextField label="Amount" value={currentRow.amount} disabled />
        </Grid>
        <Grid item xs={12} md={2}>
          <CustomTextField
            label="RoundOff"
            value={currentRow.roundOff}
            disabled
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <StyledButton
            onClick={handleAddRow}
            addIcon={editIndex >= 0 ? false : true}
            doneIcon={editIndex >= 0 ? true : false}
            style={{ width: "90%", height: "56px", gap: "10px" }}
          >
            {editIndex >= 0 ? "Update Row" : "Add Row"}
          </StyledButton>
        </Grid>
        <Grid item xs={12} md={2}>
          <StyledButton
            variant="contained"
            onClick={handleOpenModal}
            style={{ width: "90%", height: "56px", gap: "10px" }}
            bgColor={rows.length ? "green" : Colortheme.secondaryBG}
            textColor={rows.length ? Colortheme.background : Colortheme.text}
            disabled={rows.length === 0}
          >
            View Rows {rows.length > 0 && `(+${rows.length})`}
          </StyledButton>
        </Grid>
      </Grid>

      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: Colortheme.background,
            borderRadius: "20px",
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: Colortheme.background,
            color: Colortheme.text,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontFamily={"Poppins"}>
              Transaction Details
            </Typography>
            <StyledButton onClick={handleCloseModal} style={{ width: 150 }}>
              Close
            </StyledButton>
          </Box>
        </DialogTitle>
        <DialogContent
          sx={{
            backgroundColor: Colortheme.background,
            color: Colortheme.text,
          }}
        >
          <Box sx={{ height: "auto", width: "100%", mt: 2 }}>
            <CustomDataGrid
              rows={rows}
              columns={getColumns()}
              pageSize={5}
              rowsPerPageOptions={[5]}
              disableSelectionOnClick
              Colortheme={Colortheme}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 1,
                mt: 2,
                pr: 2,
                borderTop: `1px solid ${Colortheme.text}`,
                pt: 1,
              }}
            >
              {/* <Typography 
                sx={{ 
                  color: Colortheme.text,
                  fontWeight: 'bold',
                  fontFamily: 'Poppins'
                }}
              >
                Total FE Amount: {rows.reduce((sum, row) => sum + parseFloat(row.feAmount), 0).toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </Typography> */}
              {data.agentCode !== "" &&
                data.agentCode !== null &&
                data.agentCode !== "0" && (
                  <Typography
                    sx={{
                      color: Colortheme.text,
                      fontWeight: "bold",
                      fontFamily: "Poppins",
                    }}
                  >
                    Total Commission: ₹
                    {rows
                      .reduce(
                        (sum, row) =>
                          sum + parseFloat(row.commissionAmount || 0),
                        0
                      )
                      .toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                  </Typography>
                )}
              <Box display="flex" alignItems={"center"} gap={1}>
                <Typography
                  sx={{
                    color: Colortheme.text,
                    fontWeight: "bold",
                    fontFamily: "Poppins",
                  }}
                >
                  Total Amount: ₹
                  {rows
                    .reduce((sum, row) => sum + parseFloat(row.amount), 0)
                    .toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                </Typography>
                <Typography
                  sx={{
                    color: Colortheme.text,
                    fontWeight: "Regular",
                    fontFamily: "Poppins",
                    fontSize: "12px",
                  }}
                >
                  (*Tax Excluded)
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TransactionDetails;
