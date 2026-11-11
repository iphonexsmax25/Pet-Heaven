import PageHeader from '../components/PageHeader';
import PetImage from '../components/PetImage';
import { usePets } from '../context/PetsContext';
import { statusLabel } from '../utils/petRules';
import { formatDate } from '../utils/validators';

// Public card: only the pet's photo, name, species, breed, age, status and adoption date.
// It never shows adopter or releaser details, and it has no Adopt button.
function AdoptedPetCard({ pet }) {
  return (
    <article className="pet-card">
      <div className="pet-card-media">
        <PetImage src={pet.image} imageId={pet.imageId} alt={`${pet.name}, adopted`} />
        <span className="badge badge-adopted">{statusLabel(pet.status)}</span>
      </div>
      <div className="pet-card-body">
        <h3>{pet.name}</h3>
        <p className="pet-meta">{pet.breed}</p>
        <ul className="tag-list" aria-label={`${pet.name} quick facts`}>
          <li>{pet.age}</li>
          <li>{pet.species}</li>
        </ul>
        {pet.adoptedAt && <p className="pet-location">🏡 Adopted on {formatDate(pet.adoptedAt)}</p>}
      </div>
    </article>
  );
}

export default function AdoptedAnimals() {
  const { pets } = usePets();
  const adopted = pets
    .filter((pet) => pet.status === 'adopted')
    .sort((a, b) => new Date(b.adoptedAt || 0) - new Date(a.adoptedAt || 0));

  return (
    <>
      <PageHeader title="Adopted Animals" intro="Happy endings: pets who have found their forever homes." />
      <section className="section">
        <div className="container">
          {adopted.length === 0 ? (
            <div className="empty-state" role="status">
              <p className="empty-icon" aria-hidden="true">🐾</p>
              <p>No adopted animals to display yet.</p>
            </div>
          ) : (
            <div className="pet-grid">
              {adopted.map((pet) => <AdoptedPetCard key={pet.id} pet={pet} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
