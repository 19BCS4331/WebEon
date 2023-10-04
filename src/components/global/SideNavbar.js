import React from "react";
import Dropdown from "../Dropdown";
import { Box } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";

const SideNavbar = () => {
  const DropDownItemsMaster = ["Master Profiles", "Party Profiles", "Hello"];
  const DropDownItemsTrans = ["Other Trans", "Transactions", "Bye"];

  const { userRole } = useAuth();
  return (
    <Box
      display={"flex"}
      height={"85vh"}
      width={"18vw"}
      borderRadius={"20px"}
      sx={{
        backgroundColor: "#8d99ae",
        overflowY: "scroll",
        overflow: "auto",
      }}
      mt={2}
      ml={1}
      alignItems={"center"}
      flexDirection={"column"}
    >
      <Dropdown MenuText={"Master"} DropDownItems={DropDownItemsMaster} />
      {userRole === "Admin" && (
        <Dropdown
          MenuText={"Transactions"}
          DropDownItems={DropDownItemsTrans}
        />
      )}
    </Box>
  );
};

export default SideNavbar;
