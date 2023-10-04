import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastProvider } from "./contexts/ToastContext";
import Toast from "./components/Toast";
import TestPage from "./pages/TestPage";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/global/ProtectedRoute";
import "./css/global.css";

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
          </Routes>
        </ToastProvider>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
