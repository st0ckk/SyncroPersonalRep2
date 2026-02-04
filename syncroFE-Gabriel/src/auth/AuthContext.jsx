import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedRoles = localStorage.getItem("roles");

    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedRoles) setRoles(JSON.parse(storedRoles));

    setLoading(false);
  }, []);

  const login = (userData, token, roles) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("roles", JSON.stringify(roles));

    setUser(userData);
    setRoles(roles);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setRoles([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
