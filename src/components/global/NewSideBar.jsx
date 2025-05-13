import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
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
  Typography,
  Paper,
  Divider,
} from "@mui/material";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ThemeContext from "../../contexts/ThemeContext";
import CloseIcon from "@mui/icons-material/Close";
import * as MaterialIcons from "@mui/icons-material";
import { fetchNavigationItems } from "../../services/routeServices/navbarService";

// Memoized SubItem component to prevent unnecessary re-renders
const SubItem = React.memo(
  ({
    subItem,
    openItems,
    setOpenItems,
    toggleDrawer,
    depth,
    setSearchQuery,
    setSearchInput,
    setFilteredItems,
    items,
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

    // Use useCallback to memoize event handlers
    const toggleSubItems = useCallback(() => {
      setOpen((prevOpen) => !prevOpen);
    }, []);

    const handleLinkClick = useCallback(() => {
      if (subItem.subItems.length > 0) {
        toggleSubItems();
      } else {
        console.log("subitem", subItem);

        if (subItem.link) {
          // Clear search state first before navigation
          setSearchInput("");
          setSearchQuery("");
          setFilteredItems(items);

          // Then handle navigation and drawer
          toggleDrawer();

          if (location.pathname === subItem.link) {
            navigate(subItem.link, { replace: true });
          } else {
            navigate(subItem.link);
          }
        }
      }
    }, [
      subItem,
      toggleSubItems,
      toggleDrawer,
      setSearchQuery,
      setFilteredItems,
      items,
      location.pathname,
      navigate,
      setSearchInput,
    ]);

    // Memoize the isActive calculation
    const isActive = useMemo(
      () => location.pathname === subItem.link,
      [location.pathname, subItem.link]
    );

    // Memoize styles to prevent recalculations
    const listItemButtonStyles = useMemo(
      () => ({
        position: "relative",
        pl: depth > 1 ? 6 : 3,
        pr: 2,
        py: 1.75,
        my: 0.5,
        borderRadius: 2,
        backgroundColor: isActive ? `${Colortheme.text}15` : "transparent",
        // Use will-change to hint the browser about properties that will change
        willChange: "background-color, transform",
        // Use hardware acceleration for animations
        transform: "translateZ(0)",
        "&:before": {
          content: '""',
          position: "absolute",
          left: depth > 1 ? "24px" : "12px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "4px",
          height: "4px",
          borderRadius: "50%",
          backgroundColor: isActive ? Colortheme.text : "transparent",
          transition: "all 0.2s ease",
        },
        "&:hover": {
          backgroundColor: `${Colortheme.text}10`,
          "&:before": {
            backgroundColor: Colortheme.text,
            width: isActive ? "4px" : "6px",
          },
        },
      }),
      [depth, isActive, Colortheme.text]
    );

    const listItemTextStyles = useMemo(
      () => ({
        m: 0,
        "& .MuiTypography-root": {
          fontSize: depth > 1 ? "0.875rem" : "0.925rem",
          fontWeight: isActive ? 600 : 400,
          color: isActive ? Colortheme.text : `${Colortheme.text}cc`,
          transition: "all 0.2s ease",
        },
      }),
      [depth, isActive, Colortheme.text]
    );

    const expandIconStyles = useMemo(
      () => ({
        display: "flex",
        alignItems: "center",
        transition: "transform 0.2s ease",
        transform: open ? "rotate(-180deg)" : "none",
        color: `${Colortheme.text}99`,
        // Use hardware acceleration for animations
        willChange: "transform",
      }),
      [open, Colortheme.text]
    );

    return (
      <>
        <ListItemButton onClick={handleLinkClick} sx={listItemButtonStyles}>
          <ListItemText primary={subItem.name} sx={listItemTextStyles} />
          {subItem.subItems.length > 0 && (
            <Box component="span" sx={expandIconStyles}>
              <ExpandMore fontSize="small" />
            </Box>
          )}
        </ListItemButton>
        <Divider sx={{ opacity: 0.5, backgroundColor: Colortheme.text }} />
        <Collapse
          in={open || openItems.includes(subItem.id)}
          timeout={200}
          unmountOnExit
        >
          <List component="div" disablePadding>
            {subItem.subItems.map((item) => (
              <Box key={item.id}>
                <SubItem
                  subItem={item}
                  openItems={openItems}
                  setOpenItems={setOpenItems}
                  toggleDrawer={toggleDrawer}
                  setSearchQuery={setSearchQuery}
                  setSearchInput={setSearchInput}
                  setFilteredItems={setFilteredItems}
                  items={items}
                  depth={depth + 1}
                />
                <Divider
                  sx={{ opacity: 0.5, backgroundColor: Colortheme.text }}
                />
              </Box>
            ))}
          </List>
        </Collapse>
      </>
    );
  }
);

// Memoized DynamicIcon component
const DynamicIcon = React.memo(({ iconName, color }) => {
  const IconComponent = MaterialIcons[iconName];
  if (!IconComponent) return null;
  return (
    <IconComponent
      sx={{
        width: 20,
        height: 20,
        color: color,
        opacity: 0.9,
      }}
    />
  );
});

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

  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    if (!isLoginPage) {
      const fetchItems = async () => {
        try {
          const data = await fetchNavigationItems();
          setItems(data);
          setFilteredItems(data);
        } catch (error) {
          console.error("Error fetching navigation items:", error);
        }
      };
      fetchItems();
    }
  }, [isLoginPage]);

  // Memoize event handlers with useCallback
  const toggleSubItems = useCallback(
    (itemId) => {
      setOpenItems((prevOpenItems) => {
        if (prevOpenItems.includes(itemId)) {
          return prevOpenItems.filter((id) => id !== itemId);
        } else {
          return [itemId];
        }
      });
    },
    [setOpenItems]
  );

  // Memoize filter functions
  const filterItems = useCallback((items, query) => {
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
  }, []);

  const getExpandedIds = useCallback((items, query) => {
    let ids = [];
    items.forEach((item) => {
      if (item.name.toLowerCase().includes(query)) {
        ids.push(item.id);
      }
      if (item.subItems.length > 0) {
        const subItemIds = getExpandedIds(item.subItems, query);
        if (subItemIds.length > 0) {
          ids.push(item.id);
          ids = [...ids, ...subItemIds];
        }
      }
    });
    return ids;
  }, []);

  // Debounced search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput.toLowerCase());
    }, 250);
    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    const query = searchQuery;
    if (query) {
      const filtered = filterItems(items, query);
      const expandedIds = getExpandedIds(filtered, query);
      setFilteredItems(filtered);
      setOpenItems(expandedIds);
    } else {
      setFilteredItems(items);
      setOpenItems([]);
    }
  }, [searchQuery, items, filterItems, getExpandedIds, setOpenItems]);

  const handleSearchChange = useCallback((e) => {
    setSearchInput(e.target.value);
  }, []);

  if (isLoginPage) {
    return null;
  }

  // Memoize styles
  const drawerPaperStyles = {
    width: isMobile ? "280px" : "300px",
    height: "100vh",
    background: isDarkMode
      ? `linear-gradient(165deg, ${Colortheme.secondaryBG}, ${Colortheme.secondaryBG}ee)`
      : "linear-gradient(165deg, #ffffff, #fafafa)",
    borderRight: `1px solid ${Colortheme.text}15`,
    backdropFilter: "blur(8px)",
    // Use hardware acceleration
    transform: "translateZ(0)",
    willChange: "transform",
  };

  const scrollbarStyles = {
    "&::-webkit-scrollbar": {
      width: "5px",
      height: "5px",
    },
    "&::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      background: `${Colortheme.text}22`,
      borderRadius: "24px",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      background: `${Colortheme.text}44`,
    },
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={toggleDrawer}
      PaperProps={{
        style: drawerPaperStyles,
        sx: scrollbarStyles,
      }}
    >
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontSize: "1.25rem",
              fontWeight: 700,
              background: `linear-gradient(45deg, ${Colortheme.text}, ${Colortheme.text}99)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "0.5px",
            }}
          >
            Advanced EON
          </Typography>
          <IconButton
            onClick={toggleDrawer}
            size="small"
            sx={{
              color: Colortheme.text,
              backgroundColor: `${Colortheme.text}10`,
              borderRadius: "12px",
              width: 32,
              height: 32,
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: `${Colortheme.text}20`,
                transform: "scale(1.05)",
              },
              "&:active": {
                transform: "scale(0.95)",
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ px: 3, mb: 3 }}>
          <Paper
            elevation={0}
            sx={{
              backgroundColor: isDarkMode ? `${Colortheme.text}08` : "#f5f5f5",
              borderRadius: 2,
              overflow: "hidden",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: isDarkMode
                  ? `${Colortheme.text}10`
                  : "#f0f0f0",
              },
            }}
          >
            <TextField
              placeholder="Search..."
              value={searchInput}
              onChange={handleSearchChange}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MaterialIcons.Search
                      sx={{
                        width: 18,
                        height: 18,
                        color: `${Colortheme.text}88`,
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiInputBase-root": {
                  height: 44,
                  "& input": {
                    fontSize: "0.875rem",
                    color: Colortheme.text,
                    "&::placeholder": {
                      color: `${Colortheme.text}88`,
                      opacity: 1,
                    },
                  },
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
              }}
            />
          </Paper>
        </Box>

        <List
          sx={{
            px: 2,
            flex: 1,
            overflow: "auto",
            // Optimize scrolling performance
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <React.Fragment key={item.id}>
                {index > 0 && (
                  <Divider
                    sx={{
                      my: 1,
                      opacity: 0.5,
                      backgroundColor: Colortheme.text,
                    }}
                  />
                )}
                <ListItemButton
                  onClick={() => toggleSubItems(item.id)}
                  component={item.link ? Link : "div"}
                  to={item.link}
                  sx={{
                    position: "relative",
                    py: 1.75,
                    px: 2,
                    borderRadius: 2,
                    backgroundColor:
                      location.pathname === item.link
                        ? `${Colortheme.text}15`
                        : "transparent",
                    // Use hardware acceleration and optimize transitions
                    transform: "translateZ(0)",
                    willChange: "background-color, transform",
                    transition: "all 0.2s ease",
                    "&:before": {
                      content: '""',
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "4px",
                      height: "4px",
                      borderRadius: "50%",
                      backgroundColor:
                        location.pathname === item.link
                          ? Colortheme.text
                          : "transparent",
                      transition: "all 0.2s ease",
                    },
                    "&:hover": {
                      backgroundColor: `${Colortheme.text}10`,
                      "&:before": {
                        backgroundColor: Colortheme.text,
                        width: location.pathname === item.link ? "4px" : "6px",
                      },
                    },
                  }}
                  onClickCapture={() => {
                    setSearchQuery("");
                    setFilteredItems(items);
                  }}
                >
                  {item.icon_name && (
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <DynamicIcon
                        iconName={item.icon_name}
                        color={Colortheme.text}
                      />
                    </ListItemIcon>
                  )}
                  <ListItemText
                    primary={item.name}
                    sx={{
                      m: 0,
                      "& .MuiTypography-root": {
                        fontSize: "0.925rem",
                        fontWeight: location.pathname === item.link ? 600 : 500,
                        color:
                          location.pathname === item.link
                            ? Colortheme.text
                            : `${Colortheme.text}cc`,
                        transition: "all 0.2s ease",
                      },
                    }}
                  />
                  {item.subItems?.length > 0 && (
                    <Box
                      component="span"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        // Optimize animations
                        willChange: "transform",
                        transition: "transform 0.2s ease",
                        transform: openItems.includes(item.id)
                          ? "rotate(-180deg)"
                          : "none",
                        color: `${Colortheme.text}99`,
                      }}
                    >
                      <ExpandMore fontSize="small" />
                    </Box>
                  )}
                </ListItemButton>
                <Collapse
                  in={openItems.includes(item.id)}
                  timeout={200}
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    {item.subItems?.map((subItem) => (
                      <SubItem
                        key={subItem.id}
                        subItem={subItem}
                        openItems={openItems}
                        setOpenItems={setOpenItems}
                        toggleDrawer={toggleDrawer}
                        setSearchQuery={setSearchQuery}
                        setSearchInput={setSearchInput}
                        setFilteredItems={setFilteredItems}
                        items={items}
                        depth={1}
                      />
                    ))}
                  </List>
                </Collapse>
              </React.Fragment>
            ))
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: 200,
                opacity: 0.5,
              }}
            >
              <MaterialIcons.SearchOff
                sx={{
                  fontSize: 48,
                  color: Colortheme.text,
                  mb: 2,
                  opacity: 0.5,
                }}
              />
              <Typography
                variant="body1"
                sx={{ color: Colortheme.text, textAlign: "center" }}
              >
                No results found
              </Typography>
            </Box>
          )}
        </List>
      </Box>
    </Drawer>
  );
};

export default React.memo(NewSidebar);
