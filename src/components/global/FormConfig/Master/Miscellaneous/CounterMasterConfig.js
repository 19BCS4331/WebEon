const baseUrl = process.env.REACT_APP_BASE_URL;
const FinalBaseURL = `/pages/Master/Miscellaneous`;

export const formConfigs = {
  counterMasterForm: {
    endpoint: `${FinalBaseURL}/counterMaster`,
    columns: [
      { field: "vCounterID", headerName: "Counter ID", width: 150 },
      { field: "vCounterName", headerName: "Counter Name", width: 200 },
      { field: "vDescription", headerName: "Description", width: 200 },
      { field: "Remark", headerName: "Remark", width: 200 },
      { 
        field: "bIsActive", 
        headerName: "Status", 
        width: 120,
        valueGetter: (params) => (params.row.bIsActive ? "Active" : "Inactive"),
      },
    ],

    fields: [
      {
        name: "vCounterID",
        label: "Counter ID",
        type: "text",
        required: true,
      },
      {
        name: "vCounterName",
        label: "Counter Name",
        type: "text",
        required: true,
      },
      {
        name: "vDescription",
        label: "Description",
        type: "text",
        required: false,
      },
      {
        name: "Remark",
        label: "Remark",
        type: "text",
        required: false,
      },
      {
        name: "bIsActive",
        label: "Active",
        type: "checkbox",
        defaultValue: true,
        required: false,
      },
    ],

    formDataID: "nCounterID",
  },
};
