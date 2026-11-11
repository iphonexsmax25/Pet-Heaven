import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Pages for customers and logged-out visitors. Employees are sent to their dashboard.
export default function CustomerOrPublicRoute({ children }) {
  const { currentUser } = useAuth();
  const isEmployee = currentUser?.role === 'employee';
  if (isEmployee) return <Navigate to="/admin/dashboard" replace />;
  return children;
}
