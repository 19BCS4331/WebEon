import axios from "axios";
const baseUrl = process.env.REACT_APP_BASE_URL;

const FincodeFetch = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(`${baseUrl}/api/master/FinCodeFetch`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error sending data:", error); // Handle error
  }
};

const FincodeFetchOnType = async (type) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${baseUrl}/api/master/FinCodeFetchOnType`,
      { type: type },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error sending data:", error); // Handle error
  }
};

const SubFincodeFetchOnFinCode = async (id) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${baseUrl}/api/master/SubFincodeFetchOnFinCode`,
      { id: id },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error sending data:", error); // Handle error
  }
};

const SubFincodeFetchOnFinCodeForEdit = async (code) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${baseUrl}/api/master/SubFincodeFetchOnFinCodeForEdit`,
      { code: code },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error sending data:", error); // Handle error
  }
};

// ---------------CREATE MASTER---------------------

const AccountsProfileCreate = async (data) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${baseUrl}/api/master/AccountsPCreate`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Error sending data:", error);
  }
};

// ---------------CREATE MASTER---------------------

// ---------------FETCH MASTER---------------------

const APMasterFetch = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(`${baseUrl}/api/master/APMasterFetch`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error sending data:", error); // Handle error
  }
};

const getFincodeAsId = async (code) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${baseUrl}/api/master/getFincodeAsId`,
      { code: code },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error sending data:", error); // Handle error
  }
};

// ---------------FETCH MASTER---------------------

export {
  FincodeFetch,
  FincodeFetchOnType,
  SubFincodeFetchOnFinCode,
  AccountsProfileCreate,
  APMasterFetch,
  getFincodeAsId,
  SubFincodeFetchOnFinCodeForEdit,
};
