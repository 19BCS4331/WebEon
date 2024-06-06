import { Box, CircularProgress } from "@mui/material";
import React from "react";
import MainContainerCompilation from "../components/global/MainContainerCompilation";
import ThemeContext from "../contexts/ThemeContext";
import { useContext } from "react";

const LazyFallBack = () => {
  const { Colortheme } = useContext(ThemeContext);

  return (
    <MainContainerCompilation title={"Loading.."}>
      <CircularProgress style={{ color: Colortheme.text }} />
    </MainContainerCompilation>
  );
};

export default LazyFallBack;
