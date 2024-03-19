import {
  Autocomplete,
  Box,
  MenuItem,
  Skeleton,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { COLORS } from "../../../assets/colors/COLORS";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { fetchCurrencyRate } from "../../../apis/OptionsMaster";
import { motion } from "framer-motion";
import "../../../css/components/buyfromindiv.css";
import SouthIcon from "@mui/icons-material/South";
import { useActionModal } from "../../../contexts/ActionModal";

const Taxes = ({ isTaxView, handlebackClickOnTaxView }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { openModal, closeModal } = useActionModal();
  const [currencyRateOptions, setCurrencyRateOptions] = useState(null);
  const [transacType, setTransacType] = useState("");
  const [feAmount, setFeAmount] = useState("");
  const [rateCurr, setRateCurr] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [finalAmountText, setFinalAmountText] = useState("");
  const [feAmountVisible, setFeAmountVisible] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [editedTransaction, setEditedTransaction] = useState(null);
  const [nextId, setNextId] = useState(1);

  const addTransaction = () => {
    // Logic to add a new transaction
    if (selectedCurrency !== null && feAmount !== "" && transacType !== "") {
      const newTransaction = {
        id: nextId, // Generate a unique ID (you may have a better way to generate IDs)
        // Other transaction details like date, amount, etc.
        CNCode: selectedCurrency,
        Type: transacType,
        FeAmount: feAmount,
        Rate: rateCurr,
        FinalAmount: finalAmountText,
      };
      setTransactions([...transactions, newTransaction]);
      setNextId(nextId + 1);
      setSelectedCurrency(null);
      setTransacType("");
      setFeAmount("");
      setFinalAmountText("");
      setRateCurr(null);
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
    setEditedTransaction(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedTransaction((prevState) => ({
      ...prevState,
      [name]: value,
    }));
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
        const CurrencyRateOptions = await fetchCurrencyRate();
        setCurrencyRateOptions(CurrencyRateOptions);

        // setOptionsDataLoading(false);
      };
      OptionsFetch();
    }
  }, [isTransacDetailsView]);

  const handleCurrencyChange = (event, newValue) => {
    if (newValue !== null) {
      const selectedCurrency = newValue;
      const selectedRate = currencyRateOptions.find(
        (currency) => currency.currencycode === selectedCurrency
      ).rate;

      setSelectedCurrency(selectedCurrency);
      setRateCurr(selectedRate);
      console.log(selectedRate);
      console.log(newValue);
    } else {
      setRateCurr(null);
    }
  };

  const handleEditCurrencyChange = (event, newValue) => {
    if (newValue !== null) {
      const selectedCurrency = newValue;
      const selectedRate = currencyRateOptions.find(
        (currency) => currency.currencycode === selectedCurrency
      ).rate;

      setEditedTransaction((prevState) => ({
        ...prevState,
        CNCode: selectedCurrency,
        Rate: selectedRate,
      }));
    } else {
      setEditedTransaction((prevState) => ({
        ...prevState,
        CNCode: null,
        Rate: null,
      }));
    }
  };

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
    return (FeAmount * Rate).toFixed(2); // You can add any additional calculations here
  };

  const handleAddClick = (event) => {
    event.preventDefault();
    addTransaction();
  };

  return (
    <>
      {isTaxView && (
        <Box
          display={"flex"}
          component={motion.div}
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          //   exit={{ x: 50 }}
          flexDirection={"column"}
          alignItems={"center"}
          sx={{
            backgroundColor: COLORS.text,
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
          <p style={{ color: COLORS.background, fontSize: "16px" }}>
            Transaction Details
          </p>
          <KeyboardBackspaceIcon
            onClick={handlebackClickOnTransacView}
            fontSize="large"
            sx={{
              alignSelf: "flex-start",
              color: COLORS.secondaryBG,
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
            border={`1px solid ${COLORS.secondaryBG}`}
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
                <Autocomplete
                  disablePortal
                  id="CurrencyCodeRate"
                  value={selectedCurrency}
                  options={currencyRateOptions.map((item) => item.currencycode)}
                  onChange={handleCurrencyChange}
                  sx={{ width: isMobile ? "auto" : "9vw" }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Currency Code"
                      name="CurrencyCodeRate"
                      required
                      // value={calculationMethod}
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
            >
              <TextField
                label="Rate"
                // disabled
                sx={{ width: isMobile ? "auto" : "9vw" }}
                value={rateCurr ? rateCurr : ""}
              />
              <TextField
                label="Commission Type"
                sx={{ width: isMobile ? "auto" : "9vw" }}
                disabled={!comission}
              />
              <TextField
                label="Commission Per 1"
                sx={{ width: isMobile ? "auto" : "9vw" }}
                disabled={!comission}
              />
            </Box>
            <Box
              display={"flex"}
              flexDirection={isMobile ? "column" : "row"}
              gap={5}
            >
              <TextField
                label="Commission Amount"
                sx={{ width: isMobile ? "auto" : "9vw" }}
                disabled={!comission}
              />
              <TextField
                label="Final Amount"
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
                color: `${COLORS.secondaryBG}`,
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
                  border: `1px solid ${COLORS.secondaryBG}`,
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
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>{transaction.id}</td>
                        <td>
                          {" "}
                          {editedTransaction &&
                          editedTransaction.id === transaction.id ? (
                            <Autocomplete
                              value={editedTransaction.CNCode}
                              onChange={handleEditCurrencyChange}
                              options={currencyRateOptions.map(
                                (option) => option.currencycode
                              )}
                              renderInput={(params) => (
                                <TextField {...params} style={{ width: 120 }} />
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
                                borderColor: `${COLORS.secondaryBG}`,
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
                          {calculateFinalAmount(
                            transaction.FeAmount,
                            transaction.Rate
                          )}
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
              <button className="NextOnCreate" style={{ width: "10vw" }}>
                Next
              </button>
            </>
          )}
        </Box>
      )}
    </>
  );
};

export default Taxes;
