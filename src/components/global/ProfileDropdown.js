import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import LogoutIcon from "@mui/icons-material/Logout";
import { styled } from "@mui/material/styles";
import * as MaterialIcons from "@mui/icons-material";
import ThemeToggleButton from "./ThemeToggleButton";

// Styled components
const ProfileContainer = styled(motion.div)(({ theme, colortheme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  position: "absolute",
  top: 80,
  right: 10,
  zIndex: 99999,
  padding: theme.spacing(4),
  backgroundColor: colortheme.secondaryBG,
  border: `2px solid ${colortheme.text}`,
  borderRadius: "20px",
  color: colortheme.text,
  width: 220,
  [theme.breakpoints.down("sm")]: {
    width: 220,
    padding: theme.spacing(3),
    right: 5,
  },
}));

const Divider = styled("hr")({
  width: 100,
  margin: "12px 0",
  border: "none",
  borderTop: "1px solid currentColor",
  opacity: 0.3,
});

const ProfileItem = styled(Typography)(({ bold }) => ({
  fontWeight: bold ? 600 : 400,
  textAlign: "center",
  margin: "8px 0",
}));

const LogoutButton = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  cursor: "pointer",
  padding: "8px 16px",
  borderRadius: theme.spacing(1),
  transition: "background-color 0.2s",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
  // marginTop: theme.spacing(2),
}));

const ProfileDropdown = ({
  isProfileVis,
  username,
  branch,
  counter,
  finyear,
  handleLogoutAuth,
  Colortheme,
}) => {
  // Animation variants
  const dropdownVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.2 } },
    exit: { y: -20, opacity: 0, transition: { duration: 0.2 } },
  };

  const profileItems = [
    { text: username || "User", bold: true, icon_name: "Person" },
    {
      text: branch ? `${branch.vBranchCode} Branch` : "No Branch",
      icon_name: "Storefront",
    },
    {
      text: counter ? `Counter ${counter.nCounterID}` : "No Counter",
      icon_name: "Countertops",
    },
    { text: finyear || "No FinYear", icon_name: "Today" },
  ];

  // Dynamic Icon Component
  const DynamicIcon = ({ iconName }) => {
    const IconComponent = MaterialIcons[iconName];

    if (!IconComponent) {
      return null;
    }

    return (
      <IconComponent sx={{ width: 20, height: 20, color: Colortheme.text }} />
    );
  };

  return (
    <AnimatePresence>
      {isProfileVis && (
        <ProfileContainer
          colortheme={Colortheme}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={dropdownVariants}
        >
          {profileItems.map((item, index) => (
            <React.Fragment key={index}>
              <Box display={"flex"} alignItems={"center"} gap={2}>
                <DynamicIcon iconName={item.icon_name} />
                <ProfileItem bold={item.bold}>{item.text}</ProfileItem>
              </Box>
              <Divider />
            </React.Fragment>
          ))}

          <Box>
            <ThemeToggleButton isLoggedIn={true} />
          </Box>

          <Divider />

          <LogoutButton onClick={handleLogoutAuth}>
            <Typography>Logout</Typography>
            <LogoutIcon fontSize="small" />
          </LogoutButton>
        </ProfileContainer>
      )}
    </AnimatePresence>
  );
};

export default ProfileDropdown;
