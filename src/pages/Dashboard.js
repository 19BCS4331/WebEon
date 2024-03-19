import { Box, useMediaQuery, useTheme } from "@mui/material";
import React from "react";
import "../css/pages/Dashboard.css";
import Marquee from "react-fast-marquee";
import MainContainerCompilation from "../components/global/MainContainerCompilation";

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <MainContainerCompilation title={"Dashboard"}>
      <Marquee
        pauseOnHover={true}
        style={{
          color: "#edf2f4",
          userSelect: "none",
        }}
      >
        <h1 style={{ fontSize: 18 }}>Currency Rates will show here: &nbsp;</h1>
        For Example | AED: 111146.00 @ 22.210000 | AUD: 1100.00 @ 52.510000 |
        CAD: 6900.00 @ 59.680000 |
      </Marquee>

      <Box
        display={"flex"}
        height={"80%"}
        width={"90%"}
        justifyContent={"center"}
        alignItems={"center"}
        sx={{ backgroundColor: "#edf2f4" }}
        borderRadius={10}
      >
        <h1
          style={{
            fontSize: isMobile ? 20 : 40,
            color: " #8d99ae ",
            userSelect: "none",
          }}
        >
          Basic Dashboard Information
        </h1>
      </Box>
    </MainContainerCompilation>
  );
};

export default Dashboard;
