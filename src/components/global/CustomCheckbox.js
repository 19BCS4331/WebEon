// CustomCheckbox.js
import React, { useContext } from "react";
import { Checkbox, FormControlLabel, Typography } from "@mui/material";
import ThemeContext from "../../contexts/ThemeContext";

const CustomCheckbox = ({
  name,
  label,
  checked,
  onChange,
  disabled,
  ...props
}) => {
  const { Colortheme } = useContext(ThemeContext);

  return (
    <FormControlLabel
      control={
        <Checkbox
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          sx={{
            color: disabled ? "gray" : Colortheme.text,
            "&.Mui-checked": {
              color: disabled ? "gray" : Colortheme.text,
            },
            "& .MuiSvgIcon-root": {
              fontSize: 28,
              color: disabled ? "gray" : Colortheme.text,
            },
          }}
          {...props}
        />
      }
      label={
        <Typography sx={{ color: disabled ? "gray" : Colortheme.text }}>
          {label}
        </Typography>
      }
    />
  );
};

export default CustomCheckbox;
