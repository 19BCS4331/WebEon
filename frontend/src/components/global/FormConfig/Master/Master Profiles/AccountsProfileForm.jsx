import React, { useState, useEffect, useContext } from "react";
import { Box, MenuItem, useTheme, useMediaQuery } from "@mui/material";
import CustomTextField from "../../../CustomTextField";
import CustomCheckbox from "../../../CustomCheckbox";
import axios from "axios";
import ThemeContext from "../../../../../contexts/ThemeContext";
import styled from "styled-components";
import StyledButton from "../../../StyledButton";
import { useToast } from "../../../../../contexts/ToastContext";
import { useBaseUrl } from "../../../../../contexts/BaseUrl";

const AccountsProfileForm = ({ initialData, onSubmit, onCancel }) => {
  const [divisionOptions, setDivisionOptions] = useState([]);
  const [accTypeOptions, setAccTypeOptions] = useState([]);
  const [SLOptions, setSLOptions] = useState([]);
  const [CurrencyOptions, setCurrencyOptions] = useState([]);
  const [FinCodeOptions, setFinCodeOptions] = useState([]);
  const [SubFinCodeOptions, setSubFinCodeOptions] = useState([]);
  const [BranchOptions, setBranchOptions] = useState([]);
  const { Colortheme } = useContext(ThemeContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { showToast, hideToast } = useToast();
  const { baseUrl } = useBaseUrl();

  const [formData, setFormData] = useState({
    nAccID: "",
    nDivisionID: "",
    vCode: "",
    vName: "",
    vNature: "",
    vSblnat: "",
    vBankType: "",
    nCurrencyID: "",
    vFinType: "",
    vFinCode: "",
    vSubFinCode: "",
    nPCColID: "",
    bZeroBalatEOD: false,
    nBranchIDtoTransfer: "",
    bDoPurchase: false,
    bDoSales: false,
    bDoReceipts: false,
    bDoPayments: false,
    bActive: false,
    bCMSBank: false,
    bDirectRemit: false,
  });

  const BankTypeOptions = [
    { value: "0", label: "Local" },
    { value: "1", label: "Nostro" },
  ];

  const FinTypeOptions = [
    { value: "B", label: "BALANCE SHEET" },
    { value: "P", label: "PROFIT & LOSS ACCOUNT" },
    { value: "T", label: "TRADING ACCOUNT" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get(`${baseUrl}/pages/Master/MasterProfiles/accountsProfile/division`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      })
      .then((response) => {
        setDivisionOptions(response.data);
        // setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        // setLoading(false);
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get(`${baseUrl}/pages/Master/MasterProfiles/accountsProfile/accType`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      })
      .then((response) => {
        setAccTypeOptions(response.data);
        // setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        // setLoading(false);
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get(
        `${baseUrl}/pages/Master/MasterProfiles/accountsProfile/subLedgerType`,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      )
      .then((response) => {
        setSLOptions(response.data);
        // setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        // setLoading(false);
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get(`${baseUrl}/pages/Master/MasterProfiles/accountsProfile/currency`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      })
      .then((response) => {
        setCurrencyOptions(response.data);
        // setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        // setLoading(false);
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (formData.vFinType !== "") {
      axios
        .post(
          `${baseUrl}/pages/Master/MasterProfiles/accountsProfile/finCode`,
          { vFinType: formData.vFinType },
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        )
        .then((response) => {
          setFinCodeOptions(response.data);
          // setLoading(false);
        })
        .catch((error) => {
          console.log(error);
          // setLoading(false);
        });
    }
  }, [formData.vFinType]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (formData.vFinCode !== "") {
      axios
        .post(
          `${baseUrl}/pages/Master/MasterProfiles/accountsProfile/subfinCode`,
          { vFinCode: formData.vFinCode },
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        )
        .then((response) => {
          setSubFinCodeOptions(response.data);
          // setLoading(false);
        })
        .catch((error) => {
          console.log(error);
          // setLoading(false);
        });
    }
  }, [formData.vFinType, formData.vFinCode]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get(`${baseUrl}/pages/Master/PartyProfiles/BranchOptions`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      })
      .then((response) => {
        setBranchOptions(response.data);
        // setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        // setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nAccID: initialData.nAccID || "",
        nDivisionID: initialData.nDivisionID || "",
        vCode: initialData.vCode || "",
        vName: initialData.vName || "",
        vNature: initialData.vNature || "",
        vSblnat: initialData.vSblnat || "",
        vBankType: initialData.vBankType || "",
        nCurrencyID: initialData.nCurrencyID || "",
        vFinType: initialData.vFinType || "",
        vFinCode: initialData.vFinCode || "",
        vSubFinCode: initialData.vSubFinCode || "",
        nPCColID: initialData.nPCColID || "",
        bZeroBalatEOD: initialData.bZeroBalatEOD || false,
        nBranchIDtoTransfer: initialData.nBranchIDtoTransfer || "",
        bDoPurchase: initialData.bDoPurchase || false,
        bDoSales: initialData.bDoSales || false,
        bDoReceipts: initialData.bDoReceipts || false,
        bDoPayments: initialData.bDoPayments || false,
        bActive: initialData.bActive || false,
        bCMSBank: initialData.bCMSBank || false,
        bDirectRemit: initialData.bDirectRemit || false,
      });
    }
  }, [initialData]);

  useEffect(() => {
    const newFormData = { ...formData };
    let updateRequired = false;

    if (formData.vNature !== "B" && formData.vBankType !== "") {
      newFormData.vBankType = null;
      updateRequired = true;
    }

    if (formData.vNature !== "S" && formData.vSblnat !== "") {
      newFormData.vSblnat = null;
      updateRequired = true;
    }

    if (
      (formData.vNature !== "B" || formData.vBankType !== "1") &&
      formData.nCurrencyID !== ""
    ) {
      newFormData.nCurrencyID = null;
      updateRequired = true;
    }

    if (
      formData.bZeroBalatEOD === false &&
      formData.nBranchIDtoTransfer !== ""
    ) {
      newFormData.nBranchIDtoTransfer = null;
      updateRequired = true;
    }

    if (updateRequired) {
      setFormData(newFormData);
    }
  }, [formData.vNature, formData.vBankType]);

  // -----------------------------------------------SAVING WITH FIELD ERRORS AND VALIDATION START---------------------------------------------

  // -----------------------------------------------FIELD ERRORS AND VALIDATION END---------------------------------------------

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  console.log("vBankType", formData.vBankType);

  return (
    <form onSubmit={handleSubmit}>
      <Box
        display={"grid"}
        sx={{
          overflowX: "hidden",
          backgroundColor: Colortheme.background,
        }}
        gridTemplateColumns={isMobile ? "repeat(1, 1fr)" : "repeat(5, 1fr)"}
        gridTemplateRows={"repeat(3, 1fr)"}
        columnGap={"60px"}
        rowGap={"40px"}
        p={2}
      >
        <CustomTextField
          select={true}
          name="nDivisionID"
          label="Division"
          value={formData.nDivisionID}
          onChange={handleChange}
          fullWidth
          required
        >
          <MenuItem value="" key="Select6">
            Select
          </MenuItem>
          {divisionOptions &&
            divisionOptions.map((item) => (
              <MenuItem value={item.value} key={item.value}>
                {item.label}
              </MenuItem>
            ))}
        </CustomTextField>

        <CustomTextField
          required
          name="vCode"
          label="Code"
          value={formData.vCode}
          onChange={handleChange}
          fullWidth
        />

        <CustomTextField
          required
          name="vName"
          label="Name"
          value={formData.vName}
          onChange={handleChange}
          fullWidth
        />

        <CustomTextField
          select={true}
          name="vNature"
          label="Account Type"
          value={formData.vNature}
          onChange={handleChange}
          fullWidth
        >
          <MenuItem value="" key="Select6">
            Select
          </MenuItem>
          {accTypeOptions &&
            accTypeOptions.map((item) => (
              <MenuItem value={item.value} key={item.value}>
                {item.label}
              </MenuItem>
            ))}
        </CustomTextField>

        <CustomTextField
          disabled={formData.vNature !== "S"}
          select={true}
          name="vSblnat"
          label="Sub Ledger"
          value={formData.vSblnat}
          onChange={handleChange}
          fullWidth
        >
          <MenuItem value="" key="Select6">
            Select
          </MenuItem>
          {SLOptions &&
            SLOptions.map((item) => (
              <MenuItem value={item.value} key={item.value}>
                {item.label}
              </MenuItem>
            ))}
        </CustomTextField>

        <CustomTextField
          disabled={formData.vNature !== "B"}
          select={true}
          name="vBankType"
          label="Bank Type"
          value={formData.vBankType}
          onChange={handleChange}
          fullWidth
        >
          <MenuItem value="" key="Select6">
            Select
          </MenuItem>
          {BankTypeOptions &&
            BankTypeOptions.map((item) => (
              <MenuItem value={item.value} key={item.value}>
                {item.label}
              </MenuItem>
            ))}
        </CustomTextField>

        <CustomTextField
          disabled={formData.vNature !== "B" || formData.vBankType !== "1"}
          select={true}
          name="nCurrencyID"
          label="Currency"
          value={formData.nCurrencyID}
          onChange={handleChange}
          fullWidth
        >
          <MenuItem value="" key="Select6">
            Select
          </MenuItem>
          {CurrencyOptions &&
            CurrencyOptions.map((item) => (
              <MenuItem value={item.value} key={item.value}>
                {item.label}
              </MenuItem>
            ))}
        </CustomTextField>

        <CustomTextField
          select={true}
          name="vFinType"
          label="Fin Type"
          value={formData.vFinType}
          onChange={handleChange}
          fullWidth
        >
          <MenuItem value="" key="Select6">
            Select
          </MenuItem>
          {FinTypeOptions &&
            FinTypeOptions.map((item) => (
              <MenuItem value={item.value} key={item.value}>
                {item.label}
              </MenuItem>
            ))}
        </CustomTextField>

        <CustomTextField
          select={true}
          name="vFinCode"
          label="Fin Code"
          value={formData.vFinCode}
          onChange={handleChange}
          fullWidth
        >
          <MenuItem value="" key="Select6">
            Select
          </MenuItem>
          {FinCodeOptions &&
            FinCodeOptions.map((item) => (
              <MenuItem value={item.value} key={item.value}>
                {item.label}
              </MenuItem>
            ))}
        </CustomTextField>

        <CustomTextField
          select={true}
          name="vSubFinCode"
          label="Sub Fin Code"
          value={formData.vSubFinCode}
          onChange={handleChange}
          fullWidth
        >
          <MenuItem value="" key="Select6">
            Select
          </MenuItem>
          {SubFinCodeOptions &&
            SubFinCodeOptions.map((item) => (
              <MenuItem value={item.value} key={item.value}>
                {item.label}
              </MenuItem>
            ))}
        </CustomTextField>

        <CustomTextField
          name="nPCColID"
          label="Petty Cash Expense ID"
          value={formData.nPCColID}
          onChange={handleChange}
          fullWidth
        />

        <CustomCheckbox
          name="bZeroBalatEOD"
          checked={formData.bZeroBalatEOD}
          onChange={handleChange}
          label="Zero Balance at EOD"
        />

        <CustomTextField
          disabled={formData.bZeroBalatEOD === false}
          select={true}
          name="nBranchIDtoTransfer"
          label="Branch To Transfer"
          value={formData.nBranchIDtoTransfer}
          onChange={handleChange}
          fullWidth
        >
          {BranchOptions &&
            BranchOptions.map((item) => (
              <MenuItem value={item.value} key={item.value}>
                {item.label}
              </MenuItem>
            ))}
        </CustomTextField>

        <CustomCheckbox
          name="bDoPurchase"
          checked={formData.bDoPurchase}
          onChange={handleChange}
          label="Do Purchase"
        />

        <CustomCheckbox
          name="bDoSales"
          checked={formData.bDoSales}
          onChange={handleChange}
          label="Do Sale"
        />

        <CustomCheckbox
          name="bDoReceipts"
          checked={formData.bDoReceipts}
          onChange={handleChange}
          label="Do Receipts"
        />

        <CustomCheckbox
          name="bDoPayments"
          checked={formData.bDoPayments}
          onChange={handleChange}
          label="Do Payments"
        />

        <CustomCheckbox
          name="bActive"
          checked={formData.bActive}
          onChange={handleChange}
          label="Active"
        />

        <CustomCheckbox
          name="bCMSBank"
          checked={formData.bCMSBank}
          onChange={handleChange}
          label="CMS Bank"
        />

        <CustomCheckbox
          name="bDirectRemit"
          checked={formData.bDirectRemit}
          onChange={handleChange}
          label="Direct Remittance"
        />
      </Box>
      <Box display={"flex"} justifyContent={"center"} marginTop={15}>
        <Box
          display={"flex"}
          width={isMobile ? "100%" : "60%"}
          gap={5}
          justifyContent={"center"}
        >
          <StyledButton onClick={onCancel}>Cancel</StyledButton>
          <StyledButton type="submit" variant="contained" color="primary">
            Submit
          </StyledButton>
        </Box>
      </Box>
    </form>
  );
};

export default AccountsProfileForm;
