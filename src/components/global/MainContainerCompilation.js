import React from "react";
import MainBackBox from "./MainBackBox";
import Topbar from "./Topbar";
import MainContentLayout from "./MainContentLayout";
import SideNavbar from "./SideNavbar";
import MainContentBox from "./MainContentBox";

const MainContainerCompilation = ({ children, title }) => {
  return (
    <MainBackBox>
      <Topbar title={title} />
      <MainContentLayout>
        {/* <SideNavbar /> */}
        <MainContentBox>{children}</MainContentBox>
      </MainContentLayout>
    </MainBackBox>
  );
};

export default MainContainerCompilation;
