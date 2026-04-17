
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { FiltrosProvider } from './contexts/FiltrosContext'; // <-- IMPORTAR
import router from './routes';
import ReportarRescate from "./pages/public/ReportarRescate/ReportarRescate";

function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <FiltrosProvider>  {/* <-- Aquí está bien */}
          <RouterProvider router={router} />
          <ToastContainer position="top-right" autoClose={3000} />
        </FiltrosProvider>
      </SidebarProvider>
    </AuthProvider>
  );
}



export default App;