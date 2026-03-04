import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { routeConfig } from "./routes/index";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AppProvider } from "./store/Context";
import { AuthProvider } from "./store/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { SignalRProvider } from "./store/SignalRContext.tsx"; // Import provider
function App() {
  const queryClient = new QueryClient();
  const location = useLocation();

  const hideNotificationCenter = location.pathname.startsWith("/interview-chat");
  return (
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={import.meta.env.REACT_APP_GOOGLE_CLIENT_ID}>
        <AppProvider>
          <AuthProvider>
            {/* <SignalRProvider> */}
              <Routes>
                {routeConfig.map((route, index) => (
                  <Route key={index} path={route.path} element={route.element}>
                    {route.children?.map((childRoute, idx) => (
                      <Route key={idx} path={childRoute.path} element={childRoute.element} />
                    ))}
                  </Route>
                ))}
              </Routes>
              <ToastContainer
                position="top-right" // Vị trí hiển thị
                autoClose={5000} // Tự động đóng sau 5 giây
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light" // Giao diện (light, dark, colored)
              />
              {!hideNotificationCenter && (
                <div className="fixed right-6 bottom-6 z-50">
                </div>
              )}
            {/* </SignalRProvider> */}
          </AuthProvider>
        </AppProvider>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
