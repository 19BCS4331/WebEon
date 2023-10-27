import React from "react";
import MainBackBox from "../../../components/global/MainBackBox";
import Topbar from "../../../components/global/Topbar";
import MainContentLayout from "../../../components/global/MainContentLayout";
import InnerUrlGrid from "../../../components/global/InnerUrlGrid";
import SideNavbar from "../../../components/global/SideNavbar";
import MainContentBox from "../../../components/global/MainContentBox";

const BuySellOptions = () => {
  const InnerUrlGridData = [
    {
      text: "Buy From Individual / Corporates",
    },
    {
      text: "Buy from FFMCs/ADs",
    },
    {
      text: "Buy from RMCs",
    },
    {
      text: "Buy from Franchisee",
    },
    {
      text: "Sell to Individual/Corporate",
    },
    {
      text: "Sell to FFMCs/ADs",
    },
    {
      text: "Sell to Foreign Correspondent",
    },
  ];

  return (
    <MainBackBox>
      <Topbar title={"Master Profiles"} />
      <MainContentLayout>
        <SideNavbar />
        <MainContentBox>
          <InnerUrlGrid InnerUrlGridData={InnerUrlGridData} />
        </MainContentBox>
      </MainContentLayout>
    </MainBackBox>
  );
};

export default BuySellOptions;
