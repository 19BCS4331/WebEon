import React, { useState, useEffect, useContext } from 'react';
import { Grid, Dialog, DialogTitle, DialogContent, DialogActions, Button, MenuItem, IconButton, Box, TextField, InputAdornment } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import CustomTextField from '../../../../components/global/CustomTextField';
import CustomDatePicker from '../../../../components/global/CustomDatePicker';
import CustomAutoComplete from '../../../../components/global/CustomAutocomplete';
import CustomCheckbox from '../../../../components/global/CustomCheckbox';
import { apiClient } from '../../../../services/apiClient';
import StyledButton from '../../../../components/global/StyledButton';
import ThemeContext from '../../../../contexts/ThemeContext';
import CustomDataGrid from '../../../../components/global/CustomDataGrid';
import { useToast } from '../../../../contexts/ToastContext';

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
  { value: "Wife", label: "Wife" }
];

const residentialStatusOptions = [
  { value: 'RESIDENT', label: 'RESIDENT' },
  { value: 'NON-RESIDENT', label: 'NON-RESIDENT' }
];

const PartyDetails = ({ data, onUpdate, isEditMode, paxDetails: propPaxDetails, setPaxDetails: setPropPaxDetails }) => {
  const { Colortheme } = useContext(ThemeContext);
  const defaultPaxDetails = {
    nPaxcode: '',
    vCodeID: '',
    vPaxname: '',
    vEmail: '',
    vPan: '',
    vPanHolderName: '',
    dDOB: null,
    vPhoneno: '',
    vNation: '',
    vDesig: '',
    vPost: '',
    vBldgFlat: '',
    vStreetName: '',
    vLocation: '',
    vCity: '',
    vState: '',
    vCountry: '',
    vRelationWithPanHolder: '',
    UIN: '',
    vPaidByPan: '',
    vPaidByName: '',
    bTourOperator: false,
    bIsroprietorShip: false,
    GSTIN: '',
    vGSTSTATE: '',
    vPassport: '',
    dIssuedon: null,
    dExpdt: null,
    vIDREF1: '',
    vIDREF1NO: '',
    dIDREF1EXPDT: null
  };

  const [openDialog, setOpenDialog] = useState(false);
  const [isSearchView, setIsSearchView] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [allPaxList, setAllPaxList] = useState([]);
  const [filteredPaxList, setFilteredPaxList] = useState([]);
  const [selectedPartyType, setSelectedPartyType] = useState("");
  const [nationalityOptions, setNationalityOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);
  // const [relationOptions, setRelationOptions] = useState([]);
  const [idTypeOptions, setIdTypeOptions] = useState([]);
  const [partyTypeOptions, setPartyTypeOptions] = useState([]);
  const {showToast,hideToast} = useToast();
  const [localPaxDetails, setLocalPaxDetails] = useState(isEditMode ? propPaxDetails : defaultPaxDetails);

  useEffect(() => {
    if (isEditMode && propPaxDetails) {
      setLocalPaxDetails(propPaxDetails);
      setSelectedPartyType(propPaxDetails.vCodeID || '');
    }
  }, [isEditMode, propPaxDetails]);



  useEffect(() => {
    fetchAllOptions();
  }, []);

  useEffect(() => {
    if (isSearchView) {
      fetchPaxList();
    }
  }, [isSearchView]);

  const fetchPaxList = async () => {
    try {
      const response = await apiClient.get(`/pages/Transactions/pax-list`,{
        params: {
          partyType: selectedPartyType
        }
      });
      if (response.data.data) {
        setAllPaxList(response.data.data);
        setFilteredPaxList(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching PAX list:', error);
    }
  };

  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredPaxList(allPaxList);
      return;
    }

    const filtered = allPaxList.filter((pax) => {
      const searchLower = searchText.toLowerCase();
      return (
        pax.vPaxname?.toLowerCase().includes(searchLower) ||
        pax.vEmail?.toLowerCase().includes(searchLower) ||
        pax.vPhoneno?.toLowerCase().includes(searchLower) ||
        pax.vCity?.toLowerCase().includes(searchLower)
      );
    });
    setFilteredPaxList(filtered);
  }, [searchText, allPaxList]);

  const handleSearch = (event) => {
    setSearchText(event.target.value);
  };

  const handlePaxSelect = (paxData) => {
    setLocalPaxDetails(paxData);
    setPropPaxDetails(paxData);
    onUpdate({
      PaxCode: paxData.nPaxcode,
      PaxName: paxData.vPaxname
    });
    setIsSearchView(false);
  };

  const handlePartyTypeChange = (event, newValue) => {
    const newCodeID = newValue?.value || '';
    setSelectedPartyType(newCodeID);
    setLocalPaxDetails(prev => ({
      ...prev,
      vCodeID: newCodeID
    }));
  };

  const columns = [
    { field: 'nPaxcode', headerName: 'PAX Code', width: 130 },
    { field: 'vPaxname', headerName: 'PAX Name', width: 200 },
    { field: 'vEmail', headerName: 'Email', width: 200 },
    { field: 'vPhoneno', headerName: 'Phone', width: 150 },
    { field: 'vCity', headerName: 'City', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => (
        <IconButton
          onClick={() => handlePaxSelect(params.row)}
          color="primary"
        >
          <EditIcon />
        </IconButton>
      ),
    },
  ];

  const fetchAllOptions = async () => {
    try {
      // Fetch party type options based on entity type
      const partyTypeResponse = await apiClient.get(`/pages/Transactions/party-type-options/${data.TRNWITHIC || 'C'}`);
      if (partyTypeResponse.data.success) {
        setPartyTypeOptions(partyTypeResponse.data.data);
        console.log("partyTypeResponse:",partyTypeResponse.data.data);
      }

      // Fetch other options
      const [nationalityRes, cityRes, stateRes, countryRes, idTypeRes] = await Promise.all([
        apiClient.get('/pages/Transactions/nationality-options'),
        apiClient.get('/pages/Transactions/city-options'),
        apiClient.get('/pages/Transactions/state-options'),
        apiClient.get('/pages/Transactions/country-options'),
        apiClient.get('/pages/Transactions/id-type-options')
      ]);

      setNationalityOptions(nationalityRes.data);
      setCityOptions(cityRes.data);
      setStateOptions(stateRes.data);
      setCountryOptions(countryRes.data);
      setIdTypeOptions(idTypeRes.data);
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  const handlePaxDetailsChange = (field, value) => {
    setLocalPaxDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInputChange = (field, value) => {
    setLocalPaxDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const relationField = (
    <CustomTextField
      select
      label="Relation with PAN Holder"
      value={localPaxDetails?.vRelationWithPanHolder || ''}
      onChange={(e) => handlePaxDetailsChange('vRelationWithPanHolder', e.target.value)}
    >
      {relationOptions.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </CustomTextField>
  );

  const handleDialogSave = async () => {
    try {
      if (!localPaxDetails.vPaxname) {
        showToast('PAX Name is required', 'error');
        return;
      }

      if (!isEditMode) {
        // Check for duplicate pax name when creating new pax
        const checkResponse = await apiClient.get('/pages/Transactions/pax/check', {
          params: { paxName: localPaxDetails.vPaxname }
        });

        if (checkResponse.data.exists) {
          showToast('PAX Name already exists', 'error');
          return;
        }
      }

      const endpoint = localPaxDetails.nPaxcode 
        ? `/pages/Transactions/pax/${localPaxDetails.nPaxcode}` 
        : '/pages/Transactions/pax';
      
      const method = localPaxDetails.nPaxcode ? 'put' : 'post';
      
      const response = await apiClient[method](endpoint, localPaxDetails);
      
      if (response.data) {
        onUpdate({
          PaxCode: response.data.nPaxcode,
          PaxName: response.data.vPaxname
        });
        showToast(`PAX ${localPaxDetails.nPaxcode ? 'updated' : 'created'} successfully`, 'success');
        setOpenDialog(false);
      }
    } catch (error) {
      console.error('Error saving pax details:', error);
      showToast('Error saving PAX details', 'error');
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <CustomAutoComplete
          options={partyTypeOptions}
          value={isEditMode 
            ? partyTypeOptions.find(option => option.value === parseInt(data.PartyID, 10)) || null
            : partyTypeOptions.find(option => option.value === parseInt(localPaxDetails.vCodeID,10)) || null
          }
          onChange={handlePartyTypeChange}
          label="Party Type"
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <StyledButton
          variant="contained"
          onClick={() => setOpenDialog(true)}
        >
          {isEditMode ? 'View PAX Details' : 'Add PAX Details'}
        </StyledButton>
      </Grid>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: Colortheme.background,
            width: '90%',
            maxWidth: 'none',
            borderRadius: '20px',
            padding:5,
            border: `1px solid ${Colortheme.text}`
          }
        }}
      >
        <DialogTitle sx={{ 
          color: Colortheme.text,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'Poppins'
        }}>
          <Box display="flex" alignItems="center">
            {isSearchView && !isEditMode && (
              <IconButton 
                onClick={() => setIsSearchView(false)}
                sx={{ mr: 1, color: Colortheme.text }}
              >
                <ArrowBackIcon />
              </IconButton>
            )}
            {isEditMode 
              ? 'View PAX Details'
              : (isSearchView 
                  ? 'Search PAX' 
                  : (localPaxDetails.nPaxcode ? 'Edit PAX Details' : 'Add PAX Details')
                )
            }
          </Box>
          <Box display="flex" gap={2}>
            {!isEditMode &&  (
              <>
              {!isSearchView && 
               <StyledButton
               onClick={() => setIsSearchView(true)}
               searchIcon={true}
               style={{width:150}}
             >
               Search
             </StyledButton>
             }
               
                {!isSearchView && localPaxDetails.nPaxcode && (
                  <StyledButton
                    onClick={() => {
                      setLocalPaxDetails({
                        nPaxcode: '',
                        vCodeID:'',
                        vPaxname: '',
                        vEmail: '',
                        vPan: '',
                        vPanHolderName: '',
                        dDOB: null,
                        vPhoneno: '',
                        vNation: '',
                        vDesig: '',
                        vPost: '',
                        vBldgFlat: '',
                        vStreetName: '',
                        vLocation: '',
                        vCity: '',
                        vState: '',
                        vCountry: '',
                        vRelationWithPanHolder: '',
                        UIN: '',
                        vPaidByPan: '',
                        vPaidByName: '',
                        bTourOperator: false,
                        bIsroprietorShip: false,
                        GSTIN: '',
                        vGSTSTATE: '',
                        // Passport Details
                        vPassport: '',
                        dIssuedon: null,
                        dExpdt: null,
                        // Other IDs
                        vIDREF1: '',
                        vIDREF1NO: '',
                        dIDREF1EXPDT: null
                      });
                      setIsSearchView(false);
                    }}
                    addIcon={true}
                    style={{width:150,gap:10}}
                  >
                    New PAX
                  </StyledButton>
                )}
              </>
            )}
          </Box>
        </DialogTitle>
        <DialogContent sx={{
          backgroundColor: Colortheme.background,
          maxHeight: '80vh',
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: Colortheme.background,
          },
          '&::-webkit-scrollbar-thumb': {
            background: Colortheme.text,
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: Colortheme.primary,
          }
        }}>
          {isSearchView ? (
            <Box sx={{ width: '100%', mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomTextField
                    fullWidth
                    label="Search PAX by name, email, phone, or city..."
                    value={searchText}
                    onChange={handleSearch}
                    style={{width: '100%'}}
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
                <Box sx={{ 
                  border: `1px solid ${Colortheme.text}`,
                  borderRadius: '8px',
                  padding: 2,
                  mb: 2
                }}>
                  <h3 style={{ color: Colortheme.text, marginTop: 0 }}>PAX Details</h3>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <CustomTextField
                        label="PAX Name"
                        value={localPaxDetails.vPaxname}
                        onChange={(e) => handlePaxDetailsChange('vPaxname', e.target.value)}
                        required
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomTextField
                        label="Email"
                        value={localPaxDetails.vEmail}
                        onChange={(e) => handlePaxDetailsChange('vEmail', e.target.value)}
                        required
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomTextField
                        label="PAN Number"
                        value={localPaxDetails.vPan}
                        onChange={(e) => handlePaxDetailsChange('vPan', e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomTextField
                        label="PAN Holder Name"
                        value={localPaxDetails.vPanHolderName}
                        onChange={(e) => handlePaxDetailsChange('vPanHolderName', e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomDatePicker
                        label="Date of Birth"
                        value={localPaxDetails.dDOB}
                        onChange={(date) => handlePaxDetailsChange('dDOB', date)}
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomTextField
                        label="Phone Number"
                        value={localPaxDetails.vPhoneno}
                        onChange={(e) => handlePaxDetailsChange('vPhoneno', e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomAutoComplete
                        label="Nationality"
                        options={nationalityOptions}
                        value={nationalityOptions.find(opt => opt.value === localPaxDetails.vNation) || null}
                        onChange={(e, newValue) => handlePaxDetailsChange('vNation', newValue ? newValue.value : '')}
                        getOptionLabel={(option) => option.label || ''}
                        isOptionEqualToValue={(option, value) => option.value === value.value}
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomTextField
                        label="Designation"
                        value={localPaxDetails.vDesig}
                        onChange={(e) => handlePaxDetailsChange('vDesig', e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              {/* Address Section */}
              <Grid item xs={12}>
                <Box sx={{ 
                  border: `1px solid ${Colortheme.text}`,
                  borderRadius: '8px',
                  padding: 2,
                  mb: 2
                }}>
                  <h3 style={{ color: Colortheme.text, marginTop: 0 }}>Address Details</h3>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <CustomTextField
                        label="Building/Flat"
                        value={localPaxDetails.vBldgFlat}
                        onChange={(e) => handlePaxDetailsChange('vBldgFlat', e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomTextField
                        label="Street Name"
                        value={localPaxDetails.vStreetName}
                        onChange={(e) => handlePaxDetailsChange('vStreetName', e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomTextField
                        label="Location"
                        value={localPaxDetails.vLocation}
                        onChange={(e) => handlePaxDetailsChange('vLocation', e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomAutoComplete
                        label="City"
                        options={cityOptions}
                        value={cityOptions.find(opt => opt.value === localPaxDetails.vCity) || null}
                        onChange={(e, newValue) => handlePaxDetailsChange('vCity', newValue ? newValue.value : '')}
                        getOptionLabel={(option) => option.label || ''}
                        isOptionEqualToValue={(option, value) => option.value === value.value}
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomAutoComplete
                        label="State"
                        options={stateOptions}
                        value={stateOptions.find(opt => opt.value === localPaxDetails.vState) || null}
                        onChange={(e, newValue) => handlePaxDetailsChange('vState', newValue ? newValue.value : '')}
                        getOptionLabel={(option) => option.label || ''}
                        isOptionEqualToValue={(option, value) => option.value === value.value}
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomAutoComplete
                        label="Country"
                        options={countryOptions}
                        value={countryOptions.find(opt => opt.value === localPaxDetails.vCountry) || null}
                        onChange={(e, newValue) => handlePaxDetailsChange('vCountry', newValue ? newValue.value : '')}
                        getOptionLabel={(option) => option.label || ''}
                        isOptionEqualToValue={(option, value) => option.value === value.value}
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      {relationField}
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomTextField
                        label="UIN"
                        value={localPaxDetails.UIN}
                        onChange={(e) => handlePaxDetailsChange('UIN', e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomTextField
                        label="Paid By PAN"
                        value={localPaxDetails.vPaidByPan}
                        onChange={(e) => handlePaxDetailsChange('vPaidByPan', e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomTextField
                        label="Paid By Name"
                        value={localPaxDetails.vPaidByName}
                        onChange={(e) => handlePaxDetailsChange('vPaidByName', e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomCheckbox
                        label="Tour Operator"
                        checked={localPaxDetails.bTourOperator}
                        onChange={(e) => handlePaxDetailsChange('bTourOperator', e.target.checked)}
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomCheckbox
                        label="Proprietor Ship"
                        checked={localPaxDetails.bIsroprietorShip}
                        onChange={(e) => handlePaxDetailsChange('bIsroprietorShip', e.target.checked)}
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomTextField
                        label="GSTIN"
                        value={localPaxDetails.GSTIN}
                        onChange={(e) => handlePaxDetailsChange('GSTIN', e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <CustomAutoComplete
                        label="GST State"
                        options={stateOptions}
                        value={stateOptions.find(opt => opt.value === localPaxDetails.vGSTSTATE) || null}
                        onChange={(e, newValue) => handlePaxDetailsChange('vGSTSTATE', newValue ? newValue.value : '')}
                        getOptionLabel={(option) => option.label || ''}
                        isOptionEqualToValue={(option, value) => option.value === value.value}
                      />
                    </Grid>

                    {/* Passport Details Section */}
                    <Grid item xs={12}>
                      <Box sx={{ 
                        border: `1px solid ${Colortheme.text}`,
                        borderRadius: '8px',
                        padding: 2,
                        mb: 2,
                        mt: 2
                      }}>
                        <h3 style={{ color: Colortheme.text, marginTop: 0 }}>Passport Details</h3>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={3}>
                            <CustomTextField
                              label="Passport Number"
                              value={localPaxDetails.vPassport}
                              onChange={(e) => handlePaxDetailsChange('vPassport', e.target.value)}
                            />
                          </Grid>

                          <Grid item xs={12} md={3}>
                            <CustomDatePicker
                              label="Passport Issue Date"
                              value={localPaxDetails.dIssuedon}
                              onChange={(date) => handlePaxDetailsChange('dIssuedon', date)}
                            />
                          </Grid>

                          <Grid item xs={12} md={3}>
                            <CustomDatePicker
                              label="Passport Expiry Date"
                              value={localPaxDetails.dExpdt}
                              onChange={(date) => handlePaxDetailsChange('dExpdt', date)}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>

                    {/* Other IDs Section */}
                    <Grid item xs={12}>
                      <Box sx={{ 
                        border: `1px solid ${Colortheme.text}`,
                        borderRadius: '8px',
                        padding: 2,
                        mb: 2
                      }}>
                        <h3 style={{ color: Colortheme.text, marginTop: 0 }}>Other IDs</h3>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={3}>
                            <CustomAutoComplete
                              label="ID Type"
                              options={idTypeOptions}
                              value={idTypeOptions.find(opt => opt.value === localPaxDetails.vIDREF1) || null}
                              onChange={(e, newValue) => handlePaxDetailsChange('vIDREF1', newValue ? newValue.value : '')}
                              getOptionLabel={(option) => option.label || ''}
                              isOptionEqualToValue={(option, value) => option.value === value.value}
                            />
                          </Grid>

                          <Grid item xs={12} md={3}>
                            <CustomTextField
                              label="ID Number"
                              value={localPaxDetails.vIDREF1NO}
                              onChange={(e) => handlePaxDetailsChange('vIDREF1NO', e.target.value)}
                            />
                          </Grid>

                          <Grid item xs={12} md={3}>
                            <CustomDatePicker
                              label="ID Expiry Date"
                              value={localPaxDetails.dIDREF1EXPDT}
                              onChange={(date) => handlePaxDetailsChange('dIDREF1EXPDT', date)}
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
        <DialogActions sx={{ backgroundColor: Colortheme.background, padding: 2,display:'flex', justifyContent:'space-around'}}>
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
                <StyledButton onClick={handleDialogSave}>
                  Save
                </StyledButton>
              )}
            </>
          )}
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default PartyDetails;
