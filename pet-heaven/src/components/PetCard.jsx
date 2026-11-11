import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PetImage from './PetImage';
import { formatDate } from '../utils/validators';
import { ALREADY_ADOPTED_MESSAGE, statusLabel } from '../utils/petRules';

export default function PetCard({ pet, children }) {
  const { favourites, toggleFavourite } = useAuth();
  const isFavourite = favourites.includes(pet.id);
  const navigate = useNavigate();

  // Clicking anywhere on the card opens the details page. Links and buttons (favourite, View Details) keep their own action.
  const openDetails = (event) => {
    if (event.target.closest('a, button')) return;
    navigate(`/pets/${pet.id}`);
  };

  return (
    <article className="pet-card is-clickable" onClick={openDetails}>
      <div className="pet-card-media">
        <Link to={`/pets/${pet.id}`} tabIndex={-1} aria-hidden="true">
          <PetImage src={pet.image} imageId={pet.imageId} alt="" />
        </Link>
        <span className={`badge badge-${pet.status}`}>{statusLabel(pet.status)}</span>
        <button
          type="button"
          className={isFavourite ? 'fav-btn is-fav' : 'fav-btn'}
          aria-pressed={isFavourite}
          aria-label={isFavourite ? `Remove ${pet.name} from favourites` : `Add ${pet.name} to favourites`}
          onClick={() => toggleFavourite(pet.id)}
        >
          {isFavourite ? '♥' : '♡'}
        </button>
      </div>
      <div className="pet-card-body">
        <h3>{pet.name}</h3>
        <p className="pet-meta">{pet.breed} · {pet.gender}</p>
        <ul className="tag-list" aria-label={`${pet.name} quick facts`}>
          <li>{pet.age}</li>
          <li>{pet.size}</li>
          <li>{pet.species}</li>
        </ul>
        <p className="pet-location">📍 {pet.location}</p>
        {pet.status === 'adopted' && pet.adoptedAt && <p className="pet-location">🏡 Adopted on {formatDate(pet.adoptedAt)}</p>}
        <p className="pet-short">{pet.shortDescription}</p>
        <Link to={`/pets/${pet.id}`} className="btn btn-primary btn-sm" aria-label={`View details for ${pet.name}`}>
          View Details
        </Link>
        {pet.status === 'adopted' && <p className="pet-restriction-message">{ALREADY_ADOPTED_MESSAGE}</p>}
        {children}
      </div>
    </article>
  );
}
