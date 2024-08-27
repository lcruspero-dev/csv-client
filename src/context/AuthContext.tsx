import React, { createContext, useState, useEffect, ReactNode } from "react";

interface isAuthenticated {
  isAuthenticated: boolean;
  isAdmin: boolean;
}

interface AuthContextType {
  isAuthenticated: isAuthenticated;
  login: (data: isAuthenticated) => void;
  logout: () => void; // Removed the parameter since it's not necessary
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<isAuthenticated>({
    isAuthenticated: false,
    isAdmin: false,
  });

  useEffect(() => {
    const storedAuth = localStorage.getItem("isAuthenticated");
    if (storedAuth) {
      setIsAuthenticated(JSON.parse(storedAuth));
    }
  }, []);

  const login = (data: isAuthenticated): void => {
    setIsAuthenticated(data);
    localStorage.setItem("isAuthenticated", JSON.stringify(data));
  };

  const logout = (): void => {
    setIsAuthenticated({ isAuthenticated: false, isAdmin: false });
    localStorage.removeItem("isAuthenticated");
  };

  return <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>;
};
