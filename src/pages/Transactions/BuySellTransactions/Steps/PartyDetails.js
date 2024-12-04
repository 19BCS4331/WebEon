import React, { useState, useEffect, useContext } from "react";
import {
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  IconButton,
  Box,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import CustomTextField from "../../../../components/global/CustomTextField";
import CustomDatePicker from "../../../../components/global/CustomDatePicker";
import CustomAutoComplete from "../../../../components/global/CustomAutocomplete";
import CustomCheckbox from "../../../../components/global/CustomCheckbox";
import { apiClient } from "../../../../services/apiClient";
import StyledButton from "../../../../components/global/StyledButton";
import ThemeContext from "../../../../contexts/ThemeContext";
import CustomDataGrid from "../../../../components/global/CustomDataGrid";
import { useToast } from "../../../../contexts/ToastContext";
import CustomBoxButton from "../../../../components/global/CustomBoxButton";

const relationOptions = [
  { value: "Brother", label: "Brother" },
  { value: "Sister", label: "Sister" },
  { value: "Company", label: "Company" },
  { value: "Daughter", label: "Daughter" },
  { value: "Father", label: "Father" },
  { value: "Father in law", label: "Father in law" },
  { value: "Husband", label: "Husband" },
  { value: "Mother", label: "Mother" },
  { value: "Mother in law", label: "Mother in law" },
  { value: "Self", label: "Self" },
  { value: "Son", label: "Son" },
  { value: "Wife", label: "Wife" },
];

const residentialStatusOptions = [
  { value: "RESIDENT", label: "RESIDENT" },
  { value: "NON-RESIDENT", label: "NON-RESIDENT" },
];

const idTypeOptions = [
  { value: "PAN", label: "PAN" },
  { value: "PASSPORT", label: "PASSPORT" },
  { value: "AADHAAR", label: "AADHAAR CARD" },
  { value: "VOTER ID", label: "VOTER ID" },
  { value: "DRIVING LICENCE", label: "DRIVING LICENCE" },
];

const PartyDetails = ({
  data,
  onUpdate,
  isEditMode,
  paxDetails: propPaxDetails,
  setPaxDetails: setPropPaxDetails,
}) => {
  const { Colortheme } = useContext(ThemeContext);
  const defaultPaxDetails = {
    nPaxcode: "",
    vCodeID: "",
    vPaxname: "",
    vEmail: "",
    vPan: "",
    vPanHolderName: "",
    dDOB: null,
    dBdate: null,
    vPhoneno: "",
    vCellno: "",
    vNation: "",
    vDesig: "",
    vPost: "",
    vBldgFlat: "",
    vStreetName: "",
    vLocation: "",
    vCity: "",
    vState: "",
    vCountry: "",
    vRelationWithPanHolder: "",
    UIN: "",
    vPaidByPan: "",
    vPaidByName: "",
    bTourOperator: false,
    bIsroprietorShip: false,
    GSTIN: "",
    vGSTSTATE: "",
    vPassport: "",
    dIssuedon: null,
    dExpdt: null,
    vIDREF1: "",
    vIDREF1NO: "",
    dIDREF1EXPDT: null,
    vAddress: "",
  };

  console.log("Transaction Data", data);

  const [openDialog, setOpenDialog] = useState(false);
  const [isSearchView, setIsSearchView] = useState(isEditMode ? false : true);
  const [searchText, setSearchText] = useState("");
  const [allPaxList, setAllPaxList] = useState([]);
  const [filteredPaxList, setFilteredPaxList] = useState([]);
  const [selectedPartyType, setSelectedPartyType] = useState("");
  const [nationalityOptions, setNationalityOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);

  const [partyTypeOptions, setPartyTypeOptions] = useState([]);
  const { showToast, hideToast } = useToast();
  const [localPaxDetails, setLocalPaxDetails] = useState(
    isEditMode ? propPaxDetails : defaultPaxDetails
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditMode && propPaxDetails) {
      setLocalPaxDetails(propPaxDetails);
      setSelectedPartyType(propPaxDetails.vCodeID || "");
    }
  }, [isEditMode, propPaxDetails]);

  useEffect(() => {
    if (isSearchView && !isEditMode && localPaxDetails.vCodeID) {
      fetchPaxList();
    }
  }, [isSearchView, localPaxDetails.vCodeID]);

  useEffect(() => {
    if (data?.PartyID) {
      setSelectedPartyType(data.PartyID.toString());
      if (data.PaxCode) {
        setIsSearchView(false);
        fetchPaxDetails(data.PaxCode);
      }
    }
  }, [data?.PartyID, data?.PaxCode]);

  useEffect(() => {
    if (isSearchView && selectedPartyType) {
      fetchPaxList();
    }
  }, [isSearchView, selectedPartyType]);

  const fetchPaxList = async () => {
    try {
      const response = await apiClient.get(`/pages/Transactions/pax-list`, {
        params: {
          partyType: selectedPartyType,
        },
      });
      if (response.data.data) {
        setAllPaxList(response.data.data);
        setFilteredPaxList(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching PAX list:", error);
    }
  };

  const fetchPaxDetails = async (paxCode) => {
    try {
      const response = await apiClient.get(
        `/pages/Transactions/pax-details/${paxCode}`
      );
      if (response.data.data) {
        const paxData = response.data.data;
        setLocalPaxDetails({
          ...paxData,
          vCodeID: selectedPartyType, // Preserve the selected party type
        });
        setPropPaxDetails(paxData);
        console.log("Pax Details:", paxData);
      }
    } catch (error) {
      console.error("Error fetching pax details:", error);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!searchText.trim()) {
        setFilteredPaxList(allPaxList);
        return;
      }

      const searchLower = searchText.toLowerCase();
      const filtered = allPaxList.filter(
        (pax) =>
          pax.vPaxname?.toLowerCase().includes(searchLower) ||
          pax.vEmail?.toLowerCase().includes(searchLower) ||
          pax.vPhoneno?.toLowerCase().includes(searchLower) ||
          pax.vCellno?.toLowerCase().includes(searchLower) ||
          pax.vCity?.toLowerCase().includes(searchLower)
      );
      setFilteredPaxList(filtered);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchText, allPaxList]);

  const handleSearch = (event) => {
    setSearchText(event.target.value);
  };

  const handlePaxSelect = (paxData) => {
    setLocalPaxDetails(paxData);
    setPropPaxDetails(paxData);
    setIsSearchView(false);
  };

  const handlePartyTypeChange = (event, newValue) => {
    const newCodeID = newValue ? newValue.value.toString() : "";

    // Reset PAX details in parent component
    onUpdate({
      PaxCode: "",
      PaxName: "",
      PartyID: newCodeID,
    });

    // Reset local PAX details
    setLocalPaxDetails({
      ...defaultPaxDetails,
      vCodeID: newCodeID, // Preserve the selected party type
    });
    setPropPaxDetails(null);

    // Reset search view and search text
    setIsSearchView(true);
    setSearchText("");

    // Update party type in local state
    setSelectedPartyType(newCodeID);
  };

  const columns = [
    { field: "nPaxcode", headerName: "PAX Code", width: 130 },
    { field: "vPaxname", headerName: "PAX Name", width: 200 },
    { field: "vEmail", headerName: "Email", width: 200 },
    { field: "vPhoneno", headerName: "Phone", width: 150 },
    { field: "vCity", headerName: "City", width: 150 },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => (
        <IconButton onClick={() => handlePaxSelect(params.row)} color="primary">
          <EditIcon />
        </IconButton>
      ),
    },
  ];

  const fetchAllOptions = async (signal) => {
    try {
      // Fetch party type options based on entity type
      const partyTypeResponse = await apiClient.get(
        `/pages/Transactions/party-type-options/${data.TRNWITHIC || "C"}`,
        { signal }
      );

      if (partyTypeResponse.data.success) {
        setPartyTypeOptions(partyTypeResponse.data.data);
      }

      // Fetch other options in parallel
      const [nationalityRes, cityRes, stateRes, countryRes] = await Promise.all(
        [
          apiClient.get("/pages/Transactions/nationality-options", { signal }),
          apiClient.get("/pages/Transactions/city-options", { signal }),
          apiClient.get("/pages/Transactions/state-options", { signal }),
          apiClient.get("/pages/Transactions/country-options", { signal }),
        ]
      );

      setNationalityOptions(nationalityRes.data);
      setCityOptions(cityRes.data);
      setStateOptions(stateRes.data);
      setCountryOptions(countryRes.data);
    } catch (error) {
      if (!error.name === "AbortError") {
        console.error("Error fetching options:", error);
        showToast("error", "Failed to load some options");
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchAllOptions(controller.signal);

    return () => controller.abort();
  }, []);

  const normalizeRelation = (relation) => {
    if (!relation) return "";
    const selfVariants = ["SELF", "self", "S"];
    return selfVariants.includes(relation.trim()) ? "Self" : relation;
  };

  const handlePaxDetailsChange = async (fieldOrEvent, directValue) => {
    const updatedPaxDetails = { ...localPaxDetails };

    // Determine field and value based on arguments
    let field, value;
    if (fieldOrEvent && fieldOrEvent.target) {
      // Event object passed
      field = fieldOrEvent.target.name;
      value = fieldOrEvent.target.value;
    } else {
      // Direct field and value passed
      field = fieldOrEvent;
      value = directValue;
    }

    updatedPaxDetails[field] = value;

    // If relation with PAN holder is "self", auto-fill paid by fields
    if (field === "vRelationWithPanHolder") {
      if (value === "self") {
        updatedPaxDetails.vPaidByName = updatedPaxDetails.vPanHolderName;
        updatedPaxDetails.vPaidByPan = updatedPaxDetails.vPan;
      } else {
        updatedPaxDetails.vPaidByName = "";
        updatedPaxDetails.vPaidByPan = "";
      }
    }

    // Concatenate address fields whenever any address-related field changes
    if (["vBldgFlat", "vStreetName", "vCity", "vState"].includes(field)) {
      const addressParts = [
        updatedPaxDetails.vBldgFlat,
        updatedPaxDetails.vStreetName,
        updatedPaxDetails.vCity,
        updatedPaxDetails.vState,
      ].filter((part) => part && part.trim() !== "");

      updatedPaxDetails.vAddress = addressParts.join(", ");
    }

    setLocalPaxDetails(updatedPaxDetails);
  };

  const handlePaxNameChange = (value) => {
    const updatedDetails = { ...localPaxDetails };
    updatedDetails.vPaxname = value;

    // If relation is self, update Paid By Name as well
    if (
      updatedDetails.vRelationWithPanHolder?.toLowerCase() === "self" ||
      updatedDetails.vRelationWithPanHolder?.toLowerCase() === "s"
    ) {
      updatedDetails.vPaidByName = value;
    }

    setLocalPaxDetails(updatedDetails);
  };

  const handlePanChange = (value) => {
    const updatedDetails = { ...localPaxDetails };
    updatedDetails.vPan = value;

    // If relation is self, update Paid By PAN as well
    if (
      updatedDetails.vRelationWithPanHolder?.toLowerCase() === "self" ||
      updatedDetails.vRelationWithPanHolder?.toLowerCase() === "s"
    ) {
      updatedDetails.vPaidByPan = value;
    }

    setLocalPaxDetails(updatedDetails);
  };

  const handleInputChange = (field, value) => {
    setLocalPaxDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const renderRelationField = (
    <CustomTextField
      select
      label="Relation with PAN Holder"
      value={normalizeRelation(localPaxDetails?.vRelationWithPanHolder) || ""}
      onChange={(e) =>
        handlePaxDetailsChange("vRelationWithPanHolder", e.target.value)
      }
    >
      {relationOptions.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </CustomTextField>
  );

  const validateForm = (details) => {
    const errors = {};

    if (!details.vPaxname?.trim()) {
      errors.vPaxname = "PAX Name is required";
    }

    if (!details.vEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.vEmail)) {
      errors.vEmail = "Invalid email format";
    }

    if (!details.vPhoneno && !/^\d{10}$/.test(details.vPhoneno)) {
      errors.vPhoneno = "Phone number must be 10 digits";
    }

    return errors;
  };

  const handleDialogSave = async () => {
    try {
      setIsSaving(true);
      const errors = validateForm(localPaxDetails);
      if (Object.keys(errors).length > 0) {
        Object.values(errors).forEach((error) => {
          showToast(error, "error");
          setTimeout(() => {
            hideToast();
          }, 2000);
        });
        return;
      }

      // Send the request to save-pax endpoint
      try {
        const response = await apiClient.post("/pages/Transactions/save-pax", {
          ...localPaxDetails,
          vPaxCode: localPaxDetails.nPaxcode, // Include the PAX code for duplicate check if editing
        });

        if (response.data.success) {
          const { nPaxcode, vPaxname } = response.data.data;
          onUpdate({
            PaxCode: nPaxcode,
            PaxName: vPaxname,
          });
          showToast(response.data.message, "success");
          setOpenDialog(false);
        } else {
          showToast(
            response.data.message,
            "error" || "Failed to save PAX details",
            "error"
          );
        }
      } catch (error) {
        console.error("Error saving PAX details:", error);
        showToast("Failed to save PAX details", "error");
      } finally {
        setIsSaving(false);
        setTimeout(() => {
          hideToast();
        }, 2000);
      }
    } catch (error) {
      console.error("Error saving PAX details:", error);
      showToast("Failed to save PAX details", "error");
    }
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <CustomAutoComplete
            options={partyTypeOptions}
            value={
              partyTypeOptions.find(
                (option) =>
                  option.value.toString() ===
                  (data?.PartyID || selectedPartyType)?.toString()
              ) || null
            }
            onChange={handlePartyTypeChange}
            label="Party Type"
            required
            styleTF={{ width: "100%" }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <CustomBoxButton
            onClick={() => setOpenDialog(true)}
            label={data?.PaxName ? "Pax Name" : "Select PAX"}
          >
            {data?.PaxName ||
              (isEditMode ? "View PAX Details" : "Add PAX Details")}
          </CustomBoxButton>
        </Grid>

        <Grid item xs={12} md={3}>
          <CustomTextField
            label={"On Behalf of"}
            value={data?.PersonRef}
            onChange={(e) => onUpdate({ PersonRef: e.target.value })}
            style={{ width: "100%" }}
          />
        </Grid>
      </Grid>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: Colortheme.background,
            width: "90%",
            maxWidth: "none",
            borderRadius: "20px",
            padding: 5,
            border: `1px solid ${Colortheme.text}`,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: Colortheme.text,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "Poppins",
          }}
        >
          <Box display="flex" alignItems="center">
            {isEditMode
              ? "View PAX Details"
              : isSearchView
              ? "Search PAX"
              : localPaxDetails.nPaxcode
              ? "Edit PAX Details"
              : "Add PAX Details"}
          </Box>
          <Box display="flex" gap={2}>
            {!isEditMode && (
              <>
                {!isSearchView && (
                  <StyledButton
                    onClick={() => {
                      setIsSearchView(true);
                      setSearchText("");
                    }}
                    searchIcon={true}
                    style={{ width: 150 }}
                  >
                    Search
                  </StyledButton>
                )}

                {isSearchView && (
                  <StyledButton
                    onClick={() => setIsSearchView(false)}
                    style={{ width: 150, gap: 5 }}
                    addIcon={localPaxDetails.nPaxcode ? false : true}
                  >
                    {localPaxDetails.nPaxcode ? " < Edit Pax" : "New Pax"}
                  </StyledButton>
                )}

                {!isSearchView && localPaxDetails.nPaxcode && (
                  <StyledButton
                    onClick={() => {
                      setLocalPaxDetails({
                        nPaxcode: "",
                        vCodeID: "",
                        vPaxname: "",
                        vEmail: "",
                        vPan: "",
                        vPanHolderName: "",
                        dDOB: null,
                        dBdate: null,
                        vPhoneno: "",
                        vCellno: "",
                        vNation: "",
                        vDesig: "",
                        vPost: "",
                        vBldgFlat: "",
                        vStreetName: "",
                        vLocation: "",
                        vCity: "",
                        vState: "",
                        vCountry: "",
                        vRelationWithPanHolder: "",
                        UIN: "",
                        vPaidByPan: "",
                        vPaidByName: "",
                        bTourOperator: false,
                        bIsroprietorShip: false,
                        GSTIN: "",
                        vGSTSTATE: "",
                        // Passport Details
                        vPassport: "",
                        dIssuedon: null,
                        dExpdt: null,
                        // Other IDs
                        vIDREF1: "",
                        vIDREF1NO: "",
                        dIDREF1EXPDT: null,
                      });
                      setIsSearchView(false);
                    }}
                    addIcon={true}
                    style={{ width: 150, gap: 10 }}
                  >
                    New PAX
                  </StyledButton>
                )}
              </>
            )}
          </Box>
        </DialogTitle>
        <DialogContent
          sx={{
            backgroundColor: Colortheme.background,
            maxHeight: "80vh",
            overflowY: "auto",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: Colortheme.background,
            },
            "&::-webkit-scrollbar-thumb": {
              background: Colortheme.text,
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: Colortheme.primary,
            },
          }}
        >
          {isSearchView ? (
            <Box sx={{ width: "100%", mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomTextField
                    fullWidth
                    label="Search PAX by name, email, phone, or city..."
                    value={searchText}
                    onChange={handleSearch}
                    style={{ width: "100%" }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sx={{ height: 400 }}>
                  <CustomDataGrid
                    rows={filteredPaxList}
                    columns={columns}
                    getRowId={(row) => row.nPaxcode}
                    Colortheme={Colortheme}
                  />
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {/* PAX Details Section */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    border: `1px solid ${Colortheme.text}`,
                    borderRadius: "8px",
                    padding: 2,
                    mb: 2,
                  }}
                >
                  <h3 style={{ color: Colortheme.text, marginTop: 0 }}>
                    PAX Details
                  </h3>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <CustomTextField
                        label="PAX Name"
                        value={localPaxDetails.vPaxname}
                        onChange={(e) => handlePaxNameChange(e.target.value)}
                        required
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomTextField
                        label="Email"
                        value={localPaxDetails.vEmail}
                        onChange={(e) =>
                          handlePaxDetailsChange("vEmail", e.target.value)
                        }
                        required
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomTextField
                        label="PAN Number"
                        value={localPaxDetails.vPan}
                        onChange={(e) => handlePanChange(e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomTextField
                        label="PAN Holder Name"
                        value={localPaxDetails.vPanHolderName}
                        onChange={(e) =>
                          handlePaxDetailsChange(
                            "vPanHolderName",
                            e.target.value
                          )
                        }
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomDatePicker
                        label="Date of Birth"
                        value={localPaxDetails.dBdate}
                        onChange={(date) =>
                          handlePaxDetailsChange("dBdate", date)
                        }
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomTextField
                        label="Phone Number"
                        value={
                          localPaxDetails.vPhoneno || localPaxDetails.vCellno
                        }
                        onChange={(e) =>
                          handlePaxDetailsChange("vPhoneno", e.target.value)
                        }
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomAutoComplete
                        label="Nationality"
                        options={nationalityOptions}
                        value={
                          nationalityOptions.find(
                            (opt) => opt.value === localPaxDetails.vNation
                          ) || null
                        }
                        onChange={(e, newValue) =>
                          handlePaxDetailsChange(
                            "vNation",
                            newValue ? newValue.value : ""
                          )
                        }
                        getOptionLabel={(option) => option.label || ""}
                        isOptionEqualToValue={(option, value) =>
                          option.value === value.value
                        }
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomTextField
                        label="Designation"
                        value={localPaxDetails.vDesig}
                        onChange={(e) =>
                          handlePaxDetailsChange("vDesig", e.target.value)
                        }
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              {/* Address Section */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    border: `1px solid ${Colortheme.text}`,
                    borderRadius: "8px",
                    padding: 2,
                    mb: 2,
                  }}
                >
                  <h3 style={{ color: Colortheme.text, marginTop: 0 }}>
                    Address Details
                  </h3>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <CustomTextField
                        label="Building/Flat"
                        value={localPaxDetails.vBldgFlat}
                        onChange={(e) =>
                          handlePaxDetailsChange("vBldgFlat", e.target.value)
                        }
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomTextField
                        label="Street Name"
                        value={localPaxDetails.vStreetName}
                        onChange={(e) =>
                          handlePaxDetailsChange("vStreetName", e.target.value)
                        }
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomTextField
                        label="Location"
                        value={localPaxDetails.vLocation}
                        onChange={(e) =>
                          handlePaxDetailsChange("vLocation", e.target.value)
                        }
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomAutoComplete
                        label="City"
                        options={cityOptions}
                        value={
                          cityOptions.find(
                            (opt) => opt.value === localPaxDetails.vCity
                          ) || null
                        }
                        onChange={(e, newValue) =>
                          handlePaxDetailsChange(
                            "vCity",
                            newValue ? newValue.value : ""
                          )
                        }
                        getOptionLabel={(option) => option.label || ""}
                        isOptionEqualToValue={(option, value) =>
                          option.value === value.value
                        }
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomAutoComplete
                        label="State"
                        options={stateOptions}
                        value={
                          stateOptions.find(
                            (opt) => opt.value === localPaxDetails.vState
                          ) || null
                        }
                        onChange={(e, newValue) =>
                          handlePaxDetailsChange(
                            "vState",
                            newValue ? newValue.value : ""
                          )
                        }
                        getOptionLabel={(option) => option.label || ""}
                        isOptionEqualToValue={(option, value) =>
                          option.value === value.value
                        }
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomAutoComplete
                        label="Country"
                        options={countryOptions}
                        value={
                          countryOptions.find(
                            (opt) => opt.value === localPaxDetails.vCountry
                          ) || null
                        }
                        onChange={(e, newValue) =>
                          handlePaxDetailsChange(
                            "vCountry",
                            newValue ? newValue.value : ""
                          )
                        }
                        getOptionLabel={(option) => option.label || ""}
                        isOptionEqualToValue={(option, value) =>
                          option.value === value.value
                        }
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      {renderRelationField}
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomTextField
                        label="UIN"
                        value={localPaxDetails.UIN}
                        onChange={(e) =>
                          handlePaxDetailsChange("UIN", e.target.value)
                        }
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomTextField
                        label="Paid By PAN"
                        value={localPaxDetails.vPaidByPan}
                        onChange={(e) =>
                          handlePaxDetailsChange("vPaidByPan", e.target.value)
                        }
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomTextField
                        label="Paid By Name"
                        value={localPaxDetails.vPaidByName}
                        onChange={(e) =>
                          handlePaxDetailsChange("vPaidByName", e.target.value)
                        }
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomCheckbox
                        label="Tour Operator"
                        checked={localPaxDetails.bTourOperator}
                        onChange={(e) =>
                          handlePaxDetailsChange(
                            "bTourOperator",
                            e.target.checked
                          )
                        }
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomCheckbox
                        label="Proprietor Ship"
                        checked={localPaxDetails.bIsroprietorShip}
                        onChange={(e) =>
                          handlePaxDetailsChange(
                            "bIsroprietorShip",
                            e.target.checked
                          )
                        }
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomTextField
                        label="GSTIN"
                        value={localPaxDetails.GSTIN}
                        onChange={(e) =>
                          handlePaxDetailsChange("GSTIN", e.target.value)
                        }
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomAutoComplete
                        label="GST State"
                        options={stateOptions}
                        value={
                          stateOptions.find(
                            (opt) => opt.value === localPaxDetails.vGSTSTATE
                          ) || null
                        }
                        onChange={(e, newValue) =>
                          handlePaxDetailsChange(
                            "vGSTSTATE",
                            newValue ? newValue.value : ""
                          )
                        }
                        getOptionLabel={(option) => option.label || ""}
                        isOptionEqualToValue={(option, value) =>
                          option.value === value.value
                        }
                      />
                    </Grid>

                    {/* Passport Details Section */}
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          border: `1px solid ${Colortheme.text}`,
                          borderRadius: "8px",
                          padding: 2,
                          mb: 2,
                          mt: 2,
                        }}
                      >
                        <h3 style={{ color: Colortheme.text, marginTop: 0 }}>
                          Passport Details
                        </h3>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={3}>
                            <CustomTextField
                              label="Passport Number"
                              value={localPaxDetails.vPassport}
                              onChange={(e) =>
                                handlePaxDetailsChange(
                                  "vPassport",
                                  e.target.value
                                )
                              }
                            />
                          </Grid>

                          <Grid item xs={12} md={3}>
                            <CustomDatePicker
                              label="Passport Issue Date"
                              value={localPaxDetails.dIssuedon}
                              onChange={(date) =>
                                handlePaxDetailsChange("dIssuedon", date)
                              }
                            />
                          </Grid>

                          <Grid item xs={12} md={3}>
                            <CustomDatePicker
                              label="Passport Expiry Date"
                              value={localPaxDetails.dExpdt}
                              onChange={(date) =>
                                handlePaxDetailsChange("dExpdt", date)
                              }
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>

                    {/* Other IDs Section */}
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          border: `1px solid ${Colortheme.text}`,
                          borderRadius: "8px",
                          padding: 2,
                          mb: 2,
                        }}
                      >
                        <h3 style={{ color: Colortheme.text, marginTop: 0 }}>
                          Other IDs
                        </h3>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={3}>
                            <CustomAutoComplete
                              label="ID Type"
                              options={idTypeOptions}
                              value={
                                idTypeOptions.find(
                                  (opt) => opt.value === localPaxDetails.vIDREF1
                                ) || null
                              }
                              onChange={(e, newValue) =>
                                handlePaxDetailsChange(
                                  "vIDREF1",
                                  newValue ? newValue.value : ""
                                )
                              }
                              getOptionLabel={(option) => option.label || ""}
                              isOptionEqualToValue={(option, value) =>
                                option.value === value.value
                              }
                            />
                          </Grid>

                          <Grid item xs={12} md={3}>
                            <CustomTextField
                              label="ID Number"
                              value={localPaxDetails.vIDREF1NO}
                              onChange={(e) =>
                                handlePaxDetailsChange(
                                  "vIDREF1NO",
                                  e.target.value
                                )
                              }
                            />
                          </Grid>

                          <Grid item xs={12} md={3}>
                            <CustomDatePicker
                              label="ID Expiry Date"
                              value={localPaxDetails.dIDREF1EXPDT}
                              onChange={(date) =>
                                handlePaxDetailsChange("dIDREF1EXPDT", date)
                              }
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            backgroundColor: Colortheme.background,
            padding: 2,
            display: "flex",
            justifyContent: "space-around",
          }}
        >
          {isEditMode ? (
            <StyledButton onClick={() => setOpenDialog(false)}>
              Close
            </StyledButton>
          ) : (
            <>
              <StyledButton onClick={() => setOpenDialog(false)}>
                Cancel
              </StyledButton>
              {!isSearchView && (
                <StyledButton
                  onClick={handleDialogSave}
                  disabled={isSaving}
                  style={{ position: "relative" }}
                >
                  {isSaving ? (
                    <>
                      Saving
                      <CircularProgress
                        size={24}
                        sx={{
                          color: Colortheme.text,
                          marginLeft: 2,
                        }}
                      />
                    </>
                  ) : (
                    "Save"
                  )}
                </StyledButton>
              )}
            </>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PartyDetails;
