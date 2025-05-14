const FinalBaseURL = `/pages/Master/Miscellaneous`;

export const formConfigs = {
  subPurposeForm: {
    endpoint: `${FinalBaseURL}/subPurpose`,
    columns: [
      { field: "SubPurposeCode", headerName: "Sub Purpose Code", width: 150 },
      { field: "SubDescription", headerName: "Description", width: 200 },
    ],
    fields: [
      {
        name: "MstPurposeID",
        label: "Master Purpose",
        type: "autocomplete",
        required: true,
        fetchOptions: `${FinalBaseURL}/subPurpose/masterPurposeOptions`,
      },
      {
        name: "SubPurposeCode",
        label: "Sub Purpose Code",
        type: "text",
        required: true,
      },
      {
        name: "SubDescription",
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
     
    ],
    formDataID: "SubPurposeID",
  }
};
