import PageHeader from '../components/PageHeader';
import PetGrid from '../components/PetGrid';
import { useAuth } from '../context/AuthContext';
import { usePets } from '../context/PetsContext';

export default function Favourites() {
  const { favourites } = useAuth();
  const { pets } = usePets();
  const favouritePets = pets.filter((pet) => favourites.includes(pet.id));

  return (
    <>
      <PageHeader title="My Favourites" intro="The pets you have saved with the heart button." />
      <section className="section">
        <div className="container">
          <PetGrid pets={favouritePets} emptyMessage="You have not saved any favourites yet. Tap the heart on a pet to add it here." />
        </div>
      </section>
    </>
  );
}
