
import React, { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import { SidebarProvider } from './contexts/SidebarContext';
import ThemeToggle from './components/common/ThemeToggle/ThemeToggle';
import router from './routes';
import FloatingLanguageSelector from './components/common/FloatingButtons/FloatingLanguageSelector';

function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <div className="floating-buttons">
          <FloatingLanguageSelector />
          <ThemeToggle />
        </div>
        <Suspense
          fallback={
            <div
              aria-hidden="true"
              style={{
                position: 'fixed',
                inset: 0,
                background: 'transparent'
              }}
            />
          }
        >
          <RouterProvider router={router} />
        </Suspense>
        <ToastContainer position="top-right" autoClose={3000} />
      </SidebarProvider>
    </AuthProvider>
  );
}

export default App;