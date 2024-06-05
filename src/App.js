import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { ToastProvider, useToast } from "./contexts/ToastContext";
import Toast from "./components/Toast";
import TestPage from "./pages/TestPage";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/global/ProtectedRoute";
import "./css/global.css";
import CurrencyProfile from "./pages/Master/Master Profiles/CurrencyProfile";
import FinancialCodes from "./pages/Master/Master Profiles/FinancialCodes";
import FinancialSubProfile from "./pages/Master/Master Profiles/FinancialSubProfile";
import DivisionProfile from "./pages/Master/Master Profiles/DivisionProfile";
import DivisionDetails from "./pages/Master/Master Profiles/DivisionDetails";
import AccountsProfile from "./pages/Master/Master Profiles/AccountsProfile";
import Ad1Provider from "./pages/Master/Master Profiles/Ad1Provider";
import BuySellOptions from "./pages/Transactions/BuySellTransactions";
import BuyFromIndivi from "./pages/Transactions/BuySellTransactions/BuyFromIndiviOrCorp";
import LocalizationProvider from "./contexts/LocalizationProvider";
import { ModalProvider } from "./contexts/ActionModal";
import { ThemeProvider } from "./contexts/ThemeContext";
import { BaseUrlProvider } from "./contexts/BaseUrl";
import SysSetupIndex from "./pages/Master/SystemSetup";
import TaxMaster from "./pages/Master/SystemSetup/TaxMaster";
import { FormDataProvider } from "./contexts/FormDataContext";
import LoginNew from "./pages/LoginNew";
import NewSidebar from "./components/global/NewSideBar";
import useAuthHook from "./hooks/useAuthHook";
import AxiosInterceptorProvider from "./hooks/interceptorAxios";

const App = () => {
  return (
    <AuthProvider>
      <BaseUrlProvider>
        <LocalizationProvider>
          <ThemeProvider>
            <FormDataProvider>
              <BrowserRouter>
                <ModalProvider>
                  <ToastProvider>
                    <Toast />
                    <AuthBasedSidebar />
                    <AxiosInterceptorProvider>
                      <Routes>
                        <Route path="/" element={<LoginNew />} />
                        <Route path="/Dashboard" element={<ProtectedRoute />}>
                          <Route path="/Dashboard" element={<Dashboard />} />
                        </Route>

                        <Route
                          path="/Masters/master-profiles"
                          element={<ProtectedRoute />}
                        >
                          <Route
                            path="/Masters/master-profiles"
                            element={<TestPage />}
                          />
                        </Route>

                        <Route
                          path="/Masters/system-setup"
                          element={<ProtectedRoute />}
                        >
                          <Route
                            path="/Masters/system-setup"
                            element={<SysSetupIndex />}
                          />
                        </Route>

                        {/* ------------MASTERS--------------------- */}

                        {/* Master Profiles */}
                        <Route
                          path="/master-profiles/currency-profile"
                          element={<ProtectedRoute />}
                        >
                          <Route
                            path="/master-profiles/currency-profile"
                            element={<CurrencyProfile />}
                          />
                        </Route>

                        <Route
                          path="/master-profiles/financial-codes"
                          element={<ProtectedRoute />}
                        >
                          <Route
                            path="/master-profiles/financial-codes"
                            element={<FinancialCodes />}
                          />
                        </Route>

                        <Route
                          path="/master-profiles/financial-sub-profile"
                          element={<ProtectedRoute />}
                        >
                          <Route
                            path="/master-profiles/financial-sub-profile"
                            element={<FinancialSubProfile />}
                          />
                        </Route>

                        <Route
                          path="/master-profiles/division-profile"
                          element={<ProtectedRoute />}
                        >
                          <Route
                            path="/master-profiles/division-profile"
                            element={<DivisionProfile />}
                          />
                        </Route>

                        <Route
                          path="/master-profiles/division-details"
                          element={<ProtectedRoute />}
                        >
                          <Route
                            path="/master-profiles/division-details"
                            element={<DivisionDetails />}
                          />
                        </Route>

                        <Route
                          path="/master-profiles/accounts-profile"
                          element={<ProtectedRoute />}
                        >
                          <Route
                            path="/master-profiles/accounts-profile"
                            element={<AccountsProfile />}
                          />
                        </Route>

                        <Route
                          path="/master-profiles/ad1-provider"
                          element={<ProtectedRoute />}
                        >
                          <Route
                            path="/master-profiles/ad1-provider"
                            element={<Ad1Provider />}
                          />
                        </Route>

                        {/* Master Profiles End */}

                        {/* System Setup */}

                        <Route
                          path="/system-setup/tax-profile"
                          element={<ProtectedRoute />}
                        >
                          <Route
                            path="/system-setup/tax-profile"
                            element={<TaxMaster />}
                          />
                        </Route>

                        {/* System Setup End */}

                        {/* ------------MASTERS--------------------- */}

                        {/* --------------Transactions-------------------- */}
                        <Route
                          path="/Transactions/buy-sell-transactions"
                          element={<ProtectedRoute />}
                        >
                          <Route
                            path="/Transactions/buy-sell-transactions"
                            element={<BuySellOptions />}
                          />
                        </Route>

                        <Route
                          path="/transactions/buying-selling/buy-from-individuals"
                          element={<ProtectedRoute />}
                        >
                          <Route
                            path="/transactions/buying-selling/buy-from-individuals"
                            element={<BuyFromIndivi />}
                          />
                        </Route>

                        {/* --------------Transactions-------------------- */}
                      </Routes>
                    </AxiosInterceptorProvider>
                  </ToastProvider>
                </ModalProvider>
              </BrowserRouter>
            </FormDataProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </BaseUrlProvider>
    </AuthProvider>
  );
};

const AuthBasedSidebar = () => {
  const { isAuthenticated } = useAuthHook();
  return isAuthenticated ? <NewSidebar /> : null;
};

export default App;
