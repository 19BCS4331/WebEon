import React, { useState, useEffect, useContext } from "react";
import { Grid, Typography } from "@mui/material";
import CustomTextField from "../../../../components/global/CustomTextField";
import CustomAutocomplete from "../../../../components/global/CustomAutocomplete";
import { apiClient } from "../../../../services/apiClient";
import { AuthContext } from "../../../../contexts/AuthContext";

const AgentRefDetails = ({ data, onUpdate,Colortheme }) => {
  const { branch } = useContext(AuthContext);
  const [agentOptions, setAgentOptions] = useState([]);
  const [marketingRefOptions, setMarketingRefOptions] = useState([]);
  const [deliveryPersonOptions, setDeliveryPersonOptions] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const branchId = branch.nBranchID; // Get branchId from localStorage

        // Fetch agents
        const agentsResponse = await apiClient.get(
          "/pages/Transactions/agents",
          {
            params: { branchId },
          }
        );
        if (agentsResponse.data) {
          setAgentOptions(agentsResponse.data);
        }

        // Fetch marketing references
        const mrktRefResponse = await apiClient.get(
          "/pages/Transactions/marketing-refs",
          {
            params: { branchId },
          }
        );
        if (mrktRefResponse.data) {
          setMarketingRefOptions(mrktRefResponse.data);
        }

        // Fetch delivery persons
        const deliveryResponse = await apiClient.get(
          "/pages/Transactions/delivery-persons",
          {
            params: { branchId },
          }
        );
        if (deliveryResponse.data) {
          setDeliveryPersonOptions(deliveryResponse.data);
        }
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };

    fetchOptions();
  }, []);

  return (
    <Grid 
      container
      sx={{ 
        pt:1,
        width: '100%',
        '& .MuiGrid-item': {
          mb: 3,  
          px: { xs: 0, md: 1.5 }  
        }
      }}
    >
      <Grid item xs={12} md={3}>
        <CustomAutocomplete
          label="Select Agent"
          options={agentOptions}
          value={
            agentOptions.find(
              (opt) => opt.value === (data?.agentCode ? parseInt(data.agentCode) : null)
            ) || null
          }
          onChange={(e, newValue) =>
            onUpdate({ agentCode: newValue ? newValue.value.toString() : "" })
          }
          getOptionLabel={(option) => option.label || ""}
          isOptionEqualToValue={(option, value) => 
            option.value === (value.value ? parseInt(value.value) : null)
          }
          styleTF={{ width: "100%" }}
        />
      </Grid>

      <Grid item xs={12} md={3}>
        <CustomAutocomplete
          label="Marketing Reference"
          options={marketingRefOptions}
          value={
            marketingRefOptions.find(
              (opt) => opt.value === (data?.MRKTREF ? parseInt(data.MRKTREF) : null)
            ) || null
          }
          onChange={(e, newValue) =>
            onUpdate({ MRKTREF: newValue ? newValue.value.toString() : "" })
          }
          getOptionLabel={(option) => option.label || ""}
          isOptionEqualToValue={(option, value) => 
            option.value === (value.value ? parseInt(value.value) : null)
          }
          styleTF={{ width: "100%" }}
        />
      </Grid>

      <Grid item xs={12} md={3}>
        <CustomAutocomplete
          label="Delivery Person"
          options={deliveryPersonOptions}
          value={
            deliveryPersonOptions.find(
              (opt) => opt.value === (data?.nDeliveryPersonID ? parseInt(data.nDeliveryPersonID) : null)
            ) || null
          }
          onChange={(e, newValue) =>
            onUpdate({ nDeliveryPersonID: newValue ? newValue.value.toString() : "" })
          }
          getOptionLabel={(option) => option.label || ""}
          isOptionEqualToValue={(option, value) => 
            option.value === (value.value ? parseInt(value.value) : null)
          }
          styleTF={{ width: "100%" }}
        />
      </Grid>

      <Grid item xs={12} md={3}>
        <CustomTextField
          label="Other Reference"
          value={data?.OthRef || ""}
          onChange={(e) => onUpdate({ OthRef: e.target.value })}
          style={{ width: "100%" }}
        />
      </Grid>

      <Typography color={Colortheme.text} fontSize={12} marginTop={2} marginLeft={2}>*Commission fields in the next step will only be enabled if an Agent is selected</Typography>
    </Grid>
  );
};

export default AgentRefDetails;
