import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MainContainerCompilation from "../../../components/global/MainContainerCompilation";
import { Box, Tooltip, useMediaQuery, useTheme } from "@mui/material";
import ThemeContext from "../../../contexts/ThemeContext";
import CustomTextField from "../../../components/global/CustomTextField";
import { useToast } from "../../../contexts/ToastContext";
import CustomAlertModal from "../../../components/CustomAlertModal";
import { useBaseUrl } from "../../../contexts/BaseUrl";
import StyledButton from "../../../components/global/StyledButton";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { color } from "framer-motion";

const CompanyProfile = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { Colortheme } = useContext(ThemeContext);
  const [rows, setRows] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { showToast, hideToast } = useToast();
  const navigate = useNavigate();
  const { baseUrl } = useBaseUrl();

  // Get the title based on the vType parameter
  const title = "Company Profile";

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("token");
    axios
      .get(`${baseUrl}/pages/Master/SystemSetup/companyRecord`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      })
      .then((response) => {
        setRows(response.data.filter((row) => row.nCompID));
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
        showToast("Error fetching data", "error");
        setTimeout(() => {
          hideToast();
        }, 2000);
      });
  }, [baseUrl, hideToast, showToast]);

  const fields = [
    { label: "Company Name", key: "vCompanyName" },
    { label: "RBI Name", key: "vRBIName" },
    { label: "RBI Designation", key: "vRBIDesig" },
    { label: "RBI Place", key: "vRBIPlace" },
    { label: "RBI Address 1", key: "vRBIAdd1" },
    { label: "RBI Address 2", key: "vRBIAdd2" },
    { label: "RBI Address 3", key: "vRBIAdd3" },
  ];

  return (
    <MainContainerCompilation title={title}>
      <Box
        width={isMobile ? "65vw" : "60vw"}
        display="flex"
        flexDirection="column"
        gap={2}
        p={5}
        bgcolor={Colortheme.background}
        borderRadius="20px"
      >
        <Box display={"flex"} alignItems={"center"}>
          <Tooltip title="Go To Dashboard">
            <Box sx={{ alignSelf: "flex-start", mb: 2 }}>
              <StyledButton
                onClick={() => navigate("/Dashboard")}
                style={{
                  width: isMobile ? 70 : 100,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <KeyboardBackspaceIcon style={{ fontSize: "30px" }} />
              </StyledButton>
            </Box>
          </Tooltip>
          <h2
            style={{
              color: Colortheme.text,
              marginLeft: isMobile ? "5%" : "30%",
              marginTop: isMobile ? 0 : -8,
            }}
          >
            Company Profile
          </h2>
        </Box>
        {fields.map((field) => (
          <CustomTextField
            key={field.key}
            label={field.label}
            value={rows[0]?.[field.key] || ""}
            style={{ width: "100%" }}
          />
        ))}
      </Box>
      <CustomAlertModal />
    </MainContainerCompilation>
  );
};

export default CompanyProfile;
