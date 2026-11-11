import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import PetGrid from '../components/PetGrid';
import { useAuth } from '../context/AuthContext';
import { usePets } from '../context/PetsContext';
import { getApplications } from '../utils/adminData';
import { normalizeEmail } from '../utils/petRules';

export default function MyAdoptedPets() {
  const { currentUser } = useAuth();
  const { pets } = usePets();
  const email = normalizeEmail(currentUser.email);

  // Applications this member completed (older adoptions may have no adoptionHistory yet)
  const completedPetIds = new Set(
    getApplications()
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

  return (
    <>
      <PageHeader title="My Adopted Pets" intro="Pets you added to Pet Heaven or adopted through Pet Heaven." />
      <section className="section">
        <div className="container">
          {mine.length > 0 && <p className="note-text">Can no longer care for an adopted pet? <Link to="/release">Send a release request</Link>.</p>}
          <PetGrid pets={mine} emptyMessage="You have not added or adopted a pet yet. Pets you add or adopt will appear here." />
        </div>
      </section>
    </>
  );
}
