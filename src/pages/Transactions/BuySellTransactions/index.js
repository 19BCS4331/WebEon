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
} from "@mui/material";
import CustomStepper from "../../../components/global/CustomStepper/CustomStepper";
import MainContainerCompilation from "../../../components/global/MainContainerCompilation";
import ThemeContext from "../../../contexts/ThemeContext";
import BasicDetails from "./Steps/BasicDetails";
import PartyDetails from "./Steps/PartyDetails";
import TransactionDetails from "./Steps/TransactionDetails";
import TransactionList from "./Steps/TransactionList";
import { apiClient } from "../../../services/apiClient";
import StyledButton from "../../../components/global/StyledButton";
import SearchIcon from '@mui/icons-material/Search';
import { TransactionProvider, useTransaction } from "../../../contexts/TransactionContext";

const steps = [
  "Basic Details",
  "Party Details",
  "Transaction Details",
  "Party Information",
  "Purpose & Amount",
  "Payment Details",
  "Review & Submit",
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
    resetForm
  } = useTransaction();

  const { With: vTrnwith, Type: vTrntype } = useParams();
  const { Colortheme } = useContext(ThemeContext);
  const [paxDetails, setPaxDetails] = useState(null);

  useEffect(() => {
    // Reset form and show list when transaction parameters change
    resetForm();
    setShowList(true);
    setEditMode(false);
    setActiveStep(0);
    
    // Update form with new transaction parameters
    updateFormData({
      vTrnwith,
      vTrntype
    });
  }, [vTrnwith, vTrntype]);

  useEffect(() => {
    if (isEditMode && formData.PaxCode) {
      fetchPaxDetails(formData.PaxCode);
    }
  }, [isEditMode, formData.PaxCode]);

  const fetchPaxDetails = async (paxCode) => {
    try {
      const response = await apiClient.get(`/pages/Transactions/pax-details/${paxCode}`);
      if (response.data.data) {
        const paxData = response.data.data;
        setPaxDetails(paxData);
        updateFormData({
          PaxCode: paxData.nPaxcode,
          PaxName: paxData.vPaxname
        });
        console.log("Pax Details:", paxData);
      }
    } catch (error) {
      console.error('Error fetching pax details:', error);
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
        Category: "L"
      });
    } catch (error) {
      console.error("Error fetching next transaction number:", error);
    }
  };

  const handleUpdateData = (fieldOrObject, value) => {
    if (typeof fieldOrObject === 'object') {
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

  const validateStep = (step) => {
    switch (step) {
      case 0:
        return formData.TRNWITHIC && formData.Purpose && formData.vNo;
      case 1:
        return true;
      case 2:
        return formData.CounterID && formData.ShiftID;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <BasicDetails
            data={formData}
            onUpdate={handleUpdateData}
            isEditMode={isEditMode}
          />
        );
      case 1:
        return (
          <PartyDetails
            data={formData}
            onUpdate={handleUpdateData}
            isEditMode={isEditMode}
            paxDetails={paxDetails}
            setPaxDetails={setPaxDetails}
          />
        );
      case 2:
        return (
          <TransactionDetails
            data={formData}
            onUpdate={handleUpdateData}
            isEditMode={isEditMode}
          />
        );
      // Add other step components
      default:
        return null;
    }
  };

  return (
    <MainContainerCompilation
      title={`${
        formData.vTrntype === "B" ? "Buy" : "Sell"
      } Transaction - ${
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
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
            >
              <Typography
                variant="h6"
                color={Colortheme.text}
                fontFamily={"Poppins"}
              >
                {isEditMode ? "Edit Transaction" : "New Transaction"}
              </Typography>
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
                <StyledButton onClick={() => setShowList(true)} style={{ width: 150 }} searchIcon={true}>
                  Search
                </StyledButton>
              </Box>
            </Box>

            <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <CustomStepper
                steps={steps}
                activeStep={activeStep}
                onStepClick={handleStepClick}
                onNext={handleNext}
                onBack={handleBack}
                isStepValid={validateStep}
                sx={{
                  backgroundColor: Colortheme.background,
                  color: Colortheme.text,
                  mb: 3,
                }}
              />

              <Paper
                elevation={3}
                sx={{
                  mt: { lg: 2 },
                  p: { xs: 2, sm: 3 },
                  backgroundColor: Colortheme.background,
                  flex: 1,
                  minHeight: "40vh",
                  maxHeight: { xs: "calc(100vh - 500px)", sm: "none" },
                  borderRadius: "20px",
                  display: "flex",
                  flexDirection: "column",
                  "& .MuiGrid-container": {
                    flexWrap: "wrap",
                  },
                  // Custom Scrollbar Styles
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
                <Typography variant="h6" color={Colortheme.text} sx={{ mb: 3 }}>
                  {steps[activeStep]}
                </Typography>

                <Box sx={{ flex: 1 }}>{renderStepContent()}</Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 10,
                    mt: "auto",
                    pt: 4,
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
