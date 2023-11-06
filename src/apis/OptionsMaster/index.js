import axios from "axios";

const fetchCountryOptions = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(
      `http://localhost:5001/api/nav/CountryOptions`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const fetchCityOptions = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(
      `http://localhost:5001/api/nav/CityOptions`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const fetchStateOptions = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(
      `http://localhost:5001/api/nav/StateOptions`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const fetchNationalityOptions = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(
      `http://localhost:5001/api/nav/NationalityOptions`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const fetchIDOptions = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(
      `http://localhost:5001/api/nav/IDOptions`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const fetchCurrencyRate = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(
      `http://localhost:5001/api/nav/CurrencyRate`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export {
  fetchCountryOptions,
  fetchCityOptions,
  fetchNationalityOptions,
  fetchStateOptions,
  fetchIDOptions,
  fetchCurrencyRate,
};
