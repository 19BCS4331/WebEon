import {
  Autocomplete,
  Box,
  MenuItem,
  Skeleton,
  TextField,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { Colortheme } from "../../../assets/colors/COLORS";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import {
  fetchCurrencyNames,
  fetchCurrencyRates,
} from "../../../apis/OptionsMaster";
import { motion } from "framer-motion";
import "../../../css/components/buyfromindiv.css";
import SouthIcon from "@mui/icons-material/South";
import { useActionModal } from "../../../contexts/ActionModal";
import InfoIcon from "@mui/icons-material/Info";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Taxes from "./Taxes";
import {
  FormDataProvider,
  useFormData,
} from "../../../contexts/FormDataContext";
import RecPay from "./RecPay";
import ThemeContext from "../../../contexts/ThemeContext";
// import CustomSearch from "../../global/CustomSearch";

const TransacDetails = ({
  isTransacDetailsView,
  handlebackClickOnTransacView,
  setIsTransacDetailsView,
  comission,
}) => {
  const { Colortheme } = useContext(ThemeContext);
  const { updateFormData } = useFormData();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [isTaxView, setIsTaxView] = useState(false);
  const [isRecPay, setIsRecPay] = useState(false);
  const { openModal, closeModal } = useActionModal();
  const [currencyRateOptions, setCurrencyRateOptions] = useState(null);
  const [transacType, setTransacType] = useState("");
  const [feAmount, setFeAmount] = useState("");
  const [rateCurr, setRateCurr] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [finalAmountText, setFinalAmountText] = useState("");
  const [feAmountVisible, setFeAmountVisible] = useState(false);

  const [commType, setCommType] = useState("");
  const [commVal, setCommVal] = useState("");
  const [commAmount, setCommAmount] = useState("");

  const commTypeOptions = [
    {
      value: "Ps",
      label: "Ps.",
    },
    {
      value: "Percent",
      label: "%",
    },
  ];

  const [transactions, setTransactions] = useState([]);
  const [editedTransaction, setEditedTransaction] = useState(null);
  const [nextId, setNextId] = useState(1);

  const [showCommModal, setShowCommModal] = useState(false);
  const [selectedTransac, setSelectedTransac] = useState(null);

  const addTransaction = () => {
    // Logic to add a new transaction
    if (selectedCurrency !== null && feAmount !== "" && transacType !== "") {
      const newTransaction = {
        id: nextId, // Generate a unique ID (you may have a better way to generate IDs)
        // Other transaction details like date, amount, etc.
        CNCode: selectedCurrency.currency_code,
        Type: transacType,
        FeAmount: feAmount,
        Rate: rateCurr,
        FinalAmount: finalAmount,
        CommAmt: commAmount,
        CommType: commType,
        CommVal: commVal,
      };
      setTransactions([...transactions, newTransaction]);
      setNextId(nextId + 1);
      setSelectedCurrency(null);
      setTransacType("");
      setFeAmount("");
      setFinalAmountText("");
      setRateCurr(null);
      setCommAmount("");
      setCommType("");
      setCommVal("");
    }
  };

  //   const handleEdit = (id) => {
  //     // Logic to handle edit for a transaction
  //     console.log("Edit transaction:", id);
  //   };

  const handleEdit = (transactionId) => {
    const transactionToEdit = transactions.find(
      (transaction) => transaction.id === transactionId
    );
    setEditedTransaction(transactionToEdit);
  };

  const handleSaveEdit = () => {
    const updatedTransactions = transactions.map((transaction) => {
      if (transaction.id === editedTransaction.id) {
        return editedTransaction;
      }
      return transaction;
    });
    setTransactions(updatedTransactions);
    console.log("Trnasac After Save Click", transactions);
    setEditedTransaction(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedTransaction((prevState) => {
      const updatedTransaction = {
        ...prevState,
        [name]: value,
      };

      // Calculate final amount whenever FeAmount changes
      if (name === "FeAmount") {
        const finalAmount = calculateFinalAmount(
          value,
          prevState.Rate
        ).finalAmount;
        return {
          ...updatedTransaction,
          FinalAmount: finalAmount,
        };
      }

      return updatedTransaction;
    });
  };

  const handleDelete = (id) => {
    // Logic to handle delete for a transaction
    openModal({
      message: "Delete the entry?",
      onConfirm: () => {
        // Logic to execute when user confirms
        setTransactions(
          transactions.filter((transaction) => transaction.id !== id)
        );
        setTransactions((prevTransactions) =>
          prevTransactions.map((transaction, index) => ({
            ...transaction,
            id: index + 1, // Assign new IDs based on index
          }))
        );
        // Decrement nextId to ensure it remains consistent with the IDs
        setNextId(nextId - 1);
        console.log("User confirmed");
        closeModal();
      },
    });
  };

  const TransTypeOptions = [
    "Select",
    "CN (Currency)",
    "EM (Encashed TM)",
    "ET (Encashed TCS)",
    "TP (TT Purchase Back)",
    "DP (DD Purchase Back)",
  ];

  const finalAmountInit = feAmount * rateCurr;
  const finalAmount = finalAmountInit.toFixed(0);

  useEffect(() => {
    if (isTransacDetailsView) {
      const OptionsFetch = async () => {
        const CurrencyNameOptions = await fetchCurrencyNames();
        setCurrencyRateOptions(CurrencyNameOptions);

        // setOptionsDataLoading(false);
      };
      OptionsFetch();
    }
  }, [isTransacDetailsView]);

  const handleCurrencyChange = async (event, newValue) => {
    setSelectedCurrency(newValue); // Update selected currency

    // Fetch currency rate when a currency is selected
    if (newValue) {
      try {
        const response = await fetchCurrencyRates(newValue.currencyid); // Replace '/api/CurrencyRates' with your actual endpoint
        if (response.data.length > 0) {
          setRateCurr(response.data[0].rate); // Assuming the response contains rate data
        }
      } catch (error) {
        console.error("Error fetching currency rate:", error);
      }
    } else {
      setRateCurr(null); // Reset currency rate if no currency is selected
    }
  };

  const handleEditCurrencyChange = async (event, newValue) => {
    if (newValue) {
      try {
        const response = await fetchCurrencyRates(newValue.currencyid); // Replace '/api/CurrencyRates' with your actual endpoint
        const rateData = response.data;

        if (response.data.length > 0) {
          setEditedTransaction((prevState) => ({
            ...prevState,
            CNCode: newValue.currency_code,
            Rate: rateData[0].rate,
            FinalAmount: calculateFinalAmount(
              prevState.FeAmount,
              rateData[0].rate
            ).finalAmount,
          }));
        } else {
          setEditedTransaction((prevState) => ({
            ...prevState,
            CNCode: null,
            Rate: null,
            FinalAmount: null,
          }));
        }
      } catch (error) {
        console.error("Error fetching currency rate:", error);
      }
    }
  };

  // const handleEditCurrencyChange = async (event, newValue) => {
  //   if (newValue !== null) {
  //     try {
  //       const response = await fetchCurrencyRates(newValue.currencyid);
  //       const rateData = response.data;
  //       if (response.data.length > 0) {
  //         setEditedTransaction((prevState) => ({
  //           ...prevState,
  //           CNCode: newValue.currency_code, // Update CNCode with the selected currency code
  //           Rate: rateData[0].rate,
  //         }));
  //       } else {
  //         setEditedTransaction((prevState) => ({
  //           ...prevState,
  //           CNCode: null,
  //           Rate: null,
  //         }));
  //       }
  //     } catch (error) {
  //       console.error("Error fetching currency rate:", error);
  //     }
  //   } else {
  //     setEditedTransaction((prevState) => ({
  //       ...prevState,
  //       CNCode: null,
  //       Rate: null,
  //     }));
  //   }
  // };

  useEffect(() => {
    setFinalAmountText(`Rs. ${finalAmount}`);
  }, [finalAmount]);

  useEffect(() => {
    if (transacType && transacType !== "Select") {
      setFeAmountVisible(true);
    } else if (transacType === "Select") {
      setFeAmountVisible(false);
    }
  }, [transacType]);

  const calculateFinalAmount = (FeAmount, Rate) => {
    const finalAmountFloat = FeAmount * Rate;

    // Calculate rounded final amount
    const roundedFinalAmount = Math.floor(finalAmountFloat);

    // Calculate rounded-off amount
    const roundedOffAmount = finalAmountFloat - roundedFinalAmount;

    // Return final amount and rounded-off amount in an object
    return {
      finalAmount: roundedFinalAmount,
      roundedOffAmount: roundedOffAmount.toFixed(2), // Round to 2 decimal places
    };
  };

  const handleAddClick = (event) => {
    event.preventDefault();
    addTransaction();
  };

  const handleCommissionTypeChange = (e) => {
    const newCommType = e.target.value;
    setCommType(newCommType); // Update the Commission Type state

    // Calculate Commission Amount based on the new Commission Type and existing Commission Value
    if (newCommType === "Ps") {
      const calculatedCommAmountPs = commVal
        ? parseFloat(commVal) * feAmount
        : "";
      setCommAmount(calculatedCommAmountPs); // Update the Commission Amount state
    } else {
      const calculatedCommAmountPercent = commVal
        ? feAmount * rateCurr * (parseFloat(commVal) / 100)
        : "";
      setCommAmount(calculatedCommAmountPercent); // Update the Commission Amount state
    }
  };

  const handleCommissionValueChange = (e) => {
    const newValue = e.target.value;
    setCommVal(newValue); // Update the Commission Value state

    // Calculate Commission Amount based on the Commission Value and existing Commission Type
    if (commType === "Ps") {
      const calculatedCommAmountPs = newValue
        ? parseFloat(newValue) * feAmount
        : "";
      setCommAmount(calculatedCommAmountPs); // Update the Commission Amount state
    } else {
      const calculatedCommAmountPercent = newValue
        ? feAmount * rateCurr * (parseFloat(newValue) / 100)
        : "";
      setCommAmount(calculatedCommAmountPercent); // Update the Commission Amount state
    }
  };

  const handleShowCommModal = (transaction) => {
    setShowCommModal(true);
    setSelectedTransac(transaction);
  };

  const handleNextOnTransac = () => {
    // Calculate the sum of finalAmount in transactions array
    const finalAmountTotal = transactions.reduce((total, transaction) => {
      // Ensure transaction.finalAmount is parsed as number
      const finalAmount = parseFloat(transaction.FinalAmount);
      console.log("Transaction finalAmount:", finalAmount);
      return total + finalAmount;
    }, 0);

    console.log("Final Amount Total:", finalAmountTotal);

    try {
      const formDataObject = {
        transaction: transactions,
        FinalAmountTotal: finalAmountTotal,
        // Add other form data here
      };

      const formDataJSON = JSON.stringify(formDataObject);
      updateFormData(formDataObject);

      console.log("TransacCurrencyForm", formDataJSON);
      // Attempt to store the JSON string in local storage
      // localStorage.setItem("TransacCurrencyForm", formDataJSON);
      setIsTaxView(true);
      setIsTransacDetailsView(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handlebackClickOnTaxView = () => {
    setIsTaxView(false);
    setIsTransacDetailsView(true);
  };

  const handlebackClickOnRecPay = () => {
    setIsTaxView(true);
    setIsRecPay(false);
  };

  const handleRecPayView = () => {
    setIsRecPay(true);
    setIsTaxView(false);
  };

  return (
    <>
      {isTransacDetailsView && (
        <Box
          display={"flex"}
          component={motion.div}
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          //   exit={{ x: 50 }}
          flexDirection={"column"}
          alignItems={"center"}
          sx={{
            backgroundColor: Colortheme.text,
            overflow: isMobile ? "auto" : "visible",
          }}
          width={isMobile ? "70vw" : "50vw"}
          height={
            transactions.length > 0
              ? isMobile
                ? "80vh"
                : "80vh"
              : isMobile
              ? "70vh"
              : "50vh"
          }
          borderRadius={"25px"}
          boxShadow={"0px 10px 15px -3px rgba(0,0,0,0.1)"}
        >
          <p style={{ color: Colortheme.background, fontSize: "16px" }}>
            Transaction Details
          </p>
          <KeyboardBackspaceIcon
            onClick={handlebackClickOnTransacView}
            fontSize="large"
            sx={{
              alignSelf: "flex-start",
              color: Colortheme.secondaryBG,
              position: "absolute",
              cursor: "pointer",
              marginTop: 1.5,
              marginLeft: 4,
            }}
          />

          <Box
            display={"flex"}
            onSubmit={handleAddClick}
            component={"form"}
            gap={3}
            flexDirection={"column"}
            mt={5}
            border={`1px solid ${Colortheme.secondaryBG}`}
            padding={2}
            borderRadius={"10px"}
            height={isMobile ? "40vh" : "auto"}
            sx={{ overflow: isMobile ? "auto" : "visible" }}
            width={isMobile ? "80%" : "auto"}
          >
            <Box
              display={"flex"}
              flexDirection={isMobile ? "column" : "row"}
              gap={4}
            >
              {currencyRateOptions ? (
                // <Autocomplete
                //   disablePortal
                //   id="CurrencyCodeRate"
                //   value={selectedCurrency}
                //   options={currencyRateOptions.map((item) => ({
                //     label: item.currency_code,
                //     value: item.currencyid,
                //   }))}
                //   getOptionLabel={(option) => option.label || ""}
                //   isOptionEqualToValue={(option, value) =>
                //     option.label === value
                //   } // Compare option's value with selected value
                //   onChange={handleCurrencyChangeNew}
                //   renderInput={(params) => (
                //     <TextField
                //       {...params}
                //       label="Currency Code"
                //       name="CurrencyCodeRate"
                //       required
                //     />
                //   )}
                // />
                <Autocomplete
                  disablePortal
                  id="CurrencyCodeRate"
                  value={selectedCurrency}
                  options={currencyRateOptions}
                  getOptionLabel={(option) => option.currency_code || ""}
                  isOptionEqualToValue={(option, value) =>
                    option.currency_code === value.currency_code
                  }
                  onChange={handleCurrencyChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Currency Code"
                      name="CurrencyCodeRate"
                      required
                      style={{ width: isMobile ? "auto" : "10vw" }}
                    />
                  )}
                />
              ) : (
                <Skeleton
                  variant="rectangular"
                  width={isMobile ? "auto" : "12vw"}
                  height={60}
                  style={{ borderRadius: "10px" }}
                />
              )}

              {/* <TextField label="Transaction Nature" sx={{ width: "10vw" }} /> */}
              <TextField
                required
                select
                label="Type"
                sx={{ width: isMobile ? "auto" : "9vw" }}
                defaultValue={"Select"}
                value={transacType}
                onChange={(e) => setTransacType(e.target.value)}
              >
                {TransTypeOptions &&
                  TransTypeOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
              </TextField>
              <TextField
                disabled={transacType !== "EM (Encashed TM)"}
                label="Issuer"
                sx={{ width: isMobile ? "auto" : "9vw" }}
              />
              <TextField
                required
                disabled={!feAmountVisible}
                label="FE Amount"
                sx={{ width: isMobile ? "auto" : "9vw" }}
                value={feAmount}
                onChange={(e) => setFeAmount(e.target.value)}
              />
            </Box>
            <Box
              display={"flex"}
              flexDirection={isMobile ? "column" : "row"}
              gap={5}
              justifyContent={comission ? "none" : "center"}
            >
              <TextField
                label="Rate"
                // disabled
                sx={{ width: isMobile ? "auto" : "9vw" }}
                value={rateCurr ? rateCurr : ""}
              />
              {comission && (
                <TextField
                  required
                  select
                  label="Commission Type"
                  value={commType}
                  onChange={handleCommissionTypeChange}
                  sx={{ width: isMobile ? "auto" : "11vw" }}
                  disabled={!comission}
                >
                  {commTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}

              {comission && (
                <TextField
                  required
                  label="Commission Value"
                  value={commVal}
                  onChange={handleCommissionValueChange}
                  sx={{ width: isMobile ? "auto" : "10vw" }}
                  disabled={!comission}
                />
              )}
            </Box>
            <Box
              display={"flex"}
              flexDirection={isMobile ? "column" : "row"}
              gap={5}
              justifyContent={comission ? "none" : "center"}
            >
              {comission && (
                <TextField
                  required
                  label="Commission Amount (Rs.)"
                  value={commAmount}
                  sx={{ width: isMobile ? "auto" : "11vw" }}
                />
              )}

              <TextField
                label="Final Amount (Rs.)"
                sx={{ width: isMobile ? "auto" : "9vw" }}
                value={finalAmountText}
              />

              <button
                className="TransacAddButton"
                type="submit"
                style={{ width: isMobile ? "100%" : "10vw" }}
              >
                Add +
              </button>

              {/* <TextField label="Rounded" sx={{ width: "9vw" }} /> */}
            </Box>
          </Box>
          {transactions.length > 0 && (
            <SouthIcon
              style={{
                marginTop: isMobile ? 5 : 10,
                color: `${Colortheme.secondaryBG}`,
              }}
            />
          )}
          {transactions.length > 0 && (
            <>
              <Box
                className="table-container"
                component={motion.div}
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                mt={isMobile ? 0 : 2}
                p={0}
                sx={{
                  border: `1px solid ${Colortheme.secondaryBG}`,
                  borderRadius: 2,
                  maxHeight: isMobile ? "150px" : "195px",
                }}
              >
                <table>
                  <thead>
                    <tr>
                      <th>Sr.No</th>
                      {/* Other header cells */}
                      <th>Currency Code</th>
                      <th>Transaction Type</th>
                      <th>Fe Amount</th>
                      <th>Rate</th>
                      <th style={{ width: 100, maxWidth: 100 }}>
                        Amount (Rs.)
                      </th>
                      <th>Round Off</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>
                          <Box
                            display={"flex"}
                            justifyContent={"center"}
                            gap={1}
                          >
                            {transaction.id}
                            {comission && (
                              <Tooltip title="Commission Details">
                                <InfoIcon
                                  style={{
                                    color: Colortheme.secondaryBG,
                                    cursor: "pointer",
                                  }}
                                  onClick={() =>
                                    handleShowCommModal(transaction)
                                  }
                                />
                              </Tooltip>
                            )}
                          </Box>
                        </td>
                        {/* <Autocomplete
                          disablePortal
                          id="CurrencyCodeRate"
                          value={selectedCurrency}
                          options={currencyRateOptions}
                          getOptionLabel={(option) =>
                            option.currency_code || ""
                          }
                          isOptionEqualToValue={(option, value) =>
                            option.currency_code === value.currency_code
                          }
                          onChange={handleCurrencyChange}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Currency Code"
                              name="CurrencyCodeRate"
                              required
                              style={{ width: isMobile ? "auto" : "10vw" }}
                            />
                          )}
                        /> */}
                        <td>
                          {editedTransaction &&
                          editedTransaction.id === transaction.id ? (
                            <Autocomplete
                              value={
                                editedTransaction
                                  ? currencyRateOptions.find(
                                      (option) =>
                                        option.currency_code ===
                                        editedTransaction.CNCode
                                    )
                                  : null
                              } // Explicitly set the input value to the selected currency code
                              onChange={handleEditCurrencyChange}
                              options={currencyRateOptions}
                              getOptionLabel={(option) =>
                                option.currency_code || ""
                              }
                              isOptionEqualToValue={(option, value) =>
                                option.currency_code === value.currency_code
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  style={{ width: 120 }}
                                  label="Currency Code"
                                />
                              )}
                            />
                          ) : (
                            transaction.CNCode
                          )}
                        </td>
                        {/* <td>{transaction.CNCode}</td> */}
                        <td>{transaction.Type}</td>
                        <td>
                          {/* {transaction.FeAmount} */}
                          {editedTransaction &&
                          editedTransaction.id === transaction.id ? (
                            <input
                              type="text"
                              name="FeAmount"
                              value={editedTransaction.FeAmount}
                              onChange={handleEditChange}
                              style={{
                                width: 80,
                                height: 40,
                                borderColor: `${Colortheme.secondaryBG}`,
                                borderRadius: "10px",
                                paddingLeft: 10,
                                fontSize: 16,
                              }}
                            />
                          ) : (
                            transaction.FeAmount
                          )}
                        </td>
                        <td>{transaction.Rate}</td>
                        <td>
                          {
                            calculateFinalAmount(
                              transaction.FeAmount,
                              transaction.Rate
                            ).finalAmount
                          }
                        </td>
                        <td>
                          {
                            calculateFinalAmount(
                              transaction.FeAmount,
                              transaction.Rate
                            ).roundedOffAmount
                          }
                        </td>
                        {/* Render other cells with transaction details */}
                        <td style={{ display: "flex", gap: 10 }}>
                          {editedTransaction &&
                          editedTransaction.id === transaction.id ? (
                            <button
                              className="ActionButtons"
                              onClick={handleSaveEdit}
                              style={{
                                borderRadius: "10px",
                                height: 50,
                                width: 80,
                              }}
                            >
                              Save
                            </button>
                          ) : (
                            <button
                              className="ActionButtons"
                              onClick={() => handleEdit(transaction.id)}
                              style={{
                                borderRadius: "10px",
                                height: 50,
                                width: 80,
                              }}
                            >
                              Edit
                            </button>
                          )}
                          <button
                            className="DeleteButton"
                            onClick={() => handleDelete(transaction.id)}
                            style={{
                              borderRadius: "10px",
                              height: 50,
                              width: 80,
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
              <button
                className="NextOnCreate"
                style={{ width: "10vw" }}
                onClick={handleNextOnTransac}
              >
                Next
              </button>
            </>
          )}
        </Box>
      )}

      {isTaxView && (
        <Taxes
          isTaxView={isTaxView}
          handlebackClickOnTaxView={handlebackClickOnTaxView}
          handleRecPayView={handleRecPayView}
        />
      )}

      {isRecPay && (
        <RecPay
          isRecPay={isRecPay}
          handlebackClickOnRecPay={handlebackClickOnRecPay}
        />
      )}

      <Dialog
        open={showCommModal}
        onClose={() => setShowCommModal(false)}
        maxWidth={false}
      >
        <DialogContent style={isMobile ? { width: "70vw" } : { width: "40vw" }}>
          {selectedTransac && (
            <Box
              width={isMobile ? "70vw" : "40vw"}
              height={"25vh"}
              className="table-container"
            >
              <Box
                id="title"
                display={"flex"}
                justifyContent={"center"}
                fontWeight={"bold"}
                color={Colortheme.secondaryBG}
              >
                Commission Details ( Sr.No : {selectedTransac.id} )
              </Box>
              {/* <Box mt={5}>Transaction ID: {selectedTransac.id}</Box>
              <Box>FE Amount: {selectedTransac.FeAmount}</Box>
              <Box>Commission Type: {selectedTransac.CommType}</Box>
              <Box>Commission Value: {selectedTransac.CommVal}</Box>
              <Box>Commission Amount: {selectedTransac.CommAmt}</Box> */}
              <table style={{ marginTop: 40 }}>
                <thead>
                  <tr>
                    {/* <th>Sr.No</th> */}
                    {/* Other header cells */}
                    <th>Currency Code</th>
                    <th>Fe Amount</th>
                    <th>Rate</th>
                    <th>Commission Type</th>
                    <th>Commission Value</th>
                    <th>Commission Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr key={selectedTransac.id}>
                    {/* <td>
                      <Box display={"flex"} justifyContent={"center"} gap={1}>
                        {selectedTransac.id}
                      </Box>
                    </td> */}
                    <td>{selectedTransac.CNCode}</td>
                    <td>{selectedTransac.FeAmount}</td>
                    <td>{selectedTransac.Rate}</td>
                    <td>{selectedTransac.CommType}</td>
                    <td>{selectedTransac.CommVal}</td>
                    <td>{selectedTransac.CommAmt}</td>
                  </tr>
                </tbody>
              </table>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TransacDetails;
