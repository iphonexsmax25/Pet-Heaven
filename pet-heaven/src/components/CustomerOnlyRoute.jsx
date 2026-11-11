import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Forbidden from '../pages/Forbidden';

export default function CustomerOnlyRoute({ children }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search}`,
          adoptionApplication: true,
        }}
      />
    );
  }
  if (currentUser.role !== 'customer') return <Forbidden />;
  return children;
}
