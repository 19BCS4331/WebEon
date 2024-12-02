const baseUrl = process.env.REACT_APP_BASE_URL;
const FinalBaseURL = `/pages/Master/Miscellaneous`;

export const formConfigs = {
  masterPurposeForm: {
    endpoint: `${FinalBaseURL}/masterPurpose`,
    columns: [
      { field: "PurposeCode", headerName: "Purpose Code", width: 150 },
      { field: "TrnSubType", headerName: "Trn Sub Type", width: 150 },
      { field: "Description", headerName: "Description", width: 200 },
      { field: "CashExpLimit", headerName: "Cash Exp Limit", width: 150 },
      
      { 
        field: "isActive", 
        headerName: "Status", 
        width: 120,
        valueGetter: (params) => (params.row.isActive ? "Active" : "Inactive"),
      },
    ],

    fields: [
      {
        name: "vTrnWith",
        label: "Transaction With",
        type: "select",
        required: true,
        options: [
          { value: "", label: "Select Transaction With" },
          { value: "P", label: "PUBLIC" },
          { value: "F", label: "FFFMC/AD" },
          { value: "R", label: "RMC" },
          { value: "C", label: "FRANCHISEE" },
          { value: "B", label: "BRANCH" }
        ]
      },
      {
        name: "vTrnType",
        label: "Transaction Type",
        type: "select",
        required: true,
        options: [
          { value: "", label: "Select Transaction Type" },
          { value: "S", label: "SELLING" },
          { value: "B", label: "BUYING" }
        ]
      },
      {
        name: "TrnSubType",
        label: "Transaction Sub Type",
        type: "select",
        required: true,
        options: [
          { value: "", label: "Select Transaction Sub Type" },
          { value: "I", label: "INDIVIDUAL" },
          { value: "C", label: "CORPORATE" },
          { value: "B", label: "BRANCH" }
        ]
      },
      {
        name: "PurposeCode",
        label: "Purpose Code",
        type: "text",
        required: true,
      },
      {
        name: "Description",
        label: "Description",
        type: "text",
        required: true,
      },
      {
        name: "StatutoryCode",
        label: "Statutory Code",
        type: "text",
        required: false,
      },
      {
        name: "CashExpLimit",
        label: "Cash Exception Limit",
        type: "text",
        required: false,
      },
      {
        name: "CashExpCurrencyCode",
        label: "Currency Code",
        type: "select",
        required: false,
        options: [
          { value: "", label: "Select Currency" },
          { value: "USD", label: "USD" },
          { value: "RS", label: "RS" },
        ],
      },
      {
        name: "SubPurposeApp",
        label: "Sub Purpose App",
        type: "checkbox",
        required: false,
      },
      {
        name: "isActive",
        label: "Active",
        type: "checkbox",
        defaultValue: true,
        required: false,
      },
    ],

    formDataID: "nPurposeID",
  },
};
