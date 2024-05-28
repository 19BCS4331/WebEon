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

import {
  TaxMasterFetchisActive,
  TaxMasterSlabFetch,
} from "../../../apis/Master/SystemSetup";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { AccProfileFetchBuyFromIndi } from "../../../apis/IndiviOrCorp/Buy";
import { useFormData } from "../../../contexts/FormDataContext";
import { useToast } from "../../../contexts/ToastContext";

const Taxes = ({
  isTaxView,
  setIsTaxView,
  handlebackClickOnTaxView,
  handleRecPayView,
}) => {
  const { showToast, hideToast } = useToast();

  const { buyFromIndiviformData, updateFormData } = useFormData();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isFee, setIsFee] = useState(true);
  const [isCharges, setIsCharges] = useState(false);

  const [mainTaxData, setMainTaxData] = useState(null);
  const [slabTaxData, setSlabTaxData] = useState(null);

  const [accProfileData, setAccProfileData] = useState(null);
  const [selectedAccProfile, setSelectedAccProfile] = useState(null);

  const [taxAmounts, setTaxAmounts] = useState({ HFEE: 0 });
  const [finalAmount, setFinalAmount] = useState(0);
  const [showHFEEGst, setShowHFEEGst] = useState(false);
  const [hfeeRowIndex, setHfeeRowIndex] = useState(-1);

  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // --------------OTHER CHARGES TABLE--------------------

  const defaultRowData = {
    account: "Select",
    value: "",
    othSGST: 0,
    othCGST: 0,
    othIGST: 0,
  };
  const initialData = Array.from({ length: 5 }, () => ({ ...defaultRowData }));

  const [data, setData] = useState(initialData);
  const [savedData, setSavedData] = useState(null);

  const handleInputChangeCharges = (index, field, value) => {
    const newData = [...data];
    newData[index][field] = value;
    newData[index].othIGST = calculateOthIGST(newData[index].value); // Calculate othIGST based on value
    setData(newData);
  };

  const calculateOthIGST = (value) => {
    // Your calculation logic for othIGST based on value
    // For now, let's assume it's half of the value
    return value ? (parseFloat(value) * 0.18).toFixed(2) : 0;
  };

  const handleSave = () => {
    const OtherCharges = data.filter(
      (row) => row.account !== "" && row.value !== ""
    );
    setSavedData(OtherCharges);
    const formDataObject = {
      OtherCharges: OtherCharges,

      // Add other form data here
    };
    updateFormData(formDataObject);
    handleRecPayView();
    console.log("Other Charges SAVE", OtherCharges); // Save the changes to the context or wherever you want
  };

  // --------------OTHER CHARGES TABLE--------------------

  // Calculate the range of items to display based on the current page
  const startIndex = page * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Slice the mainTaxData array to display only the items for the current page
  const displayedData = mainTaxData && mainTaxData.slice(startIndex, endIndex);

  // Total number of pages
  const totalPages =
    mainTaxData && Math.ceil(mainTaxData.length / itemsPerPage);

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset page to 0 when changing items per page
  };

  const handleShowFee = () => {
    setIsFee(true);
    setIsCharges(false);
  };

  const handleShowCharges = () => {
    setIsFee(false);
    setIsCharges(true);
  };

  useEffect(() => {
    if (isTaxView) {
      const fetchTaxMaster = async () => {
        const MainTaxresponse = await TaxMasterFetchisActive();
        const SlabResponse = await TaxMasterSlabFetch();
        if (MainTaxresponse && SlabResponse) {
          console.log(MainTaxresponse.data);
          console.log(SlabResponse.data);
          setMainTaxData(MainTaxresponse.data);
          setSlabTaxData(SlabResponse.data);
        }
      };

      fetchTaxMaster();
    }
  }, [isTaxView]);

  useEffect(() => {
    if (isCharges) {
      const AccProfileFetch = async () => {
        const response = await AccProfileFetchBuyFromIndi();

        if (response) {
          setAccProfileData(response);
        }
      };

      AccProfileFetch();
    }
  }, [isCharges]);

  useEffect(() => {
    // Retrieve data from FormContext and extract final amount
    if (buyFromIndiviformData && buyFromIndiviformData.FinalAmountTotal) {
      const finalAmountFromContext = buyFromIndiviformData.FinalAmountTotal;
      setFinalAmount(finalAmountFromContext);

      // Calculate tax amounts initially
      const initialTaxAmounts = {};
      mainTaxData &&
        mainTaxData.forEach((item) => {
          if (item.tax_code !== "HFEE") {
            // Skip calculation if tax_code is HFEE
            const taxAmount = calculateTaxAmount(
              finalAmountFromContext,
              item.tax_value
            );
            initialTaxAmounts[item.tax_code] = taxAmount;
          }
        });
      setTaxAmounts(initialTaxAmounts);

      // Find index of "HFEE" row
      const hfeeIndex =
        mainTaxData &&
        mainTaxData.findIndex((item) => item.tax_code === "HFEE");
      if (hfeeIndex !== -1) {
        setHfeeRowIndex(hfeeIndex);
      }
    }
  }, [mainTaxData]);

  // Function to calculate tax amount based on final amount and tax value
  const calculateTaxAmount = (finalAmount, taxValue) => {
    return ((finalAmount * taxValue) / 100).toFixed(2);
  };

  // Function to handle input change and update corresponding tax amount
  const handleInputChange = (event, taxCode) => {
    const { value } = event.target;

    if (taxCode === "HFEE") {
      if (value === "") {
        // If HFEE input is cleared, set both HFEE and HFEE GST amounts to 0
        setTaxAmounts((prevTaxAmounts) => ({
          ...prevTaxAmounts,
          [taxCode]: 0, // Set to 0 instead of ""
          "HFEE GST": 0,
        }));
        setShowHFEEGst(false);
        return; // Exit early to prevent further updates
      }
      // Update tax amount for HFEE GST
      const hfeeGstAmount = ((value * 18) / 100).toFixed(2);
      setTaxAmounts((prevTaxAmounts) => ({
        ...prevTaxAmounts,
        "HFEE GST": hfeeGstAmount,
      }));
      setShowHFEEGst(true);
    }

    // Update tax amounts for other tax codes
    setTaxAmounts((prevTaxAmounts) => ({
      ...prevTaxAmounts,
      [taxCode]: value,
    }));
  };

  const calculateHFEEGstAmount = () => {
    const hfeeAmount = taxAmounts["HFEE"];
    return ((hfeeAmount * 18) / 100).toFixed(2);
  };

  const totalAmount = Object.values(taxAmounts).reduce((acc, curr) => {
    return acc + parseFloat(curr);
  }, 0);

  const totalNewAmount = buyFromIndiviformData.FinalAmountTotal + totalAmount;
  console.log("accProfileData", accProfileData);
  console.log("formData", buyFromIndiviformData);

  const handleTaxSave = () => {
    const formDataObject = {
      FinalAmountAfterTax: totalNewAmount,
    };
    updateFormData(formDataObject);

    setIsFee(false);
    setIsCharges(true);
  };

  const handleSkip = () => {
    if (taxAmounts["HFEE"] === undefined || taxAmounts["HFEE"] === 0) {
      const totalNewAmountSkipped =
        buyFromIndiviformData.FinalAmountTotal +
        buyFromIndiviformData.FinalAmountTotal * 0.0018;
      const formDataObject = {
        FinalAmountAfterTax: totalNewAmountSkipped.toFixed(2),
      };
      updateFormData(formDataObject);
      handleRecPayView();
    } else {
      if (isCharges) {
        setIsCharges(false);
        setIsFee(true);
      }
      showToast("Clear Tax Field Input Before Skipping", "fail");
      setTimeout(() => {
        hideToast();
      }, 2000);
    }
  };
  console.log("taxAmounts", taxAmounts["HFEE"]);

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
            Fee/Tax & Charges Details
          </p>
          <KeyboardBackspaceIcon
            onClick={handlebackClickOnTaxView}
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
              onClick={handleSkip}
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

          <Box display={"flex"} mt={2} gap={5}>
            <button
              className="TaxesMainButtons"
              onClick={handleShowFee}
              style={
                isFee
                  ? { backgroundColor: COLORS.background }
                  : { backgroundColor: COLORS.secondaryBG }
              }
            >
              Fee/Tax
            </button>
            <button
              className="TaxesMainButtons"
              onClick={handleShowCharges}
              style={
                isCharges
                  ? { backgroundColor: COLORS.background }
                  : { backgroundColor: COLORS.secondaryBG }
              }
            >
              Other Charges
            </button>
          </Box>

          {isFee && (
            <Box
              component={motion.div}
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              mt={3}
              height={"55vh"}
              overflow={"auto"}
              width={"auto"}
              // boxShadow={"0px 2px 5px 0px rgba(0,0,0,0.5);"}
              border={`3px solid ${COLORS.secondaryBG}`}
              display={"flex"}
              flexDirection={"column"}
              alignItems={"center"}
              borderRadius={"20px"}
              p={2}
            >
              {mainTaxData && (
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box
                    id="FinalAmountContainer"
                    display={"flex"}
                    gap={1}
                    border={`2px solid ${COLORS.secondaryBG}`}
                    borderRadius={20}
                    p={1}
                    height={30}
                    alignItems={"center"}
                  >
                    <p
                      style={{
                        fontWeight: "bold",
                        color: COLORS.secondaryBG,
                        fontSize: 17,
                      }}
                    >
                      Amount:
                    </p>
                    <p
                      style={{
                        fontWeight: "bold",
                        color: COLORS.secondaryBG,
                        fontSize: 17,
                      }}
                    >
                      Rs.
                      {buyFromIndiviformData.FinalAmountTotal.toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </Box>
                  <div
                    className="table-container"
                    style={{
                      maxHeight: "calc(50vh - 30px)",
                      width: "100%",
                      borderRadius: "18px",
                      marginTop: "20px",
                      overflowY: "auto",
                    }}
                  >
                    <table>
                      <thead style={{ height: 50 }}>
                        <tr>
                          <th>Tax Code</th>
                          <th>Apply As</th>
                          <th>Value</th>
                          <th style={{ width: 70 }}>[+] / [-]</th>
                          <th>Tax Amount (Rs.)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedData.map((item, index) => (
                          <React.Fragment key={item.taxid}>
                            <tr>
                              <td>
                                <Box
                                  display="flex"
                                  justifyContent="center"
                                  gap={1}
                                >
                                  {item.tax_code}
                                </Box>
                              </td>
                              <td>{item.apply_as}</td>
                              <td>{item.tax_value}</td>
                              <td>{item.retail_buying}</td>
                              <td style={{ width: 180 }}>
                                <input
                                  type="number"
                                  value={taxAmounts[item.tax_code] || ""}
                                  onChange={(e) =>
                                    handleInputChange(e, item.tax_code)
                                  }
                                  disabled={item.tax_code !== "HFEE"}
                                  style={{
                                    height: 40,
                                    width: 150,
                                    paddingLeft: 10,
                                    fontSize: 15,
                                    borderRadius: 10,
                                    border: "1px solid gray",
                                  }}
                                />
                              </td>
                            </tr>
                            {index === hfeeRowIndex && showHFEEGst && (
                              <tr>
                                <td>
                                  <Box
                                    display="flex"
                                    justifyContent="center"
                                    gap={1}
                                  >
                                    HFEE Gst
                                  </Box>
                                </td>
                                <td>{item.apply_as}</td>
                                <td>{item.tax_value}</td>
                                <td>{item.retail_buying}</td>
                                <td style={{ width: 180 }}>
                                  <input
                                    type="number"
                                    value={calculateHFEEGstAmount()}
                                    disabled
                                    style={{
                                      height: 40,
                                      width: 150,
                                      paddingLeft: 10,
                                      fontSize: 15,
                                      borderRadius: 10,
                                      border: "1px solid gray",
                                    }}
                                  />
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                    <Box
                      display={"flex"}
                      justifyContent={"center"}
                      width={"100%"}
                      sx={{
                        backgroundColor: COLORS.secondaryBG,
                        color: "white",
                      }}
                    >
                      {totalAmount > 0 && (
                        <p style={{ fontWeight: "bold" }}>
                          Total Tax Amount: Rs. {totalAmount.toFixed(2)}
                        </p>
                      )}
                    </Box>
                  </div>
                  <p style={{ color: COLORS.secondaryBG, fontWeight: "bold" }}>
                    New Final Amount : Rs.
                    {totalNewAmount.toLocaleString("en-IN")}
                  </p>

                  <button
                    className="TaxSaveButton"
                    onClick={handleTaxSave}
                    style={{
                      border: "none",
                      borderRadius: "20px",
                      color: "white",
                      width: "8vw",
                      height: "4.5vh",
                      cursor: "pointer",
                      fontSize: 15,
                    }}
                  >
                    Save
                  </button>
                  {/* Pagination */}
                  <div
                    style={{
                      marginTop: "20px",
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 5,
                      border: `2px solid ${COLORS.secondaryBG}`,
                      borderRadius: 20,
                      width: "80%",
                      padding: 5,
                    }}
                  >
                    <button
                      onClick={() =>
                        setPage((prevPage) => Math.max(prevPage - 1, 0))
                      }
                      disabled={page === 0}
                      style={{
                        width: "auto",
                        border: "none",
                        borderRadius: 20,

                        cursor: "pointer",
                        backgroundColor:
                          page === 0 ? "gray" : COLORS.secondaryBG,
                        color: "white",
                      }}
                    >
                      <ChevronLeftIcon />
                    </button>
                    <span
                      style={{
                        margin: "0 10px",
                        color: COLORS.secondaryBG,
                        fontWeight: "bold",
                      }}
                    >
                      Page {page + 1} of {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setPage((prevPage) =>
                          Math.min(prevPage + 1, totalPages - 1)
                        )
                      }
                      disabled={page === totalPages - 1}
                      style={{
                        width: "auto",
                        border: "none",
                        borderRadius: 20,

                        cursor: "pointer",
                        backgroundColor:
                          page === totalPages - 1 ? "gray" : COLORS.secondaryBG,
                        color: "white",
                      }}
                    >
                      <ChevronRightIcon />
                    </button>
                    {/* Items per page dropdown */}
                    <div
                      style={{
                        textAlign: "center",
                        display: "flex",
                        marginLeft: 20,
                        alignItems: "center",
                      }}
                    >
                      <p
                        style={{
                          color: COLORS.secondaryBG,
                          fontWeight: "bold",
                          fontSize: 12,
                        }}
                      >
                        Items / page:
                      </p>
                      <Select
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        style={{ marginLeft: 10, height: 40 }}
                      >
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={20}>20</MenuItem>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </Box>
          )}

          {isCharges && (
            <>
              <Box
                component={motion.div}
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                mt={3}
                height={"auto"}
                width={"auto"}
                p={2}
                border={`3px solid ${COLORS.secondaryBG}`}
                display={"flex"}
                flexDirection={"column"}
                alignItems={"center"}
                borderRadius={"20px"}
                maxHeight={"47vh"}
                overflow={"scroll"}
                sx={{ overflowX: "hidden" }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Account</TableCell>
                      <TableCell>Value (Rs.)</TableCell>
                      <TableCell>Oth. SGST</TableCell>
                      <TableCell>Oth. CGST</TableCell>
                      <TableCell>Oth. IGST</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <TextField
                            select
                            label="Account"
                            value={row.account}
                            sx={{ width: "12vw" }}
                            onChange={(e) =>
                              handleInputChangeCharges(
                                index,
                                "account",
                                e.target.value
                              )
                            }
                          >
                            <MenuItem value="Select">Select</MenuItem>

                            {/* Options coming from backend */}
                            {accProfileData &&
                              accProfileData.map((item) => (
                                <MenuItem value={item.acc_code}>
                                  {item.acc_code}
                                </MenuItem>
                              ))}

                            {/* Add more options as needed */}
                          </TextField>
                        </TableCell>
                        <TableCell>
                          <TextField
                            label="Value"
                            type="number"
                            sx={{ width: "8vw" }}
                            value={row.value}
                            onChange={(e) =>
                              handleInputChangeCharges(
                                index,
                                "value",
                                e.target.value
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>{row.othSGST}</TableCell>
                        <TableCell>{row.othCGST}</TableCell>
                        <TableCell>{row.othIGST}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
              <button
                style={{
                  border: "none",
                  backgroundColor: COLORS.secondaryBG,
                  color: "white",
                  borderRadius: 20,
                  cursor: "pointer",
                  width: 180,
                  height: 45,
                  marginTop: 20,
                }}
                onClick={handleSave}
              >
                Save
              </button>
            </>
          )}
        </Box>
      )}
    </>
  );
};

export default Taxes;
