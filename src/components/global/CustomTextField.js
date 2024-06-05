// CustomTextField.js
import React, { useContext } from "react";
import { TextField, useMediaQuery, useTheme } from "@mui/material";
import ThemeContext from "../../contexts/ThemeContext";

const CustomTextField = ({
  value,
  error,
  onChange,
  label,
  select,
  children,
  ...props
}) => {
  const { Colortheme } = useContext(ThemeContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <TextField
      label={label}
      variant="outlined"
      select={select}
      sx={{
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: Colortheme.text,
          },
          "&:hover fieldset": {
            borderColor: Colortheme.text,
          },
          "&.Mui-focused fieldset": {
            borderColor: Colortheme.text,
          },
          "&.Mui-error fieldset": {
            borderColor: "red",
          },
          "& .MuiSvgIcon-root": {
            // This targets the dropdown arrow icon
            color: Colortheme.text,
          },
        },
        "& .MuiInputLabel-root": {
          color: Colortheme.text,
        },
        "& .MuiInputLabel-root.Mui-focused": {
          color: Colortheme.text,
        },
        "& .MuiInputLabel-root.Mui-error": {
          color: "red",
        },
        "& .MuiOutlinedInput-input": {
          color: Colortheme.text,
        },
        "& .MuiOutlinedInput-input.Mui-error": {
          color: "red",
        },
        "& .Mui-disabled": {
          ":hover fieldset": {
            borderColor: "gray",
          },
        },
        width: isMobile ? "auto" : "12vw",
      }}
      value={value}
      error={error}
      onChange={onChange}
      {...props}
    >
      {select ? children : null}
    </TextField>
  );
};

export default CustomTextField;
