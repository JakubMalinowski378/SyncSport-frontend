import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export const UserRole = {
  User: 1,
  Manager: 2,
  Admin: 3,
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

export interface User {
  id: string;
  email: string;
  role: UserRoleType;
  managedFacilityIds?: string[];
}

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (token) {
      const decoded = parseJwt(token);
      if (decoded) {
        const sub = decoded.sub || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
        const email = decoded.email || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
        const roleStr = decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        let role: UserRoleType = UserRole.User;
        
        if (roleStr !== undefined && roleStr !== null) {
          const parsedRole = parseInt(roleStr.toString(), 10);
          if (!isNaN(parsedRole)) {
            role = parsedRole as UserRoleType;
          } else if (typeof roleStr === 'string') {
             if (roleStr.toLowerCase() === 'admin') role = UserRole.Admin;
             if (roleStr.toLowerCase() === 'manager') role = UserRole.Manager;
          }
        }

        const managedFacilityIds: string[] = [];
        if (role === UserRole.Manager && decoded.ManagedFacilityId) {
            if (Array.isArray(decoded.ManagedFacilityId)) {
                managedFacilityIds.push(...decoded.ManagedFacilityId);
            } else {
                managedFacilityIds.push(decoded.ManagedFacilityId);
            }
        }

        setUser({
          id: sub,
          email: email,
          role: role,
          managedFacilityIds: role === UserRole.Manager ? managedFacilityIds : undefined,
        });
      } else {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
    setTokenState(newToken);
  };

  const login = (newToken: string) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, setToken, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

