import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import PetGrid from '../components/PetGrid';
import ChangePasswordForm from '../components/ChangePasswordForm';
import AdoptionJourney from '../components/AdoptionJourney';
import { useAuth } from '../context/AuthContext';
import { usePets } from '../context/PetsContext';
import { APPLICATIONS_KEY, getApplications, isActiveApplication, ownsApplication } from '../utils/adminData';
import { getJourney } from '../utils/adoptionJourney';
import { formatDate } from '../utils/validators';

export default function Profile() {
  const { currentUser: user, favourites, logout } = useAuth();
  const navigate = useNavigate();
  const { pets, releaseRequests, cancelReleaseRequest, cancelAdoptionApplication } = usePets();
  const [savedApplications, setSavedApplications] = useState(getApplications);
  const [releaseMessage, setReleaseMessage] = useState('');
  const [applicationMessage, setApplicationMessage] = useState('');

  const favouritePets = pets.filter((pet) => favourites.includes(pet.id));
  const applications = savedApplications.filter((item) => ownsApplication(item, user));
  // Release requests this member sent (matched by user ID)
  const releases = releaseRequests
    .filter((item) => item.requestedByUserId === user.id)
    .map((item) => ({
      ...item,
      displayStatus: item.status === 'pending'
        ? 'Pending Review'
        : item.status.charAt(0).toUpperCase() + item.status.slice(1),
    }));

  const handleCancelRelease = (requestId, petName) => {
    if (!window.confirm(`Cancel the release request for ${petName}? ${petName} will remain with you.`)) return;
    const result = cancelReleaseRequest(requestId, user);
    setReleaseMessage(result.ok ? `Release request for ${petName} cancelled. The pet remains with you.` : result.error);
  };

  const handleCancelApplication = (application) => {
    if (!window.confirm(`Cancel your adoption application for ${application.petName}? This will stop its progress, but keep it in your history.`)) return;
    const result = cancelAdoptionApplication(application.id, user);
    setApplicationMessage(result.ok ? `Your application for ${application.petName} was cancelled.` : result.error);
    if (result.ok) setSavedApplications(getApplications());
  };

  useEffect(() => {
    const refreshApplications = (event) => {
      if (!event.key || event.key === APPLICATIONS_KEY) setSavedApplications(getApplications());
    };
    window.addEventListener('storage', refreshApplications);
    return () => window.removeEventListener('storage', refreshApplications);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <PageHeader title="My Profile" intro={`Welcome back, ${user.name}!`} />
      <section className="section">
        <div className="container">
          <div className="profile-card">
            <span className="avatar avatar-large" aria-hidden="true">{user.name[0].toUpperCase()}</span>
            <div>
              <h2>{user.name}</h2>
              <p>{user.email}</p>
            </div>
            <button type="button" className="btn btn-outline" onClick={handleLogout}>Log out</button>
          </div>

          <div className="button-row">
            <Link to="/favourites" className="btn btn-outline btn-sm">Favourites</Link>
            <Link to="/adoption-history" className="btn btn-outline btn-sm">Adoption history</Link>
            <Link to="/my-adopted-pets" className="btn btn-outline btn-sm">My adopted pets</Link>
            <Link to="/account" className="btn btn-outline btn-sm">Account</Link>
          </div>

          <h2>My favourite pets</h2>
          <PetGrid pets={favouritePets} emptyMessage="You have not saved any favourites yet. Tap the heart on a pet to add it here." />

          <div className="two-col">
            <div className="info-box">
              <h2>My Applications</h2>
              {applicationMessage && <p className="notice" role="status">{applicationMessage}</p>}
              {applications.length === 0 ? (
                <p>No applications yet. <Link to="/adopt">Start an application</Link></p>
              ) : (
                <div>
                  {applications.map((item) => (
                    <div className="journey-card" key={item.id}>
                      <div className="journey-card-head">
                        <h3>{item.petName}</h3>
                        <span>Submitted {formatDate(item.submittedAt)}</span>
                      </div>
                      <AdoptionJourney application={item} />
                      {isActiveApplication(item) && !getJourney(item).complete && (
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => handleCancelApplication(item)}>
                          Cancel application
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="info-box">
              <h2>My release requests</h2>
              {releaseMessage && <p className="notice" role="status">{releaseMessage}</p>}
              {releases.length === 0 ? (
                <p>No release requests. <Link to="/release">Release a pet</Link></p>
              ) : (
                <ul className="record-list">
                  {releases.map((item) => (
                    <li key={item.id}>
                      <strong>{item.petName}</strong>
                      <span>
                        Submitted {formatDate(item.submittedAt)} · {item.displayStatus}
                        {item.status === 'pending' && (
                          <> · <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleCancelRelease(item.id, item.petName)}>Cancel request</button></>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="narrow-form profile-password">
            <ChangePasswordForm />
          </div>
        </div>
      </section>
    </>
  );
}
