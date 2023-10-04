import React from "react";
import SideNavbar from "../components/global/SideNavbar";
import Topbar from "../components/global/Topbar";
import MainBackBox from "../components/global/MainBackBox";
import MainContentBox from "../components/global/MainContentBox";
import MainContentLayout from "../components/global/MainContentLayout";

const TestPage = ({ handleLogoutAuth }) => {
  return (
    <MainBackBox>
      <Topbar title={"Master Profiles"} handleLogoutAuth={handleLogoutAuth} />
      <MainContentLayout>
        <SideNavbar />
        <MainContentBox></MainContentBox>
      </MainContentLayout>
    </MainBackBox>
  );
};

export default TestPage;
