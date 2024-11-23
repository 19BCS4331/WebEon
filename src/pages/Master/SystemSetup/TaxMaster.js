import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import MainContainerCompilation from "../../../components/global/MainContainerCompilation";
import { Box, Tooltip, useMediaQuery, useTheme } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import ThemeContext from "../../../contexts/ThemeContext";
import StyledButton from "../../../components/global/StyledButton";
import CustomTextField from "../../../components/global/CustomTextField";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import LazyFallBack from "../../LazyFallBack";

import { useToast } from "../../../contexts/ToastContext";
import CustomAlertModal from "../../../components/CustomAlertModal";
import TaxMasterForm from "../../../components/global/FormConfig/Master/SystemSetup/TaxMasterForm";
import { apiClient } from "../../../services/apiClient";
import CustomDataGrid from "../../../components/global/CustomDataGrid";
const TaxMaster = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { Colortheme } = useContext(ThemeContext);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectionModel, setSelectionModel] = useState([]);
  const [rows, setRows] = useState([]);
  const [rowid, SetRowid] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { showAlertDialog, hideAlertDialog, showToast, hideToast } = useToast();
  const navigate = useNavigate();
  // Add this with your other state declarations at the top of the component
  const [taxSlabs, setTaxSlabs] = useState([]);

  useEffect(() => {
    setLoading(true);
    apiClient
      .get(`/pages/Master/SystemSetup/taxMaster`)
      .then((response) => {
        setRows(response.data.filter((row) => row.nTaxID));
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
        showToast("Error fetching data", "error");
        setTimeout(() => {
          hideToast();
        }, 2000);
      });
  }, []);

  // Add this function near your other fetch-related functions
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(
        "/pages/Master/SystemSetup/taxMaster"
      );
      setRows(response.data.filter((row) => row.nTaxID));
      setSearchKeyword("");
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast("Error fetching data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectionModelChange = (newSelection) => {
    setSelectionModel(newSelection);
  };

  const handleSearchChange = (event) => {
    setSearchKeyword(event.target.value);
  };

  const handleAdd = () => {
    setEditData(null);
    setShowForm(true);
  };

  const handleEdit = (row) => {
    setEditData(row);
    setShowForm(true);
  };

  const handleDeleteClick = (row) => {
    const rowid = row.nTaxID;
    console.log("Delete button clicked for ID:", row.nTaxID);
    showAlertDialog(`Delete the Product : ${row.DESCRIPTION} `, "", () =>
      DeleteFunc(rowid)
    );
  };

  const DeleteFunc = async (nTaxID) => {
    setLoading(true);
    try {
      const response = await apiClient.post(
        `/pages/Master/SystemSetup/taxMaster/delete`,
        { nTaxID: nTaxID }
      );
      console.log(response.data);
      setRows((prev) => prev.filter((row) => row.nTaxID !== nTaxID));
      setLoading(false);
      showToast("Successfully Deleted!", "success");
      setTimeout(() => {
        hideToast();
      }, 2000);
      hideAlertDialog();
      setSearchKeyword("");
    } catch (error) {
      console.log(error);
      setLoading(false);
      hideAlertDialog();
      showToast("Error deleting data", "error");
      setTimeout(() => {
        hideToast();
      }, 2000);
    }
  };

  const handleFormSubmitSlabs = async (slabsData, taxID) => {
    try {
      // Delete existing slabs if any (for edit case)
      if (editData?.nTaxID) {
        await apiClient.post(
          `/pages/Master/SystemSetup/taxMaster/taxSlabs/delete`,
          { nTaxID: editData.nTaxID }
        );
      }

      // Add all new slabs
      if (slabsData.length > 0) {
        await Promise.all(
          slabsData.map((slab) => {
            const slabData = {
              SRNO: slab.SRNO,
              FROMAMT: slab.FROMAMT,
              TOAMT: slab.TOAMT,
              VALUE: slab.VALUE,
              BASEVALUE: slab.BASEVALUE,
              nTaxID: taxID,
            };
            return apiClient.post(
              "/pages/Master/SystemSetup/taxMaster/taxSlabs",
              slabData
            );
          })
        );
      }
    } catch (error) {
      console.error("Error saving tax slabs:", error);
      showToast("Error saving tax slabs", "error");
      throw error; // Propagate error to handle in form submit
    }
  };

  // const handleFormSubmit = (formData) => {
  //   setLoading(true);
  //   if (editData) {
  //     apiClient
  //       .put(`/pages/Master/SystemSetup/taxMaster`, formData)
  //       .then((response) => {
  //         setRows((prev) =>
  //           prev.map((row) =>
  //             row.nTaxID === editData.nTaxID ? response.data : row
  //           )
  //         );
  //         setShowForm(false);
  //         showToast("Successfully Edited!", "success");
  //         setTimeout(() => {
  //           hideToast();
  //         }, 2000);
  //         setSearchKeyword("");
  //         setLoading(false);
  //       })
  //       .catch((error) => {
  //         setLoading(false);
  //         setError(error);
  //         showToast("Error Editing data", "error");
  //         setTimeout(() => {
  //           hideToast();
  //         }, 2000);
  //       });
  //   } else {
  //     apiClient
  //       .post(`${baseUrl}/pages/Master/SystemSetup/taxMaster`, formData)
  //       .then((response) => {
  //         setRows((prev) => [...prev, response.data]);
  //         setShowForm(false);
  //         showToast("Successfully Inserted!", "success");
  //         setTimeout(() => {
  //           hideToast();
  //         }, 2000);
  //         setSearchKeyword("");
  //         setLoading(false);
  //       })
  //       .catch((error) => {
  //         setLoading(false);
  //         setError(error);
  //         showToast("Error Inserting data", "error");
  //         setTimeout(() => {
  //           hideToast();
  //         }, 2000);
  //       });
  //   }
  // };

  const handleFormSubmit = (formData, slabsData) => {
    setLoading(true);
    if (editData) {
      apiClient
        .put(`/pages/Master/SystemSetup/taxMaster`, formData)
        .then((response) => {
          handleFormSubmitSlabs(slabsData, editData.nTaxID)
            .then(() => {
              showToast("Data Updated Successfully", "success");
              setTimeout(() => {
                hideToast();
              }, 2000);
              setShowForm(false);
              fetchData();
            })
            .catch(() => {
              showToast("Error updating slabs", "error");
              setTimeout(() => {
                hideToast();
              }, 2000);
            });
        })
        .catch((error) => {
          console.error(error);
          showToast("Error updating data", "error");
          setTimeout(() => {
            hideToast();
          }, 2000);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      apiClient
        .post(`/pages/Master/SystemSetup/taxMaster`, formData)
        .then((response) => {
          const newTaxID = response.data.nTaxID;
          handleFormSubmitSlabs(slabsData, newTaxID)
            .then(() => {
              showToast("Data Inserted Successfully", "success");
              setTimeout(() => {
                hideToast();
              }, 2000);
              setShowForm(false);
              fetchData();
            })
            .catch(() => {
              showToast("Error saving slabs", "error");
              setTimeout(() => {
                hideToast();
              }, 2000);
            });
        })
        .catch((error) => {
          console.error(error);
          showToast("Error inserting data", "error");
          setTimeout(() => {
            hideToast();
          }, 2000);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  if (loading) {
    return <LazyFallBack />;
  }

  // if (error) {
  //   return <div>Error fetching data: {error.message}</div>;
  // }

  const columns = [
    { field: "CODE", headerName: "Code", width: 200 },
    { field: "DESCRIPTION", headerName: "Name", width: 200 },
    {
      field: "ISACTIVE",
      headerName: "Status",
      width: 120,
      valueGetter: (params) => (params.row.ISACTIVE ? "Active" : "Inactive"),
    },

    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <Box display={"flex"} gap={2}>
          <StyledButton
            onClick={() => handleEdit(params.row)}
            bgColor={Colortheme.buttonBg}
            bgColorHover={Colortheme.buttonBgHover}
            style={{ width: 80, height: 30 }}
          >
            Edit
          </StyledButton>
          <StyledButton
            onClick={() => handleDeleteClick(params.row)}
            bgColor={Colortheme.buttonBg}
            bgColorHover={"red"}
            textColOnHover={"white"}
            style={{ width: 80, height: 30 }}
          >
            Delete
          </StyledButton>
        </Box>
      ),
    },
  ];

  const filteredRows = rows
    .filter((row) => row.nTaxID) // Ensure each row has a nTaxID
    .map((row) => {
      // Add any additional transformations needed for your data
      return row;
    })
    .filter((row) => {
      if (searchKeyword === "") {
        return true;
      }

      const lowerSearchKeyword = searchKeyword.toLowerCase();
      for (const column of columns) {
        const cellValue = row[column.field]
          ? row[column.field].toString().toLowerCase()
          : "";
        if (cellValue.includes(lowerSearchKeyword)) {
          return true;
        }
      }

      return false;
    });

  return (
    <MainContainerCompilation title={"Tax Master"}>
      {!showForm ? (
        <AnimatePresence>
          <Box
            component={motion.div}
            initial={{ x: -50 }}
            animate={{ x: 0 }}
            exit={{ x: -50 }}
            sx={{
              // width: "95%",
              // height: "80%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              backgroundColor: Colortheme.background,
              p: 5,
              borderRadius: 10,
            }}
            maxWidth={isMobile ? "60vw" : "90%"}
          >
            <Tooltip title="Go To Dashboard">
              <Box sx={{ alignSelf: "flex-start", mb: 2 }}>
                <StyledButton
                  onClick={() => navigate("/Dashboard")}
                  style={{
                    width: 100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <KeyboardBackspaceIcon style={{ fontSize: "30px" }} />
                </StyledButton>
              </Box>
            </Tooltip>

            <CustomTextField
              variant="outlined"
              placeholder="Search..."
              value={searchKeyword}
              onChange={handleSearchChange}
              style={{
                width: isMobile ? "80%" : "50%",
                marginTop: isMobile ? "10px" : "-50px",
              }}
            />

            <StyledButton
              onClick={handleAdd}
              bgColor={Colortheme.buttonBg}
              bgColorHover={Colortheme.buttonBgHover}
              style={{
                marginBottom: "20px",
                width: isMobile ? "80%" : "20%",
                marginTop: 29,
              }}
            >
              Add New
            </StyledButton>

            <CustomDataGrid
              rows={filteredRows}
              columns={columns}
              selectionModel={selectionModel}
              getRowId={(row) => row.nTaxID}
              sortModel={[
                {
                  field: "nTaxID",
                  sort: "asc",
                },
              ]}
              columnVisibilityModel={
                isMobile
                  ? {
                      dIntdate: false,
                      vName: false,
                      vBranchCode: false,
                      bActive: false,
                      nCREDITLIM: false,
                      nCREDITDAYS: false,
                    }
                  : { id: false }
              }
              onSelectionModelChange={handleSelectionModelChange}
              searchKeyword={searchKeyword}
              setSearchKeyword={setSearchKeyword}
              Colortheme={Colortheme}
            />
          </Box>
        </AnimatePresence>
      ) : (
        <Box
          component={motion.div}
          overflow={isMobile ? "scroll" : "none"}
          initial={{ y: -5 }}
          animate={{ y: 0 }}
          exit={{ y: -50 }}
          sx={{
            // width: "90vw",
            // height: "70vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: Colortheme.background,
            p: 5,
            borderRadius: 10,
            overflowX: "hidden",
          }}
          maxWidth={isMobile ? "60vw" : "90%"}
        >
          <Box sx={{ alignSelf: "flex-start", mb: 2 }}>
            <StyledButton
              onClick={() => setShowForm(false)}
              style={{
                width: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <KeyboardBackspaceIcon style={{ fontSize: "30px" }} />
            </StyledButton>
          </Box>
          <Box marginTop={-10}>
            {editData ? (
              <h2 style={{ color: Colortheme.text }}>EDIT</h2>
            ) : (
              <h2 style={{ color: Colortheme.text }}>CREATE</h2>
            )}
          </Box>
          <TaxMasterForm
            initialData={editData}
            onSubmit={(formData) => handleFormSubmit(formData, taxSlabs)}
            onCancel={() => setShowForm(false)}
            setTaxSlabs={setTaxSlabs}
            taxSlabs={taxSlabs}
          />
        </Box>
      )}
      <CustomAlertModal />
    </MainContainerCompilation>
  );
};

export default TaxMaster;
