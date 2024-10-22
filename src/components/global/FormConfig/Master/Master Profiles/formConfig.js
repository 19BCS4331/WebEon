const baseUrl = process.env.REACT_APP_BASE_URL;
export const formConfigs = {
  currencyForm: {
    endpoint: `${baseUrl}/pages/Master/MasterProfiles/currencyProfile`,

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
        fetchOptions: `${baseUrl}/pages/Master/MasterProfiles/currencyProfile/countries`,
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
    endpoint: `${baseUrl}/pages/Master/MasterProfiles/financialProfile`,

    fields: [
      {
        name: "vFinType",
        label: "Financial Type",
        type: "select",
        options: [
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
  },

  financialSubCodesForm: {
    endpoint: `${baseUrl}/pages/Master/MasterProfiles/financialSubProfile`,

    fields: [
      {
        name: "vFinType",
        label: "Financial Type",
        type: "select",
        options: [
          { value: "B", label: "Balance Sheet" },
          { value: "P", label: "Profit & Loss" },
          { value: "T", label: "Trading" },
        ],
        required: true,
        // dependencies: ["vFinCode"],
      },

      {
        name: "vFinCode",
        label: "Financial Code",
        type: "autocomplete",
        fetchOptions: `${baseUrl}/pages/Master/MasterProfiles/financialSubProfile/finCode`,
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
  },

  divisionProfileForm: {
    endpoint: `${baseUrl}/pages/Master/MasterProfiles/divisionProfile`,

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
        fetchOptions: `${baseUrl}/pages/Master/MasterProfiles/divisionProfile/branch`,
        required: false,
      },
    ],
  },

  divisionDetailsForm: {
    endpoint: `${baseUrl}/pages/Master/MasterProfiles/divisionDetails`,

    fields: [
      {
        name: "vDivCode",
        label: "Division Code",
        type: "autocomplete",
        fetchOptions: `${baseUrl}/pages/Master/MasterProfiles/divisionDetails/divCode`,
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
  },

  accountsProfileForm: {
    endpoint: `${baseUrl}/pages/Master/MasterProfiles/accountsProfile`,

    fields: [
      {
        name: "nDivisionID",
        label: "Division / Dept",
        type: "select",
        fetchOptions: `${baseUrl}/pages/Master/MasterProfiles/accountsProfile/division`,
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
        fetchOptions: `${baseUrl}/pages/Master/MasterProfiles/accountsProfile/accType`,

        required: false,
      },

      {
        name: "vSblnat",
        label: "Sub Ledger Type",
        type: "select",
        fetchOptions: `${baseUrl}/pages/Master/MasterProfiles/accountsProfile/subLedgerType`,
        required: false,
      },

      {
        name: "vBankType",
        label: "Bank Nature",
        type: "select",
        options: [
          { value: 0, label: "Local" },
          { value: 1, label: "Nostro" },
        ],
        required: false,
      },

      {
        name: "nCurrencyID",
        label: "Currency",
        type: "select",
        fetchOptions: `${baseUrl}/pages/Master/MasterProfiles/accountsProfile/currency`,
        required: false,
      },

      {
        name: "vFinType",
        label: "Financial Type",
        type: "select",
        options: [
          { value: "B", label: "Balance Sheet" },
          { value: "P", label: "Profit & Loss" },
          { value: "T", label: "Trading" },
        ],
        required: true,
        // dependencies: ["vFinCode"],
      },

      {
        name: "vFinCode",
        label: "Financial Code",
        type: "autocomplete",
        fetchOptions: `${baseUrl}/pages/Master/MasterProfiles/accountsProfile/finCode`,
        required: true,
        dependent: true,
        dependsOn: "vFinType",
      },
      {
        name: "vSubFinCode",
        label: "Financial Sub Code",
        type: "select",
        fetchOptions: `${baseUrl}/pages/Master/MasterProfiles/accountsProfile/finSubCode`,
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
        fetchOptions: `${baseUrl}/pages/Master/MasterProfiles/accountsProfile/branchTransfer`,
        required: false,
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
    endpoint: `${baseUrl}/pages/Master/MasterProfiles/ad1Master`,

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
