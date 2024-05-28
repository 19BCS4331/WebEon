import axios from "axios";
const baseUrl = process.env.REACT_APP_BASE_URL;

const TaxMasterCreate = async (data) => {
  const token = localStorage.getItem("token");
  try {
    // Make a POST request to your server endpoint with the data
    const response = await axios.post(
      `${baseUrl}/api/master/TaxMasterCreate`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Error sending data:", error); // Handle error
  }
};

const TaxMasterFetch = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(`${baseUrl}/api/master/TaxMasterFetch`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    console.error("Error sending data:", error); // Handle error
  }
};

const TaxMasterFetchisActive = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(
      `${baseUrl}/api/master/TaxMasterFetchTxn`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Error sending data:", error); // Handle error
  }
};

const TaxMasterSlabFetch = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(
      `${baseUrl}/api/master/TaxMasterSlabFetch`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Error sending data:", error); // Handle error
  }
};

export {
  TaxMasterCreate,
  TaxMasterFetch,
  TaxMasterSlabFetch,
  TaxMasterFetchisActive,
};
