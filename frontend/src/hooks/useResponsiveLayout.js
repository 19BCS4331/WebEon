import { useMediaQuery, useTheme } from "@mui/material";
import { useMemo } from "react";

export const useResponsiveLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  return useMemo(() => ({
    isMobile,
    contentWidth: isMobile ? "85%" : "95%",
    contentPadding: isMobile ? 2 : 3,
    spacing: isMobile ? 2 : 5,
  }), [isMobile]);
};
