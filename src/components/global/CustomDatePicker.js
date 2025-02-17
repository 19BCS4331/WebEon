import React, { useContext } from "react";
import { TextField, useMediaQuery, useTheme } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import ThemeContext from "../../contexts/ThemeContext";
import "../../css/components/datePicker.css";

const CustomDatePicker = (props) => {
  const { Colortheme } = useContext(ThemeContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <DatePicker
      {...props}
      value={props.value ? dayjs(props.value) : null}
      onChange={(newValue) =>
        props.onChange(newValue ? newValue.format("YYYY-MM-DDTHH:mm:ss") : null)
      }
      inputFormat="YYYY-MM-DDTHH:mm:ss"
      format="DD/MM/YYYY"
      slotProps={{
        textField: {
          error: props.error,
          helperText: props.error ? props.helperText : null,
          label: props.label,
          name: props.name,
          required: props.required,
          fullWidth: true,
          style: props.styleTF,
          sx: {
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
              "&.Mui-disabled": {
                "& fieldset": {
                  borderColor: "gray !important",
                },
                "& input": {
                  WebkitTextFillColor: "gray !important",
                  color: "gray !important",
                },
                "& .MuiSvgIcon-root": {
                  color: "gray !important",
                },
              },
              "& .MuiSvgIcon-root": {
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
            "& .MuiInputLabel-root.Mui-disabled": {
              color: "gray !important",
            },
            "& .MuiOutlinedInput-input": {
              color: Colortheme.text,
            },
            "& .MuiOutlinedInput-input.Mui-error": {
              color: "red",
            },
            "& .MuiOutlinedInput-input.Mui-disabled": {
              WebkitTextFillColor: "gray !important",
              color: "gray !important",
            },
            width: isMobile ? "100%" : "12vw",
          },
        },
      }}
      disablePast={props.disablePast}
    />
  );
};

export default CustomDatePicker;
