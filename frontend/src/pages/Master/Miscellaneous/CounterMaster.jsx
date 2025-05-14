import React from "react";
import MainFormComponent from "../../../components/global/Form/MainFormComponent";
import { formConfigs } from "../../../components/global/FormConfig/Master/Miscellaneous/CounterMasterConfig";
import MainContainerCompilation from "../../../components/global/MainContainerCompilation";

const CounterMaster = () => {
  return (
    <MainContainerCompilation title="Counter Master">
    <MainFormComponent
      formConfig={formConfigs.counterMasterForm}
      formDataID={formConfigs.counterMasterForm.formDataID}
    />
    </MainContainerCompilation>
  );
};

export default CounterMaster;
