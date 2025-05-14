import React from "react";
import MainContainerCompilation from "../../../components/global/MainContainerCompilation";
import { Box, Typography } from "@mui/material";
import StyledButton from "../../../components/global/StyledButton";
import dayjs from "dayjs";
import ThemeContext from "../../../contexts/ThemeContext";
import { useContext } from "react";
import { useToast } from "../../../contexts/ToastContext";
import {usePermissions} from "../../../services/permissionService"

const BeginningDay = () => {
  const { Colortheme } = useContext(ThemeContext);
  const { showToast } = useToast();
  const {canAdd} = usePermissions();

  const ProcessBOD = () => {
    if (canAdd){
      showToast("BOD Process Initiated", "success");
    }
    else{
      showToast("You do not have permission to perform this action", "warning");
    }
  };

  return (
    <MainContainerCompilation title={"Beginning Of Day"}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 4,
          gap: 3,
          backgroundColor: Colortheme.background,
          borderRadius: 10,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 2,
            justifyContent: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontFamily: "Poppins",color:Colortheme.text }}>
            BOD For:
          </Typography>

          <Typography
            variant="h6"
            borderBottom={`1px solid ${Colortheme.text}`}
            sx={{ fontFamily: "Poppins" , color:Colortheme.text}}
          >
            {dayjs(Date.now()).format("DD-MM-YYYY")}
            {/* Change with Dynamic Date later */}
          </Typography>
        </Box>

        <Typography
          variant="body2"
          align="center"
          sx={{ fontFamily: "Poppins",color:Colortheme.text }}
        >
          *This process will update the system date and prepare the application
          for the new working day.
        </Typography>
        <Typography
          variant="body2"
          align="center"
          sx={{ fontFamily: "Poppins", marginBottom: 5,color:Colortheme.text }}
        >
          *Please ensure all previous day operations are completed before
          proceeding.
        </Typography>

        <StyledButton
          onClick={() => ProcessBOD()}
          variant="contained"
        >
          Start
        </StyledButton>
      </Box>
    </MainContainerCompilation>
  );
};

export default BeginningDay;
