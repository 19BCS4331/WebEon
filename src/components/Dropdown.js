import React, { useState } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardControlKeyIcon from "@mui/icons-material/KeyboardControlKey";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { COLORS } from "../assets/colors/COLORS";
import { useEffect } from "react";

const Dropdown = ({ MenuText, DropDownItems, searchResults }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();

  const shouldShowDropdown = searchResults.some(
    (item) => item.text === MenuText || item.subMenu.includes(MenuText)
  );

  const [isDropdownVis, setIsDropdownVis] = useState(false);

  const handleToggleDropdown = () => {
    setIsDropdownVis(!isDropdownVis);
  };

  const handleItemClick = (item) => {
    const pageName = item
      .toLowerCase()
      .replace(/[^\w\s]/g, "") // Remove special characters except hyphens and spaces
      .replace(/\s+/g, "-") // Replace consecutive spaces with a single hyphen
      .replace(/-{2,}/g, "-") // Replace consecutive hyphens with a single hyphen
      .trim(); // Trim any leading or trailing spaces
    const targetLocation = `/${MenuText}/${pageName}`;
    if (location.pathname !== targetLocation) {
      navigate(targetLocation);
    }
  };

  useEffect(() => {
    if (
      searchResults &&
      searchResults.length === 1 &&
      searchResults.some(
        (item) => item.text === MenuText || item.subMenu.includes(MenuText)
      )
    ) {
      setIsDropdownVis(true);
    }
    // else if (searchResults.length > 2 && isDropdownVis === true) {
    //   setIsDropdownVis(false);
    // }
  }, [searchResults]);

  return (
    <Box>
      <Box
        className="DropDownContainer"
        display={"flex"}
        sx={{ backgroundColor: COLORS.text, cursor: "pointer" }}
        width={isMobile ? "35vw" : "15vw"}
        height={"50px"}
        mt={5}
        borderRadius={"10px"}
        alignItems={"center"}
        justifyContent={"space-between"}
        onClick={handleToggleDropdown}
      >
        <p style={{ marginLeft: 20, userSelect: "none" }}>{MenuText}</p>

        {shouldShowDropdown && (
          <>
            {!isDropdownVis && (
              <Box
                component={motion.div}
                initial={{ rotateX: 0 }}
                animate={{ rotateX: 360 }}
                transition={0.4}
              >
                <KeyboardArrowDownIcon style={{ marginRight: 20 }} />
              </Box>
            )}

            {isDropdownVis && (
              <Box
                component={motion.div}
                initial={{ rotateX: 360 }}
                animate={{ rotateX: 0 }}
                transition={0.4}
              >
                <KeyboardControlKeyIcon
                  style={{ marginRight: 20, marginTop: 5 }}
                />
              </Box>
            )}
          </>
        )}
      </Box>
      <AnimatePresence>
        {shouldShowDropdown && isDropdownVis && (
          // {isDropdownVis && (
          <Box
            sx={{ backgroundColor: COLORS.text }}
            height={"50vh"}
            borderRadius={"10px"}
            mt={1}
            pl={0}
            pt={1}
            pb={1.5}
            component={motion.div}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0, transition: 0.1 }}
            transition={{ duration: 0.4 }}
            display={"flex"}
            justifyContent={"center"}
          >
            <Box>
              {DropDownItems?.map((item) => (
                <Box
                  component={motion.div}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: 0.4 }}
                  exit={{ opacity: 0 }}
                  width={isMobile ? "25vw" : "13vw"}
                  mt={1}
                  pl={2}
                  borderRadius={2}
                  sx={{
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                  onClick={() => handleItemClick(item)}
                  className="ItemBox"
                >
                  <p>{item}</p>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default Dropdown;
