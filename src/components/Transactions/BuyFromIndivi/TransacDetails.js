import { Autocomplete, Box, MenuItem, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { COLORS } from "../../../assets/colors/COLORS";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { fetchCurrencyRate } from "../../../apis/OptionsMaster";
import { motion } from "framer-motion";

const TransacDetails = ({
  isTransacDetailsView,
  handlebackClickOnTransacView,
}) => {
  const [currencyRateOptions, setCurrencyRateOptions] = useState(null);
  const [transacType, setTransacType] = useState(null);
  const [feAmount, setFeAmount] = useState(null);
  const [rateCurr, setRateCurr] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState(null);

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
          sx={{ backgroundColor: COLORS.text }}
          width={"50vw"}
          height={"50vh"}
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
            gap={3}
            flexDirection={"column"}
            mt={2}
            border={`1px solid ${COLORS.secondaryBG}`}
            padding={2}
            borderRadius={"10px"}
          >
            <Box display={"flex"} gap={4}>
              <Autocomplete
                disablePortal
                id="CurrencyCodeRate"
                options={
                  currencyRateOptions &&
                  currencyRateOptions.map((item) => item.currencycode)
                }
                onChange={handleCurrencyChange}
                sx={{ width: "9vw" }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Currency Code"
                    name="CurrencyCodeRate"

                    // value={calculationMethod}
                  />
                )}
              />
              {/* <TextField label="Transaction Nature" sx={{ width: "10vw" }} /> */}
              <TextField
                select
                label="Type"
                sx={{ width: "9vw" }}
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
                sx={{ width: "9vw" }}
              />
              <TextField
                label="FE Amount"
                sx={{ width: "9vw" }}
                value={feAmount}
                onChange={(e) => setFeAmount(e.target.value)}
              />
            </Box>
            <Box display={"flex"} gap={5}>
              <TextField
                label="Rate"
                disabled
                sx={{ width: "9vw" }}
                value={rateCurr ? rateCurr : ""}
              />
              <TextField label="Commission Type" sx={{ width: "9vw" }} />
              <TextField label="Commission Per 1" sx={{ width: "9.5vw" }} />
            </Box>
            <Box display={"flex"} gap={5}>
              <TextField label="Commission Amount" sx={{ width: "10.5vw" }} />
              <TextField
                label="Final Amount"
                sx={{ width: "9vw" }}
                value={finalAmount}
              />
              {/* <TextField label="Rounded" sx={{ width: "9vw" }} /> */}
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

export default TransacDetails;
