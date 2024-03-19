import { Box, useMediaQuery, useTheme } from "@mui/material";
import React from "react";
import { COLORS } from "../../assets/colors/COLORS";
import "../../css/components/InnerUrlGrid.css";
import { useNavigate, useLocation } from "react-router-dom";

const InnerUrlGrid = ({ InnerUrlGridData, title }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();

  // const handleItemClick = (item) => {
  //   // const validPageNames = ["master-profiles", "party-profiles"];
  //   const pageName = item.toLowerCase().replace(/ /g, "-");
  //   const targetLocation = `/${pageName}`;
  //   if (
  //     location.pathname !== targetLocation
  //     // validPageNames.includes(pageName.toLowerCase())
  //   ) {
  //     navigate(targetLocation);
  //   }
  // };

  const handleItemClick = (item) => {
    const pageName = item
      .toLowerCase()
      .replace(/[^\w\s]/g, "") // Remove special characters except hyphens and spaces
      .replace(/\s+/g, "-") // Replace consecutive spaces with a single hyphen
      .replace(/-{2,}/g, "-") // Replace consecutive hyphens with a single hyphen
      .trim(); // Trim any leading or trailing spaces
    const targetLocation = `/${title}/${pageName}`;
    if (location.pathname !== targetLocation) {
      navigate(targetLocation);
    }
  };

  return (
    <Box
      display={"flex"}
      alignItems={"center"}
      flexDirection={"column"}
      gap={5}
    >
      <Box
        mt={isMobile ? 0 : -10}
        color={COLORS.text}
        fontSize={25}
        sx={{ userSelect: "none" }}
      >
        Navigate
      </Box>
      <Box
        sx={{
          backgroundColor: COLORS.text,
          boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1)",
        }}
        borderRadius={"40px"}
        p={3}
        width={isMobile ? "60vw" : "auto"}
      >
        <Box
          display="grid"
          // gridTemplateColumns="repeat(3, 1fr)"
          gridTemplateColumns={isMobile ? "repeat(1, 1fr)" : "repeat(3, 1fr)"}
          sx={{
            overflow: isMobile ? "auto" : "visible",
          }}
          maxHeight={isMobile ? "60vh" : "auto"}
          gridTemplateRows="repeat(2, 1fr)"
          columnGap="40px"
          rowGap="40px"
          justifyItems={isMobile ? "center" : "auto"}
        >
          {InnerUrlGridData.map((item) => (
            <Box
              key={item.text}
              className="InnerUrlGridBox"
              borderRadius="20px"
              sx={{
                backgroundColor: COLORS.secondaryBG,
                cursor: "pointer",
                width: isMobile ? "40vw" : "auto",
              }}
              p={2}
              onClick={() => handleItemClick(item.text)}
            >
              {item.text}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default InnerUrlGrid;
