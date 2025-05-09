import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme,
  useMediaQuery,
  Tooltip,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Modal,
} from "@mui/material";
import dayjs from "dayjs";
import CustomTextField from "../../../CustomTextField";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import CustomDatePicker from "../../../CustomDatePicker";
import CustomCheckbox from "../../../CustomCheckbox";
import { useParams } from "react-router-dom";
import axios from "axios";
import ThemeContext from "../../../../../contexts/ThemeContext";
import styled from "styled-components";
import StyledButton from "../../../StyledButton";
import { useToast } from "../../../../../contexts/ToastContext";
import { useBaseUrl } from "../../../../../contexts/BaseUrl";
import { DataGrid } from "@mui/x-data-grid";
import CircularProgress from "@mui/material/CircularProgress";
import { apiClient } from "../../../../../services/apiClient";

const BoxButton = styled.div`
  ${(props) => {
    return `
      width: ${props.width || (props.isMobile ? "50vw" : "12vw")};
      display: flex;
      justify-content: center;
      align-items: center;
      transition: 0.3s;
      border-radius: ${props.borderRadius || "5px"};
      height: 55px;
      cursor: pointer;
      border: 1px solid ${props.borderColor || props.theme.text};
      color: ${props.color || props.theme.text};
      &:hover {
        background-color: ${props.hoverBgColor || props.theme.text};
        color: ${props.hoverColor || props.theme.background};
        border-radius: ${props.hoverBorderRadius || "10px"};
        font-size: 15px;
        border: 1px solid ${props.borderColorHover || props.theme.text};
      }
    `;
  }}
`;

const CustomScrollbarBox = styled(Box)`
  /* Custom Scrollbar Styles */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.text};
    border-radius: 8px;
  }

  &::-webkit-scrollbar-track {
    background-color: ${({ theme }) => theme.secondaryBG};
  }
`;

const CustomScrollbarDialogContent = styled(DialogContent)`
  /* Custom Scrollbar Styles */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.text};
    border-radius: 8px;
  }

  &::-webkit-scrollbar-track {
    background-color: ${({ theme }) => theme.secondaryBG};
  }
`;

const UserProfileForm = ({ initialData, onSubmit, onCancel }) => {
  const { isGroup } = useParams();
  const isGroupBool = isGroup === "true";
  const { Colortheme } = useContext(ThemeContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isSmallDesktop = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const { showToast, hideToast } = useToast();
  const { baseUrl } = useBaseUrl();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  //   Fetch Options for BranchList and GroupList from API
  const [branchList, setBranchList] = useState([]);
  const [groupList, setGroupList] = useState([]);

  //Counter Link States
  const [counterLink, setCounterLink] = useState([]);
  const [unsavedChanges, setUnsavedChanges] = useState([]);
  const [counterSearchQuery, setCounterSearchQuery] = useState("");

  const filteredCounterLink =
    counterLink &&
    counterLink.filter(
      (branch) =>
        branch.vBranchCode &&
        branch.vBranchCode
          .toLowerCase()
          .includes(counterSearchQuery.toLowerCase())
    );

  // Branch Link States
  const [branchSearchQuery, setBranchSearchQuery] = useState("");
  const [branches, setBranches] = useState([]);
  const [branchLinks, setBranchLinks] = useState([]);
  const [unsavedBranchLinksChanges, setUnsavedBranchLinksChanges] = useState(
    []
  );

  const filteredBranches = branches.filter(
    (branch) =>
      branch.vBranchCode &&
      branch.vBranchCode.toLowerCase().includes(branchSearchQuery.toLowerCase())
  );

  const [expandedSuperParent, setExpandedSuperParent] = useState(null);
  const [selectedParent, setSelectedParent] = useState(null);
  const [navigationItems, setNavigationItems] = useState([]);
  const [groupRights, setGroupRights] = useState({});
  const [userRights, setUserRights] = useState({});
  const [selectAll, setSelectAll] = useState({
    add: false,
    modify: false,
    delete: false,
    view: false,
    export: false,
  });
  const [selectedGroup, setSelectedGroup] = useState(initialData?.nUserID);

  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [codeExists, setCodeExists] = useState(false);
  const [nameExists, setNameExists] = useState(false);
  // Add these state variables at the top with other useState declarations
  const [codeBlurred, setCodeBlurred] = useState(false);
  const [nameBlurred, setNameBlurred] = useState(false);

  const checkAvailability = async (type, value) => {
    if (!value) return;
    try {
      const endpoint = type === "code" ? "/checkCode" : "/checkName";
      const body = type === "code" ? { vUID: value } : { vName: value };
      const response = await apiClient.post(
        `/pages/Master/SystemSetup/${endpoint}`,
        body
      );
      return response.data.exists;
    } catch (error) {
      console.error(`Error checking ${type}:`, error);
      return false;
    }
  };

  const getGridTemplateColumns = () => {
    if (isMobile) return "repeat(1, 1fr)";
    if (isTablet) return "repeat(2, 1fr)";
    if (isSmallDesktop) return "repeat(3, 1fr)";
    if (isLargeDesktop) return "repeat(4, 1fr)";
    return "repeat(5, 1fr)";
  };

  // Fetch Navigation Items
  useEffect(() => {
    const fetchNavigationItems = async () => {
      try {
        const response = await apiClient.get(
          `/pages/Master/SystemSetup/all-navigation`
        );
        setNavigationItems(response.data);
      } catch (error) {
        console.error("Error fetching navigation items:", error);
      }
    };
    fetchNavigationItems();
  }, []);

  // User Counter Link

  useEffect(() => {
    // Fetch the data from the backend
    if (!isGroupBool) {
      apiClient
        .get(
          `/pages/Master/SystemSetup/UserProfile/counters?userId=${selectedGroup}`
        )
        .then((response) => {
          setCounterLink(response.data);
        })
        .catch((error) => {
          console.error("Error fetching data", error);
        });
    }
  }, [isGroupBool, selectedGroup]);

  useEffect(() => {
    if (!isGroupBool) {
      // Fetch all branches
      const fetchBranches = apiClient.get(
        `/pages/Master/SystemSetup/UserProfile/branchesOnUser`
      );
      // Fetch user branch links
      const fetchUserBranchLinks = apiClient.get(
        `/pages/Master/SystemSetup/UserProfile/userBranchLinks?userId=${selectedGroup}`
      );

      Promise.all([fetchBranches, fetchUserBranchLinks])
        .then(([branchesResponse, userBranchLinksResponse]) => {
          const branches = branchesResponse.data;
          const userBranchLinks = userBranchLinksResponse.data;

          // Initialize branchLinks with branches and their active status
          const initializedBranchLinks = branches.map((branch) => {
            const link = userBranchLinks.find(
              (link) => link.nBranchID === branch.nBranchID
            );
            return {
              ...branch,
              bIsActive: link ? link.bIsActive : false,
            };
          });

          setBranches(branches);
          setBranchLinks(initializedBranchLinks);
        })
        .catch((error) => {
          console.error("Error fetching data", error);
        });
    }
  }, [isGroupBool, selectedGroup]);

  const handleUserCounterCheckboxChange = (branchId, counterId, isActive) => {
    // Update the state
    setCounterLink((prevBranches) =>
      prevBranches.map((branch) =>
        branch.nBranchID === branchId
          ? {
              ...branch,
              counters: branch.counters.map((counter) =>
                counter.nCounterID === counterId
                  ? { ...counter, bIsActive: !isActive }
                  : counter
              ),
            }
          : branch
      )
    );

    // Track unsaved changes
    setUnsavedChanges((prevChanges) => [
      ...prevChanges,
      { branchId, counterId, isActive: !isActive },
    ]);
  };

  const handleBranchCheckboxChange = (branchId, isActive) => {
    setBranchLinks((prevLinks) =>
      prevLinks.map((link) =>
        link.nBranchID === branchId ? { ...link, bIsActive: !isActive } : link
      )
    );

    setUnsavedBranchLinksChanges((prevChanges) => [
      ...prevChanges,
      { branchId, isActive: !isActive },
    ]);
  };

  const saveUserBranchLinks = () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    console.log("Unsaved Changes:", unsavedBranchLinksChanges); // Log unsaved changes for debugging
    Promise.all(
      unsavedBranchLinksChanges.map((change) =>
        apiClient.post(
          `/pages/Master/SystemSetup/UserProfile/updateUserBranchLink`,
          {
            userId: selectedGroup,
            branchId: change.branchId,
            isActive: change.isActive,
          }
        )
      )
    )
      .then(() => {
        setUnsavedBranchLinksChanges([]);
        showToast("Changes saved successfully!", "success");
        setTimeout(() => {
          hideToast();
        }, 2000);
        setTimeout(() => {
          setLoading(false);
        }, 500);
      })
      .catch((error) => {
        console.error("Error updating user branch links", error);
        showToast("Failed to save changes.", "error");
        setTimeout(() => {
          hideToast();
        }, 2000);

        setTimeout(() => {
          setLoading(false);
        }, 500);
      });
  };

  const SaveUserCounterLink = () => {
    setLoading(true);
    Promise.all(
      unsavedChanges.map((change) =>
        apiClient.post(
          `/pages/Master/SystemSetup/UserProfile/updateCounterAccess`,
          {
            userId: selectedGroup,
            branchId: change.branchId,
            counterId: change.counterId,
            isActive: change.isActive,
          }
        )
      )
    )
      .then(() => {
        // Clear unsaved changes after successful save
        setUnsavedChanges([]);
        showToast("Changes saved successfully!", "success");
        setTimeout(() => {
          setLoading(false);
        }, 500);
        setTimeout(() => {
          hideToast();
        }, 2000);
      })
      .catch((error) => {
        console.error("Error updating counter access", error);
        showToast("Failed to save changes.", "error");
        setTimeout(() => {
          setLoading(false);
        }, 500);
        setTimeout(() => {
          hideToast();
        }, 2000);
      });
  };

  // User Counter Link END

  useEffect(() => {
    const fetchRights = async () => {
      if (!selectedGroup) return;

      try {
        // The backend requires parentId (which is the navigation parent ID) and userID/groupId
        // Default to 0 as the parent ID to fetch all rights
        const parentId = 0;
        
        const endpoint = isGroupBool
          ? `/pages/Master/SystemSetup/UserProfile/group-rights?groupId=${selectedGroup}&parentId=${parentId}`
          : `/pages/Master/SystemSetup/UserProfile/user-rights?userID=${selectedGroup}&parentId=${parentId}`;

        const response = await apiClient.get(endpoint, {});

        const rightsData = response.data.reduce((acc, item) => {
          acc[item.id] = {
            add: item.add ?? false,
            modify: item.modify ?? false,
            delete: item.delete ?? false,
            view: item.view ?? false,
            export: item.export ?? false,
          };
          return acc;
        }, {});

        // Initialize rights for all navigation items if not present in rightsData
        navigationItems.forEach((item) => {
          if (!rightsData[item.id]) {
            rightsData[item.id] = {
              add: false,
              modify: false,
              delete: false,
              view: false,
              export: false,
            };
          }
        });

        if (isGroupBool) {
          setGroupRights(rightsData);
        } else {
          setUserRights(rightsData);
        }

        const initialSelectAllState = computeInitialSelectAll(rightsData);
        setSelectAll(initialSelectAllState);
      } catch (error) {
        console.error("Error fetching rights:", error);
        // Handle case where rights data is null or undefined
        const initialSelectAllState = computeInitialSelectAll(null);
        setSelectAll(initialSelectAllState);
      }
    };

    fetchRights();
  }, [selectedGroup, isGroupBool, navigationItems]);

  const handleSuperParentClick = (superParent) => {
    setExpandedSuperParent(
      expandedSuperParent === superParent ? null : superParent
    );
    setSelectedParent(null); // Reset selected parent when super parent changes
  };

  const handleParentClick = async (parent) => {
    setLoading(true);
    const token = localStorage.getItem("token");
    setSelectedParent(parent);

    if (isMobile || isTablet || isSmallDesktop) {
      setIsModalOpen(true);
    }

    if (!selectedGroup) {
      console.error("No group selected");
      setLoading(false);
      return;
    }

    try {
      const endpoint = isGroupBool
        ? `/pages/Master/SystemSetup/UserProfile/group-rights?parentId=${parent.id}&groupId=${selectedGroup}`
        : `/pages/Master/SystemSetup/UserProfile/user-rights?parentId=${parent.id}&userID=${selectedGroup}`;

      const response = await apiClient.get(endpoint, {});

      const rightsData = response.data.reduce((acc, item) => {
        acc[item.id] = {
          add: item.add ?? false,
          modify: item.modify ?? false,
          delete: item.delete ?? false,
          view: item.view ?? false,
          export: item.export ?? false,
        };
        return acc;
      }, {});

      // Initialize rights for all navigation items if not present in rightsData
      parent.subItems.forEach((item) => {
        if (!rightsData[item.id]) {
          rightsData[item.id] = {
            add: false,
            modify: false,
            delete: false,
            view: false,
            export: false,
          };
        }
      });

      if (isGroupBool) {
        setGroupRights(rightsData);
        setLoading(false);
      } else {
        setUserRights(rightsData);
        setLoading(false);
      }

      const initialSelectAllState = computeInitialSelectAll(rightsData);
      setSelectAll(initialSelectAllState);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching rights:", error);
      setLoading(false);
    }
  };

  const handleRightsChange = (e) => {
    const { name, checked } = e.target;
    const [id, right] = name.split("_");

    const updateRights = (prevRights) => {
      const updatedRights = {
        ...prevRights,
        [id]: {
          ...prevRights[id],
          [right]: checked,
        },
      };

      // Recalculate the "Select All" state
      const allChecked = Object.values(updatedRights).every(
        (rights) => rights[right]
      );
      setSelectAll((prevSelectAll) => ({
        ...prevSelectAll,
        [right]: allChecked,
      }));

      return updatedRights;
    };

    if (isGroupBool) {
      setGroupRights(updateRights);
    } else {
      setUserRights(updateRights);
    }
  };

  const handleSelectAllChange = (e) => {
    const { name, checked } = e.target;

    setSelectAll((prevSelectAll) => ({
      ...prevSelectAll,
      [name]: checked,
    }));

    const updateRights = (prevRights) => {
      const updatedRights = { ...prevRights };
      for (const id in updatedRights) {
        updatedRights[id][name] = checked;
      }
      return updatedRights;
    };

    if (isGroupBool) {
      setGroupRights(updateRights);
    } else {
      setUserRights(updateRights);
    }
  };

  const computeInitialSelectAll = (rightsData) => {
    const selectAllState = {
      add: true,
      modify: true,
      delete: true,
      view: true,
      export: true,
    };

    if (!rightsData || Object.keys(rightsData).length === 0) {
      // If rightsData is null or empty, assume all rights are not granted
      return {
        add: false,
        modify: false,
        delete: false,
        view: false,
        export: false,
      };
    }

    for (const id in rightsData) {
      selectAllState.add = selectAllState.add && (rightsData[id]?.add ?? true);
      selectAllState.modify =
        selectAllState.modify && (rightsData[id]?.modify ?? true);
      selectAllState.delete =
        selectAllState.delete && (rightsData[id]?.delete ?? true);
      selectAllState.view =
        selectAllState.view && (rightsData[id]?.view ?? true);
      selectAllState.export =
        selectAllState.export && (rightsData[id]?.export ?? true);
    }

    return selectAllState;
  };

  const handleSaveRights = async () => {
    if (!selectedParent || !selectedGroup) return;

    try {
      const endpoint = isGroupBool
        ? `/pages/Master/SystemSetup/UserProfile/update-group-rights`
        : `/pages/Master/SystemSetup/UserProfile/update-user-rights`;

      const rightsData = isGroupBool ? groupRights : userRights;

      const requestBody = isGroupBool
        ? {
            parentId: selectedParent.id,
            groupId: selectedGroup,
            rights: rightsData,
          }
        : {
            parentId: selectedParent.id,
            userID: selectedGroup,
            rights: rightsData,
          };

      await apiClient.post(endpoint, requestBody);
      showToast("Rights updated successfully!", "success");
      setTimeout(() => {
        hideToast();
      }, 2000);
    } catch (error) {
      console.error("Error updating rights:", error);
      showToast("Error updating rights!", "fail");
      setTimeout(() => {
        hideToast();
      }, 2000);
    }
  };

  const renderRightsTable = () => {
    if (!selectedParent) {
      return (
        <CustomScrollbarBox
          display={"flex"}
          width={"100%"}
          height={"100%"}
          textAlign={"center"}
          borderRadius={"20px"}
          sx={{ color: Colortheme.text, fontSize: "20px", fontWeight: "bold" }}
          justifyContent={"center"}
          alignItems={"center"}
        >
          Select a parent item to configure rights
        </CustomScrollbarBox>
      );
    }

    const rightsData = isGroupBool ? groupRights : userRights;

    const rows = selectedParent.subItems.map((child) => ({
      id: child.id,
      name: child.name,
      add: rightsData[child.id]?.add ?? false,
      modify: rightsData[child.id]?.modify ?? false,
      delete: rightsData[child.id]?.delete ?? false,
      view: rightsData[child.id]?.view ?? false,
      export: rightsData[child.id]?.export ?? false,
    }));

    const columns = [
      { field: "name", headerName: "Menu Item", width: 200, sortable: false },
      {
        field: "add",
        headerName: (
          <CustomCheckbox
            name="add"
            label="Add"
            checked={selectAll.add}
            onChange={handleSelectAllChange}
          />
        ),
        width: 150,
        sortable: false,
        renderCell: (params) => (
          <CustomCheckbox
            name={`${params.row.id}_add`}
            checked={params.value || false}
            onChange={handleRightsChange}
          />
        ),
      },
      {
        field: "modify",
        headerName: (
          <CustomCheckbox
            name="modify"
            label="Modify"
            checked={selectAll.modify}
            onChange={handleSelectAllChange}
          />
        ),
        width: 150,
        sortable: false,
        renderCell: (params) => (
          <CustomCheckbox
            name={`${params.row.id}_modify`}
            checked={params.value || false}
            onChange={handleRightsChange}
          />
        ),
      },
      {
        field: "delete",
        headerName: (
          <CustomCheckbox
            name="delete"
            label="Delete"
            checked={selectAll.delete}
            onChange={handleSelectAllChange}
          />
        ),
        width: 150,
        sortable: false,
        renderCell: (params) => (
          <CustomCheckbox
            name={`${params.row.id}_delete`}
            checked={params.value || false}
            onChange={handleRightsChange}
          />
        ),
      },
      {
        field: "view",
        headerName: (
          <CustomCheckbox
            name="view"
            label="View"
            checked={selectAll.view}
            onChange={handleSelectAllChange}
          />
        ),
        width: 150,
        sortable: false,
        renderCell: (params) => (
          <CustomCheckbox
            name={`${params.row.id}_view`}
            checked={params.value || false}
            onChange={handleRightsChange}
          />
        ),
      },
      {
        field: "export",
        headerName: (
          <CustomCheckbox
            name="export"
            label="Export"
            checked={selectAll.export}
            onChange={handleSelectAllChange}
          />
        ),
        width: 150,
        sortable: false,
        renderCell: (params) => (
          <CustomCheckbox
            name={`${params.row.id}_export`}
            checked={params.value || false}
            onChange={handleRightsChange}
          />
        ),
      },
    ];

    return (
      <CustomScrollbarBox style={{ flex: 2, padding: "0 20px" }}>
        <h3 style={{ color: Colortheme.text, textAlign: "center" }}>
          Rights for {selectedParent.name}
        </h3>
        <CustomScrollbarBox style={{ height: 400, width: "100%" }}>
          {loading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "90%",
                alignItems: "center",
                justifyContent: "center",
                width: isMobile ? "95vw" : "auto",
                maxWidth: isMobile ? "75vw" : "100%",
                gap: 2,
                color: Colortheme.text,
              }}
            >
              <CircularProgress
                size="50px"
                style={{ color: Colortheme.text }}
              />
              Please Wait...
            </Box>
          ) : (
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={5}
              disableSelectionOnClick
              sx={{
                backgroundColor: Colortheme.background,
                p: isMobile ? "10px" : "20px",
                maxHeight: "50vh",
                width: isMobile ? "95vw" : "auto",
                maxWidth: isMobile ? "75vw" : "100%",
                border: "2px solid",
                borderColor: Colortheme.background,
                // Custom Scrollbar Styling
                "& .MuiDataGrid-virtualScroller::-webkit-scrollbar": {
                  width: "8px",
                  height: "8px",
                },
                "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb": {
                  backgroundColor: Colortheme.text,
                  borderRadius: "8px",
                },
                "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-track": {
                  backgroundColor: Colortheme.secondaryBG,
                },
                "& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnHeaderTitleContainer":
                  {
                    display: "none",
                  },
                "& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell": {
                  backgroundColor: Colortheme.background,
                  color: Colortheme.text,
                },
                "& .MuiDataGrid-root": {
                  color: Colortheme.text,
                },
                "& .MuiTablePagination-root": {
                  color: Colortheme.text,
                },
                "& .MuiSvgIcon-root": {
                  color: Colortheme.text,
                },
                "& .MuiDataGrid-toolbarContainer": {
                  color: Colortheme.text,
                },
                "& .MuiDataGrid-footerContainer": {
                  backgroundColor: Colortheme.background,
                },
                "& .MuiButtonBase-root": {
                  color: Colortheme.text,
                },
              }}
            />
          )}
        </CustomScrollbarBox>
        <CustomScrollbarBox
          width={"100%"}
          display={"flex"}
          justifyContent={"center"}
          // marginTop={"20px"}
          marginBottom={"20px"}
          gap={5}
        >
          {isMobile && (
            <StyledButton color="primary" onClick={() => setIsModalOpen(false)}>
              Close
            </StyledButton>
          )}

          <StyledButton color="primary" onClick={handleSaveRights}>
            Save
          </StyledButton>
        </CustomScrollbarBox>
      </CustomScrollbarBox>
    );
  };

  const renderNavigationTree = (items) => {
    return items.map((item) => {
      if (
        item.parent_id === null &&
        item.subItems &&
        item.subItems.length > 0
      ) {
        return (
          <CustomScrollbarBox key={item.id}>
            <CustomScrollbarBox
              onClick={() => handleSuperParentClick(item)}
              sx={{
                color: Colortheme.text,
                cursor: "pointer",
                fontSize: "16px",
                marginTop: "10px",
                marginBottom: "10px",
                border: `1px solid ${Colortheme.text}`,
                padding: "10px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {item.name}
              {expandedSuperParent === item ? <ExpandLess /> : <ExpandMore />}
            </CustomScrollbarBox>

            <Collapse
              in={expandedSuperParent === item}
              timeout="auto"
              unmountOnExit
            >
              <CustomScrollbarBox
                display={"flex"}
                flexDirection={"column"}
                width={"100%"}
                alignItems={"center"}
                sx={{
                  transition: "all 0.3s ease",
                }}
              >
                {item.subItems.map((subItem) => (
                  <CustomScrollbarBox
                    key={subItem.id}
                    onClick={() => handleParentClick(subItem)}
                    sx={{
                      color:
                        selectedParent === subItem
                          ? Colortheme.background
                          : Colortheme.text,
                      width: "70%",
                      cursor: "pointer",
                      fontSize: "15px",
                      marginTop: "5px",
                      marginBottom: "5px",
                      border: `1px solid ${Colortheme.text}`,
                      padding: "10px",
                      borderRadius: "10px",
                      backgroundColor:
                        selectedParent === subItem
                          ? Colortheme.text
                          : Colortheme.background,
                    }}
                  >
                    {subItem.name}
                  </CustomScrollbarBox>
                ))}
              </CustomScrollbarBox>
            </Collapse>
          </CustomScrollbarBox>
        );
      }
      return null;
    });
  };

  useEffect(() => {
    const fetchBranchList = async () => {
      try {
        const response = await apiClient.get(
          `/pages/Master/SystemSetup/userProfile/BranchOptions`
        );
        setBranchList(response.data);
      } catch (error) {
        console.error("Error fetching branch list:", error);
      }
    };

    const fetchGroupList = async () => {
      try {
        const response = await apiClient.get(
          `/pages/Master/SystemSetup/userProfile/GroupOptions`
        );
        setGroupList(response.data);
      } catch (error) {
        console.error("Error fetching group list:", error);
      }
    };

    fetchBranchList();
    fetchGroupList();
  }, [baseUrl]);

  const [formData, setFormData] = useState({
    nUserID: "",
    nGroupID: "",
    vUID: "",
    vName: "",
    vCellNo: "",
    vMailID: "",
    bActive: false,
    dValidTill: null,
    bIsGroup: isGroupBool ? true : false,
    nGroupPriority: "",
    nBranchID: "",
    bIsAdministrator: false,
    bCanClearCounter: false,
    bComplianceAuthorization: false,
    bDataEntryAuthorization: false,
    bCreditLimitAuthorization: false,
    bMiscLimitAuthorization: false,
    nCreatedBy: "",
    dCreationDate: null,
    nLastUpdateBy: "",
    dLastUpdateDate: null,
    nTrackingID: "",
    nAPID: "",
    bCanOptCentralM: false,
    BDATAENTRYPRIVILEGE: false,
    bSpecialRights: false,
    nSanctionLimit: "",
    bIsVerified: false,
    nVerifyedby: "",
    dVerifiedDate: null,
    nDeletedby: "",
    bIsDeleted: false,
    dDeleteddate: null,
    isCorporate: false,
    CrpCode: "",
    ref_branchlogin: "",
    ref_finyearlogin: "",
    bIsOrderCreation: false,
    bIsOrderAllotment: false,
    Permission: "",
    Ref_BranchCode: "",
    Ref_finyear: "",
    Otausername: "",
    biskeyuser: "",
    OktaUserName: "",
    DBName: "",
  });
  const [openSectionDialog, setOpenSectionDialog] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nUserID: initialData.nUserID || "",
        nGroupID: initialData.nGroupID || "",
        vUID: initialData.vUID || "",
        vName: initialData.vName || "",
        vCellNo: initialData.vCellNo || "",
        vMailID: initialData.vMailID || "",
        bActive: initialData.bActive || false,
        dValidTill: initialData.dValidTill
          ? dayjs(initialData.dValidTill)
          : null,
        bIsGroup: initialData.bIsGroup || false,
        nGroupPriority: initialData.nGroupPriority || "",
        nBranchID: initialData.nBranchID || "",
        bIsAdministrator: initialData.bIsAdministrator || false,
        bCanClearCounter: initialData.bCanClearCounter || false,
        bComplianceAuthorization: initialData.bComplianceAuthorization || false,
        bDataEntryAuthorization: initialData.bDataEntryAuthorization || false,
        bCreditLimitAuthorization:
          initialData.bCreditLimitAuthorization || false,
        bMiscLimitAuthorization: initialData.bMiscLimitAuthorization || false,
        nCreatedBy: initialData.nCreatedBy || "",
        dCreationDate: initialData.dCreationDate
          ? dayjs(initialData.dCreationDate)
          : null,
        nLastUpdateBy: initialData.nLastUpdateBy || "",
        dLastUpdateDate: initialData.dLastUpdateDate
          ? dayjs(initialData.dLastUpdateDate)
          : null,
        nTrackingID: initialData.nTrackingID || "",
        nAPID: initialData.nAPID || "",
        bCanOptCentralM: initialData.bCanOptCentralM || false,
        BDATAENTRYPRIVILEGE: initialData.BDATAENTRYPRIVILEGE || false,
        bSpecialRights: initialData.bSpecialRights || false,
        nSanctionLimit: initialData.nSanctionLimit || "",
        bIsVerified: initialData.bIsVerified || false,
        nVerifyedby: initialData.nVerifyedby || "",
        dVerifiedDate: initialData.dVerifiedDate
          ? dayjs(initialData.dVerifiedDate)
          : null,
        nDeletedby: initialData.nDeletedby || "",
        bIsDeleted: initialData.bIsDeleted || false,
        dDeleteddate: initialData.dDeleteddate
          ? dayjs(initialData.dDeleteddate)
          : null,
        isCorporate: initialData.isCorporate || false,
        CrpCode: initialData.CrpCode || "",
        ref_branchlogin: initialData.ref_branchlogin || "",
        ref_finyearlogin: initialData.ref_finyearlogin || "",
        bIsOrderCreation: initialData.bIsOrderCreation || false,
        bIsOrderAllotment: initialData.bIsOrderAllotment || false,
        Permission: initialData.Permission || "",
        Ref_BranchCode: initialData.Ref_BranchCode || "",
        Ref_finyear: initialData.Ref_finyear || "",
        Otausername: initialData.Otausername || "",
        biskeyuser: initialData.biskeyuser || "",
        OktaUserName: initialData.OktaUserName || "",
        DBName: initialData.DBName || "",
        isGroup: isGroupBool,
      });
    }
  }, [initialData]);

  // -----------------------------------------------SAVING WITH FIELD ERRORS AND VALIDATION START---------------------------------------------

  const [fieldErrors, setFieldErrors] = useState({
    vCode: false,
    vName: false,
    vBranchCode: false,
    dIntdate: false,
    bActive: false,
    bIND: false,
    vAddress1: false,
    vAddress2: false,
    vAddress3: false,
    vPinCode: false,
    vPhone: false,
    vFax: false,
    vEmail: false,
    vDesign: false,
    vGrpcode: false,
    vEntityType: false,
    vBusinessNature: false,
    bSaleParty: false,
    bPurchaseParty: false,
    bEEFCClient: false,
    bPrintAddress: false,
    vLocation: false,
    vWebsite: false,
    vCreditPolicy: false,
    nCREDITLIM: false,
    nCREDITDAYS: false,
    nAddCreditLimit: false,
    nAddCreditDays: false,
    nTxnSaleLimit: false,
    nTxnPurLimit: false,
    nChqTxnlimt: false,
    vKYCApprovalNumber: false,
    vKYCRiskCategory: false,
    nHandlingCharges: false,
    bTDSDED: false,
    nTDSPER: false,
    vTDSGroup: false,
    bServiceTax: false,
    bIGSTOnly: false,
    cGSTNO: false,
    sGSTNO: false,
    iGSTNO: false,
    vState: false,
    AccHolderName: false,
    BankName: false,
    AccNumber: false,
    IFSCCode: false,
    BankAddress: false,
    CancelledChequecopy: false,
    vPanName: false,
    dPanDOB: false,
    vPan: false,
    nMrktExecutive: false,
    nBranchID: false,
    bEnableBlockDate: false,
    dBlockDate: false,
    dEstblishDate: false,
    Remarks: false,
    vRegno: false,
    dRegdate: false,
    bExportParty: false,
    bEnforcement: false,
  });

  const handleSaveControlDetails = () => {
    // Proceed with save logic
    console.log("Saving Control Details:", formData);
    handleDialogClose();
    // Example: saveFormDataToBackend(formData);
  };

  // -----------------------------------------------FIELD ERRORS AND VALIDATION END---------------------------------------------

  // const handleChange = (e) => {
  //   const { name, value, type, checked } = e.target;
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     [name]: type === "checkbox" ? checked : value,
  //   }));
  //   setFieldErrors({
  //     ...fieldErrors,
  //     [name]: false,
  //   });
  // };

  useEffect(() => {
    if (formData.bIsAdministrator) {
      setFormData((prevData) => {
        const updatedData = { ...prevData };
        const checkboxes = [
          "bMiscLimitAuthorization",
          "bCanClearCounter",
          "bComplianceAuthorization",
          "bDataEntryAuthorization",
          "bCreditLimitAuthorization",
          "bCanOptCentralM",
          "BDATAENTRYPRIVILEGE",
          "bSpecialRights",
          "bIsOrderCreation",
          "bIsOrderAllotment",
        ];

        checkboxes.forEach((checkbox) => {
          updatedData[checkbox] = true;
        });

        return updatedData;
      });
    }
  }, [formData.bIsAdministrator]);

  // const handleChange = (e) => {
  //   const { name, value, type, checked } = e.target;

  //   setFormData((prevData) => {
  //     const updatedData = {
  //       ...prevData,
  //       [name]: type === "checkbox" ? checked : value,
  //     };

  //     if (name === "bIsAdministrator") {
  //       const checkboxes = [
  //         "bMiscLimitAuthorization",
  //         "bCanClearCounter",
  //         "bComplianceAuthorization",
  //         "bDataEntryAuthorization",
  //         "bCreditLimitAuthorization",
  //         "bCanOptCentralM",
  //         "BDATAENTRYPRIVILEGE",
  //         "bSpecialRights",
  //         "bIsOrderCreation",
  //         "bIsOrderAllotment",
  //       ];

  //       checkboxes.forEach((checkbox) => {
  //         updatedData[checkbox] = checked;
  //       });
  //     }

  //     return updatedData;
  //   });

  //   setFieldErrors((prevErrors) => ({
  //     ...prevErrors,
  //     [name]: false,
  //   }));
  // };

  // const handleChange = async (e) => {
  //   const { name, value, type, checked } = e.target;

  //   setFormData((prevData) => {
  //     const updatedData = {
  //       ...prevData,
  //       [name]: type === "checkbox" ? checked : value,
  //     };

  //     if (name === "bIsAdministrator") {
  //       const checkboxes = [
  //         "bMiscLimitAuthorization",
  //         "bCanClearCounter",
  //         "bComplianceAuthorization",
  //         "bDataEntryAuthorization",
  //         "bCreditLimitAuthorization",
  //         "bCanOptCentralM",
  //         "BDATAENTRYPRIVILEGE",
  //         "bSpecialRights",
  //         "bIsOrderCreation",
  //         "bIsOrderAllotment",
  //       ];

  //       checkboxes.forEach((checkbox) => {
  //         updatedData[checkbox] = checked;
  //       });
  //     }

  //     return updatedData;
  //   });

  //   setFieldErrors((prevErrors) => ({
  //     ...prevErrors,
  //     [name]: false,
  //   }));

  //   // Add availability checks for code and name
  //   if (name === "vUID" && value) {
  //     setIsCheckingCode(true);
  //     const exists = await checkAvailability("code", value);
  //     setCodeExists(exists);
  //     setFieldErrors((prev) => ({
  //       ...prev,
  //       vUID: exists ? "This code is already in use" : false,
  //     }));
  //     setIsCheckingCode(false);
  //   } else if (name === "vName" && value) {
  //     setIsCheckingName(true);
  //     const exists = await checkAvailability("name", value);
  //     setNameExists(exists);
  //     setFieldErrors((prev) => ({
  //       ...prev,
  //       vName: exists ? "This name is already in use" : false,
  //     }));
  //     setIsCheckingName(false);
  //   }
  // };

  // Add these handlers for blur events
  const handleBlur = async (e) => {
    const { name, value } = e.target;

    if (!value) return;

    if (name === "vUID") {
      setCodeBlurred(true);
      setIsCheckingCode(true);
      const exists = await checkAvailability("code", value);
      setCodeExists(exists);
      setFieldErrors((prev) => ({
        ...prev,
        vUID: exists ? "This code is already in use" : false,
      }));
      setIsCheckingCode(false);
    } else if (name === "vName") {
      setNameBlurred(true);
      setIsCheckingName(true);
      const exists = await checkAvailability("name", value);
      setNameExists(exists);
      setFieldErrors((prev) => ({
        ...prev,
        vName: exists ? "This name is already in use" : false,
      }));
      setIsCheckingName(false);
    }
  };

  // Modify handleChange to remove the availability checks
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "vUID") {
      setCodeBlurred(false);
    } else if (name === "vName") {
      setNameBlurred(false);
    }

    setFormData((prevData) => {
      const updatedData = {
        ...prevData,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "bIsAdministrator") {
        const checkboxes = [
          "bMiscLimitAuthorization",
          "bCanClearCounter",
          "bComplianceAuthorization",
          "bDataEntryAuthorization",
          "bCreditLimitAuthorization",
          "bCanOptCentralM",
          "BDATAENTRYPRIVILEGE",
          "bSpecialRights",
          "bIsOrderCreation",
          "bIsOrderAllotment",
        ];

        checkboxes.forEach((checkbox) => {
          updatedData[checkbox] = checked;
        });
      }

      return updatedData;
    });

    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      [name]: false,
    }));
  };

  const handleValidTillDateChange = (date) => {
    setFormData((prevData) => ({
      ...prevData,
      dValidTill: date,
    }));
  };

  const handleSectionEdit = (section) => {
    setOpenSectionDialog(section);
  };

  const handleDialogClose = () => {
    setOpenSectionDialog(null);
  };

  // //   Create a function to validate all fields in the form
  // const validateAllFields = () => {
  //   const requiredKeys = ["vUID", "vName"];
  //   let allFieldsValid = true;
  //   requiredKeys.forEach((key) => {
  //     if (formData[key] === "" || formData[key] === null) {
  //       allFieldsValid = false;
  //     }
  //   });
  //   return allFieldsValid;
  // };

  const validateAllFields = () => {
    const requiredKeys = ["vUID", "vName"];
    let allFieldsValid = true;

    requiredKeys.forEach((key) => {
      if (formData[key] === "" || formData[key] === null) {
        allFieldsValid = false;
      }
    });

    // Check if code or name exists
    if (codeExists || nameExists) {
      allFieldsValid = false;
    }

    return allFieldsValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isValid = validateAllFields();
    if (isValid) {
      onSubmit(formData);
    } else {
      console.log("ERROR IN FORM DETAILS");
      showToast("Enter All Required Details!", "fail");
      setTimeout(() => {
        hideToast();
      }, 2000);
    }
  };

  const columns = [
    { field: "nCounterID", headerName: "Counter ID", flex: 1 },
    {
      field: "bIsActive",
      headerName: "Active",
      flex: 1,
      renderCell: (params) => (
        <CustomCheckbox
          checked={params.value}
          onChange={() =>
            handleUserCounterCheckboxChange(
              params.row.nBranchID,
              params.row.nCounterID,
              params.value
            )
          }
          sx={{
            color: Colortheme.text,
            "&.Mui-checked": {
              color: Colortheme.text,
            },
          }}
        />
      ),
    },
  ];

  const renderSectionFields = () => {
    switch (openSectionDialog) {
      case "Control Setup":
        return (
          <>
            <CustomCheckbox
              name="bIsAdministrator"
              label="is Admin?"
              checked={formData.bIsAdministrator}
              onChange={handleChange}
            />

            <CustomCheckbox
              name="bMiscLimitAuthorization"
              label="Misc Limit Authorization?"
              checked={formData.bMiscLimitAuthorization}
              onChange={handleChange}
              disabled={formData.bIsAdministrator}
            />

            <CustomCheckbox
              name="bCanClearCounter"
              label="Can Clear Counter?"
              checked={formData.bCanClearCounter}
              onChange={handleChange}
              disabled={formData.bIsAdministrator}
            />

            <CustomCheckbox
              name="bComplianceAuthorization"
              label="Compliance Authorization?"
              checked={formData.bComplianceAuthorization}
              onChange={handleChange}
              disabled={formData.bIsAdministrator}
            />

            <CustomCheckbox
              name="bDataEntryAuthorization"
              label="Data Entry Authorization?"
              checked={formData.bDataEntryAuthorization}
              onChange={handleChange}
              disabled={formData.bIsAdministrator}
            />

            <CustomCheckbox
              name="bCreditLimitAuthorization"
              label="Credit Limit Authorization?"
              checked={formData.bCreditLimitAuthorization}
              onChange={handleChange}
              disabled={formData.bIsAdministrator}
            />

            <CustomCheckbox
              name="bCanOptCentralM"
              label="Can Operate Central Master?"
              checked={formData.bCanOptCentralM}
              onChange={handleChange}
              disabled={formData.bIsAdministrator}
            />

            <CustomCheckbox
              name="BDATAENTRYPRIVILEGE"
              label="Data Entry Privilege?"
              checked={formData.BDATAENTRYPRIVILEGE}
              onChange={handleChange}
              disabled={formData.bIsAdministrator}
            />
            <CustomCheckbox
              name="bSpecialRights"
              label="Special Rights For Card?"
              checked={formData.bSpecialRights}
              onChange={handleChange}
              disabled={formData.bIsAdministrator}
            />

            <CustomCheckbox
              name="bIsOrderCreation"
              label="Order Creation Allowed?"
              checked={formData.bIsOrderCreation}
              onChange={handleChange}
              disabled={formData.bIsAdministrator}
            />
            <CustomCheckbox
              name="bIsOrderAllotment"
              label="Order Allotment Allowed?"
              checked={formData.bIsOrderAllotment}
              onChange={handleChange}
              disabled={formData.bIsAdministrator}
            />
          </>
        );

      case "Rights":
        return (
          <>
            <CustomScrollbarBox
              style={{ display: "flex", width: "100%", gap: 15 }}
            >
              <CustomScrollbarBox
                border={`1px solid ${Colortheme.text}`}
                borderRadius={"20px"}
                maxHeight={"80%"}
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  padding: isMobile ? "10px" : "20px",
                  minWidth: isMobile ? "80%" : "25%", // Set a minimum width for mobile and larger screens
                }}
              >
                <Box
                  sx={{
                    color: Colortheme.text,
                    textAlign: "center",
                    fontWeight: "bold",
                    marginBottom: "10px",
                  }}
                >
                  Menu of rights (click to select)
                </Box>
                <CustomScrollbarBox
                  sx={{
                    width: "100%",
                    backgroundColor: Colortheme.text,
                    height: "0.5px",
                    marginBottom: "25px",
                  }}
                />
                {renderNavigationTree(navigationItems)}
              </CustomScrollbarBox>

              {!isMobile && !isTablet && !isSmallDesktop && (
                <CustomScrollbarBox
                  sx={{
                    flex: 2,
                    width: "100%",
                    maxHeight: "80%",
                  }}
                  border={`1px solid ${Colortheme.text}`}
                  borderRadius={"20px"}
                >
                  {renderRightsTable()}
                </CustomScrollbarBox>
              )}
            </CustomScrollbarBox>

            <Modal
              open={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  backgroundColor: Colortheme.background,
                  padding: "20px",
                  borderRadius: "20px",
                  width: "80%",
                  maxHeight: "80vh",
                  overflowY: "auto",
                  margin: "20px auto",
                }}
              >
                {renderRightsTable()}
              </Box>
            </Modal>
          </>
        );

      case "Branch Link":
        return (
          <Box display={"flex"} flexDirection={"column"} alignItems={"center"}>
            <CustomTextField
              label="Search by Branch Code"
              variant="outlined"
              value={branchSearchQuery}
              onChange={(e) => setBranchSearchQuery(e.target.value)}
              style={{ width: isMobile ? "90%" : "50%", marginBottom: "20px" }}
            />
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  height: "90%",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 5,
                }}
              >
                <CircularProgress
                  size="50px"
                  style={{ color: Colortheme.text }}
                />
              </Box>
            ) : (
              <Box
                display="grid"
                gridTemplateColumns={getGridTemplateColumns()}
                gap={isMobile ? 1 : 2}
                width="100%"
                marginTop={"20px"}
              >
                {filteredBranches.map((branch) => {
                  const link =
                    branchLinks.find(
                      (link) => link.nBranchID === branch.nBranchID
                    ) || {};
                  return (
                    <Box
                      key={branch.nBranchID}
                      style={{ marginBottom: "20px" }}
                      width={"90%"}
                      display={"flex"}
                      flexDirection={"column"}
                      alignItems={"center"}
                      border={`1px solid ${Colortheme.text}`}
                      borderRadius={"10px"}
                      p={1}
                    >
                      <h3
                        style={{ color: Colortheme.text, textAlign: "center" }}
                      >
                        Branch Code : {branch.vBranchCode}
                      </h3>
                      <Box
                        sx={{
                          height: "0.5px",
                          width: "50%",
                          backgroundColor: Colortheme.text,
                          marginBottom: "20px",
                        }}
                      />
                      <CustomCheckbox
                        name={`branch-${branch.nBranchID}`}
                        label={"Active"}
                        checked={link.bIsActive || false}
                        onChange={() =>
                          handleBranchCheckboxChange(
                            branch.nBranchID,
                            link.bIsActive
                          )
                        }
                      />
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        );

      case "Counter Link":
        return (
          <Box display={"flex"} flexDirection={"column"} alignItems={"center"}>
            <CustomTextField
              label="Search by Branch Code"
              variant="outlined"
              value={counterSearchQuery}
              onChange={(e) => setCounterSearchQuery(e.target.value)}
              style={{
                width: isMobile ? "100%" : "50%",
                marginBottom: "20px",
              }}
            />
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  height: "90%",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 5,
                }}
              >
                <CircularProgress
                  size="50px"
                  style={{ color: Colortheme.text }}
                />
              </Box>
            ) : (
              <Box
                display="grid"
                gridTemplateColumns={getGridTemplateColumns()}
                gap={isMobile ? 5 : 15}
                width="100%"
                marginTop={"20px"}
              >
                {filteredCounterLink.map((branch) => (
                  <Box
                    key={branch.nBranchID}
                    style={{ marginBottom: "20px" }}
                    width={"100%"}
                    display={"flex"}
                    flexDirection={"column"}
                    alignItems={"center"}
                    border={`1px solid ${Colortheme.text}`}
                    borderRadius={"10px"}
                    p={isMobile ? 0 : 1}
                  >
                    <h3 style={{ color: Colortheme.text }}>
                      {branch.vBranchCode}
                    </h3>
                    <Box
                      sx={{
                        height: "0.5px",
                        width: "50%",
                        backgroundColor: Colortheme.text,
                        marginBottom: "20px",
                      }}
                    />
                    <TableContainer
                      component={Paper}
                      style={{
                        backgroundColor: Colortheme.background,
                      }}
                    >
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell style={{ color: Colortheme.text }}>
                              Counter ID
                            </TableCell>
                            <TableCell style={{ color: Colortheme.text }}>
                              Active
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {branch.counters.map((counter) => (
                            <TableRow key={counter.nCounterID}>
                              <TableCell style={{ color: Colortheme.text }}>
                                {counter.nCounterID}
                              </TableCell>
                              <TableCell>
                                <CustomCheckbox
                                  name={`counter-${counter.nCounterID}`}
                                  checked={counter.bIsActive}
                                  onChange={() =>
                                    handleUserCounterCheckboxChange(
                                      branch.nBranchID,
                                      counter.nCounterID,
                                      counter.bIsActive
                                    )
                                  }
                                  sx={{
                                    color: Colortheme.text,
                                    "&.Mui-checked": {
                                      color: Colortheme.text,
                                    },
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        );
      default:
        return null;
    }
  };

  const handleClose = (event, reason) => {
    if (reason && reason === "backdropClick") return;
    handleDialogClose();
  };

  return (
    <form onSubmit={handleSubmit}>
      <CustomScrollbarBox
        display={"grid"}
        sx={{
          overflowX: "hidden",
          backgroundColor: Colortheme.background,
         
        }}
        gridTemplateColumns={isMobile ? "repeat(1, 1fr)" : "repeat(4, 1fr)"}
        gridTemplateRows={"repeat(3, 1fr)"}
        columnGap={"60px"}
        rowGap={"20px"}
        p={1}
      >
        {/* // If isGroup is true then render fields for vCode(Textfield),
        vName(Textfield), bActive(Checkbox), SanctionLimit(textfield) else
        render fields for isGroup = false */}
        {isGroupBool ? (
          <>
            {/* <CustomTextField
              name="vUID"
              label="Code"
              value={formData.vUID}
              onChange={handleChange}
              fullWidth
              error={codeExists}
              helperText={
                fieldErrors.vUID ||
                (isCheckingCode ? "Checking availability..." : "")
              }
              required
              InputProps={{
                endAdornment: isCheckingCode && <CircularProgress size={20} sx={{color: Colortheme.text}}/>,
              }}
            />

            <CustomTextField
              name="vName"
              label="Name"
              value={formData.vName}
              onChange={handleChange}
              fullWidth
              error={!!fieldErrors.vName || nameExists}
              helperText={
                fieldErrors.vName ||
                (isCheckingName ? "Checking availability..." : "")
              }
              required
              InputProps={{
                endAdornment: isCheckingName && <CircularProgress size={20} />,
              }}
            /> */}

            <CustomTextField
              name="vUID"
              label="Code"
              value={formData.vUID}
              onChange={handleChange}
              onBlur={handleBlur}
              fullWidth
              error={!!fieldErrors.vUID || codeExists}
              helperText={
                fieldErrors.vUID ||
                (isCheckingCode
                  ? "Checking availability..."
                  : formData.vUID && !codeExists && codeBlurred
                  ? "Code Available"
                  : "")
              }
              required
              InputProps={{
                endAdornment: isCheckingCode && (
                  <CircularProgress size={20} sx={{ color: Colortheme.text }} />
                ),
              }}
            />

            <CustomTextField
              name="vName"
              label="Name"
              value={formData.vName}
              onChange={handleChange}
              onBlur={handleBlur}
              fullWidth
              error={!!fieldErrors.vName || nameExists}
              helperText={
                fieldErrors.vName ||
                (isCheckingName
                  ? "Checking availability..."
                  : formData.vName && !nameExists && nameBlurred
                  ? "Name Available"
                  : "")
              }
              required
              InputProps={{
                endAdornment: isCheckingName && <CircularProgress size={20} />,
              }}
            />

            <CustomCheckbox
              name="bActive"
              label="Active"
              checked={formData.bActive}
              onChange={handleChange}
            />

            <CustomTextField
              name="nSanctionLimit"
              label="Sanction Limit"
              value={formData.nSanctionLimit}
              onChange={handleChange}
              fullWidth
              error={fieldErrors.nSanctionLimit}
              helperText={
                fieldErrors.nSanctionLimit ? "Enter Valid Sanction Limit!" : ""
              }
            />

            {initialData && (
              <CustomScrollbarBox>
                <BoxButton
                  isMobile={isMobile}
                  onClick={() => handleSectionEdit("Rights")}
                  borderColor={"#00d3ff"}
                  borderRadius="8px" // Custom border radius
                >
                  {isGroupBool ? "Edit Group Rights" : "Edit User Rights"}
                </BoxButton>
              </CustomScrollbarBox>
            )}
          </>
        ) : (
          <>
            <CustomTextField
              name="vUID"
              label="Code"
              value={formData.vUID}
              onChange={handleChange}
              onBlur={handleBlur}
              fullWidth
              error={!!fieldErrors.vUID || codeExists}
              helperText={
                fieldErrors.vUID ||
                (isCheckingCode
                  ? "Checking availability..."
                  : formData.vUID && !codeExists && codeBlurred
                  ? "Code Available"
                  : "")
              }
              required
              InputProps={{
                endAdornment: isCheckingCode && (
                  <CircularProgress size={20} sx={{ color: Colortheme.text }} />
                ),
              }}
            />

            <CustomTextField
              name="vName"
              label="Name"
              value={formData.vName}
              onChange={handleChange}
              onBlur={handleBlur}
              fullWidth
              error={!!fieldErrors.vName || nameExists}
              helperText={
                fieldErrors.vName ||
                (isCheckingName
                  ? "Checking availability..."
                  : formData.vName && !nameExists && nameBlurred
                  ? "Name Available"
                  : "")
              }
              required
              InputProps={{
                endAdornment: isCheckingName && <CircularProgress size={20} />,
              }}
            />

            {/* Add Cellno, emailId, branch(select), ValidtillDate(date), GroupId(select), active (checkbox), Control Setup Checkboxes */}
            <CustomTextField
              name="vCellNo"
              label="Cell No"
              value={formData.vCellNo}
              onChange={handleChange}
              fullWidth
              error={fieldErrors.vCellNo}
              helperText={fieldErrors.vCellNo ? "Enter Valid Cell No!" : ""}
            />

            <CustomTextField
              name="vMailID"
              label="Email Id"
              value={formData.vMailID}
              onChange={handleChange}
              fullWidth
              error={fieldErrors.vMailID}
              helperText={fieldErrors.vMailID ? "Enter Valid Email Id!" : ""}
            />

            <CustomTextField
              name="nBranchID"
              label="Branch"
              value={formData.nBranchID}
              onChange={handleChange}
              fullWidth
              select
              required
              error={fieldErrors.nBranchID}
              helperText={fieldErrors.nBranchID ? "Select Branch!" : ""}
            >
              {branchList.map((item) => (
                <MenuItem key={item} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </CustomTextField>

            <CustomDatePicker
              name="dValidTill"
              label="Valid Till Date"
              value={formData.dValidTill}
              onChange={handleValidTillDateChange}
            />

            <CustomTextField
              name="nGroupID"
              label="Group"
              value={formData.nGroupID}
              onChange={handleChange}
              fullWidth
              select
              required
              error={fieldErrors.nGroupID}
              helperText={fieldErrors.nGroupID ? "Select Group !" : ""}
            >
              {groupList.map((item) => (
                <MenuItem key={item} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </CustomTextField>

            <CustomCheckbox
              name="bActive"
              label="Active"
              checked={formData.bActive}
              onChange={handleChange}
            />

            <CustomScrollbarBox>
              <BoxButton
                isMobile={isMobile}
                onClick={() => handleSectionEdit("Control Setup")}
              >
                Control Setup
              </BoxButton>
            </CustomScrollbarBox>

            {initialData && (
              <CustomScrollbarBox>
                <BoxButton
                  isMobile={isMobile}
                  onClick={() => handleSectionEdit("Rights")}
                  borderColor={"#00d3ff"}
                  borderRadius="8px" // Custom border radius
                >
                  {isGroupBool ? "Edit Group Rights" : "Edit User Rights"}
                </BoxButton>
              </CustomScrollbarBox>
            )}

            {initialData && (
              <CustomScrollbarBox>
                <BoxButton
                  isMobile={isMobile}
                  onClick={() => handleSectionEdit("Branch Link")}
                  borderColor={"#00d3ff"}
                  borderRadius="8px" // Custom border radius
                >
                  Branch Link
                </BoxButton>
              </CustomScrollbarBox>
            )}

            {initialData && (
              <CustomScrollbarBox>
                <BoxButton
                  isMobile={isMobile}
                  onClick={() => handleSectionEdit("Counter Link")}
                  borderColor={"#00d3ff"}
                  borderRadius="8px" // Custom border radius
                >
                  Counter Link
                </BoxButton>
              </CustomScrollbarBox>
            )}
          </>
        )}
      </CustomScrollbarBox>
      <CustomScrollbarBox
        display={"flex"}
        justifyContent={"center"}
        marginTop={15}
      >
        <CustomScrollbarBox
          display={"flex"}
          width={isMobile ? "100%" : "60%"}
          gap={5}
          justifyContent={"center"}
        >
          <StyledButton onClick={onCancel}>Cancel</StyledButton>
          <StyledButton type="submit" variant="contained" color="primary">
            Submit
          </StyledButton>
        </CustomScrollbarBox>
      </CustomScrollbarBox>

      <Dialog
        open={!!openSectionDialog}
        onClose={handleClose}
        maxWidth={false}
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            padding: isMobile ? 1 : 2,
            width: "90vw",
            backgroundColor: Colortheme.background,
            overflowX: "hidden",
            border: `1px solid ${Colortheme.text}`,
            borderRadius: "15px",
          },
        }}
      >
        <DialogTitle
          sx={{
            width: isMobile ? "80%" : "95%",
            alignSelf: "center",
            display: "flex",
            justifyContent: "center",
            color: Colortheme.text,
            border: `1px solid ${Colortheme.text}`,
            borderRadius: "10px",
            fontFamily: "Poppins",
            fontWeight: 400,
          }}
        >
          {openSectionDialog ? `Edit ${openSectionDialog}` : openSectionDialog}
        </DialogTitle>
        <CustomScrollbarDialogContent>
          <CustomScrollbarBox
            sx={
              openSectionDialog !== "Rights" &&
              openSectionDialog !== "Counter Link" &&
              openSectionDialog !== "Branch Link"
                ? {
                    marginTop: 2,
                    border: `1px solid ${Colortheme.text}`,
                    borderRadius: "10px",
                    padding: 5,
                    display: "grid",
                    overflow: "initial",
                    backgroundColor: Colortheme.background,
                    gridTemplateColumns: isMobile
                      ? "repeat(1, 1fr)"
                      : "repeat(4, 1fr)",
                    gridTemplateRows: "auto",
                    rowGap: "25px",
                  }
                : {
                    // padding: isMobile ? 0 : 5,
                    // border: `1px solid ${Colortheme.text}`,
                    borderRadius: isMobile ? "20px" : "10px",
                    marginTop: 2,
                  }
            }
          >
            {renderSectionFields()}
          </CustomScrollbarBox>
        </CustomScrollbarDialogContent>
        <DialogActions
          sx={{
            alignSelf: "center",
            display: "flex",
            justifyContent: "center",
            width: isMobile ? "100%" : "50%",
            gap: isMobile ? 3 : 10,
            marginBottom: 2, // Add some margin to ensure proper spacing
          }}
        >
          <StyledButton onClick={handleDialogClose}>Close</StyledButton>
          {openSectionDialog === "Control Setup" && (
            <StyledButton
              onClick={handleSaveControlDetails}
              variant="contained"
              color="primary"
            >
              Okay
            </StyledButton>
          )}

          {openSectionDialog === "Counter Link" && (
            <StyledButton
              onClick={SaveUserCounterLink}
              disabled={unsavedChanges.length === 0}
              style={{
                backgroundColor: Colortheme.buttonBg,
                color: Colortheme.buttonText,
                cursor: unsavedChanges.length === 0 ? "not-allowed" : "pointer",
              }}
            >
              Save Changes
            </StyledButton>
          )}

          {openSectionDialog === "Branch Link" && (
            <StyledButton
              onClick={saveUserBranchLinks}
              disabled={unsavedBranchLinksChanges.length === 0}
              style={{
                backgroundColor: Colortheme.buttonBg,
                color: Colortheme.buttonText,
                cursor:
                  unsavedBranchLinksChanges.length === 0
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              Save Changes
            </StyledButton>
          )}
        </DialogActions>
      </Dialog>
    </form>
  );
};

export default UserProfileForm;
