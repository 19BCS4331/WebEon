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
import AgentRefDetails from "./Steps/AgentRefDetails";
import TransactionDetails from "./Steps/TransactionDetails";
import ChargesAndRecPay from "./Steps/ChargesAndRecPay";
import TransactionList from "./Steps/TransactionList";
import { apiClient } from "../../../services/apiClient";
import StyledButton from "../../../components/global/StyledButton";
import {
  TransactionProvider,
  useTransaction,
} from "../../../contexts/TransactionContext";

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
    component: null,
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

  const validateStep = (step) => {
    switch (step) {
      case 0:
        return formData.TRNWITHIC && formData.vNo;
      case 1:
        return true;
      case 2:
        return true;
      case 3:
        return true;
      default:
        return true;
    }
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
          // <Paper
          //   elevation={3}
          //   sx={{
          //     p: { xs: 2, sm: 3 },
          //     backgroundColor: Colortheme.background,
          //     height: "95%",
          //     borderRadius: "20px",
          //     display: "flex",
          //     flexDirection: "column",
          //   }}
          // >
          //   <Box
          //     sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
          //   >
          //     <Typography
          //       variant="h6"
          //       color={Colortheme.text}
          //       fontFamily={"Poppins"}
          //     >
          //       {isEditMode ? "Edit Transaction" : "New Transaction"}
          //     </Typography>
          //     <Box display="flex" gap={2}>
          //       {isEditMode && (
          //         <StyledButton
          //           onClick={() => {
          //             resetForm();
          //             setEditMode(false);
          //             handleNewTransaction();
          //           }}
          //           style={{ width: 200 }}
          //           addIcon={true}
          //         >
          //           New Transaction
          //         </StyledButton>
          //       )}
          //       <StyledButton
          //         onClick={() => setShowList(true)}
          //         style={{ width: 150 }}
          //         searchIcon={true}
          //       >
          //         Search
          //       </StyledButton>
          //     </Box>
          //   </Box>

          //   <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          //     <CustomStepper
          //       steps={steps.map((step) => step.label)}
          //       activeStep={activeStep}
          //       onStepClick={handleStepClick}
          //       onNext={handleNext}
          //       onBack={handleBack}
          //       isStepValid={validateStep}
          //       sx={{
          //         backgroundColor: Colortheme.background,
          //         color: Colortheme.text,
          //         mb: 3,
          //       }}
          //     />

          //     <Paper
          //       elevation={3}
          //       sx={{
          //         mt: { lg: 2, sm: 2, xs: 2 },
          //         p: { xs: 2, sm: 3 },
          //         backgroundColor: Colortheme.background,
          //         flex: 1,
          //         minHeight: "40vh",
          //         maxHeight: { xs: "calc(100vh - 550px)", sm: "calc(100vh - 580px)" },
          //         borderRadius: "20px",
          //         display: "flex",
          //         flexDirection: "column",
          //         overflow: "auto",
          //         overflowX: "hidden",
          //         "& .MuiGrid-container": {
          //           flexWrap: "wrap",
          //           width: "100%",
          //         },
          //         // Custom Scrollbar Styles
          //         "&::-webkit-scrollbar": {
          //           width: "8px",
          //           height: "8px",
          //         },
          //         "&::-webkit-scrollbar-track": {
          //           backgroundColor: Colortheme.background,
          //         },
          //         "&::-webkit-scrollbar-thumb": {
          //           backgroundColor: Colortheme.text,
          //           borderRadius: "8px",
          //         },
          //         "&::-webkit-scrollbar-thumb:hover": {
          //           backgroundColor: Colortheme.secondaryBGcontra,
          //         },
          //       }}
          //     >
          //       <Typography
          //         variant="h6"
          //         color={Colortheme.text}
          //         sx={{ mb: 3 }}
          //         fontFamily={"Poppins"}
          //       >
          //         {steps[activeStep].label}
          //       </Typography>

          //       <Box sx={{ flex: 1 }}>{renderStepContent()}</Box>

          //       <Box
          //         sx={{
          //           display: "flex",
          //           justifyContent: "center",
          //           gap: 10,
          //           mt: "auto",
          //           pt: 4,
          //         }}
          //       >
          //         <StyledButton
          //           onClick={handleBack}
          //           disabled={activeStep === 0}
          //           style={{ width: 250 }}
          //         >
          //           Back
          //         </StyledButton>
          //         <StyledButton
          //           onClick={handleNext}
          //           disabled={activeStep === steps.length - 1}
          //           style={{ width: 250 }}
          //         >
          //           {activeStep === steps.length - 1 ? "Submit" : "Next"}
          //         </StyledButton>
          //       </Box>
          //     </Paper>
          //   </Box>
          // </Paper>
          <Paper
            elevation={3}
            sx={{
              p: { xs: 2, sm: 3 },
              backgroundColor: Colortheme.background,
              height: "95%", // Changed from 95%
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
                <StyledButton
                  onClick={() => setShowList(true)}
                  style={{ width: 150 }}
                  searchIcon={true}
                >
                  Search
                </StyledButton>
              </Box>
            </Box>

            {/* Content Container */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minHeight: 0, // Important for flex child scrolling
              }}
            >
              {/* Stepper */}
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
                  mb: 3,
                  flexShrink: 0, // Prevent stepper from shrinking
                }}
              />

              {/* Content Paper */}
              <Paper
                elevation={3}
                sx={{
                  mt: { lg: 2, sm: 2, xs: 2 },
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
