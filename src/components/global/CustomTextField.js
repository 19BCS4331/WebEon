// CustomTextField.js
import React, { useContext } from "react";
import { TextField, useMediaQuery, useTheme } from "@mui/material";
import ThemeContext from "../../contexts/ThemeContext";

const CustomTextField = ({
  value,
  error,
  helperText,
  type,
  inputMode,
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
      type={type}
      label={label}
      inputMode={inputMode}
      variant="outlined"
      select={select}
      helperText={helperText}
      SelectProps={{
        MenuProps: {
          sx: { maxHeight: "400px" },
          PaperProps: {
            style: {
              zIndex: 999999,
            },
          },
          disablePortal: false,
        },
      }}
      sx={{
        "& .MuiInputBase-root.Mui-disabled": {
          color: "gray",
          WebkitTextFillColor: "gray",
        },
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: Colortheme.text,
          },
          "&:hover fieldset": {
            borderColor: Colortheme.text,
          },
          "&.Mui-disabled fieldset": {
            borderColor: "gray",
            color: "gray",
          },

          "&.Mui-focused fieldset": {
            borderColor: Colortheme.text,
          },
          "&.Mui-error fieldset": {
            borderColor: "red",
            color: "red",
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
        "& .MuiInputLabel-root.Mui-disabled": {
          color: "gray",
        },
        "& .MuiInputLabel-root.Mui-error": {
          color: "red",
        },
        "& .MuiOutlinedInput-input": {
          color: Colortheme.text,
        },
        "& .MuiOutlinedInput-input.Mui-error": {
          color: "red",
          WebkitTextFillColor: "red",
        },
        "& .MuiOutlinedInput-input.Mui-disabled": {
          WebkitTextFillColor: "gray",
          color: "gray",
        },
        "& .Mui-disabled": {
          ":hover fieldset": {
            borderColor: "gray",
          },
        },
        width: isMobile ? "auto" : "12vw",
        "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
          {
            display: "none",
          },
        "& input[type=number]": {
          MozAppearance: "textfield",
        },
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
