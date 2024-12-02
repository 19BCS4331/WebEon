export const initialState = {
  // Form Data
  formData: {
    vTrnwith: "",
    vTrntype: "",
    TRNWITHIC: "",
    Purpose: "",
    date: new Date().toISOString().split("T")[0],
    ManualBillRef: "",
    vNo: "",
    Category: "L",
    InvVendorNo: "",
    Remark: "",
    // Party Details
    vCodeID: "",
    PaxCode: "",
    PartyType: "",
    PartyID: "",
    // Transaction Details
    CounterID: "",
    UserID: "",
    nBranchID: "",
    vBranchCode: "",
    ShiftID: "",
    SubPurpose: "",
    Amount: 0,
    TaxAmt: 0,
    Netamt: 0,
    byCash: 0,
    byChq: 0,
    byCard: 0,
    byTransfer: 0,
    byOth: 0,
    // Other fields
    PartyName: "",
    PurposeDescription: "",
    SubPurposeDescription: "",
    OthChgID1: "",
    OthAmt1: 0,
    OthChgID2: "",
    OthAmt2: 0,
    TDSRate: 0,
    TDSAmount: 0,
    agentCode: "",
    agentCommCN: 0,
    agentCommOth: 0,
    WebDealRef: "",
    MRKTREF: "",
    OthRef: "",
    usdIBR: 0,
    RiskCateg: "",
    InvVendor: "",
  },
  // UI State
  activeStep: 0,
  showList: true,
  isEditMode: false,
  // Validation State
  errors: {},
  isDirty: false,
};

export const ActionTypes = {
  UPDATE_FORM_DATA: 'UPDATE_FORM_DATA',
  SET_ACTIVE_STEP: 'SET_ACTIVE_STEP',
  SET_SHOW_LIST: 'SET_SHOW_LIST',
  SET_EDIT_MODE: 'SET_EDIT_MODE',
  RESET_FORM: 'RESET_FORM',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_FORM_DIRTY: 'SET_FORM_DIRTY',
  INITIALIZE_TRANSACTION: 'INITIALIZE_TRANSACTION'
};

export const transactionReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.UPDATE_FORM_DATA:
      return {
        ...state,
        formData: {
          ...state.formData,
          ...action.payload
        },
        isDirty: true
      };

    case ActionTypes.SET_ACTIVE_STEP:
      return {
        ...state,
        activeStep: action.payload
      };

    case ActionTypes.SET_SHOW_LIST:
      return {
        ...state,
        showList: action.payload
      };

    case ActionTypes.SET_EDIT_MODE:
      return {
        ...state,
        isEditMode: action.payload
      };

    case ActionTypes.RESET_FORM:
      return {
        ...state,
        formData: {
          ...initialState.formData,
          vTrnwith: state.formData.vTrnwith,
          vTrntype: state.formData.vTrntype
        },
        isDirty: false,
        errors: {}
      };

    case ActionTypes.INITIALIZE_TRANSACTION:
      return {
        ...state,
        formData: {
          ...initialState.formData,
          ...action.payload
        },
        activeStep: 0,
        isEditMode: false,
        showList: false,
        isDirty: false,
        errors: {}
      };

    case ActionTypes.SET_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.field]: action.payload.message
        }
      };

    case ActionTypes.CLEAR_ERROR:
      const newErrors = { ...state.errors };
      delete newErrors[action.payload];
      return {
        ...state,
        errors: newErrors
      };

    case ActionTypes.SET_FORM_DIRTY:
      return {
        ...state,
        isDirty: action.payload
      };

    default:
      return state;
  }
};
