import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import "../css/pages/Dashboard.css";
import Marquee from "react-fast-marquee";
import SideNavbar from "../components/global/SideNavbar";
import Topbar from "../components/global/Topbar";
import MainBackBox from "../components/global/MainBackBox";
import MainContentBox from "../components/global/MainContentBox";
import MainContentLayout from "../components/global/MainContentLayout";

const Dashboard = () => {
  return (
    <MainBackBox>
      <Topbar title={"Dashboard"} />

      <MainContentLayout>
        <SideNavbar />

        <MainContentBox>
          <Marquee
            pauseOnHover={true}
            style={{
              color: "#edf2f4",
              marginTop: 10,
              userSelect: "none",
            }}
          >
            <h1 style={{ fontSize: 18 }}>
              Currency Rates will show here: &nbsp;
            </h1>
            For Example | AED: 111146.00 @ 22.210000 | AUD: 1100.00 @ 52.510000
            | CAD: 6900.00 @ 59.680000 |
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
            <h1 style={{ color: " #8d99ae ", userSelect: "none" }}>
              Basic Dashboard Information
            </h1>
          </Box>
        </MainContentBox>
      </MainContentLayout>
    </MainBackBox>
  );
};

export default Dashboard;
