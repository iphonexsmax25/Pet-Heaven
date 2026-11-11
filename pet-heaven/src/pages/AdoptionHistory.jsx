import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import AdoptionJourney from '../components/AdoptionJourney';
import { useAuth } from '../context/AuthContext';
import { usePets } from '../context/PetsContext';
import { APPLICATIONS_KEY, getApplications, isActiveApplication, ownsApplication } from '../utils/adminData';
import { getJourney } from '../utils/adoptionJourney';
import { formatDate } from '../utils/validators';

export default function AdoptionHistory() {
  const { currentUser } = useAuth();
  const { cancelAdoptionApplication } = usePets();
  const [saved, setSaved] = useState(getApplications);
  const [message, setMessage] = useState('');

  // Customers can only view progress. If an employee changes a status in another tab, the tracker updates here too.
  useEffect(() => {
    const refresh = (event) => {
      if (!event.key || event.key === APPLICATIONS_KEY) setSaved(getApplications());
    };
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, []);

  const applications = saved.filter((item) => ownsApplication(item, currentUser));

  const handleCancel = (application) => {
    if (!window.confirm(`Cancel your adoption application for ${application.petName}? This will stop its progress, but keep it in your history.`)) return;
    const result = cancelAdoptionApplication(application.id, currentUser);
    setMessage(result.ok ? `Your application for ${application.petName} was cancelled.` : result.error);
    if (result.ok) setSaved(getApplications());
  };

  return (
    <>
      <PageHeader title="Adoption History" intro="Applications you have submitted from this browser." />
      <section className="section">
        <div className="container narrow-form wide">
          {message && <p className="notice" role="status">{message}</p>}
          {applications.length === 0 ? (
            <div className="info-box">
              <p>No applications yet. <Link to="/adopt">Start an application</Link></p>
            </div>
          ) : (
            applications.map((item) => (
              <div className="info-box journey-card" key={item.id}>
                <div className="journey-card-head">
                  <h2>{item.petName}</h2>
                  <span>Submitted {formatDate(item.submittedAt)}</span>
                </div>
                <AdoptionJourney application={item} />
                {isActiveApplication(item) && !getJourney(item).complete && (
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => handleCancel(item)}>
                    Cancel application
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}