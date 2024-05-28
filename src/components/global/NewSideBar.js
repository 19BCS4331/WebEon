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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { AuthContext } from "../../contexts/AuthContext";
import { COLORS } from "../../assets/colors/COLORS";

const SubItem = ({
  subItem,
  openItems,
  setOpenItems,
  toggleDrawer,
  setSearchQuery,
}) => {
  const [open, setOpen] = useState(false);

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
      // Reset search query when a link is clicked and drawer is closed
      setSearchQuery("");
    }
  };

  return (
    <>
      <ListItemButton
        onClick={handleLinkClick}
        sx={{ pl: 4, color: "#fff" }}
        component={subItem.link && Link}
        to={subItem.link}
      >
        <ListItemText primary={subItem.name} sx={{ color: "#fff" }} />
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

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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
          setItems(response.data.map((item) => ({ ...item, open: false })));
        } catch (error) {
          console.error("Error fetching navigation items:", error);
        }
      };
      fetchItems();
    }
  }, [isLoginPage, token]);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const toggleSubItems = (itemId) => {
    setOpenItems((prevOpenItems) =>
      prevOpenItems.includes(itemId)
        ? prevOpenItems.filter((id) => id !== itemId)
        : [...prevOpenItems, itemId]
    );
  };

  const filteredItems = items.filter((item) => {
    // Check if the item name includes the search query
    if (item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return true;
    }
    // Check if any sub-item name includes the search query
    return item.subItems.some((subItem) =>
      subItem.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (isLoginPage) {
    return null;
  }

  return (
    <>
      <IconButton
        onClick={toggleDrawer}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          zIndex: 1000,
          color: "white",
          backgroundColor: COLORS.background,
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
            backgroundColor: COLORS.background,
            color: "white",
            width: "300px",
            paddingTop: "20px",
          },
        }}
      >
        <List>
          <ListItemButton>
            <TextField
              variant="outlined"
              placeholder="Search..."
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                backgroundColor: "#fff",
                borderRadius: "4px",
                marginBottom: "10px",
              }}
            />
          </ListItemButton>
          {filteredItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <ListItemButton
                onClick={() => {
                  toggleSubItems(item.id);
                }}
                component={item.link && Link}
                to={item.link}
                sx={{ color: "#fff" }}
              >
                <ListItemText primary={item.name} sx={{ color: "#fff" }} />
                {item.subItems.length > 0 &&
                  (openItems.includes(item.id) ? (
                    <ExpandLess />
                  ) : (
                    <ExpandMore />
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
