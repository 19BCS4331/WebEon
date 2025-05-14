// BaseUrlContext.js
import React, { createContext, useContext, useState } from "react";

const BaseUrlContext = createContext();

export const BaseUrlProvider = ({ children }) => {
  const urlSet = process.env.REACT_APP_BASE_URL;
  const [baseUrl, setBaseUrl] = useState(urlSet);

  return (
    <BaseUrlContext.Provider value={{ baseUrl, setBaseUrl }}>
      {children}
    </BaseUrlContext.Provider>
  );
};

export const useBaseUrl = () => {
  return useContext(BaseUrlContext);
};
