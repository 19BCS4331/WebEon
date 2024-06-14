import React from "react";
import MainContainerCompilation from "../components/global/MainContainerCompilation";
import ThemeContext from "../contexts/ThemeContext";
import { useContext } from "react";
import { MutatingDots } from "react-loader-spinner";

const LazyFallBack = () => {
  const { Colortheme } = useContext(ThemeContext);

  return (
    <MainContainerCompilation title={"Loading.."}>
      <MutatingDots
        visible={true}
        height="100"
        width="100"
        color={Colortheme.text}
        secondaryColor={Colortheme.text}
        radius="12.5"
        ariaLabel="mutating-dots-loading"
      />
    </MainContainerCompilation>
  );
};

export default LazyFallBack;
