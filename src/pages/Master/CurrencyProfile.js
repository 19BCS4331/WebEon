import React from "react";
import MainContainerCompilation from "../../components/global/MainContainerCompilation";
import FormComponent from "../../components/global/Form/FormComponent";

const CurrencyProfile = () => {
  const InputsData = [
    {
      name: "CurrencyProfile",
      label: "Currency Profile",
      // Autocomplete: true,
      select: true,
      options: [
        { label: "Hello" },
        { label: "World" },
        { label: "First form input" },
      ],
    },
    {
      name: "FinancialCodes",
      label: "Financial Codes",
    },
    {
      name: "FinancialSubProfile",
      label: "Financial Sub Profile",
    },
    {
      name: "DivisionProfile",
      label: "Division Profile",
      // Autocomplete: true,
      select: true,
      options: [
        { label: "Hello" },
        { label: "World" },
        { label: "First form input" },
      ],
    },
    {
      name: "DivisionDetails",
      label: "Division Details",
    },
    {
      name: "AccountsProfile",
      label: "Accounts Profile",
    },
    {
      name: "AD1Provider",
      label: "AD1 Provider",
    },
    {
      name: "AnotherInput",
      label: "Another Input",
    },
    {
      name: "TwoOther",
      label: "Two Other Input",
    },
  ];
  return (
    <MainContainerCompilation title={"Currency Profile"}>
      <FormComponent InputsData={InputsData} title={"Currency Master"} />
    </MainContainerCompilation>
  );
};

export default CurrencyProfile;
