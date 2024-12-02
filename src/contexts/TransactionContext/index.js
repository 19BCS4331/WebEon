import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { transactionReducer, initialState, ActionTypes } from './reducer';

const TransactionContext = createContext();

export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
};

export const TransactionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(transactionReducer, initialState);

  const updateFormData = useCallback((data) => {
    dispatch({
      type: ActionTypes.UPDATE_FORM_DATA,
      payload: data
    });
  }, []);

  const setActiveStep = useCallback((step) => {
    dispatch({
      type: ActionTypes.SET_ACTIVE_STEP,
      payload: step
    });
  }, []);

  const setShowList = useCallback((show) => {
    dispatch({
      type: ActionTypes.SET_SHOW_LIST,
      payload: show
    });
  }, []);

  const setEditMode = useCallback((isEdit) => {
    dispatch({
      type: ActionTypes.SET_EDIT_MODE,
      payload: isEdit
    });
  }, []);

  const resetForm = useCallback(() => {
    dispatch({ type: ActionTypes.RESET_FORM });
  }, []);

  const initializeTransaction = useCallback((data) => {
    dispatch({
      type: ActionTypes.INITIALIZE_TRANSACTION,
      payload: data
    });
  }, []);

  const setError = useCallback((field, message) => {
    dispatch({
      type: ActionTypes.SET_ERROR,
      payload: { field, message }
    });
  }, []);

  const clearError = useCallback((field) => {
    dispatch({
      type: ActionTypes.CLEAR_ERROR,
      payload: field
    });
  }, []);

  const setFormDirty = useCallback((isDirty) => {
    dispatch({
      type: ActionTypes.SET_FORM_DIRTY,
      payload: isDirty
    });
  }, []);

  const value = {
    ...state,
    updateFormData,
    setActiveStep,
    setShowList,
    setEditMode,
    resetForm,
    initializeTransaction,
    setError,
    clearError,
    setFormDirty
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

export default TransactionContext;
