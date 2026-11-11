import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import AppointmentCalendar from '../components/AppointmentCalendar';
import { useAuth } from '../context/AuthContext';
import { usePets } from '../context/PetsContext';
import { getApplications, getNotifications } from '../utils/adminData';
import { formatDate } from '../utils/validators';

const tiles = [
  ['/admin/pets', 'Pet Fleet', 'Every pet with every status. Pets are never deleted.'],
  ['/admin/applications', 'Manage Adoption Applications', 'Approve or reject applications.'],
  ['/admin/releases', 'Manage Pet Releases', 'Review and approve release requests.'],
  ['#calendar', 'Appointment Calendar', 'See scheduled adoption visits.'],
  ['/admin/reports', 'Reports', 'Totals for pets, applications and members.'],
  ['#notifications', 'Email Notifications', 'Messages sent to applicants.'],
];

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const { pets, releaseRequests } = usePets();
  const applications = getApplications();
  const notifications = getNotifications();
  const visits = applications
    .filter((item) => item.status === 'Approved' && item.visitDate)
    .map((item) => ({ date: item.visitDate, label: item.petName }));

  return (
    <>
      <PageHeader title="Employee Dashboard" intro={`Welcome, ${currentUser.name}.`} />
      <section className="section">
        <div className="container">
          <div className="admin-stats">
            <div className="stat-card"><strong>{pets.length}</strong><span>Total pets</span></div>
            <div className="stat-card"><strong>{pets.filter((pet) => pet.status === 'available').length}</strong><span>Available pets</span></div>
            <div className="stat-card"><strong>{pets.filter((pet) => pet.status === 'pending').length}</strong><span>Pending pets</span></div>
            <div className="stat-card"><strong>{pets.filter((pet) => pet.status === 'adopted').length}</strong><span>Adopted pets</span></div>
            <div className="stat-card"><strong>{applications.filter((item) => item.status === 'Pending').length}</strong><span>Pending applications</span></div>
            <div className="stat-card"><strong>{releaseRequests.filter((request) => request.status === 'pending').length}</strong><span>Pending release requests</span></div>
          </div>

          <div className="admin-tiles">
            {tiles.map(([to, title, text]) => {
              const content = <><h3>{title}</h3><p>{text}</p></>;
              return to.startsWith('#')
                ? <a key={to} href={to} className="admin-tile">{content}</a>
                : <Link key={to} to={to} className="admin-tile">{content}</Link>;
            })}
          </div>

          <div id="calendar" className="admin-section info-box">
            <h2>Appointment Calendar</h2>
            <p>Visits appear here when you approve an application and pick a visit date.</p>
            <AppointmentCalendar visits={visits} />
          </div>

          <div id="notifications" className="admin-section info-box">
            <h2>Email Notifications</h2>
            <p>These are simulated. No real email is sent because the site has no server.</p>
            {notifications.length === 0 ? (
              <p>No notifications yet. They are created when you approve or reject an application.</p>
            ) : (
              <ul className="mail-list">
                {notifications.slice(0, 8).map((mail) => (
                  <li key={mail.id}>
                    <strong>{mail.subject}</strong>
                    <span>To {mail.to} · {formatDate(mail.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
