const baseUrl = process.env.REACT_APP_BASE_URL;
const FinalBaseURL = `${baseUrl}/pages/Master/MasterProfiles`;

const financialTypeLabels = {
  B: "Balance Sheet",
  P: "Profit & Loss",
  T: "Trading",
};
export const formConfigs = {
  currencyForm: {
    endpoint: `${FinalBaseURL}/currencyProfile`,
    tableNameEndpoint: `${FinalBaseURL}/mCurrency`,
    columns: [
      { field: "vCncode", headerName: "Currency Code", width: 150 },
      { field: "vCnName", headerName: "Currency Name", width: 200 },
    ],

    fields: [
      {
        name: "vCncode",
        label: "Currency Code",
        type: "text",
        required: true,
      },

      {
        name: "vCnName",
        label: "Currency Name",
        type: "text",
        required: true,
      },
      {
        name: "vCountryName",
        label: "Country",
        type: "autocomplete",
        required: false,
        fetchOptions: `${FinalBaseURL}/currencyProfile/countries`,
        // disabled: true,
      },

      {
        name: "nPriority",
        label: "Priority",
        type: "text",
        required: false,
      },

      {
        name: "nRatePer",
        label: "Rate / Per",
        type: "text",
        required: false,
      },

      {
        name: "nDefaultMinRate",
        label: "Default Min Rate",
        type: "text",
        required: false,
      },

      {
        name: "nDefaultMaxRate",
        label: "Default Max Rate",
        type: "text",
        required: false,
      },

      {
        name: "vCalculationMethod",
        label: "Calculation Method",
        type: "select",
        options: [
          { value: "M", label: "Multiplication" },
          { value: "D", label: "Division" },
        ],
        required: false,
      },

      {
        name: "nOpenRatePremium",
        label: "Open Rate Premium",
        type: "text",
        required: false,
      },

      {
        name: "nGulfDiscFactor",
        label: "Gulf Disc Factor",
        type: "text",
        required: false,
      },

      {
        name: "vAmexCode",
        label: "Amex Map Code",
        type: "text",
        required: false,
      },
      {
        name: "nCurrencyGroupID",
        label: "Group",
        type: "autocomplete",
        required: false,
        fetchOptions: "/api/groups",
        fetchNotNeeded: true,
        disabled: true,
      },
      {
        name: "bIsActive",
        label: "Active",
        type: "checkbox",
      },

      {
        name: "bTradedCurrency",
        label: "Only Stocking",
        type: "checkbox",
      },
      // {
      //   name: "openModal",
      //   label: "Open Modal",
      //   type: "button",
      //   onClick: () => {
      //     // Logic to open the modal
      //     console.log("Modal opened");
      //   },
      //   dependencies: ["currency"], // Enabling this field enables 'currency'
      // },
    ],
  },

  financialCodesForm: {
    endpoint: `${FinalBaseURL}/financialProfile`,

    fields: [
      {
        name: "vFinType",
        label: "Financial Type",
        type: "select",
        options: [
          { value: "", label: "Select Financial Type" },
          { value: "B", label: "Balance Sheet" },
          { value: "P", label: "Profit & Loss" },
          { value: "T", label: "Trading" },
        ],
        required: true,
      },

      {
        name: "vFinCode",
        label: "Financial Code",
        type: "text",
        required: true,
      },
      {
        name: "vFinName",
        label: "Financial Name",
        type: "text",
        required: true,
      },
      {
        name: "vDefaultSign",
        label: "Default Sign",
        type: "select",
        options: [
          { value: "", label: "Select Default Sign" },
          { value: "C", label: "Credit" },
          { value: "D", label: "Debit" },
        ],
        required: false,
      },

      {
        name: "nPriority",
        label: "Priority",
        type: "text",
        required: false,
      },
    ],
    columns: [
      {
        field: "vFinType",
        headerName: "Fin Type",
        width: 150,
        renderCell: (params) =>
          financialTypeLabels[params.value] || params.value,
      },
      { field: "vFinCode", headerName: "Fin Code", width: 150 },
      { field: "vFinName", headerName: "Fin Name", width: 150 },
    ],
  },

  financialSubCodesForm: {
    endpoint: `${FinalBaseURL}/financialSubProfile`,
    tableNameEndpoint: `${FinalBaseURL}/FinancialSubProfile`,
    fields: [
      {
        name: "vFinType",
        label: "Financial Type",
        type: "select",
        options: [
          { value: "", label: "Select Financial Type" },
          { value: "B", label: "Balance Sheet" },
          { value: "P", label: "Profit & Loss" },
          { value: "T", label: "Trading" },
        ],
        required: true,
        dependencies: ["vFinCode"],
      },

      {
        name: "vFinCode",
        label: "Financial Code",
        type: "autocomplete",
        fetchOptions: `${FinalBaseURL}/financialSubProfile/finCode`,
        required: true,
        dependent: true,
        dependsOn: "vFinType",
      },
      {
        name: "vSubFinCode",
        label: "Financial Sub Code",
        type: "text",
        required: true,
      },
      {
        name: "vSubFinName",
        label: "Financial Sub Name",
        type: "text",
        required: true,
      },

      {
        name: "nPriority",
        label: "Priority",
        type: "text",
        required: false,
      },
    ],

    columns: [
      { field: "vSubFinCode", headerName: "Sub Fin Code", width: 150 },
      { field: "vSubFinName", headerName: "Sub Fin Name", width: 150 },
      { field: "vFinCode", headerName: "Fin Code", width: 150 },
      // Add more column configurations if needed
    ],

    hiddenColumns: {},
  },

  divisionProfileForm: {
    endpoint: `${FinalBaseURL}/divisionProfile`,

    fields: [
      {
        name: "vDivCode",
        label: "Division Code",
        type: "text",
        required: true,
      },
      {
        name: "vDivName",
        label: "Division Name",
        type: "text",
        required: true,
      },

      {
        name: "vBranchCode",
        label: "Controlling Branch",
        type: "autocomplete",
        fetchOptions: `${FinalBaseURL}/divisionProfile/branch`,
        required: false,
      },
    ],

    columns: [
      { field: "vDivCode", headerName: "Division Code", width: 150 },
      { field: "vDivName", headerName: "Division Name", width: 200 },
      { field: "vBranchCode", headerName: "Controlling Branch", width: 150 },
      // Add more column configurations if needed
    ],
  },

  divisionDetailsForm: {
    endpoint: `${FinalBaseURL}/divisionDetails`,

    fields: [
      {
        name: "vDivCode",
        label: "Division Code",
        type: "autocomplete",
        fetchOptions: `${FinalBaseURL}/divisionDetails/divCode`,
        required: true,
      },
      {
        name: "nNo_of_Emp",
        label: "Number Of Employees",
        type: "text",
        required: false,
      },

      {
        name: "vHeadDept",
        label: "Head Of Department",
        type: "text",
        required: false,
      },

      {
        name: "vContactH",
        label: "Contact Number (HOD)",
        type: "text",
        required: false,
      },

      {
        name: "nAreaManagerID",
        label: "Area Manager",
        type: "text",
        required: false,
      },

      {
        name: "vContactAM",
        label: "Contact Number (Area Manager)",
        type: "text",
        required: false,
      },

      {
        name: "IsActive",
        label: "Active",
        type: "checkbox",
        required: false,
      },
    ],

    columns: [
      { field: "vDivCode", headerName: "Division Code", width: 150 },
      { field: "vHeadDept", headerName: "HOD", width: 200 },
      { field: "vContactH", headerName: "HOD Contact", width: 150 },
      // Add more column configurations if needed
    ],
  },

  accountsProfileForm: {
    endpoint: `${FinalBaseURL}/accountsProfile`,

    columns: [
      { field: "vCode", headerName: "Code", width: 120 },
      { field: "vName", headerName: "Name", width: 200 },
      {
        field: "bActive",
        headerName: "Status",
        width: 120,
        valueGetter: (params) => (params.row.bActive ? "Active" : "Inactive"),
      },
    ],

    fields: [
      {
        name: "nDivisionID",
        label: "Division / Dept",
        type: "select",
        isApi: true,
        fetchOptions: `${FinalBaseURL}/accountsProfile/division`,
        required: true,
      },
      {
        name: "vCode",
        label: "Account Code",
        type: "text",
        required: false,
      },

      {
        name: "vName",
        label: "Account Name",
        type: "text",
        required: false,
      },

      {
        name: "vNature",
        label: "Account Type",
        type: "select",
        isApi: true,
        fetchOptions: `${FinalBaseURL}/accountsProfile/accType`,
        required: false,
        dependencies: ["vSblnat"],
      },

      {
        name: "vSblnat",
        label: "Sub Ledger Type",
        type: "select",
        isApi: true,
        fetchOptions: `${FinalBaseURL}/accountsProfile/subLedgerType`,
        required: false,
        enableWhen: {
          field: "vNature",
          value: "S",
        },
      },

      {
        name: "vBankType",
        label: "Bank Nature",
        type: "select",
        options: [
          { value: "", label: "Select Bank Nature" },
          { value: 0, label: "Local" },
          { value: 1, label: "Nostro" },
        ],
        required: false,
        enableWhen: {
          field: "vNature",
          value: "B",
        },
      },

      {
        name: "nCurrencyID",
        label: "Currency",
        type: "select",
        isApi: true,
        fetchOptions: `${FinalBaseURL}/accountsProfile/currency`,
        required: false,
        enableWhen: {
          field: "vBankType",
          value: 1,
        },
      },

      {
        name: "vFinType",
        label: "Financial Type",
        type: "select",
        options: [
          { value: "", label: "Select Financial Type" },
          { value: "B", label: "Balance Sheet" },
          { value: "P", label: "Profit & Loss" },
          { value: "T", label: "Trading" },
        ],
        required: true,
        dependencies: ["vFinCode"],
      },

      {
        name: "vFinCode",
        label: "Financial Code",
        type: "autocomplete",
        fetchOptions: `${FinalBaseURL}/accountsProfile/finCode`,
        required: true,
        dependent: true,
        dependsOn: "vFinType",
        dependencies: ["vSubFinCode"],
      },
      {
        name: "vSubFinCode",
        label: "Financial Sub Code",
        type: "select",
        isApi: true,
        dependent: true,
        dependsOn: "vFinCode",
        fetchOptions: `${FinalBaseURL}/accountsProfile/subfinCode`,
        required: false,
      },

      {
        name: "nPCColID",
        label: "Petty Cash Expense ID",
        type: "text",
        required: false,
      },

      {
        name: "bZeroBalatEOD",
        label: "Zero Balance At EOD",
        type: "checkbox",
        required: false,
      },

      {
        name: "nBranchIDtoTransfer",
        label: "Branch To Transfer",
        type: "select",
        isApi: true,
        fetchOptions: `${FinalBaseURL}/accountsProfile/branchTransfer`,
        required: false,
        enableWhen: {
          field: "bZeroBalatEOD",
          value: true,
        },
      },

      {
        name: "bDoSales",
        label: "Do Sale",
        type: "checkbox",
        required: false,
      },
      {
        name: "bDoPurchase",
        label: "Do Purchase",
        type: "checkbox",
        required: false,
      },
      {
        name: "bDoReceipts",
        label: "Do Receipt",
        type: "checkbox",
        required: false,
      },
      {
        name: "bDoPayments",
        label: "Do Payments",
        type: "checkbox",
        required: false,
      },
      {
        name: "bActive",
        label: "Active",
        type: "checkbox",
        required: false,
      },
      {
        name: "bCMSBank",
        label: "CMS Bank",
        type: "checkbox",
        required: false,
      },
      {
        name: "bDirectRemit",
        label: "Direct Remittance",
        type: "checkbox",
        required: false,
      },
    ],
  },

  ad1MasterForm: {
    endpoint: `${FinalBaseURL}/ad1Master`,
    columns: [
      { field: "vCode", headerName: "Code", width: 150 },
      { field: "vName", headerName: "Name", width: 200 },
      { field: "vEmail", headerName: "Email", width: 150 },
    ],

    fields: [
      {
        name: "vCode",
        label: "Code",
        type: "text",
        required: true,
      },
      {
        name: "dIntdate",
        label: "Date Of Intro",
        type: "date",
        required: false,
      },

      {
        name: "vName",
        label: "Name",
        type: "text",
        required: false,
      },

      {
        name: "vAddress1",
        label: "Address",
        type: "text",
        required: false,
      },
      {
        name: "vLocation",
        label: "Location",
        type: "text",
        required: false,
      },
      {
        name: "vPhone",
        label: "Phone No.",
        type: "text",
        required: false,
      },
      {
        name: "vFax",
        label: "Fax No.",
        type: "text",
        required: false,
      },

      {
        name: "vEmail",
        label: "Email",
        type: "text",
        required: false,
      },

      {
        name: "vWebsite",
        label: "Website",
        type: "text",
        required: false,
      },

      {
        name: "vCommRcvbl",
        label: "Commission Receivable",
        type: "text",
        required: false,
      },

      {
        name: "vCommAccount",
        label: "Commission Account",
        type: "text",
        required: false,
      },
      {
        name: "divfactor",
        label: "Div Factor",
        type: "text",
        required: false,
      },
      {
        name: "ADType",
        label: "Type",
        type: "select",
        options: [
          { value: "", label: "Select Type" },
          { value: "BN", label: "Bank" },
          { value: "AD", label: "AD II" },
        ],
        required: false,
      },
      {
        name: "vServiceChargeAcc",
        label: "Service Charge",
        type: "text",
        required: false,
      },
      {
        name: "bLvalue",
        label: "Active",
        type: "checkbox",
        required: false,
      },
    ],
  },
};
