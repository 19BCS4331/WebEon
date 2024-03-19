import React, { useState, useEffect, useContext } from "react";
import Dropdown from "../Dropdown";
import {
  Box,
  CircularProgress,
  TextField,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
// import { COLORS } from "../../assets/colors/COLORS";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import ClearIcon from "@mui/icons-material/Clear";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import MenuIcon from "@mui/icons-material/Menu";
import ThemeContext from "../../contexts/ThemeContext";
import { useBaseUrl } from "../../contexts/BaseUrl";

const SideNavbar = () => {
  const { baseUrl } = useBaseUrl();
  const { Colortheme } = useContext(ThemeContext);
  const [menuData, setMenuData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { userRole } = useAuth();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const cachedMenuData = JSON.parse(localStorage.getItem("menuData"));

    if (cachedMenuData) {
      console.log("Using cached menu data...");
      setMenuData(cachedMenuData);
    } else {
      console.log("Fetching menu data from API...");
      fetchNavMenu(token);
    }
  }, []);

  const fetchNavMenu = async (token) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${baseUrl}/api/nav/NavMenu`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const organizedMenuData = organizeMenuData(response.data);
      setMenuData(organizedMenuData);
      localStorage.setItem("menuData", JSON.stringify(organizedMenuData));
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect(() => {
  //   const token = localStorage.getItem("token");

  //   const fetchNavMenu = async () => {
  //     setIsLoading(true);
  //     try {
  //       const response = await axios.get(
  //         `http://localhost:5001/api/nav/NavMenu`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );
  //       const organizedMenuData = organizeMenuData(response.data);
  //       setMenuData(organizedMenuData);
  //       setIsLoading(false);
  //     } catch (error) {
  //       console.log(error);
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchNavMenu();
  // }, []);

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

  const handleSearchChange = (event) => {
    setSearchKeyword(event.target.value);
  };

  const handleSearchClear = () => {
    setSearchKeyword("");
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
    <>
      {/* Render menu button only on mobile screens */}
      <Box
        position="fixed"
        top={30}
        left={10}
        zIndex={1000} // Ensure it's above other content
        bgcolor="transparent" // Make background transparent
      >
        <IconButton
          onClick={handleMobileMenuToggle}
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{
            display: { xs: "flex", md: "none", color: Colortheme.text },
          }}

          // Show on mobile, hide on desktop
          // style={{ marginBottom: "20px" }}
        >
          <MenuIcon sx={{ fontSize: "40px" }} />
        </IconButton>
      </Box>

      {/* Render sidebar for desktop screens */}
      <Box
        display={{ xs: "none", md: "flex" }} // Hide on mobile, show on desktop
        flexDirection="column"
        height="85vh"
        width="18vw"
        borderRadius="20px"
        backgroundColor={Colortheme.secondaryBG}
        overflowY="scroll"
        overflow={"auto"}
        mt={2}
        ml={1}
        alignItems="center"
      >
        <Box>
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
              backgroundColor: "white",
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
        {isLoading ? (
          <CircularProgress
            sx={{ marginTop: "20vh", color: Colortheme.text }}
          />
        ) : (
          <List>
            {filteredItems.map((item) => (
              <React.Fragment key={item.id}>
                {userRole === "Admin" || item.role !== "Admin" ? (
                  <ListItem>
                    <Dropdown
                      MenuText={item.text}
                      DropDownItems={item.subMenu.map(
                        (subItem) => subItem.text
                      )}
                      searchResults={filteredItems}
                    />
                  </ListItem>
                ) : null}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {/* Render sidebar for mobile screens */}
      <Drawer
        anchor="left"
        open={isMobileMenuOpen}
        onClose={handleMobileMenuToggle}
      >
        <Box
          display="flex"
          flexDirection="column"
          height="100%"
          width="45vw"
          borderRadius={isMobileMenuOpen ? "0px" : "20px"}
          backgroundColor={Colortheme.secondaryBG}
          overflowY="auto"
          alignItems="center"
        >
          <Box
            width="100%" // Ensure the search bar spans the full width
            display="flex"
            justifyContent="center" // Align items horizontally at the center
            marginTop={2} // Adjust top margin
          >
            <TextField
              placeholder="Search.."
              value={searchKeyword}
              onChange={handleSearchChange}
              sx={{
                "& fieldset": { border: "none" },
              }}
              style={{
                width: "90%",
                backgroundColor: Colortheme.text,
                borderRadius: "20px",
                height: 50,
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
          {isLoading ? (
            <CircularProgress
              sx={{ marginTop: "20vh", color: Colortheme.text }}
            />
          ) : (
            <List>
              {filteredItems.map((item) => (
                <React.Fragment key={item.id}>
                  {userRole === "Admin" || item.role !== "Admin" ? (
                    <ListItem>
                      <Dropdown
                        MenuText={item.text}
                        DropDownItems={item.subMenu.map(
                          (subItem) => subItem.text
                        )}
                        searchResults={filteredItems}
                      />
                    </ListItem>
                  ) : null}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default SideNavbar;
