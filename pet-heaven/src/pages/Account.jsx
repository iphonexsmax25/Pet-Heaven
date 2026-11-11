import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import ChangePasswordForm from '../components/ChangePasswordForm';
import { useAuth } from '../context/AuthContext';

export default function Account() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <PageHeader title="My Account" intro="Your details and password." />
      <section className="section">
        <div className="container">
          <div className="profile-card">
            <span className="avatar avatar-large" aria-hidden="true">{currentUser.name[0].toUpperCase()}</span>
            <div>
              <h2>{currentUser.name}</h2>
              <p>{currentUser.email}</p>
            </div>
            <button type="button" className="btn btn-outline" onClick={handleLogout}>Log out</button>
          </div>
          <div className="narrow-form">
            <ChangePasswordForm />
          </div>
        </div>
      </section>
    </>
  );
}
