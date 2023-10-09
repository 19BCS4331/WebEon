import { Box } from "@mui/material";
import React from "react";
import { COLORS } from "../../assets/colors/COLORS";
import "../../css/components/InnerUrlGrid.css";
import { useNavigate, useLocation } from "react-router-dom";

const InnerUrlGrid = ({ InnerUrlGridData }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleItemClick = (item) => {
    // const validPageNames = ["master-profiles", "party-profiles"];
    const pageName = item.toLowerCase().replace(/ /g, "-");
    const targetLocation = `/${pageName}`;
    if (
      location.pathname !== targetLocation
      // validPageNames.includes(pageName.toLowerCase())
    ) {
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
      <Box mt={-10} color={COLORS.text} fontSize={20}>
        Select from below
      </Box>

      <Box display={"flex"} gap={3}>
        {InnerUrlGridData.map((item) => (
          <Box
            className="InnerUrlGridBox"
            display={"flex"}
            flexDirection={"row"}
            alignItems={"center"}
            borderRadius={"20px"}
            height={"5vh"}
            width={"auto"}
            sx={{ backgroundColor: COLORS.text, cursor: "pointer" }}
            p={2}
            onClick={() => handleItemClick(item.text)}
            boxShadow={"0px 10px 15px -3px rgba(0,0,0,0.1)"}
          >
            {item.text}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default InnerUrlGrid;
