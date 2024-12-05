import React, { useEffect, useState } from "react";
import {
  Grid,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CustomTextField from "../../../../components/global/CustomTextField";
import CustomAutocomplete from "../../../../components/global/CustomAutocomplete";
import CustomDataGrid from "../../../../components/global/CustomDataGrid";
import { useTransaction } from "../../../../contexts/TransactionContext";
import { apiClient } from "../../../../services/apiClient";
import { useParams } from "react-router-dom";
import StyledButton from "../../../../components/global/StyledButton";

const TransactionDetails = ({ data, onUpdate, Colortheme }) => {
  const { Type: vTrntype } = useParams();
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
    { value: "%", label: "Percent" },
    { value: "Ps", label: "Paise" },
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

  const fetchRate = async (currencyCode) => {
    if (!currencyCode) return;
    try {
      const response = await apiClient.get("/pages/Transactions/getRate", {
        params: { currencyCode },
      });
      handleInputChange("rate", response.data.rate);
    } catch (error) {
      console.error("Error fetching rate:", error);
      setError("rate", "Failed to load rate");
    }
  };

  const calculateCommissionAmount = (feAmount, rate, commType, commValue) => {
    if (!feAmount || !rate || !commType || !commValue) return "";
    const baseAmount = feAmount * rate;

    if (commType === "%") {
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
        fetchRate(value);
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
    const newRow = {
      id: Date.now(), // Add unique id for DataGrid
      currencyCode: currentRow.currencyCode?.value || "", // Extract value from currency object
      currencyLabel: currentRow.currencyCode?.label || "", // Store label separately
      type: currentRow.type,
      issuer: currentRow.issuer,
      feAmount: currentRow.feAmount,
      rate: currentRow.rate,
      commissionType: currentRow.commissionType,
      commissionValue: currentRow.commissionValue,
      commissionAmount: currentRow.commissionAmount,
      amount: currentRow.amount,
      roundOff: currentRow.roundOff,
      srNo: editIndex >= 0 ? editIndex + 1 : rows.length + 1,
    };

    if (editIndex >= 0) {
      const updatedRows = [...rows];
      updatedRows[editIndex] = newRow;
      setRows(updatedRows);
      setEditIndex(-1);
    } else {
      setRows((prev) => [...prev, newRow]);
    }

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
    setCurrentRow({
      currencyCode: { value: row.currencyCode, label: row.currencyLabel }, // Reconstruct currency object
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
    setRows((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.map((row, i) => ({ ...row, srNo: i + 1 }));
    });
  };

  const getColumns = () => {
    const baseColumns = [
      { field: "srNo", headerName: "Sr.No", width: 70 },
      {
        field: "currencyCode",
        headerName: "Currency Code",
        width: 180,
        renderCell: (params) => params.row.currencyLabel || params.value,
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
        width: 130,
        type: "number",
      },
      { field: "commissionType", headerName: "Comm Type", width: 130 },
      {
        field: "commissionValue",
        headerName: "Comm Value",
        width: 130,
        type: "number",
      },
      {
        field: "commissionAmount",
        headerName: "Comm Amount",
        width: 130,
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
      <Grid container spacing={2}>
        {/* First Row */}
        <Grid item xs={12} md={2}>
          <CustomAutocomplete
            options={currencyOptions}
            value={currentRow.currencyCode}
            onChange={(_, value) => handleInputChange("currencyCode", value)}
            label="Currency Code"
            required
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
            disabled={currentRow.type === "CN"}
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
          <StyledButton onClick={handleAddRow} addIcon={true} style={{ width: "90%",height:"56px",gap:"10px" }}>
            Add Row
          </StyledButton>
        </Grid>
        <Grid item xs={12} md={2}>
          <StyledButton
            variant="contained"
            onClick={handleOpenModal}
            style={{ width: "90%",height:"56px",gap:"10px" }}
            bgColor={rows.length
              ? "green"
              : Colortheme.secondaryBG}
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
            <Typography variant="h6">Transaction Details</Typography>
            <StyledButton 
              onClick={handleCloseModal} 
              style={{ width: 150 }}
            >
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
          <Box sx={{ height: 400, width: "100%", mt: 2 }}>
            <CustomDataGrid
              rows={rows}
              columns={getColumns()}
              pageSize={5}
              rowsPerPageOptions={[5]}
              disableSelectionOnClick
              Colortheme={Colortheme}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TransactionDetails;
