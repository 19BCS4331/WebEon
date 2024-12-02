import React, { useContext, useEffect, useState } from 'react';
import { Grid, MenuItem } from '@mui/material';
import CustomTextField from '../../../../components/global/CustomTextField';
import CustomDatePicker from '../../../../components/global/CustomDatePicker';
import { AuthContext } from '../../../../contexts/AuthContext';
import { apiClient } from '../../../../services/apiClient';
import { useParams } from 'react-router-dom';
import { useTransaction } from '../../../../contexts/TransactionContext';

const entityOptions = [
  { value: 'I', label: 'INDIVIDUAL' },
  { value: 'C', label: 'CORPORATE' }
];

const BasicDetails = ({ data, onUpdate }) => {
  const { With: vTrnwith } = useParams();
  const { userId, branch, counter } = useContext(AuthContext);
  const { setError, clearError } = useTransaction();
  const [purposeOptions, setPurposeOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);

  const handleChange = (field, value) => {
    if (field === 'TRNWITHIC') {
      onUpdate({
        [field]: value,
        Purpose: value === 'I' ? '8' : '30'
      });
      clearError(field);
    } else {
      onUpdate({ [field]: value });
      clearError(field);
    }
  };

  useEffect(() => {
    const getCategoryOptions = async () => {
      try {
        const response = await apiClient.get('/pages/Transactions/getCategoryOptions');
        setCategoryOptions(response.data);
        if (response.data.length > 0 && !data.Category) {
          handleChange('Category', 'L');
        }
      } catch (error) {
        console.error('Error getting category options:', error);
        setError('Category', 'Failed to load categories');
      }
    };

    getCategoryOptions();

    // Set context values
    handleChange('CounterID', counter);
    handleChange('UserID', userId);
    handleChange('nBranchID', branch.nBranchID);
    handleChange('vBranchCode', branch.vBranchCode);
  }, [counter, userId, branch]);

  useEffect(() => {
    const getPurposeOptions = async () => {
      if (data.TRNWITHIC) {
        try {
          const response = await apiClient.get('/pages/Transactions/getPurposeOptions', {
            params: {
              vTrnWith: data.vTrnwith,
              vTrnType: data.vTrntype,
              TrnSubType: data.TRNWITHIC
            }
          });
          setPurposeOptions(response.data);
        } catch (error) {
          console.error('Error getting purpose options:', error);
          setError('Purpose', 'Failed to load purposes');
        }
      }
    };

    getPurposeOptions();
  }, [data.TRNWITHIC, data.vTrnwith, data.vTrntype]);

  return (
    <Grid container spacing={3} width={'100%'}>
      <Grid item xs={12} md={2.4}>
        <CustomTextField
          select={true}
          label="Entity"
          value={data.TRNWITHIC || ''}
          onChange={(e) => handleChange('TRNWITHIC', e.target.value)}
          required
        
        >
          {entityOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </CustomTextField>
      </Grid>

      {vTrnwith === 'P' && 
      <Grid item xs={12} md={2.4}>
      <CustomTextField
        select={true}
        label="Purpose"
        value={data.Purpose || ''}
        onChange={(e) => handleChange('Purpose', e.target.value)}
        required
      >
        {purposeOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </CustomTextField>
    </Grid>
      
      }
      

      <Grid item xs={12} md={2.4}>
        <CustomDatePicker
          label="Date"
          value={data.date}
          disabled={true}
        />
      </Grid>

      <Grid item xs={12} md={2.4}>
        <CustomTextField
          label="Manual Bill Ref."
          value={data.ManualBillRef || ''}
          onChange={(e) => handleChange('ManualBillRef', e.target.value)}
        />
      </Grid>

      <Grid item xs={12} md={2.4}>
        <CustomTextField
          label="Transaction No."
          value={data.vNo || ''}
          disabled
          required
        />
      </Grid>

      <Grid item xs={12} md={2.4}>
        <CustomTextField
          select={true}
          label="Category"
          value={data.Category || ''}
          onChange={(e) => handleChange('Category', e.target.value)}
          required
        >
          {categoryOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </CustomTextField>
      </Grid>

      <Grid item xs={12} md={2.4}>
        <CustomTextField
          label="Inv Vendor No."
          value={data.InvVendorNo || ''}
          onChange={(e) => handleChange('InvVendorNo', e.target.value)}
        />
      </Grid>

      <Grid item xs={12} md={2.4}>
        <CustomTextField
          label="Remark"
          value={data.Remark || ''}
          onChange={(e) => handleChange('Remark', e.target.value)}
          multiline
          rows={2}
        />
      </Grid>
    </Grid>
  );
};

export default BasicDetails;
