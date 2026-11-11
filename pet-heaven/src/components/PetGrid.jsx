import PetCard from './PetCard';

// Shows a grid of pet cards, or a friendly message when the list is empty
export default function PetGrid({ pets, emptyMessage = 'No pets to show right now.' }) {
  if (pets.length === 0) {
    return (
      <div className="empty-state" role="status">
        <p className="empty-icon" aria-hidden="true">🐾</p>
        <h3>No pets found</h3>
        <p>{emptyMessage}</p>
      </div>
    );
  }
  return (
    <div className="pet-grid">
      {pets.map((pet) => (
        <PetCard key={pet.id} pet={pet} />
      ))}
    </div>
  );
}
