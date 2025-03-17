import React, { useState, useEffect, useContext } from "react";
import { Box, IconButton, InputAdornment, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import ThemeContext from "../../../../contexts/ThemeContext";
import { apiClient } from "../../../../services/apiClient";
import CustomTextField from "../../../../components/global/CustomTextField";
import CustomDataGrid from "../../../../components/global/CustomDataGrid";
import CustomDatePicker from "../../../../components/global/CustomDatePicker";
import { AuthContext } from "../../../../contexts/AuthContext";

const TransactionList = ({ vTrnwith, vTrntype, onEdit }) => {
  const { branch } = useContext(AuthContext);
  const { Colortheme } = useContext(ThemeContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [fromDate, setFromDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() - 6))
      .toISOString()
      .split("T")[0]
  );
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const branchId = branch.nBranchID;

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/pages/Transactions/transactions", {
        params: {
          vTrnwith,
          vTrntype,
          fromDate,
          toDate,
          branchId,
        },
      });
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeDates = () => {
      const sixMonthsAgo = new Date(new Date().setMonth(new Date().getMonth() - 6))
        .toISOString()
        .split("T")[0];
      const today = new Date().toISOString().split("T")[0];
      
      setFromDate(sixMonthsAgo);
      setToDate(today);
    };

    // Only initialize dates when transaction type changes
    if (vTrnwith || vTrntype) {
      initializeDates();
      setSearchText("");
    }
  }, [vTrnwith, vTrntype]);

  useEffect(() => {
    if (fromDate && toDate && branchId) {
      fetchTransactions();
    }
  }, [fromDate, toDate, branchId, vTrnwith, vTrntype]);

  const getColumns = () => {
    const baseColumns = [
      { field: "vNo", headerName: "Txn No", width: 100 },
      {
        field: "date",
        headerName: "Date",
        width: 150,
        valueFormatter: (params) => {
          if (!params.value) return "";
          const date = new Date(params.value);
          return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          });
        },
      },
    ];

    if (vTrnwith === "P") {
      baseColumns.push(
        { field: "PartyName", headerName: "PaxName", width: 200 },
        { field: "PurposeDescription", headerName: "Purpose", width: 150 }
      );
    }

    baseColumns.push(
      { field: "Amount", headerName: "Amount", width: 120 },
      { field: "vBranchCode", headerName: "Branch", width: 150 },
      {
        field: "actions",
        headerName: "Actions",
        width: 100,
        renderCell: (params) => (
          <IconButton
            onClick={() => onEdit(params.row)}
            sx={{
              color: Colortheme.text,
              "&:hover": {
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
      .join(" ")
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "calc(100vh - 350px)",
        maxHeight: "calc(100vh - 250px)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 2,
          flexWrap: { xs: "wrap", md: "nowrap" },
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
      {filteredTransactions.length > 0 ? (
        <CustomDataGrid
          rows={filteredTransactions}
          columns={columns}
          pageSize={10}
          loading={loading}
          getRowId={(row) => row.nTranID}
          Colortheme={Colortheme}
          customSx={{
            maxHeight: {
              xs: "calc(100vh - 500px)",
              sm: "calc(100vh - 500px)",
              lg: "calc(100vh - 380px)",
            },
          }}
        />
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            flexDirection: "column",
            marginTop: "100px",
          }}
        >
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Typography
              variant="h5"
              color={Colortheme.text}
              sx={{ textAlign: "center" }}
              fontFamily={"Poppins"}
            >
              No transactions found !
            </Typography>
          </Box>
          <Typography
            variant="body1"
            color={Colortheme.text}
            sx={{ textAlign: "center" }}
            fontFamily={"Poppins"}
          >
            Please check your filter criteria or try refreshing the page.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default TransactionList;
