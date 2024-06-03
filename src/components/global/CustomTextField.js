// CustomTextField.js
import React, { useContext } from "react";
import { TextField } from "@mui/material";
import ThemeContext from "../../contexts/ThemeContext";

const CustomTextField = ({ value, error, onChange, label, ...props }) => {
  const { Colortheme } = useContext(ThemeContext);

  return (
    <TextField
      label={label}
      variant="outlined"
      sx={{
        // width: { xs: "50vw", sm: "16vw" },
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
      }}
      value={value}
      error={error}
      onChange={onChange}
      {...props}
    />
  );
};

export default CustomTextField;
