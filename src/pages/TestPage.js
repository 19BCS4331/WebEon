import React from "react";
import SideNavbar from "../components/global/SideNavbar";
import Topbar from "../components/global/Topbar";
import MainBackBox from "../components/global/MainBackBox";
import MainContentBox from "../components/global/MainContentBox";
import MainContentLayout from "../components/global/MainContentLayout";
import InnerUrlGrid from "../components/global/InnerUrlGrid";
import MainContainerCompilation from "../components/global/MainContainerCompilation";

const TestPage = () => {
  const InnerUrlGridData = [
    {
      text: "Currency Profile",
    },
    {
      text: "Financial Codes",
    },
    {
      text: "Financial Sub Profile",
    },
    {
      text: "Division Profile",
    },
    {
      text: "Division Details",
    },
    {
      text: "Accounts Profile",
    },
    {
      text: "AD1 Provider",
    },
  ];

  return (
    <MainContainerCompilation title={"Master Profiles"}>
      <InnerUrlGrid
        InnerUrlGridData={InnerUrlGridData}
        title={"master-profiles"}
      />
    </MainContainerCompilation>
  );
};

export default TestPage;
