import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import AdoptionJourney from '../components/AdoptionJourney';
import { useAuth } from '../context/AuthContext';
import { APPLICATIONS_KEY, getApplications } from '../utils/adminData';
import { formatDate } from '../utils/validators';

export default function AdoptionHistory() {
  const { currentUser } = useAuth();
  const [saved, setSaved] = useState(getApplications);

  // Customers can only view progress. If an employee changes a status in another tab, the tracker updates here too.
  useEffect(() => {
    const refresh = (event) => {
      if (!event.key || event.key === APPLICATIONS_KEY) setSaved(getApplications());
    };
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, []);

  const applications = saved.filter(
    (item) => item.email && item.email.trim().toLowerCase() === currentUser.email
  );

  return (
    <>
      <PageHeader title="Adoption History" intro="Applications you have submitted from this browser." />
      <section className="section">
        <div className="container narrow-form wide">
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
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}