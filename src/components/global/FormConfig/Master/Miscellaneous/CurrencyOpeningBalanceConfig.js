const baseUrl = process.env.REACT_APP_BASE_URL;
const FinalBaseURL = `/pages/Miscellaneous/OpeningBalances`;

export const formConfigs = {
  currencyOpeningBalanceForm: {
    endpoint: `${FinalBaseURL}/currencyOpeningBalance`,
    tableNameEndpoint: `${FinalBaseURL}/curropn`,
    columns: [
      { field: "counter", headerName: "Counter", width: 120 },
      { field: "cncode", headerName: "Currency Code", width: 150 },
      { field: "exchtype", headerName: "Exchange Type", width: 150 },
      { field: "date", headerName: "Date", width: 150, 
        valueGetter: (params) => params.row.date ? new Date(params.row.date).toLocaleDateString() : "" },
      { field: "feamount", headerName: "FE Amount", width: 150, 
        valueGetter: (params) => params.row.feamount ? Number(params.row.feamount).toFixed(2) : "0.00" },
      { field: "amount", headerName: "Amount (INR)", width: 150, 
        valueGetter: (params) => params.row.amount ? Number(params.row.amount).toFixed(2) : "0.00" },
      { field: "vBranchCode", headerName: "Branch Code", width: 150 },
    ],

    fields: [
      {
        name: "counter",
        label: "Counter",
        type: "autocomplete",
        required: true,
        fetchOptions: `${FinalBaseURL}/counters`,
        fetchMethod: "POST",
        includeContextFields: ["branchId", "counterId"],  
        // The fetchBody is not needed as the dynamicBody in MainFormComponent will automatically 
        // include branch and counter data from AuthContext
        valueField: "nCounterID",
        labelField: "nCounterID",
      },
      {
        name: "cncode",
        label: "Currency Code",
        type: "autocomplete",
        required: true,
        fetchOptions: `${FinalBaseURL}/currencies`,
        valueField: "vCncode",
        labelField: "vCnName",
      },
      {
        name: "exchtype",
        label: "Exchange Type",
        type: "autocomplete",
        required: true,
        fetchOptions: `${FinalBaseURL}/products`,
        valueField: "PRODUCTCODE",
        labelField: "DESCRIPTION",
      },
      {
        name: "isscode",
        label: "Issue Code",
        type: "text",
        required: false,
        fetchOptions: `${FinalBaseURL}/issuers`,
        enableWhen: {
          field: "exchtype",
          value: "CN",
          operator: "!=",
        },
      },
      {
        name: "series",
        label: "Series",
        type: "text",
        required: false,
        enableWhen: {
          field: "exchtype",
          value: "CN",
          operator: "!=",
        },
      },
      {
        name: "series_",
        label: "Series Flag",
        type: "checkbox",
        required: false,
        defaultValue: false,
        enableWhen: {
          field: "exchtype",
          value: "CN",
          operator: "!=",
        },
      },
      {
        name: "transit",
        label: "Transit",
        type: "checkbox",
        required: false,
        defaultValue: false,
        enableWhen: {
          field: "exchtype",
          value: "CN",
          operator: "!=",
        },
      },
      {
        name: "FESETTLED",
        label: "FE Settled",
        type: "text",
        required: false,
        defaultValue: 0,
        enableWhen: {
          field: "exchtype",
          value: "CN",
          operator: "!=",
        },
      },
      {
        name: "IBRRATE",
        label: "IBR Rate",
        type: "text",
        required: false,
        defaultValue: 0,
      },
      {
        name: "feamount",
        label: "FE Amount",
        type: "text",
        required: true,
        defaultValue: 0,
      },
      {
        name: "amount",
        label: "Amount (INR)",
        type: "text",
        required: true,
        defaultValue: 0,
        calculated: true,
        dependsOn: ["IBRRATE", "feamount"],
        formula: (values) => {
          const ibrRate = parseFloat(values.IBRRATE) || 0;
          const feAmount = parseFloat(values.feamount) || 0;
          return (ibrRate * feAmount).toFixed(2);
        }
      },
      {
        name: "no_from",
        label: "Number From",
        type: "text",
        required: false,
        enableWhen: {
          field: "exchtype",
          value: "CN",
          operator: "!=",
        },
      },
      {
        name: "no_to",
        label: "Number To",
        type: "text",
        required: false,
        enableWhen: {
          field: "exchtype",
          value: "CN",
          operator: "!=",
        },
      },
      {
        name: "denominat",
        label: "Denomination",
        type: "text",
        required: false,
        defaultValue: 0,
        enableWhen: {
          field: "exchtype",
          value: "CN",
          operator: "!=",
        },
      },
      {
        name: "brate",
        label: "Base Rate",
        type: "text",
        required: false,
        defaultValue: 0,
      },
    ],
  },
};
