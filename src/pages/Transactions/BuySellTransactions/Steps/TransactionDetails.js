import React, { useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import CustomDatePicker from '../../../../components/global/CustomDatePicker';
import CustomTextField from '../../../../components/global/CustomTextField';
import { useTransaction } from '../../../../contexts/TransactionContext';
import { apiClient } from '../../../../services/apiClient';

const TransactionDetails = ({ data, onUpdate }) => {
  const { setError, clearError } = useTransaction();
  const [subPurposeOptions, setSubPurposeOptions] = useState([]);

  const handleChange = (field, value) => {
    clearError(field);
    onUpdate({
      [field]: value,
      ...(field === 'Amount' && { 
        Netamt: calculateNetAmount(value, data.TaxAmt)
      })
    });
  };

  const calculateNetAmount = (amount, taxAmt) => {
    const amt = parseFloat(amount) || 0;
    const tax = parseFloat(taxAmt) || 0;
    return amt + tax;
  };

  useEffect(() => {
    const fetchSubPurposes = async () => {
      if (data.Purpose) {
        try {
          const response = await apiClient.get('/pages/Transactions/getSubPurposes', {
            params: { purposeId: data.Purpose }
          });
          setSubPurposeOptions(response.data);
        } catch (error) {
          console.error('Error fetching sub purposes:', error);
          setError('SubPurpose', 'Failed to load sub purposes');
        }
      }
    };

    fetchSubPurposes();
  }, [data.Purpose]);

  return (
    <Grid container spacing={2} sx={{ mt: 2 }}>
      <Grid item xs={12} md={6}>
        <CustomDatePicker
          label="Transaction Date"
          value={data.date}
          onChange={(newValue) => handleChange('date', newValue)}
          required
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <CustomTextField
          fullWidth
          label="Counter ID"
          value={data.CounterID}
          onChange={(e) => handleChange('CounterID', e.target.value)}
          required
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <CustomTextField
          fullWidth
          label="Shift ID"
          value={data.ShiftID}
          onChange={(e) => handleChange('ShiftID', e.target.value)}
          required
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <CustomTextField
          fullWidth
          label="Amount"
          type="number"
          value={data.Amount}
          onChange={(e) => handleChange('Amount', e.target.value)}
          required
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <CustomTextField
          fullWidth
          label="Tax Amount"
          type="number"
          value={data.TaxAmt}
          onChange={(e) => handleChange('TaxAmt', e.target.value)}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <CustomTextField
          fullWidth
          label="Net Amount"
          type="number"
          value={data.Netamt}
          disabled
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <CustomTextField
          fullWidth
          select
          label="Sub Purpose"
          value={data.SubPurpose}
          onChange={(e) => handleChange('SubPurpose', e.target.value)}
          SelectProps={{
            native: true,
          }}
        >
          <option value="">Select Sub Purpose</option>
          {subPurposeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </CustomTextField>
      </Grid>

      <Grid item xs={12} md={6}>
        <CustomTextField
          fullWidth
          label="By Cash"
          type="number"
          value={data.byCash}
          onChange={(e) => handleChange('byCash', e.target.value)}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <CustomTextField
          fullWidth
          label="By Cheque"
          type="number"
          value={data.byChq}
          onChange={(e) => handleChange('byChq', e.target.value)}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <CustomTextField
          fullWidth
          label="By Card"
          type="number"
          value={data.byCard}
          onChange={(e) => handleChange('byCard', e.target.value)}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <CustomTextField
          fullWidth
          label="By Transfer"
          type="number"
          value={data.byTransfer}
          onChange={(e) => handleChange('byTransfer', e.target.value)}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <CustomTextField
          fullWidth
          label="By Other"
          type="number"
          value={data.byOth}
          onChange={(e) => handleChange('byOth', e.target.value)}
        />
      </Grid>
    </Grid>
  );
};

export default TransactionDetails;
