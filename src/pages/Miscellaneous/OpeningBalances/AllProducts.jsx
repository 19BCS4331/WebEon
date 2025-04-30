import React, { useContext, useState, useRef } from "react";
import MainContainerCompilation from "../../../components/global/MainContainerCompilation";
import MainFormComponent from "../../../components/global/Form/MainFormComponent";
import { formConfigs } from "../../../components/global/FormConfig/Master/Miscellaneous/CurrencyOpeningBalanceConfig";
import ThemeContext from "../../../contexts/ThemeContext";
import { useToast } from "../../../contexts/ToastContext";
import { useAuth } from "../../../contexts/AuthContext";
import axios from "axios";
import Papa from "papaparse";
import { apiClient } from "../../../services/apiClient";

const AllProducts = () => {
  const { Colortheme } = useContext(ThemeContext);
  const { showToast } = useToast();
  const { branch } = useAuth();
  const [isImporting, setIsImporting] = useState(false);
  const refreshDataRef = useRef(null);

  // Function to handle file selection for import
  const handleImport = () => {
    // Create a file input element
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".csv";

    // Handle file selection
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        setIsImporting(true);

        // Parse CSV file
        const results = await new Promise((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => resolve(results),
            error: (error) => reject(error),
          });
        });

        if (results.data && results.data.length > 0) {
          // Validate data
          const validData = results.data.filter((row) => {
            return (
              row.counter &&
              row.cncode &&
              row.exchtype &&
              row.feamount &&
              row.amount &&
              row.vBranchCode
            );
          });

          if (validData.length === 0) {
            showToast("No valid records found in CSV", "error");
            setIsImporting(false);
            return;
          }

          // Process data to ensure correct types
          const processedData = validData.map((row) => ({
            counter: row.counter,
            cncode: row.cncode,
            exchtype: row.exchtype,
            isscode: row.isscode || null,
            date: row.date || new Date().toISOString().split("T")[0],
            series: row.series || null,
            series_: row.series_ === "true",
            transit: row.transit === "true",
            FESETTLED: parseFloat(row.FESETTLED || 0),
            IBRRATE: parseFloat(row.IBRRATE || 0),
            feamount: parseFloat(row.feamount),
            amount: parseFloat(row.amount),
            no_from: row.no_from || null,
            no_to: row.no_to || null,
            denominat: parseFloat(row.denominat || 0),
            brate: parseFloat(row.brate || 0),
            nBranchID: parseInt(row.nBranchID || branch.nBranchID),
            vBranchCode: row.vBranchCode || branch.vBranchCode,
          }));

          // Send data to server for bulk import
          const response = await apiClient.post(
            `/pages/Miscellaneous/OpeningBalances/bulk-import`,
            {
              records: processedData,
            }
          );

          if (response.data.success) {
            showToast(
              `Successfully imported ${processedData.length} records`,
              "success"
            );
            // Refresh data grid
            if (refreshDataRef.current) {
              refreshDataRef.current();
            }
          } else {
            showToast(response.data.message || "Import failed", "error");
          }
        } else {
          showToast("No data found in CSV file", "error");
        }
      } catch (error) {
        console.error("Import error:", error);
        
        // Get the most specific error message available
        let errorMessage = "Error importing data";
        
        // Check for error message in response data
        if (error.response?.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.error) {
            errorMessage = error.response.data.error;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
          
        showToast(errorMessage, "error");
      } finally {
        setIsImporting(false);
      }
    };

    // Trigger file selection dialog
    fileInput.click();
  };

  const handleExport = () => {
    // Handle export logic here
    console.log("Exporting to Excel/CSV");
  };

  const handleRefresh = () => {
    // Refresh data grid
    if (refreshDataRef.current) {
      refreshDataRef.current();
      showToast("Data refreshed successfully", "success");
    }
  };

  const handleFormatDownload = () => {
    // Download the CSV template file
    const templateUrl = "/templates/curr_opn_format.csv";

    // Create a link element and trigger download
    const link = document.createElement("a");
    link.href = templateUrl;
    link.download = "curr_opn_format.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("CSV template downloaded successfully", "success");
  };

  // Store the refresh function from MainFormComponent
  const handleRefreshCallback = (refreshFunc) => {
    refreshDataRef.current = refreshFunc;
  };

  // Define action buttons for the MainFormComponent
  const actionButtons = [
    {
      label: isImporting ? "Importing..." : "Import From Excel/CSV",
      onClick: handleImport,
      icon: "add",
      bgColor: Colortheme.secondaryBG,
      textColor: Colortheme.text,
      style: {width: "250px", gap: "1rem"},
      disabled: isImporting,
    },
    {
      label: "CSV Format",
      onClick: handleFormatDownload,
      icon: "download",
      bgColor: Colortheme.secondaryBG,
      textColor: Colortheme.text,
      style: { width: "150px",gap: "1rem" },
    },
    // {
    //   label: "Export To Excel/CSV",
    //   onClick: handleExport,
    //   icon: "search",
    //   bgColor: Colortheme.secondaryBG,
    //   textColor: Colortheme.text,
    //   style: {width: "250px"}
    // },
    {
      label: "Refresh Data",
      onClick: handleRefresh,
      icon: "refresh",
      bgColor: Colortheme.secondaryBG,
      textColor: Colortheme.text,
      style: {width: "250px", gap: "1rem"}
    }
  ];

  return (
    <MainContainerCompilation title={"Opening Balances"}>
      <MainFormComponent
        formConfig={formConfigs.currencyOpeningBalanceForm}
        formDataID="curropnid"
        editFieldTitle="Currency Opening Balance"
        actionButtons={actionButtons}
        onRefresh={handleRefreshCallback}
      />
    </MainContainerCompilation>
  );
};

export default AllProducts;
