import React from "react";
import Dropdown from "../Dropdown";
import { Box } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";

const SideNavbar = () => {
  // const DropDownItemsMaster = ["Master Profiles", "Party Profiles", "Hello"];

  const DropDownItems = [
    {
      text: "Master",
      role: "All",
      subMenu: [
        {
          text: "Master Profiles",
          subMenu: [{ text: "Currency Profile" }, { text: "Financial Codes" }],
        },
        {
          text: "Party Profiles",
          subMenu: [
            { text: "Category Master" },
            { text: "Corporate Client Profile" },
          ],
        },
      ],
    },
    {
      text: "Transactions",
      role: "All",
      subMenu: [
        {
          text: "Other Transactions",
          subMenu: [{ text: "AD1 Transactions" }, { text: "Insurance Sales" }],
        },
        {
          text: "Accounting Transactions",
          subMenu: [{ text: "Debit / Credit Transact" }, { text: "Receipt" }],
        },
      ],
    },

    {
      text: "Miscellaneous",
      role: "Admin",
      subMenu: [
        {
          text: "Other Transactions",
          subMenu: [{ text: "AD1 Transactions" }, { text: "Insurance Sales" }],
        },
        {
          text: "Accounting Transactions",
          subMenu: [{ text: "Debit / Credit Transact" }, { text: "Receipt" }],
        },
      ],
    },
  ];

  // const DropDownItemsTrans = ["Other Trans", "Transactions", "Bye"];

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
      {DropDownItems.map((item) => (
        <>
          {userRole === "Admin" ? (
            <Dropdown
              MenuText={item.text}
              DropDownItems={item.subMenu.map((subItem) => subItem.text)}
            />
          ) : (
            <>
              {item.role !== "Admin" && (
                <Dropdown
                  MenuText={item.text}
                  DropDownItems={item.subMenu.map((subItem) => subItem.text)}
                />
              )}
            </>
          )}
        </>
      ))}
    </Box>
  );
};

export default SideNavbar;
