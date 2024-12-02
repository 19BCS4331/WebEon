import React from "react";
import MainFormComponent from "../../../components/global/Form/MainFormComponent";
import { formConfigs } from "../../../components/global/FormConfig/Master/Miscellaneous/MasterPurposeConfig";
import MainContainerCompilation from "../../../components/global/MainContainerCompilation";

const MasterPurposeProfile = () => {
  return (
    <MainContainerCompilation title="Master Purpose Profile">
      <MainFormComponent
        formConfig={formConfigs.masterPurposeForm}
        formDataID={formConfigs.masterPurposeForm.formDataID}
      />
    </MainContainerCompilation>
  );
};

export default MasterPurposeProfile;
