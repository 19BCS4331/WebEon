// CustomCheckbox.js
import React, { useContext } from "react";
import { Checkbox, FormControlLabel } from "@mui/material";
import ThemeContext from "../../contexts/ThemeContext";

const CustomCheckbox = ({ name, label, checked, onChange, ...props }) => {
  const { Colortheme } = useContext(ThemeContext);

  return (
    <FormControlLabel
      control={
        <Checkbox
          name={name}
          checked={checked}
          onChange={onChange}
          sx={{
            color: Colortheme.text,
            "&.Mui-checked": {
              color: Colortheme.text,
            },
            "& .MuiSvgIcon-root": {
              fontSize: 28,
            },
          }}
          {...props}
        />
      }
      label={label}
      sx={{
        color: Colortheme.text,
      }}
    />
  );
};

export default CustomCheckbox;
