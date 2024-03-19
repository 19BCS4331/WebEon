import React from "react";
import SideNavbar from "../../../components/global/SideNavbar";
import Topbar from "../../../components/global/Topbar";
import MainBackBox from "../../../components/global/MainBackBox";
import MainContentBox from "../../../components/global/MainContentBox";
import MainContentLayout from "../../../components/global/MainContentLayout";
import InnerUrlGrid from "../../../components/global/InnerUrlGrid";

const SysSetupIndex = () => {
  const InnerUrlGridData = [
    {
      text: "Tax Profile",
    },
    {
      text: "Company Profile",
    },
    {
      text: "User Profile",
    },
    {
      text: "Product Profile",
    },
  ];

  return (
    <MainBackBox>
      <Topbar title={"System Setup"} />
      <MainContentLayout>
        <SideNavbar />
        <MainContentBox>
          <InnerUrlGrid
            InnerUrlGridData={InnerUrlGridData}
            title={"system-setup"}
          />
        </MainContentBox>
      </MainContentLayout>
    </MainBackBox>
  );
};

export default SysSetupIndex;
