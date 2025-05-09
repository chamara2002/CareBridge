import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  // Initialize user state from localStorage on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");
    
    if (token) {
      setUser({ loggedIn: true, role: userRole });
    }
  }, []);

  // Login function
  const login = (token, role) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userRole", role);
    setUser({ loggedIn: true, role });
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
