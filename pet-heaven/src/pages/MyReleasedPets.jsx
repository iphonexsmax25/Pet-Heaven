import PageHeader from '../components/PageHeader';
import PetGrid from '../components/PetGrid';
import { useAuth } from '../context/AuthContext';
import { usePets } from '../context/PetsContext';
import { wasReleasedByCurrentUser } from '../utils/petRules';

export default function MyReleasedPets() {
  const { currentUser } = useAuth();
  const { pets } = usePets();
  const mine = pets.filter((pet) => wasReleasedByCurrentUser(pet, currentUser));

  return (
    <>
      <PageHeader title="My Released Pets" intro="Pets you released to Pet Heaven after an employee approved your request. A released pet can be adopted again, including by you." />
      <section className="section">
        <div className="container">
          <PetGrid pets={mine} emptyMessage="No released pets yet. Use “Release a Pet” to send a release request." />
        </div>
      </section>
    </>
  );
}
