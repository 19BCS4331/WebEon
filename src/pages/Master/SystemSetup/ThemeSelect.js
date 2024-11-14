import React, { useContext, useState } from "react";
import MainContainerCompilation from "../../../components/global/MainContainerCompilation";
import ThemeContext, { themes } from "../../../contexts/ThemeContext";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import StyledButton from "../../../components/global/StyledButton";
import { useToast } from "../../../contexts/ToastContext";

const ThemeSelect = () => {
  const { showToast, hideToast } = useToast();
  const theme = useTheme();
  const { Colortheme, setTheme } = useContext(ThemeContext);
  const [selectedTheme, setSelectedTheme] = useState(null); // State to track the selected theme for flipping
  const [cardModes, setCardModes] = useState({}); // State to track light/dark mode for each card
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isSmallDesktop = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up("lg"));

  const getGridTemplateColumns = () => {
    if (isMobile) return "repeat(1, 1fr)";
    if (isTablet) return "repeat(2, 1fr)";
    if (isSmallDesktop) return "repeat(3, 1fr)";
    if (isLargeDesktop) return "repeat(4, 1fr)";
    return "repeat(5, 1fr)";
  };

  const handleToggleTheme = (themeName) => {
    setSelectedTheme(themeName);
    setCardModes((prevModes) => ({
      ...prevModes,
      [themeName]: !prevModes[themeName],
    }));
  };

  const handleSetTheme = (themeName) => {
    setTheme(themeName);
    showToast("Theme changed successfully", "success");
    setTimeout(() => {
      hideToast();
    }, 2000);
  };
  return (
    <MainContainerCompilation title={"Select Theme"}>
      <Box
        display={"grid"}
        gridTemplateColumns={getGridTemplateColumns()}
        gap={4}
        p={2}
        overflow={"auto"}
        maxHeight={"100%"}
        maxWidth={"100%"}
        sx={{
          "&::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: Colortheme.text,
            borderRadius: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: Colortheme.secondaryBG,
          },
          "& > *": {
            borderRadius: "50px",
          },
        }}
      >
        {Object.keys(themes).map((themeName) => {
          const lightTheme = themes[themeName].light;
          const darkTheme = themes[themeName].dark;
          let modifiedThemeName = themeName;

          modifiedThemeName =
            themeName[0].toUpperCase() +
            themeName.slice(1).replace(/([A-Z])/g, " $1");

          const isDarkMode = cardModes[themeName] || false;
          const currentTheme = isDarkMode ? darkTheme : lightTheme;

          return (
            <>
              <Box
                display={"flex"}
                flexDirection={"column"}
                gap={2}
                p={4}
                sx={{
                  backgroundColor: currentTheme.background,
                  color: currentTheme.text,
                  borderRadius: "50px",
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontWeight: "bold" }}>
                    {modifiedThemeName}
                  </span>
                  <Box
                    onClick={() => handleToggleTheme(themeName)}
                    sx={{
                      backgroundColor: currentTheme.secondaryBG,
                      color: currentTheme.text,
                      fontSize: "0.8rem",
                      padding: "10px",
                      borderRadius: "10px",
                      cursor: "pointer",
                    }}
                  >
                    {isDarkMode ? "Dark" : "Light"}
                  </Box>
                </Box>
                {["Background", "Secondary Background", "Text", "Contrast"].map(
                  (field, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 2,
                        borderRadius: "0.5rem",
                        backgroundColor: currentTheme.secondaryBG,
                        color: currentTheme.secondaryBGcontra,
                      }}
                    >
                      <span style={{ fontWeight: "bold" }}>{field}:</span>
                      <Box
                        sx={{
                          display: "inline-block",
                          width: "1.5rem",
                          height: "1.5rem",
                          borderRadius: "0.5rem",
                          backgroundColor:
                            field === "Background"
                              ? currentTheme.background
                              : field === "Secondary background"
                              ? currentTheme.secondaryBG
                              : field === "Text"
                              ? currentTheme.text
                              : currentTheme.secondaryBGcontra,
                        }}
                      ></Box>
                      {/* {currentTheme[field.toLowerCase().replace(/\s/g, "")]} */}
                    </Box>
                  )
                )}
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <StyledButton
                    sx={{
                      py: 1,
                      px: 2,
                      borderRadius: "0.5rem",
                      backgroundColor: currentTheme.secondaryBG,
                      color: currentTheme.secondaryBGcontra,
                    }}
                    bgColor={currentTheme.secondaryBG}
                    textColor={currentTheme.secondaryBGcontra}
                    bgColorHover={currentTheme.secondaryBGcontra}
                    textColOnHover={currentTheme.secondaryBG}
                    onClick={() => handleSetTheme(themeName)}
                  >
                    Select
                  </StyledButton>
                </Box>
              </Box>
            </>
          );
        })}
      </Box>
    </MainContainerCompilation>
  );
};

export default ThemeSelect;
