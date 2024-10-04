import React, { createContext, useContext } from 'react';
import { useRouter } from 'expo-router';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const route = useRouter();

  return (
    <AppContext.Provider value={{ route }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};
