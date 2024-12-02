import React from "react";
import MainContainerCompilation from "../../../components/global/MainContainerCompilation";
import { formConfigs } from "../../../components/global/FormConfig/Master/Master Profiles/formConfig";
import MainFormComponent from "../../../components/global/Form/MainFormComponent";

const AccountsProfile = () => {
  const formConfig = formConfigs.accountsProfileForm;

  return (
    <MainContainerCompilation title="Accounts Profile">
      <MainFormComponent
        formConfig={formConfig}
        formDataID={"nAccID"}
        editFieldTitle={"vCode"}
      />
    </MainContainerCompilation>
  );
};

export default AccountsProfile;
