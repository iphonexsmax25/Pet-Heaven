import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { usePets } from '../context/PetsContext';
import { VALID_STATUSES, statusLabel } from '../utils/petRules';
import { formatDate } from '../utils/validators';

// The Pet Fleet: the master list of every pet, whatever its status. Pets are never removed.
export default function AdminPets() {
  const { pets, releaseRequests, updatePet } = usePets();
  const [message, setMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const count = (status) => pets.filter((pet) => pet.status === status).length;
  const shown = statusFilter ? pets.filter((pet) => pet.status === statusFilter) : pets;

  const handleStatus = (pet, status) => {
    const result = updatePet(pet.id, { status });
    setMessage(result.ok ? `${pet.name} is now ${statusLabel(status)}.` : result.error);
  };

  const lastRelease = (pet) => pet.releaseHistory.filter((entry) => entry.type === 'release' && entry.approvedAt).slice(-1)[0];

  // Releases are never approved from this table: only from a pending request on the Releases page
  const hasPendingRequest = (pet) => releaseRequests.some((request) => String(request.petId) === String(pet.id) && request.status === 'pending');

  return (
    <>
      <PageHeader title="Pet Fleet" intro="Every pet with every status. Pets are never deleted: adopted pets stay in the fleet." />
      <section className="section">
        <div className="container">
          <div className="admin-stats">
            <div className="stat-card"><strong>{pets.length}</strong><span>Total pets</span></div>
            <div className="stat-card"><strong>{count('available')}</strong><span>Available</span></div>
            <div className="stat-card"><strong>{count('pending')}</strong><span>Pending</span></div>
            <div className="stat-card"><strong>{count('adopted')}</strong><span>Adopted</span></div>
          </div>

          {message && <p className="notice" role="status">{message}</p>}

          <div className="fleet-toolbar">
            <div className="filter-field">
              <label htmlFor="fleet-status">Show</label>
              <select id="fleet-status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="">All statuses</option>
                {VALID_STATUSES.map((item) => <option key={item} value={item}>{statusLabel(item)}</option>)}
              </select>
            </div>
            <p className="result-count" aria-live="polite">Showing <strong>{shown.length}</strong> of {pets.length} pets</p>
          </div>

          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Pet</th><th>Species</th><th>Breed</th><th>Location</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {shown.map((pet) => (
                  <tr key={pet.id}>
                    <td><Link to={`/pets/${pet.id}`}>{pet.name}</Link></td>
                    <td>{pet.species}</td>
                    <td>{pet.breed}</td>
                    <td>{pet.location}</td>
                    <td>
                      {/* Adopted is set only by "Complete adoption"; it goes back to available only when a release request is approved */}
                      {/* The pet's most recent approved release, if any */}
                      {pet.status === 'adopted' ? (
                        <>
                          <span className="status-pill status-pill-adopted">Adopted</span>
                          {pet.adoptedAt && <><br /><small>Adopted on {formatDate(pet.adoptedAt)}</small></>}
                        </>
                      ) : (
                        <>
                        <select value={pet.status} onChange={(event) => handleStatus(pet, event.target.value)} aria-label={`Status for ${pet.name}`}>
                          <option value="available">{statusLabel('available')}</option>
                          <option value="pending">{statusLabel('pending')}</option>
                        </select>
                        {lastRelease(pet) && <><br /><small>Released on {formatDate(lastRelease(pet).approvedAt)}</small></>}
                        </>
                      )}
                    </td>
                    <td>
                      {hasPendingRequest(pet)
                        ? <Link to="/admin/releases">Release requested: review</Link>
                        : <span>Kept in fleet</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
