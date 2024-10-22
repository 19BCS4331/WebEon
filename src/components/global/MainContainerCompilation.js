import React from "react";
import MainBackBox from "./MainBackBox";
import Topbar from "./Topbar";
import MainContentLayout from "./MainContentLayout";
import SideNavbar from "./SideNavbar";
import MainContentBox from "./MainContentBox";
import LazyFallBack from "../../pages/LazyFallBack";

const MainContainerCompilation = ({ children, title, loading }) => {
  return (
    <MainBackBox>
      {loading ? (
        <LazyFallBack />
      ) : (
        <>
          <Topbar title={title} />
          <MainContentLayout>
            {/* <SideNavbar /> */}
            <MainContentBox>{children}</MainContentBox>
          </MainContentLayout>
        </>
      )}
    </MainBackBox>
  );
};

export default MainContainerCompilation;
