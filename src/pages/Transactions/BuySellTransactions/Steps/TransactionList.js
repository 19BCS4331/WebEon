import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import ThemeContext from '../../../../contexts/ThemeContext';
import { apiClient } from '../../../../services/apiClient';
import CustomTextField from '../../../../components/global/CustomTextField';
import CustomDataGrid from '../../../../components/global/CustomDataGrid';
import CustomDatePicker from '../../../../components/global/CustomDatePicker';

const TransactionList = ({ vTrnwith, vTrntype, onEdit }) => {
  const { Colortheme } = useContext(ThemeContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [fromDate, setFromDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() - 6))
      .toISOString()
      .split('T')[0]
  );
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/pages/Transactions/transactions', {
        params: {
          vTrnwith,
          vTrntype,
          fromDate,
          toDate,
        },
      });
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [vTrnwith, vTrntype, fromDate, toDate]);

  const getColumns = () => {
    const baseColumns = [
      { field: 'vNo', headerName: 'Txn No', width: 100 },
      { 
        field: 'date', 
        headerName: 'Date', 
        width: 150,
        valueFormatter: (params) => {
          if (!params.value) return '';
          const date = new Date(params.value);
          return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
          });
        }
      }
    ];

    if (vTrnwith === 'P') {
      baseColumns.push(
        { field: 'PartyName', headerName: 'PaxName', width: 200 },
        { field: 'PurposeDescription', headerName: 'Purpose', width: 150 }
      );
    }

    baseColumns.push(
      { field: 'Amount', headerName: 'Amount', width: 120 },
      { field: 'vBranchCode', headerName: 'Branch', width: 150 },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 100,
        renderCell: (params) => (
          <IconButton
            onClick={() => onEdit(params.row)}
            sx={{
              color: Colortheme.text,
              '&:hover': {
                backgroundColor: Colortheme.secondaryBG,
              },
            }}
          >
            <EditIcon />
          </IconButton>
        ),
      }
    );

    return baseColumns;
  };

  const columns = getColumns();

  const filteredTransactions = transactions.filter((transaction) =>
    Object.values(transaction)
      .join(' ')
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  return (
    <Box sx={{  width: '100%',minHeight: 'calc(100vh - 350px)',maxHeight: 'calc(100vh - 250px)' }}>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 2,
          flexWrap: { xs: 'wrap', md: 'nowrap' },
        }}
      >
        <CustomDatePicker
          label="From Date"
          value={fromDate}
          onChange={(newValue) => setFromDate(newValue)}
        />
        <CustomDatePicker
          label="To Date"
          value={toDate}
          onChange={(newValue) => setToDate(newValue)}
        />
        <CustomTextField
          label="Search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon sx={{ color: Colortheme.text }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <CustomDataGrid
        rows={filteredTransactions}
        columns={columns}
        pageSize={10}
        loading={loading}
        getRowId={(row) => row.nTranID}
        Colortheme={Colortheme}
        customSx={{ maxHeight: { xs: "calc(100vh - 500px)", sm: "calc(100vh - 500px)", lg: "calc(100vh - 380px)" } }}
      />
    </Box>
  );
};

export default TransactionList;
