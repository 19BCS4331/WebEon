import {
  Autocomplete,
  Box,
  Button,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { COLORS } from "../../../assets/colors/COLORS";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import SkipNextIcon from "@mui/icons-material/SkipNext";

import { AnimatePresence, motion } from "framer-motion";
import "../../../css/components/buyfromindiv.css";
import SouthIcon from "@mui/icons-material/South";
import { DataGrid } from "@mui/x-data-grid";

import { AccProfileFetchBuyFromIndi } from "../../../apis/IndiviOrCorp/Buy";
import { useFormData } from "../../../contexts/FormDataContext";

const RecPay = ({ handlebackClickOnRecPay, isRecPay }) => {
  const { buyFromIndiviformData, updateFormData } = useFormData();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [accProfileData, setAccProfileData] = useState(null);
  const [selectedAccProfile, setSelectedAccProfile] = useState(null);

  useEffect(() => {
    if (isRecPay) {
      const AccProfileFetch = async () => {
        const response = await AccProfileFetchBuyFromIndi();

        if (response) {
          setAccProfileData(response);
        }
      };

      AccProfileFetch();
    }
  }, [isRecPay]);
  console.log("buyFromIndiviformData", buyFromIndiviformData);

  return (
    <>
      {isRecPay && (
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
          height={"80vh"}
          borderRadius={"25px"}
          boxShadow={"0px 10px 15px -3px rgba(0,0,0,0.1)"}
        >
          <p
            style={{
              color: COLORS.secondaryBG,
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            Receipt / Payment
          </p>
          <KeyboardBackspaceIcon
            onClick={handlebackClickOnRecPay}
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
          <Tooltip title="Skip">
            <SkipNextIcon
              onClick={() => console.log("SKIP")}
              fontSize="large"
              sx={{
                alignSelf: "flex-end",
                color: COLORS.secondaryBG,
                position: "absolute",
                cursor: "pointer",
                marginTop: 1.5,
                marginRight: 4,
              }}
            />
          </Tooltip>
          {buyFromIndiviformData && (
            <Box>
              <p>Amount : Rs. {buyFromIndiviformData.FinalAmountAfterTax}</p>
            </Box>
          )}
        </Box>
      )}
    </>
  );
};

export default RecPay;
