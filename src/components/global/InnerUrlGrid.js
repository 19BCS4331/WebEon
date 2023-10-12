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
      <Box
        mt={-10}
        color={COLORS.text}
        fontSize={25}
        sx={{ userSelect: "none" }}
      >
        Masters
      </Box>
      <Box
        sx={{
          backgroundColor: COLORS.text,
          boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1)",
        }}
        borderRadius={"40px"}
        p={3}
      >
        <Box
          display="grid"
          gridTemplateColumns="repeat(3, 1fr)"
          gridTemplateRows="repeat(2, 1fr)"
          columnGap="40px"
          rowGap="40px"
        >
          {InnerUrlGridData.map((item) => (
            <Box
              key={item.text}
              className="InnerUrlGridBox"
              borderRadius="20px"
              sx={{
                backgroundColor: COLORS.secondaryBG,
                cursor: "pointer",
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
