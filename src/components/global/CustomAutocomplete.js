// CustomAutocomplete.js
import React, { useContext } from "react";
import { Autocomplete } from "@mui/material";
import CustomTextField from "./CustomTextField";
import ThemeContext from "../../contexts/ThemeContext";

const CustomAutocomplete = (props) => {
  const { Colortheme } = useContext(ThemeContext);

  return (
    <Autocomplete
      {...props}
      sx={{
        "& .MuiAutocomplete-clearIndicator": {
          color: Colortheme.text,
        },
        "& .MuiAutocomplete-popupIndicator": {
          color: Colortheme.text,
        },
      }}
      renderInput={(params) => (
        <CustomTextField {...params} label={props.label} />
      )}
    />
  );
};

export default CustomAutocomplete;
