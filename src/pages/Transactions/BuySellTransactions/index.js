import React, { useState, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Tooltip,
} from "@mui/material";
import CustomStepper from "../../../components/global/CustomStepper/CustomStepper";
import MainContainerCompilation from "../../../components/global/MainContainerCompilation";
import ThemeContext from "../../../contexts/ThemeContext";
import BasicDetails from "./Steps/BasicDetails";
import PartyDetails from "./Steps/PartyDetails";
import AgentRefDetails from "./Steps/AgentRefDetails";
import TransactionDetails from "./Steps/TransactionDetails";
import ChargesAndRecPay from "./Steps/ChargesAndRecPay";
import TransactionList from "./Steps/TransactionList";
import ReviewAndSubmit from "./Steps/ReviewAndSubmit";
import { apiClient } from "../../../services/apiClient";
import StyledButton from "../../../components/global/StyledButton";
import {
  TransactionProvider,
  useTransaction,
} from "../../../contexts/TransactionContext";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useToast } from "../../../contexts/ToastContext";

const steps = [
  {
    label: "Basic Details",
    component: BasicDetails,
  },
  {
    label: "Party Details",
    component: PartyDetails,
  },
  {
    label: "Agent/Ref Selection (Optional)",
    component: AgentRefDetails,
  },
  {
    label: "Transaction Details",
    component: TransactionDetails,
  },
  {
    label: "Charges and Rec/Pay",
    component: ChargesAndRecPay,
  },
  {
    label: "Review & Submit",
    component: ReviewAndSubmit,
  },
];

const BuySellTransactionsContent = () => {
  const {
    formData,
    activeStep,
    showList,
    isEditMode,
    updateFormData,
    setActiveStep,
    setShowList,
    setEditMode,
    initializeTransaction,
    resetForm,
  } = useTransaction();

  const { With: vTrnwith, Type: vTrntype } = useParams();
  const { Colortheme } = useContext(ThemeContext);
  const [paxDetails, setPaxDetails] = useState(null);
  const [showStepper, setShowStepper] = useState(true);
  const { showToast,hideToast } = useToast();

  useEffect(() => {
    // Reset form and show list when transaction parameters change
    resetForm();
    setShowList(true);
    setEditMode(false);
    setActiveStep(0);

    // Update form with new transaction parameters
    updateFormData({
      vTrnwith,
      vTrntype,
    });
  }, [vTrnwith, vTrntype]);

  useEffect(() => {
    if (isEditMode && formData.PaxCode) {
      fetchPaxDetails(formData.PaxCode);
    }
  }, [isEditMode, formData.PaxCode]);

  useEffect(() => {
    if (isEditMode && formData.vNo) {
      fetchExchangeData(formData.vNo);
    }
  }, [isEditMode, formData.vNo]);

  const fetchPaxDetails = async (paxCode) => {
    try {
      const response = await apiClient.get(
        `/pages/Transactions/pax-details/${paxCode}`
      );
      if (response.data.data) {
        const paxData = response.data.data;
        setPaxDetails(paxData);
        updateFormData({
          PaxCode: paxData.nPaxcode,
          PaxName: paxData.vPaxname,
        });
        console.log("Pax Details:", paxData);
      }
    } catch (error) {
      console.error("Error fetching pax details:", error);
    }
  };

  const fetchExchangeData = async (vNo) => {
    try {
      const response = await apiClient.get(
        "/pages/Transactions/getExchangeData",
        {
          params: {
            vNo,
            vTrnwith,
            vTrntype,
          },
        }
      );
      if (response.data.success) {
        const exchangeData = response.data.data;
        updateFormData({
          exchangeData: exchangeData,
        });
      }
    } catch (error) {
      console.error("Error fetching exchange data:", error);
    }
  };

  const handleNewTransaction = async () => {
    try {
      const response = await apiClient.get(
        "/pages/Transactions/transactions/nextNumber",
        {
          params: {
            vTrnwith: vTrnwith,
            vTrntype: vTrntype,
          },
        }
      );

      initializeTransaction({
        vTrnwith,
        vTrntype,
        vNo: response.data || "",
        date: new Date().toISOString().split("T")[0],
        Category: "L",
      });
    } catch (error) {
      console.error("Error fetching next transaction number:", error);
    }
  };

  const handleUpdateData = (fieldOrObject, value) => {
    if (typeof fieldOrObject === "object") {
      updateFormData(fieldOrObject);
    } else {
      updateFormData({ [fieldOrObject]: value });
    }
  };

  const handleBack = () => {
    if (activeStep === 0) {
      setShowList(true);
      setEditMode(false);
    } else {
      setActiveStep(activeStep - 1);
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleStepClick = (step) => {
    if (step <= activeStep + 1 && validateStep(activeStep)) {
      setActiveStep(step);
    }
  };

  const getValidationMessage = (step) => {
    switch (step) {
      case 0:
        if (!formData.TRNWITHIC) return "Entity Type is required";
        if (!formData.vNo) return "Transaction Number is required";
        if (!formData.Purpose) return "Purpose is required";
        if (!formData.Category) return "Category is required";
        if (!formData.vBranchCode) return "Branch is required";
        if (!formData.date) return "Date is required";
        return "";
      
      case 1:
        if (!formData.PartyID) return "Party Selection is required";
        if (!formData.PartyType) return "Party Type is required";
        if (!formData.PaxCode) return "Please Select A PAX";
        if (!formData.PaxName) return "Pax Name is required";
        return "";
      
      case 2:
        if (formData.agentCode && !formData.agentCommCN) {
          return "Agent Commission is required when Agent is selected";
        }
        return "";
      
      case 3:
        if (!formData.exchangeData || formData.exchangeData.length === 0) {
          return "At least one exchange transaction is required";
        }
        const invalidTxn = formData.exchangeData.find(item => 
          !item.CNCodeID || !item.ExchType || !item.Amount || !item.Rate
        );
        if (invalidTxn) {
          return "All exchange transactions must have Currency, Exchange Type, Amount, and Rate";
        }
        return "";
      
      case 4:
        const netAmount = (() => {
          const chargesTotal = Math.abs(parseFloat(formData.ChargesTotalAmount || 0));
          const taxTotal = Math.abs(parseFloat(formData.TaxTotalAmount || 0));
          const totalDeductions = chargesTotal + taxTotal;
          return (parseFloat(formData.Amount) || 0) - totalDeductions;
        })();
        const totalPayments = (formData.RecPay || [])
          .reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
        if (totalPayments < netAmount) {
          return "Total payments must cover the net amount";
        }
        return "";
      
      default:
        return "";
    }
  };

  const validateStep = (step) => {
    const validationMessage = getValidationMessage(step);
    if (validationMessage) {
      showToast(validationMessage, "error");
      setTimeout(() => hideToast(), 3000);
      return false;
    }
    return true;
  };

  const renderStepContent = () => {
    const StepComponent = steps[activeStep].component;
    if (!StepComponent) return null;

    const commonProps = {
      data: formData,
      onUpdate: handleUpdateData,
      isEditMode: isEditMode,
      Colortheme: Colortheme,
    };

    switch (activeStep) {
      case 0:
        return <StepComponent {...commonProps} />;
      case 1:
        return (
          <StepComponent
            {...commonProps}
            paxDetails={paxDetails}
            setPaxDetails={setPaxDetails}
          />
        );
      case 2:
        return <StepComponent {...commonProps} />;
      case 3:
        return <StepComponent {...commonProps} />;
      case 4:
        return <StepComponent {...commonProps} />;
      case 5:
        return <StepComponent {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <MainContainerCompilation
      title={`${formData.vTrntype === "B" ? "Buy" : "Sell"} Transaction - ${
        {
          B: "Bank",
          P: "Public",
          F: "FFFMC/AD",
          R: "RMC",
          C: "FRANCHISEE",
          I: "FOREIGN CORRESPONDENT",
          H: "NON-FRANCHISEE",
          K: "BANK",
          E: "FOREIGN CORRESPONDENT",
        }[formData.vTrnwith] || ""
      }`}
    >
      <Box sx={{ width: "95%", p: { xs: 1, sm: 2 }, minHeight: "75vh" }}>
        {showList ? (
          <Paper
            elevation={3}
            sx={{
              p: 3,
              backgroundColor: Colortheme.background,
              color: Colortheme.text,
              borderRadius: "20px",
            }}
          >
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
            >
              <Typography
                variant="h6"
                color={Colortheme.text}
                fontFamily={"Poppins"}
              >
                Transaction List
              </Typography>
              <StyledButton
                onClick={handleNewTransaction}
                style={{ width: 150 }}
              >
                New Transaction
              </StyledButton>
            </Box>
            <TransactionList
              vTrnwith={vTrnwith}
              vTrntype={vTrntype}
              onEdit={(transaction) => {
                updateFormData({
                  ...transaction,
                  vNo: transaction.vNo || transaction.VNo,
                  // TRNWITHIC: transaction.TRNWITHIC || "",
                });
                setEditMode(true);
                setShowList(false);
                setActiveStep(0);
              }}
            />
          </Paper>
        ) : (
          <Paper
            elevation={3}
            sx={{
              p: { xs: 2, sm: 3 },
              backgroundColor: Colortheme.background,
              height: "95%",
              borderRadius: "20px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 3,
                flexShrink: 0, // Prevent header from shrinking
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography
                  variant="h6"
                  color={Colortheme.text}
                  fontFamily={"Poppins"}
                >
                  {isEditMode ? "Edit Transaction" : "New Transaction"}
                </Typography>
                <Tooltip title={showStepper ? "Hide Stepper" : "Show Stepper"}>
                  <IconButton
                    size="small"
                    onClick={() => setShowStepper(!showStepper)}
                    sx={{
                      backgroundColor: Colortheme.secondaryBG,
                      padding: '4px',
                      '&:hover': {
                        backgroundColor: `${Colortheme.text}20`,
                      },
                      transition: 'transform 0.3s',
                      transform: showStepper ? 'rotate(180deg)' : 'none',
                    }}
                  >
                    {showStepper ? (
                      <KeyboardArrowUpIcon sx={{ color: Colortheme.text, fontSize: '1.2rem' }} />
                    ) : (
                      <KeyboardArrowDownIcon sx={{ color: Colortheme.text, fontSize: '1.2rem' }} />
                    )}
                  </IconButton>
                </Tooltip>
              </Box>
              <Box display="flex" gap={2}>
                {isEditMode && (
                  <StyledButton
                    onClick={() => {
                      resetForm();
                      setEditMode(false);
                      handleNewTransaction();
                    }}
                    style={{ width: 200 }}
                    addIcon={true}
                  >
                    New Transaction
                  </StyledButton>
                )}
                <StyledButton
                  onClick={() => setShowList(true)}
                  style={{ width: 150 }}
                  searchIcon={true}
                >
                  Search
                </StyledButton>
              </Box>
            </Box>

            {/* Main Content Container */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                flexGrow: 1,
                minHeight: 0, // Important for flex child scrolling
              }}
            >
              {/* Collapsible Stepper */}
              <Box
                sx={{
                  height: showStepper ? 'auto' : 0,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease-in-out',
                  mb: showStepper ? 1 : 0
                }}
              >
                <CustomStepper
                  steps={steps.map((step) => step.label)}
                  activeStep={activeStep}
                  onStepClick={handleStepClick}
                  onNext={handleNext}
                  onBack={handleBack}
                  isStepValid={validateStep}
                  sx={{
                    backgroundColor: Colortheme.background,
                    color: Colortheme.text,
                    // mb: 3,
                    flexShrink: 0,
                  }}
                />
              </Box>

              {/* Content Paper */}
              <Paper
                elevation={3}
                sx={{
                  // mt: { lg: 2, sm: 2, xs: 2 },
                  p: { xs: 2, sm: 3 },
                  backgroundColor: Colortheme.background,
                  borderRadius: "20px",
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  minHeight: 0, // Important for flex child scrolling
                  overflow: "hidden", // Handle overflow at container level
                  "& .MuiGrid-container": {
                    flexWrap: "wrap",
                    width: "100%",
                    margin: 0,
                  },
                }}
              >
                {/* Step Title */}
                <Typography
                  variant="h6"
                  color={Colortheme.text}
                  sx={{ mb: 3, flexShrink: 0 }} // Prevent title from shrinking
                  fontFamily={"Poppins"}
                >
                  {steps[activeStep].label}
                </Typography>

                {/* Step Content */}
                <Box
                  sx={{
                    // backgroundColor: 'black',
                    flex: 1,
                    overflowY: "auto",
                    overflowX: "hidden",
                    // Scrollbar Styles
                    "&::-webkit-scrollbar": {
                      width: "8px",
                      height: "8px",
                    },
                    "&::-webkit-scrollbar-track": {
                      backgroundColor: Colortheme.background,
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: Colortheme.text,
                      borderRadius: "8px",
                    },
                    "&::-webkit-scrollbar-thumb:hover": {
                      backgroundColor: Colortheme.secondaryBGcontra,
                    },
                  }}
                >
                  {renderStepContent()}
                </Box>

                {/* Footer Buttons */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 10,
                    mt: 3,
                    pt: 2,
                    borderTop: `1px solid ${Colortheme.border}`,
                    flexShrink: 0, // Prevent footer from shrinking
                  }}
                >
                  <StyledButton
                    onClick={handleBack}
                    disabled={activeStep === 0}
                    style={{ width: 250 }}
                  >
                    Back
                  </StyledButton>
                  <StyledButton
                    onClick={handleNext}
                    disabled={activeStep === steps.length - 1}
                    style={{ width: 250 }}
                  >
                    {activeStep === steps.length - 1 ? "Submit" : "Next"}
                  </StyledButton>
                </Box>
              </Paper>
            </Box>
          </Paper>
        )}
      </Box>
    </MainContainerCompilation>
  );
};

const BuySellTransactions = () => {
  return (
    <TransactionProvider>
      <BuySellTransactionsContent />
    </TransactionProvider>
  );
};

export default BuySellTransactions;
