import React, { useContext } from "react";
import { Autocomplete, useMediaQuery, useTheme } from "@mui/material";
import CustomTextField from "./CustomTextField";
import ThemeContext from "../../contexts/ThemeContext";

const CustomAutocomplete = (props) => {
  const { Colortheme } = useContext(ThemeContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
        "& .Mui-disabled": {
          ".MuiOutlinedInput-notchedOutline": {
            borderColor: "gray", // Custom outline color when disabled
          },
        },
        width: isMobile ? "auto" : "12vw",
      }}
      renderInput={(params) => (
        <CustomTextField
          {...params}
          label={props.label}
          name={props.name}
          value={props.value}
          required={props.required}
        />
      )}
    />
  );
};

export default CustomAutocomplete;
