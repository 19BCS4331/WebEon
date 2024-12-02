import React from 'react';
import MainFormComponent from '../../../components/global/Form/MainFormComponent';
import { formConfigs } from '../../../components/global/FormConfig/Master/Miscellaneous/SubPurposeConfig';
import MainContainerCompilation from '../../../components/global/MainContainerCompilation';

const SubPurposeProfile = () => {
  return (
    <MainContainerCompilation title="Sub Purpose Profile">
      <MainFormComponent 
      formConfig={formConfigs.subPurposeForm} 
      formDataID={formConfigs.subPurposeForm.formDataID}
      />
    </MainContainerCompilation>
  );
};

export default SubPurposeProfile;
