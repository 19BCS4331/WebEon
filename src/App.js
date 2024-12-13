// import { Suspense } from "react";
// import { BrowserRouter, Routes } from "react-router-dom";
// import { ToastProvider } from "./contexts/ToastContext";
// import Toast from "./components/Toast";
// import { AuthProvider } from "./contexts/AuthContext";
// import "./css/global.css";
// import LocalizationProvider from "./contexts/LocalizationProvider";
// import { ModalProvider } from "./contexts/ActionModal";
// import { ThemeProvider } from "./contexts/ThemeContext";
// import { BaseUrlProvider } from "./contexts/BaseUrl";
// import { FormDataProvider } from "./contexts/FormDataContext";
// import NewSidebar from "./components/global/NewSideBar";
// import useAuthHook from "./hooks/useAuthHook";
// import AxiosInterceptorProvider from "./hooks/interceptorAxios";
// import renderRoutes from "./routes";
// import LazyFallBack from "./pages/LazyFallBack";

import { Suspense, useEffect } from "react";
import { BrowserRouter, Routes } from "react-router-dom";
import { ToastProvider } from "./contexts/ToastContext";
import Toast from "./components/Toast";
import { AuthProvider } from "./contexts/AuthContext";
import "./css/global.css";
import LocalizationProvider from "./contexts/LocalizationProvider";
import { ModalProvider } from "./contexts/ActionModal";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import {
  ThemeProvider as CustomThemeProvider,
  ThemeContext,
} from "./contexts/ThemeContext";
import { BaseUrlProvider } from "./contexts/BaseUrl";
import { FormDataProvider } from "./contexts/FormDataContext";
import NewSidebar from "./components/global/NewSideBar";
import useAuthHook from "./hooks/useAuthHook";
// import AxiosInterceptorProvider from "./hooks/interceptorAxios";
import renderRoutes from "./routes";
import LazyFallBack from "./pages/LazyFallBack";
import ChatWidget from './components/global/ChatWidget';
import { AppActionsProvider } from './contexts/AppActionsContext';
import CustomInfoModal from './components/CustomInfoModal';
import CustomAlertModal from './components/CustomAlertModal';

function App() {
  return (
    <AuthProvider>
      <BaseUrlProvider>
        <LocalizationProvider>
          <CustomThemeProvider>
            <ThemeContext.Consumer>
              {({ Colortheme }) => (
                <StyledThemeProvider theme={Colortheme}>
                  <FormDataProvider>
                    <BrowserRouter>
                      <ModalProvider>
                        <ToastProvider>
                          <AppActionsProvider>
                            <Toast />
                            <CustomInfoModal />
                            <CustomAlertModal />
                            <AuthBasedSidebar />
                            <ChatWidget />
                            <Suspense fallback={<LazyFallBack />}>
                              <Routes>{renderRoutes()}</Routes>
                            </Suspense>
                          </AppActionsProvider>
                        </ToastProvider>
                      </ModalProvider>
                    </BrowserRouter>
                  </FormDataProvider>
                </StyledThemeProvider>
              )}
            </ThemeContext.Consumer>
          </CustomThemeProvider>
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
