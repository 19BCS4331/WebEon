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
  alignItems: "stretch",
  position: "absolute",
  top: 80,
  right: 10,
  zIndex: 99999,
  padding: theme.spacing(3),
  backgroundColor: `${colortheme.secondaryBG}dd`,
  backdropFilter: "blur(10px)",
  border: `1px solid ${colortheme.text}22`,
  borderRadius: 16,
  color: colortheme.text,
  width: 280,
  boxShadow: `0 4px 24px -2px ${colortheme.text}15`,
  [theme.breakpoints.down("sm")]: {
    width: 260,
    padding: theme.spacing(2.5),
    right: 5,
  },
}));

const Divider = styled("hr")(({ theme }) => ({
  width: "100%",
  margin: "16px 0",
  border: "none",
  borderTop: "1px solid currentColor",
  opacity: 0.1,
}));

const ProfileItem = styled(Typography)(({ bold }) => ({
  fontWeight: bold ? 600 : 400,
  fontSize: "0.925rem",
  letterSpacing: "0.2px",
  margin: 0,
}));

const LogoutButton = styled(Box)(({ theme, colortheme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
  padding: "12px 16px",
  borderRadius: 12,
  backgroundColor: `${colortheme.text}08`,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    backgroundColor: `${colortheme.text}15`,
    transform: "translateY(-1px)",
  },
  "&:active": {
    transform: "translateY(1px)",
  },
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
    hidden: { y: -10, opacity: 0, scale: 0.95 },
    visible: { 
      y: 0, 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 25
      } 
    },
    exit: { 
      y: -10, 
      opacity: 0, 
      scale: 0.95,
      transition: { 
        duration: 0.2,
        ease: "easeOut"
      } 
    },
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
      <IconComponent 
        sx={{ 
          width: 20, 
          height: 20, 
          color: Colortheme.text,
          opacity: 0.7
        }} 
      />
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
          className="ProfileBox"
        >
          {profileItems.map((item, index) => (
            <React.Fragment key={index}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 1.5,
                  borderRadius: 2,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: `${Colortheme.text}08`
                  }
                }}
              >
                <DynamicIcon iconName={item.icon_name} />
                <ProfileItem bold={item.bold} fontFamily={"Poppins"}>{item.text}</ProfileItem>
              </Box>
              {index < profileItems.length - 1 && <Divider />}
            </React.Fragment>
          ))}

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              p: 1
            }}
          >
            <ThemeToggleButton isLoggedIn={true} />
          </Box>

          <Divider />

          <LogoutButton onClick={handleLogoutAuth} colortheme={Colortheme}>
            <Typography
            fontFamily={"Poppins"}
              sx={{
                fontSize: "0.925rem",
                fontWeight: 500,
                color: Colortheme.text
                
              }}
            >
              Sign Out
            </Typography>
            <LogoutIcon 
              sx={{ 
                fontSize: 20,
                color: Colortheme.text,
                opacity: 0.7
              }} 
            />
          </LogoutButton>
        </ProfileContainer>
      )}
    </AnimatePresence>
  );
};

export default ProfileDropdown;