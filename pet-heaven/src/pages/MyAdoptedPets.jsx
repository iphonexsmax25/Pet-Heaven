import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import PetCard from '../components/PetCard';
import { useAuth } from '../context/AuthContext';
import { usePets } from '../context/PetsContext';
import { getApplications, isActiveApplication } from '../utils/adminData';
import { normalizeEmail } from '../utils/petRules';

export default function MyAdoptedPets() {
  const { currentUser } = useAuth();
  const { pets, releaseRequests, removePet } = usePets();
  const [message, setMessage] = useState('');
  const email = normalizeEmail(currentUser.email);
  const applications = getApplications();

  // Applications this member completed (older adoptions may have no adoptionHistory yet)
  const completedPetIds = new Set(
    applications
      .filter((item) => item.status === 'Completed'
        && ((item.applicantUserId && item.applicantUserId === currentUser.id)
          || (!item.applicantUserId && normalizeEmail(item.email) === email)))
      .map((item) => String(item.petId))
  );

  const mine = pets.filter((pet) => {
    if (pet.status !== 'adopted') return false;
    if (pet.ownerUserId === currentUser.id) return true;
    if (pet.adoptedByUserId) return pet.adoptedByUserId === currentUser.id;
    const last = pet.adoptionHistory[pet.adoptionHistory.length - 1];
    if (last) return last.userId ? last.userId === currentUser.id : normalizeEmail(last.email) === email;
    return completedPetIds.has(String(pet.id));
  });

  const canRemove = (pet) => pet.ownerUserId === currentUser.id
    && !releaseRequests.some((request) => String(request.petId) === String(pet.id))
    && !applications.some((application) => String(application.petId) === String(pet.id) && isActiveApplication(application));

  const handleRemove = async (pet) => {
    if (!window.confirm(`Permanently remove ${pet.name} from Pet Heaven? This cannot be undone and will also remove its saved image and favourites.`)) return;
    const result = await removePet(pet.id, currentUser);
    setMessage(result.ok
      ? (result.warning || `${pet.name} was permanently removed.`)
      : result.error);
  };

  return (
    <>
      <PageHeader title="My Adopted Pets" intro="Pets you added to Pet Heaven or adopted through Pet Heaven." />
      <section className="section">
        <div className="container">
          {message && <p className="notice" role="status">{message}</p>}
          {mine.length > 0 && <p className="note-text">Can no longer care for an adopted pet? <Link to="/release">Send a release request</Link>.</p>}
          {mine.length === 0 ? (
            <div className="empty-state" role="status">
              <p className="empty-icon" aria-hidden="true">🐾</p>
              <h3>No pets to show</h3>
              <p>You have not added or adopted a pet yet. Pets you add or adopt will appear here.</p>
            </div>
          ) : (
            <div className="pet-grid">
              {mine.map((pet) => (
                <PetCard pet={pet} key={pet.id}>
                  {pet.ownerUserId === currentUser.id && (
                    <>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        disabled={!canRemove(pet)}
                        onClick={() => handleRemove(pet)}
                      >Remove Pet</button>
                      {!canRemove(pet) && (
                        <p className="note-text">                        This pet cannot be removed while it has a release request or an active adoption application.</p>
                      )}
                    </>
                  )}
                </PetCard>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
