import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastProvider } from "./contexts/ToastContext";
import Toast from "./components/Toast";
import TestPage from "./pages/TestPage";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/global/ProtectedRoute";
import "./css/global.css";
import CurrencyProfile from "./pages/Master/CurrencyProfile";
import FinancialCodes from "./pages/Master/FinancialCodes";
import FinancialSubProfile from "./pages/Master/FinancialSubProfile";
import DivisionProfile from "./pages/Master/DivisionProfile";
import DivisionDetails from "./pages/Master/DivisionDetails";
import AccountsProfile from "./pages/Master/AccountsProfile";
import Ad1Provider from "./pages/Master/Ad1Provider";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastProvider>
          <Toast />

          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/Dashboard" element={<ProtectedRoute />}>
              <Route path="/Dashboard" element={<Dashboard />} />
            </Route>

            <Route path="/master-profiles" element={<ProtectedRoute />}>
              <Route path="/master-profiles" element={<TestPage />} />
            </Route>

            {/* ------------MASTERS--------------------- */}
            <Route path="/currency-profile" element={<ProtectedRoute />}>
              <Route path="/currency-profile" element={<CurrencyProfile />} />
            </Route>

            <Route path="/financial-codes" element={<ProtectedRoute />}>
              <Route path="/financial-codes" element={<FinancialCodes />} />
            </Route>

            <Route path="/financial-sub-profile" element={<ProtectedRoute />}>
              <Route
                path="/financial-sub-profile"
                element={<FinancialSubProfile />}
              />
            </Route>

            <Route path="/division-profile" element={<ProtectedRoute />}>
              <Route path="/division-profile" element={<DivisionProfile />} />
            </Route>

            <Route path="/division-details" element={<ProtectedRoute />}>
              <Route path="/division-details" element={<DivisionDetails />} />
            </Route>

            <Route path="/accounts-profile" element={<ProtectedRoute />}>
              <Route path="/accounts-profile" element={<AccountsProfile />} />
            </Route>

            <Route path="/ad1-provider" element={<ProtectedRoute />}>
              <Route path="/ad1-provider" element={<Ad1Provider />} />
            </Route>
          </Routes>
        </ToastProvider>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
