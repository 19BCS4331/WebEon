// FormDataContext.js
import React, { createContext, useState, useContext } from "react";

const FormDataContext = createContext();

export const useFormData = () => useContext(FormDataContext);

export const FormDataProvider = ({ children }) => {
  const [buyFromIndiviformData, setBuyFromIndiviformData] = useState({});

  const updateFormData = (buyfromindivsubformData) => {
    setBuyFromIndiviformData((prevData) => ({
      ...prevData,
      ...buyfromindivsubformData,
    }));
  };

  const resetFormData = () => {
    setBuyFromIndiviformData({});
  };

  return (
    <FormDataContext.Provider
      value={{ buyFromIndiviformData, updateFormData, resetFormData }}
    >
      {children}
    </FormDataContext.Provider>
  );
};
