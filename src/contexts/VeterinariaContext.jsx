import React, { createContext, useContext, useState } from 'react';

const VeterinariaContext = createContext();

export const useVeterinaria = () => useContext(VeterinariaContext);

export const VeterinariaProvider = ({ children }) => {
  const [state, setState] = useState({});

  return (
    <VeterinariaContext.Provider value={{ state, setState }}>
      {children}
    </VeterinariaContext.Provider>
  );
};