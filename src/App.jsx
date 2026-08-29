// src/App.jsx
import React, { Suspense, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import { SidebarProvider } from './contexts/SidebarContext';
import ThemeToggle from './components/common/ThemeToggle/ThemeToggle';
import router from './routes';
import FloatingLanguageSelector from './components/common/FloatingButtons/FloatingLanguageSelector';
import RouteChangeListener from './components/common/RouteChangeListener';

function App() {
  const [isRouteLoading, setIsRouteLoading] = useState(false);

  return (
    <AuthProvider>
      <SidebarProvider>
        <div className="floating-buttons">
          <FloatingLanguageSelector />
          <ThemeToggle />
        </div>

        {isRouteLoading && (
          <div className="global-route-loader" aria-live="polite" aria-busy="true">
            <div className="global-route-loader-track">
              <span className="global-route-loader-fill" />
            </div>
          </div>
        )}

        <Suspense fallback={null}>
          <RouteChangeListener router={router} onLoadingChange={setIsRouteLoading} />
          <RouterProvider router={router} />
        </Suspense>
        <ToastContainer position="top-right" autoClose={3000} />
      </SidebarProvider>
    </AuthProvider>
  );
}

export default App;