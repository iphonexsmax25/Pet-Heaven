import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Forbidden from '../pages/Forbidden';

// Only employees can see the page inside it (the front-end version of the requireEmployee middleware).
// Logged-out visitors are sent to Login; customers see a 403 Forbidden page.
export default function RequireEmployee({ children }) {
  const { isAuthenticated, isEmployee } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!isEmployee) return <Forbidden />;
  return children;
}
