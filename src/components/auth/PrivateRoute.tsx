import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { UserRoleType } from '../../context/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  roles?: UserRoleType[];
}

export default function PrivateRoute({ children, roles }: PrivateRouteProps) {
  const { token, user } = useAuth();

  if (!token) {
    return <Navigate to="/logowanie" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
