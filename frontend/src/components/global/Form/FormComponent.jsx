import { Box, TextField } from "@mui/material";
import React from "react";
import { COLORS } from "../../../assets/colors/COLORS";
import "../../../css/components/formComponent.css";
import MenuItem from "@mui/material/MenuItem";

const FormComponent = ({ InputsData, title }) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    var data = new FormData(event.target);
    let formObject = Object.fromEntries(data.entries());
    console.log(formObject);
  };

  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      alignItems={"center"}
      name="ContainerBox"
      component={"form"}
      onSubmit={handleSubmit}
      sx={{ backgroundColor: COLORS.text }}
      height={"auto"}
      p={2}
      width={"75%"}
      borderRadius={"40px"}
      boxShadow={"box-shadow: 0px 10px 15px -3px rgba(0,0,0,0.6)"}
    >
      <Box name="HeaderSection" textAlign={"center"} fontSize={"20px"} mt={1}>
        {title}
      </Box>
      <Box name="InputsContainer">
        {InputsData.map((item) => (
          <>
            {item.select ? (
              <TextField
                name={item.label}
                id="outlined-select-currency"
                select
                label={item.label}
                SelectProps={{ MenuProps: { sx: { maxHeight: 250 } } }}
                sx={{
                  margin: 2,
                  width: "12vw",
                }}
              >
                {item.options.map((option) => (
                  <MenuItem key={option.label} value={option.label}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                name={item.name}
                label={item.label}
                value={item.value}
                sx={{ margin: 2, width: "12vw" }}
                // select={item.select}
              ></TextField>
            )}
          </>
        ))}
      </Box>
      <Box display="flex" name="FooterSection" mt={2} gap={5}>
        <button className="FormFooterButton">Cancel</button>
        <button className="FormFooterButton" type="submit">
          Save
        </button>
      </Box>
    </Box>
  );
};

export default FormComponent;
