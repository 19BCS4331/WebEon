import React from "react";
import InnerUrlGrid from "../../../components/global/InnerUrlGrid";
import MainContainerCompilation from "../../../components/global/MainContainerCompilation";

const BuySellOptions = () => {
  const InnerUrlGridData = [
    {
      text: "Buy From Individual / Corporates",
    },
    {
      text: "Buy from FFMCs/ADs",
    },
    {
      text: "Buy from RMCs",
    },
    {
      text: "Buy from Franchisee",
    },
    {
      text: "Sell to Individual/Corporate",
    },
    {
      text: "Sell to FFMCs/ADs",
    },
    {
      text: "Sell to Foreign Correspondent",
    },
  ];

  return (
    <MainContainerCompilation title={"Buy / Sell Transactions"}>
      <InnerUrlGrid
        InnerUrlGridData={InnerUrlGridData}
        title={"buy-sell-transactions"}
      />
    </MainContainerCompilation>
  );
};

export default BuySellOptions;
