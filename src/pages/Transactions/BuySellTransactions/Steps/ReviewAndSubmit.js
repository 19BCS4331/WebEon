import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import StyledButton from "../../../../components/global/StyledButton";

const SectionTitle = ({ children, Colortheme }) => (
  <Typography
    variant="h6"
    sx={{
      color: Colortheme.text,
      fontFamily: "Poppins",
      fontWeight: "bold",
      mb: 2,
    }}
  >
    {children}
  </Typography>
);

const DetailRow = ({ label, value, Colortheme, highlight }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      mb: 1.5,
      p: 1,
      borderRadius: "8px",
      backgroundColor: highlight ? `${Colortheme.text}08` : "transparent",
      '&:hover': {
        backgroundColor: `${Colortheme.text}05`,
      },
      "& .label": {
        color: Colortheme.text,
        fontFamily: "Poppins",
        opacity: 0.8,
        fontWeight: "500",
      },
      "& .value": {
        color: Colortheme.text,
        fontFamily: "Poppins",
        fontWeight: "600",
      },
    }}
  >
    <Typography className="label">{label}:</Typography>
    <Typography className="value">{value || "N/A"}</Typography>
  </Box>
);

const DetailDialog = ({ open, onClose, title, children, Colortheme }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="md"
    fullWidth
    PaperProps={{
      sx: {
        backgroundColor: Colortheme.background,
        borderRadius: "20px",
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
        borderBottom: `1px solid ${Colortheme.text}20`,
        py: 2,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: "600" }}>
        {title}
      </Typography>
      <IconButton
        onClick={onClose}
        sx={{
          color: Colortheme.text,
          '&:hover': {
            backgroundColor: `${Colortheme.text}10`,
          },
        }}
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent
      sx={{
        backgroundColor: Colortheme.background,
        py: 3,
      }}
    >
      {children}
    </DialogContent>
  </Dialog>
);

const SectionHeader = ({ children, Colortheme }) => (
  <Typography
    sx={{
      color: Colortheme.text,
      fontFamily: "Poppins",
      fontSize: "1rem",
      fontWeight: "600",
      mb: 2,
      pb: 1,
      borderBottom: `1px solid ${Colortheme.text}15`,
    }}
  >
    {children}
  </Typography>
);

const ReviewAndSubmit = ({ data, Colortheme }) => {
  const [openDialog, setOpenDialog] = useState(null);
  console.log(data);

  const calculateNetAmount = () => {
    const chargesTotal = Math.abs(parseFloat(data.ChargesTotalAmount || 0));
    const taxTotal = Math.abs(parseFloat(data.TaxTotalAmount || 0));
    const totalDeductions = chargesTotal + taxTotal;
    return (parseFloat(data.Amount) || 0) - totalDeductions;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const handleClose = () => {
    setOpenDialog(null);
  };

  const renderBasicDetails = () => (
    <Paper sx={{ p: 3, backgroundColor: Colortheme.secondaryBG,mt:2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <DetailRow
            label="Transaction Number"
            value={data.vNo}
            Colortheme={Colortheme}
          />
          <DetailRow
            label="Date"
            value={formatDate(data.date)}
            Colortheme={Colortheme}
          />
          <DetailRow
            label="Entity Type"
            value={data.TRNWITHIC === "I" ? "Individual" : "Corporate"}
            Colortheme={Colortheme}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <DetailRow
            label="Purpose"
            value={data.PurposeDescription}
            Colortheme={Colortheme}
          />
          <DetailRow
            label="Category"
            value={data.Category}
            Colortheme={Colortheme}
          />
          <DetailRow
            label="Branch"
            value={data.vBranchCode}
            Colortheme={Colortheme}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <DetailRow
            label="Manual Bill Reference"
            value={data.ManualBillRef}
            Colortheme={Colortheme}
          />
          <DetailRow
            label="Remarks"
            value={data.Remark}
            Colortheme={Colortheme}
          />
        </Grid>
      </Grid>
    </Paper>
  );

  const renderPartyDetails = () => (
    <Paper sx={{ p: 3, backgroundColor: Colortheme.secondaryBG,mt:2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <DetailRow
            label="Party ID"
            value={data.PartyID}
            Colortheme={Colortheme}
          />
          <DetailRow
            label="Party Type"
            value={data.PartyType}
            Colortheme={Colortheme}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <DetailRow
            label="On Behalf Client"
            value={data.OnBehalfClient}
            Colortheme={Colortheme}
          />
          <DetailRow
            label="Risk Category"
            value={data.Category}
            Colortheme={Colortheme}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <DetailRow
            label="Pax Code"
            value={data.PaxCode}
            Colortheme={Colortheme}
          />
          <DetailRow
            label="Pax Name"
            value={data.PaxName}
            Colortheme={Colortheme}
          />
        </Grid>
      </Grid>
    </Paper>
  );

  const renderAgentDetails = () => (
    <Paper sx={{ p: 3, backgroundColor: Colortheme.secondaryBG,mt:2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <DetailRow
            label="Agent Code"
            value={data.agentCode}
            Colortheme={Colortheme}
          />
          <DetailRow
            label="Marketing Reference"
            value={data.MRKTREF}
            Colortheme={Colortheme}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <DetailRow
            label="Agent Commission"
            value={formatCurrency(data.agentCommCN)}
            Colortheme={Colortheme}
          />
          <DetailRow
            label="Other Reference"
            value={data.OthRef}
            Colortheme={Colortheme}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <DetailRow
            label="Delivery Person"
            value={data.nDeliveryPersonID}
            Colortheme={Colortheme}
          />
          <DetailRow
            label="Web Deal Reference"
            value={data.WebDealRef}
            Colortheme={Colortheme}
          />
        </Grid>
      </Grid>
    </Paper>
  );

  const renderTransactionDetails = () => (
    <Paper sx={{ p: 3, backgroundColor: Colortheme.secondaryBG, mt:2 }}>
  
      {data.exchangeData?.map((item, index) => (
        <Box
          key={index}
          sx={{
            mb: 3,
            p: 2,
            borderRadius: "12px",
            backgroundColor: `${Colortheme.text}05`,
            '&:hover': {
              backgroundColor: `${Colortheme.text}08`,
            },
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <DetailRow
                label="Currency"
                value={item.CNCodeID}
                Colortheme={Colortheme}
                highlight={true}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <DetailRow
                label="Type"
                value={item.ExchType}
                Colortheme={Colortheme}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <DetailRow
                label="FE Amount"
                value={formatCurrency(item.FEAmount)}
                Colortheme={Colortheme}
                highlight={true}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <DetailRow
                label="Amount"
                value={formatCurrency(item.Amount)}
                Colortheme={Colortheme}
                highlight={true}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <DetailRow
                label="Rate"
                value={item.Rate}
                Colortheme={Colortheme}
              />
            </Grid>
          </Grid>
        </Box>
      ))}
    </Paper>
  );

  const renderChargesAndPayments = () => (
    <Paper sx={{ p: 3, backgroundColor: Colortheme.secondaryBG,mt:2 }}>
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <SectionHeader Colortheme={Colortheme}>Charges</SectionHeader>
        <Box sx={{ 
          p: 2, 
          borderRadius: "12px",
          backgroundColor: `${Colortheme.text}05`,
        }}>
          {data.Charges?.map((charge, index) => (
            <Box sx={{backgroundColor: `${Colortheme.text}08`, borderRadius: "12px"}}>
            <DetailRow
              key={index}
              label={charge.account?.label}
              value={`${charge.operation} ${formatCurrency(charge.value)}`}
              Colortheme={Colortheme}
            />
            <DetailRow
              key={index}
              label={`IGST ON ${charge.account?.code}`}
              value={`${charge.operation} ${formatCurrency(charge.othIGST)}`}
              Colortheme={Colortheme}
            />
            </Box>
          ))}
          <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${Colortheme.text}15` }}>
            <DetailRow
              label="Total Charges"
              value={formatCurrency(data.ChargesTotalAmount)}
              Colortheme={Colortheme}
              highlight={true}
            />
          </Box>
        </Box>
      </Grid>

      <Grid item xs={12} md={6}>
      <SectionHeader Colortheme={Colortheme}>Taxes</SectionHeader>
      <Box sx={{ 
          p: 2, 
          borderRadius: "12px",
          backgroundColor: `${Colortheme.text}05`,
        }}>
          {data.Taxes?.map((tax, index) => (
            <Box
              key={index}
              sx={{ mb: 1, display: "flex", justifyContent: "space-between" }}
            >
              <Typography
                sx={{ color: Colortheme.text, fontFamily: "Poppins" }}
              >
                {tax.DESCRIPTION}:
              </Typography>
              <Typography
                sx={{ color: Colortheme.text, fontFamily: "Poppins" }}
              >
                {formatCurrency(tax.amount)}
              </Typography>
            </Box>
          ))}
          </Box>
          <Divider sx={{ my: 2 }} />
            <DetailRow
              label="Total Taxes"
              value={formatCurrency(data.TaxTotalAmount)}
              Colortheme={Colortheme}
              highlight={true}
          />
        </Grid>
      </Grid>

      {/* Payment Summary */}
      <Box sx={{ mt: 4 }}>
        <Typography
          sx={{
            color: Colortheme.text,
            fontFamily: "Poppins",
            mb: 2,
            fontWeight: "bold",
          }}
        >
          Payment Summary:
        </Typography>
        <Box
          sx={{
            backgroundColor: `${Colortheme.text}10`,
            p: 2,
            borderRadius: 1,
          }}
        >
          <DetailRow
            label="Base Amount"
            value={formatCurrency(data.Amount)}
            Colortheme={Colortheme}
          />
          <DetailRow
            label="Charges"
            value={formatCurrency(data.ChargesTotalAmount)}
            Colortheme={Colortheme}
          />
          <DetailRow
            label="Taxes"
            value={formatCurrency(data.TaxTotalAmount)}
            Colortheme={Colortheme}
          />
          <Divider sx={{ my: 2 }} />
          <DetailRow
            label="Net Amount"
            value={formatCurrency(calculateNetAmount())}
            Colortheme={Colortheme}
            highlight={true}
          />
          </Box>
        </Box>

      {/* Payments */}
      <Box sx={{ mt: 4 }}>
        <Typography
          sx={{
            color: Colortheme.text,
            fontFamily: "Poppins",
            mb: 2,
            fontWeight: "medium",
          }}
        >
          Payments Received:
        </Typography>
        {data.RecPay?.map((payment, index) => (
          <Box
            key={index}
            sx={{
              mb: 2,
              p: 2,
              border: `1px solid ${Colortheme.text}20`,
              borderRadius: 1,
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <DetailRow
                  label="Payment Mode"
                  value={payment.code}
                  Colortheme={Colortheme}
                  highlight={true}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <DetailRow
                  label="Amount"
                  value={formatCurrency(payment.amount)}
                  Colortheme={Colortheme}
                />
              </Grid>
              {payment.chequeNo && (
                <>
                  <Grid item xs={12} md={3}>
                    <DetailRow
                      label="Cheque No"
                      value={payment.chequeNo}
                      Colortheme={Colortheme}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <DetailRow
                      label="Bank"
                      value={payment.drawnOn}
                      Colortheme={Colortheme}
                    />
      </Grid>
                </>
              )}
    </Grid>
          </Box>
        ))}
      </Box>
    </Paper>
    );

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Grid container spacing={2}>
        {/* Summary Cards */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              backgroundColor: Colortheme.secondaryBG,
              mb: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography
                sx={{
                  color: Colortheme.text,
                  fontFamily: "Poppins",
                  fontSize: "1.2rem",
                  mb: 1,
                }}
              >
                Transaction Summary
              </Typography>
              <Typography
                sx={{
                  color: Colortheme.text,
                  fontFamily: "Poppins",
                  opacity: 0.8,
                }}
              >
                Transaction No: {data.vNo}
              </Typography>
            </Box>
            <Chip
              label={data.RecPayTotalAmount >= calculateNetAmount() ? "FULLY PAID" : "PAYMENT PENDING"}
              color={data.RecPayTotalAmount >= calculateNetAmount() ? "success" : "warning"}
              sx={{ fontSize: "1rem", py: 2, px: 3 }}
            />
          </Paper>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12} md={4}>
          <StyledButton
            onClick={() => setOpenDialog("basic")}
            style={{ width: "100%", height: "120px" }}
          >
            <Box>
              <Typography sx={{ fontSize: "1.1rem", mb: 1 }}>
                Basic Details
              </Typography>
              <Typography sx={{ opacity: 0.8, fontSize: "0.9rem" }}>
                View transaction date, purpose, and category
              </Typography>
            </Box>
          </StyledButton>
        </Grid>

        <Grid item xs={12} md={4}>
          <StyledButton
            onClick={() => setOpenDialog("party")}
            style={{ width: "100%", height: "120px" }}
          >
            <Box>
              <Typography sx={{ fontSize: "1.1rem", mb: 1 }}>
                Party Details
              </Typography>
              <Typography sx={{ opacity: 0.8, fontSize: "0.9rem" }}>
                View party information and details
              </Typography>
            </Box>
          </StyledButton>
        </Grid>

        {data.agentCode !== "" && data.agentCode !== null && (
        <Grid item xs={12} md={4}>
          <StyledButton
            onClick={() => setOpenDialog("agent")}
            style={{ width: "100%", height: "120px" }}
          >
            <Box>
              <Typography sx={{ fontSize: "1.1rem", mb: 1 }}>
                Agent Details
              </Typography>
              <Typography sx={{ opacity: 0.8, fontSize: "0.9rem" }}>
                View agent and reference information
              </Typography>
            </Box>
          </StyledButton>
        </Grid>
        )}

        <Grid item xs={12} md={4}>
          <StyledButton
            onClick={() => setOpenDialog("transaction")}
            style={{ width: "100%", height: "120px" }}
          >
            <Box>
              <Typography sx={{ fontSize: "1.1rem", mb: 1 }}>
                Transaction Details
              </Typography>
              <Typography sx={{ opacity: 0.8, fontSize: "0.9rem" }}>
                View exchange rates and amounts
              </Typography>
            </Box>
          </StyledButton>
        </Grid>

        <Grid item xs={12} md={6}>
          <StyledButton
            onClick={() => setOpenDialog("charges")}
            style={{ width: "100%", height: "120px" }}
          >
            <Box>
              <Typography sx={{ fontSize: "1.1rem", mb: 1 }}>
                Charges & Payments
              </Typography>
              <Typography sx={{ opacity: 0.8, fontSize: "0.9rem" }}>
                View charges, taxes, and payment details
              </Typography>
            </Box>
          </StyledButton>
        </Grid>
      </Grid>

      {/* Dialogs */}
      <DetailDialog
        open={openDialog === "basic"}
        onClose={handleClose}
        title="Basic Details"
        Colortheme={Colortheme}
      >
        {renderBasicDetails()}
      </DetailDialog>

      <DetailDialog
        open={openDialog === "party"}
        onClose={handleClose}
        title="Party Details"
        Colortheme={Colortheme}
      >
        {renderPartyDetails()}
      </DetailDialog>

      {data.agentCode !== "" && data.agentCode !== null && (
        <DetailDialog
          open={openDialog === "agent"}
          onClose={handleClose}
          title="Agent Details"
          Colortheme={Colortheme}
        >
          {renderAgentDetails()}
        </DetailDialog>
      )}

      <DetailDialog
        open={openDialog === "transaction"}
        onClose={handleClose}
        title="Transaction Details"
        Colortheme={Colortheme}
      >
        {renderTransactionDetails()}
      </DetailDialog>

      <DetailDialog
        open={openDialog === "charges"}
        onClose={handleClose}
        title="Charges & Payments"
        Colortheme={Colortheme}
      >
        {renderChargesAndPayments()}
      </DetailDialog>
    </Box>
  );
};

export default ReviewAndSubmit;
