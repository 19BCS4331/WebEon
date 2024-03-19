import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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
import SysSetupIndex from "./pages/Master/System Setup";

const App = () => {
  return (
    <BaseUrlProvider>
      <AuthProvider>
        <LocalizationProvider>
          <ThemeProvider>
            <BrowserRouter>
              <ModalProvider>
                <ToastProvider>
                  <Toast />

                  <Routes>
                    <Route path="/" element={<Login />} />
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
                      path="/buy-sell-transactions/buy-from-individual-corporates"
                      element={<ProtectedRoute />}
                    >
                      <Route
                        path="/buy-sell-transactions/buy-from-individual-corporates"
                        element={<BuyFromIndivi />}
                      />
                    </Route>

                    {/* --------------Transactions-------------------- */}
                  </Routes>
                </ToastProvider>
              </ModalProvider>
            </BrowserRouter>
          </ThemeProvider>
        </LocalizationProvider>
      </AuthProvider>
    </BaseUrlProvider>
  );
};

export default App;
