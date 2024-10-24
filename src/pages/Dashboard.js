import { Box, useMediaQuery, useTheme } from "@mui/material";
import React from "react";
import "../css/pages/Dashboard.css";
import Marquee from "react-fast-marquee";
import MainContainerCompilation from "../components/global/MainContainerCompilation";
import ThemeContext from "../contexts/ThemeContext";
import { useContext } from "react";

const Dashboard = () => {
  const { Colortheme } = useContext(ThemeContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <MainContainerCompilation title={"Dashboard"}>
      <Marquee
        pauseOnHover={true}
        style={{
          color: Colortheme.text,
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
        width={isMobile ? "90%" : "95%"}
        justifyContent={"center"}
        alignItems={"center"}
        sx={{ backgroundColor: Colortheme.background }}
        borderRadius={10}
        boxShadow={"0px 5px 10px -2px rgba(0,0,0,0.30);"}
      >
        <h1
          style={{
            fontSize: isMobile ? 20 : 40,
            color: Colortheme.text,
            userSelect: "none",
            width: isMobile ? "60%" : "100%",
            textAlign: "center",
          }}
        >
          Basic Dashboard Information
        </h1>
      </Box>
    </MainContainerCompilation>
  );
};

export default Dashboard;
