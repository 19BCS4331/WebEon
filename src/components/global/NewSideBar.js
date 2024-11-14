import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  useMediaQuery,
  useTheme,
  TextField,
  IconButton,
  Box,
  ListItemIcon,
  InputAdornment,
} from "@mui/material";

import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { AuthContext } from "../../contexts/AuthContext";
import ThemeContext from "../../contexts/ThemeContext";
import CloseIcon from "@mui/icons-material/Close";
import * as MaterialIcons from "@mui/icons-material";
import { fetchNavigationItems } from "../../services/routeServices/navbarService";

const SubItem = ({
  subItem,
  openItems,
  setOpenItems,
  toggleDrawer,
  depth,
  setSearchQuery,
  setFilteredItems, // Add setFilteredItems to props
  items, // Add items to props
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { Colortheme } = useContext(ThemeContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (openItems.includes(subItem.id)) {
      setOpen(true);
    }
  }, [openItems, subItem.id]);

  const toggleSubItems = () => {
    setOpen(!open);
  };

  const handleLinkClick = () => {
    console.log("subItem", subItem);
    if (subItem.subItems.length > 0) {
      toggleSubItems();
    } else {
      if (subItem.link) {
        toggleDrawer();
        setSearchQuery(""); // Reset search query
        setFilteredItems(items); // Reset filtered items to original items

        if (location.pathname === subItem.link) {
          navigate(subItem.link, { replace: true });
        } else {
          navigate(subItem.link);
        }
      }
    }
  };

  return (
    <>
      <ListItemButton
        onClick={handleLinkClick}
        sx={{
          textAlign: "center",

          pl: 2,
          color: Colortheme.text,
          border:
            depth > 1
              ? `2px solid ${Colortheme.text}`
              : `1px solid ${Colortheme.text}`,
          marginTop: 2,
          borderRadius: depth > 1 ? 5 : 3,
          width: depth > 1 ? "75%" : "85%",
          marginLeft: depth > 1 ? 5 : 3,
          boxShadow: depth > 1 ? "-1px 4px 10px 0px rgba(0,0,0,0.1);" : "",
        }}
      >
        <ListItemText primary={subItem.name} sx={{ color: Colortheme.text }} />

        {subItem.subItems.length > 0 &&
          (open ? <ExpandLess /> : <ExpandMore />)}
      </ListItemButton>
      <Collapse
        in={open || openItems.includes(subItem.id)}
        timeout="auto"
        unmountOnExit
      >
        <List component="div" disablePadding>
          {subItem.subItems.map((item) => (
            <SubItem
              key={item.id}
              subItem={item}
              openItems={openItems}
              setOpenItems={setOpenItems}
              toggleDrawer={toggleDrawer}
              setSearchQuery={setSearchQuery}
              setFilteredItems={setFilteredItems} // Pass setFilteredItems to subitems
              items={items} // Pass items to subitems
              depth={depth + 1} // Increment depth for nested items
            />
          ))}
        </List>
      </Collapse>
    </>
  );
};

const NewSidebar = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/";
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const {
    Colortheme,
    isDarkMode,
    open,
    openItems,
    setOpenItems,
    toggleDrawer,
  } = useContext(ThemeContext);

  // const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  // const [openItems, setOpenItems] = useState([]);
  const { token } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");

  // useEffect(() => {
  //   if (!isLoginPage) {
  //     const fetchItems = async () => {
  //       try {
  //         const response = await axios.get(`${baseUrl}/nav/navigation`, {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         });
  //         const fetchedItems = response.data.map((item) => ({
  //           ...item,
  //           open: false,
  //         }));
  //         setItems(fetchedItems);
  //         setFilteredItems(fetchedItems); // Set initial filtered items
  //       } catch (error) {
  //         console.error("Error fetching navigation items:", error);
  //       }
  //     };
  //     fetchItems();
  //   }
  // }, [isLoginPage, token]);

  useEffect(() => {
    if (!isLoginPage) {
      const fetchItems = async () => {
        try {
          const data = await fetchNavigationItems();
          setItems(data);
          setFilteredItems(data); // Set initial filtered items
        } catch (error) {
          console.error("Error fetching navigation items:", error);
        }
      };
      fetchItems();
    }
  }, [isLoginPage]);

  const toggleSubItems = (itemId) => {
    setOpenItems((prevOpenItems) => {
      // Close all other items when opening a new one
      if (prevOpenItems.includes(itemId)) {
        return prevOpenItems.filter((id) => id !== itemId);
      } else {
        return [itemId];
      }
    });
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query) {
      const filtered = filterItems(items, query);
      const expandedIds = getExpandedIds(filtered, query);
      setFilteredItems(filtered);
      setOpenItems(expandedIds);
    } else {
      // Reset to original items when search is cleared
      setFilteredItems(items);
      setOpenItems([]);
    }
  };

  const filterItems = (items, query) => {
    return items
      .map((item) => {
        if (item.name.toLowerCase().includes(query)) {
          return item;
        }
        if (item.subItems.length > 0) {
          const filteredSubItems = filterItems(item.subItems, query);
          if (filteredSubItems.length > 0) {
            return { ...item, subItems: filteredSubItems };
          }
        }
        return null;
      })
      .filter((item) => item !== null);
  };

  const getExpandedIds = (items, query) => {
    let ids = [];
    items.forEach((item) => {
      if (item.name.toLowerCase().includes(query)) {
        ids.push(item.id);
      }
      if (item.subItems.length > 0) {
        const subItemIds = getExpandedIds(item.subItems, query);
        if (subItemIds.length > 0) {
          ids.push(item.id); // Also include this item's ID if any subItem matches
          ids = [...ids, ...subItemIds];
        }
      }
    });
    return ids;
  };

  if (isLoginPage) {
    return null;
  }

  // Dynamic Icon Component
  const DynamicIcon = ({ iconName }) => {
    const IconComponent = MaterialIcons[iconName];

    if (!IconComponent) {
      return null;
    }

    return (
      <IconComponent sx={{ width: 25, height: 25, color: Colortheme.text }} />
    );
  };

  return (
    <>
      <Drawer
        anchor="left"
        open={open}
        onClose={toggleDrawer}
        PaperProps={{
          style: {
            backgroundColor: Colortheme.secondaryBG,
            color: "white",
            width: isMobile ? "250px" : "300px",
            paddingTop: "20px",
            borderTopRightRadius: 40,
            height: "98vh",
          },
          sx: {
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: Colortheme.background,
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: Colortheme.text,
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: Colortheme.accent, // Use an accent color if you want a hover effect
            },
          },
        }}
      >
        <Box
          display={"flex"}
          alignItems={"center"}
          justifyContent={"space-around"}
        >
          <h1 style={{ fontSize: 22, color: Colortheme.text }}>Advanced EON</h1>
          {open && (
            <IconButton
              onClick={toggleDrawer}
              style={{
                width: 40,
                height: 40,
                alignItems: "center",
                justifyContent: "center",
                color: Colortheme.secondaryBG,
                backgroundColor: Colortheme.text,
                padding: "5px",
                borderRadius: "50%",
                boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              <CloseIcon
                sx={{ width: 25, height: 25, color: Colortheme.background }}
              />
            </IconButton>
          )}
        </Box>

        {/* ## Search Input For Filtering Sidebar Items */}

        <Box width={"100%"} display={"flex"} justifyContent={"center"}>
          <TextField
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MaterialIcons.Search
                    sx={{
                      width: 25,
                      height: 25,
                      color: "#141619",
                    }}
                  />
                </InputAdornment>
              ),
            }}
            sx={{
              marginTop: 4,
              width: "80%",
              // marginLeft: 4,
              backgroundColor: "white",
              borderRadius: 20,
              "& .MuiInputBase-input": {
                color: "black", // Text color when typing
                pl: 1,
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderWidth: 1.5,
                  borderRadius: 5,
                  borderColor: isDarkMode ? "transparent" : "black", // Border color
                },
                "&:hover fieldset": {
                  borderColor: isDarkMode ? "transparent" : "black", // Border color on hover
                },
                "&.Mui-focused fieldset": {
                  borderColor: isDarkMode ? "transparent" : "gray", // Border color when focused
                },
              },
              "& .MuiInputLabel-root": {
                color: Colortheme.background, // Placeholder color
              },
            }}
          />
        </Box>

        <List>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <React.Fragment key={item.id}>
                <ListItemButton
                  onClick={() => {
                    toggleSubItems(item.id);
                  }}
                  component={item.link && Link}
                  to={item.link}
                  sx={{
                    color: "#fff",
                    border: `2px solid ${Colortheme.text}`,
                    marginTop: 4,
                    borderTopRightRadius: 15,
                    marginLeft: 2,
                    width: "90%",
                  }}
                  onClickCapture={() => {
                    setSearchQuery(""); // Reset search query
                    setFilteredItems(items); // Reset filtered items to original items
                  }}
                >
                  {/* Add Icon here */}
                  {item.icon_name && (
                    <ListItemIcon>
                      <DynamicIcon iconName={item.icon_name} size={20} />
                    </ListItemIcon>
                  )}
                  <ListItemText
                    primary={item.name}
                    sx={{ color: Colortheme.text }}
                  />
                  {item.subItems.length > 0 &&
                    (openItems.includes(item.id) ? (
                      <ExpandLess sx={{ color: Colortheme.text }} />
                    ) : (
                      <ExpandMore sx={{ color: Colortheme.text }} />
                    ))}
                </ListItemButton>
                <Collapse
                  in={openItems.includes(item.id)}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    {item.subItems.map((subItem) => (
                      <SubItem
                        key={subItem.id}
                        subItem={subItem}
                        openItems={openItems}
                        setOpenItems={setOpenItems}
                        toggleDrawer={toggleDrawer}
                        setSearchQuery={setSearchQuery}
                        setFilteredItems={setFilteredItems} // Pass setFilteredItems to subitems
                        items={items} // Pass items to subitems
                        depth={1}
                      />
                    ))}
                  </List>
                </Collapse>
              </React.Fragment>
            ))
          ) : (
            <ListItemText
              primary="No results found"
              sx={{ color: Colortheme.text, textAlign: "center", marginTop: 4 }}
            />
          )}
        </List>
      </Drawer>
    </>
  );
};

export default NewSidebar;
