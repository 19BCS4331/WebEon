import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
  Collapse,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { AuthContext } from "../../contexts/AuthContext";
import { COLORS } from "../../assets/colors/COLORS";
import ThemeContext from "../../contexts/ThemeContext";

const SubItem = ({
  subItem,
  openItems,
  setOpenItems,
  toggleDrawer,
  setSearchQuery,
  depth,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { Colortheme } = useContext(ThemeContext);

  useEffect(() => {
    if (openItems.includes(subItem.id)) {
      setOpen(true);
    }
  }, [openItems, subItem.id]);

  const toggleSubItems = () => {
    setOpen(!open);
  };

  const handleLinkClick = () => {
    if (subItem.subItems.length > 0) {
      toggleSubItems();
    } else {
      toggleDrawer();
      // setSearchQuery("");
      if (location.pathname === subItem.link) {
        navigate(subItem.link, { replace: true });
      } else {
        navigate(subItem.link);
      }
    }
  };

  return (
    <>
      <ListItemButton
        onClick={handleLinkClick}
        sx={{
          pl: 4,
          color: Colortheme.text,
          border:
            depth > 1
              ? `2px solid ${Colortheme.text}`
              : `1px solid ${Colortheme.text}`,
          marginTop: 2,
          borderRadius: depth > 1 ? 5 : 3,
          width: depth > 1 ? "75%" : "85%",
          marginLeft: depth > 1 ? 5 : 3,
          // backgroundColor: depth > 1 ? Colortheme.secondaryBGcontra : "",
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
  const { Colortheme } = useContext(ThemeContext);

  const [open, setOpen] = useState(false);
  // const [items, setItems] = useState([]);
  // const [originalItems, setOriginalItems] = useState([]); // State to hold original items
  const [filteredItems, setFilteredItems] = useState([]); // State for filtered items
  // const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState([]);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (!isLoginPage) {
      const fetchItems = async () => {
        try {
          const response = await axios.get(
            "http://localhost:5002/nav/navigation",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const fetchedItems = response.data.map((item) => ({
            ...item,
            open: false,
          }));
          // setItems(fetchedItems);
          // setOriginalItems(fetchedItems); // Save original items
          setFilteredItems(fetchedItems); // Set initial filtered items
        } catch (error) {
          console.error("Error fetching navigation items:", error);
        }
      };
      fetchItems();
    }
  }, [isLoginPage, token]);

  const toggleDrawer = () => {
    setOpen(!open);
    if (open) {
      setOpenItems([]);
    }
  };

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

  // ----------------------------SEARCH TEMP DISABLED-----------------------
  // const handleSearch = (e) => {
  //   const query = e.target.value.toLowerCase();
  //   setSearchQuery(query);

  //   if (query === "") {
  //     setFilteredItems(originalItems); // Reset to original items when search query is cleared
  //     setOpenItems([]); // Close all items when search query is cleared
  //   } else {
  //     const newOpenItems = [];

  //     const filterItems = (items) => {
  //       return items.filter((item) => {
  //         const matches = item.name.toLowerCase().includes(query);
  //         const subItems = filterItems(item.subItems || []);
  //         if (matches || subItems.length > 0) {
  //           if (matches) {
  //             newOpenItems.push(item.id);
  //           }
  //           item.subItems = subItems;
  //           return true;
  //         }
  //         return false;
  //       });
  //     };

  //     const filteredItems = filterItems(
  //       JSON.parse(JSON.stringify(originalItems))
  //     ); // Filter a deep copy of original items
  //     setOpenItems(newOpenItems);
  //     setFilteredItems(filteredItems);
  //   }
  // };

  // ----------------------------SEARCH TEMP DISABLED-----------------------

  if (isLoginPage) {
    return null;
  }

  return (
    <>
      <IconButton
        onClick={toggleDrawer}
        style={{
          position: "absolute",
          top: "35px",
          left: "20px",
          zIndex: 1000,
          color: Colortheme.secondaryBG,
          backgroundColor: Colortheme.text,
          padding: "10px",
          borderRadius: "50%",
          boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </IconButton>
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
          },
        }}
      >
        <h1
          style={{ fontSize: 22, alignSelf: "center", color: Colortheme.text }}
        >
          Navigation
        </h1>
        <List>
          {/* --------------SEARCH COMMENTED TEMP------------------------- */}
          {/* <ListItemButton>
            <TextField
              variant="outlined"
              placeholder="Search..."
              fullWidth
              value={searchQuery}
              onChange={handleSearch}
              sx={{
                backgroundColor: "#fff",
                borderRadius: "20px",
                marginBottom: "10px",
              }}
            />
          </ListItemButton> */}
          {/* --------------SEARCH COMMENTED TEMP------------------------- */}
          {filteredItems.map((item, index) => (
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
              >
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
                      // setSearchQuery={setSearchQuery}
                      depth={1} // Initial depth for top-level items
                    />
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default NewSidebar;
