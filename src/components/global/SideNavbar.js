import React, { useState, useEffect } from "react";
import Dropdown from "../Dropdown";
import { Box, TextField } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import { COLORS } from "../../assets/colors/COLORS";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import ClearIcon from "@mui/icons-material/Clear";
import axios from "axios";

const SideNavbar = () => {
  // const DropDownItemsMaster = ["Master Profiles", "Party Profiles", "Hello"];
  const [menuData, setMenuData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchNavMenu = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          `http://localhost:5001/api/nav/NavMenu`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const organizedMenuData = organizeMenuData(response.data);
        setMenuData(organizedMenuData);
      } catch (error) {
        console.log(error);
      }
    };

    fetchNavMenu();
  }, []);

  const organizeMenuData = (menuItems, parentId = null) => {
    const organizedData = menuItems
      .filter((item) => item.parent_id === parentId)
      .map((item) => {
        const subMenu = organizeMenuData(menuItems, item.id);
        if (subMenu.length > 0) {
          item.subMenu = subMenu;
        }
        return item;
      });

    return organizedData;
  };

  const { userRole } = useAuth();
  const [searchKeyword, setSearchKeyword] = React.useState("");

  const handleSearchChange = (event) => {
    setSearchKeyword(event.target.value);
  };

  const handleSearchClear = () => {
    setSearchKeyword("");
  };

  const filteredItems = menuData.filter((item) => {
    return (
      item.text.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.subMenu.some((subItem) =>
        subItem.text.toLowerCase().includes(searchKeyword.toLowerCase())
      )
    );
  });

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
      <Box>
        {/* <SearchIcon
          style={{
            position: "absolute",
            marginLeft: "1.5rem",
            marginTop: "2rem",
          }}
          fontSize="small"
        /> */}
        <TextField
          placeholder="Search.."
          value={searchKeyword}
          onChange={handleSearchChange}
          sx={{
            "& fieldset": { border: "none" },
          }}
          style={{
            display: "flex",
            width: "16vw",
            backgroundColor: COLORS.text,
            borderRadius: "20px",
            marginTop: 20,
            height: 50,
            justifyContent: "center",
            boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1)",
          }}
          InputProps={
            searchKeyword.length > 0
              ? {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <ClearIcon
                        onClick={handleSearchClear}
                        style={{ cursor: "pointer" }}
                      />
                    </InputAdornment>
                  ),
                }
              : {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }
          }
        />
      </Box>
      {filteredItems.map((item) => (
        <>
          {userRole === "Admin" ? (
            <Dropdown
              MenuText={item.text}
              DropDownItems={item.subMenu.map((subItem) => subItem.text)}
              searchResults={filteredItems}
            />
          ) : (
            <>
              {item.role !== "Admin" && (
                <Dropdown
                  MenuText={item.text}
                  DropDownItems={item.subMenu.map((subItem) => subItem.text)}
                  searchResults={filteredItems}
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
