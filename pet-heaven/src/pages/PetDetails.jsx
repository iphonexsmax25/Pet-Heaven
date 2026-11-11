import { Link, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import PetGallery from '../components/PetGallery';
import PetCard from '../components/PetCard';
import { useAuth } from '../context/AuthContext';
import { usePets } from '../context/PetsContext';
import { formatDate } from '../utils/validators';
import { ALREADY_ADOPTED_MESSAGE, statusLabel } from '../utils/petRules';
import { getCompatibility, getGalleryItems, getHighlights, stateSymbol, stateWord } from '../utils/petProfile';

// One yes / no / unknown line: a symbol and words, so the meaning never depends on colour alone
function StateLine({ item }) {
  return (
    <li className={`state-line state-${item.state}`}>
      <span className="state-symbol" aria-hidden="true">{stateSymbol(item.state)}</span>
      <span>{item.text}</span>
      <span className="sr-only"> ({stateWord(item.state)})</span>
    </li>
  );
}

export default function PetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { favourites, toggleFavourite } = useAuth();
  const { pets, getPet } = usePets();
  const pet = getPet(id);

  // Friendly message if the id in the address does not match a pet
  if (!pet) {
    return (
      <section className="section">
        <div className="container narrow center-text">
          <p className="empty-icon" aria-hidden="true">🔍</p>
          <h1>Pet not found</h1>
          <p>Sorry, we could not find a pet with that ID. They may have found a home, or the link may be wrong.</p>
          <div className="button-row button-row-center">
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Go back</button>
            <Link to="/dogs" className="btn btn-primary">Browse dogs</Link>
            <Link to="/cats" className="btn btn-primary">Browse cats</Link>
          </div>
        </div>
      </section>
    );
  }

  const isFavourite = favourites.includes(pet.id);
  const canAdopt = pet.status === 'available';
  const isAdopted = pet.status === 'adopted';
  const related = pets.filter((item) => item.species === pet.species && item.id !== pet.id).slice(0, 3);
  const highlights = getHighlights(pet);
  const compatibility = getCompatibility(pet);

  const facts = [
    ['Breed', pet.breed], ['Age', pet.age], ['Gender', pet.gender], ['Size', pet.size],
    ['Colour', pet.colour], ['Location', pet.location], ['Availability', statusLabel(pet.status)], ['Vaccination', pet.vaccinated],
    ...(isAdopted && pet.adoptedAt ? [['Adopted on', formatDate(pet.adoptedAt)]] : []),
  ];

  return (
    <>
      <PageHeader title={pet.name} intro={`${pet.breed} · ${pet.age} · ${pet.gender}`} />
      <section className="section">
        <div className="container">
          <button type="button" className="back-link" onClick={() => navigate(-1)}>← Back</button>

          <div className="details-grid">
            <PetGallery key={pet.id} items={getGalleryItems(pet)} name={pet.name}>
              <span className={`badge badge-${pet.status}`}>{statusLabel(pet.status)}</span>
            </PetGallery>

            <div className="details-info">
              <h2>About {pet.name}</h2>
              <p>{pet.fullDescription}</p>

              <ul className="highlight-list" aria-label={`${pet.name} highlights`}>
                {highlights.map((item) => <StateLine key={item.label} item={item} />)}
              </ul>

              <dl className="fact-grid">
                {facts.map(([label, value]) => (
                  <div key={label} className="fact">
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="button-row">
                {canAdopt ? (
                  <Link to={`/adopt?pet=${pet.id}`} className="btn btn-primary">Adopt {pet.name}</Link>
                ) : isAdopted ? null : (
                  <button type="button" className="btn btn-primary" disabled>
                    Adoption pending
                  </button>
                )}
                <button
                  type="button"
                  className={isFavourite ? 'btn btn-outline is-active' : 'btn btn-outline'}
                  aria-pressed={isFavourite}
                  onClick={() => toggleFavourite(pet.id)}
                >
                  {isFavourite ? '♥ Favourited' : '♡ Add to favourites'}
                </button>
              </div>
              {isAdopted && <p className="pet-restriction-message" role="status">{ALREADY_ADOPTED_MESSAGE}</p>}
            </div>
          </div>

          <div className="two-col">
            {pet.personality.length > 0 && <div className="info-box">
              <h3>Personality</h3>
              <ul className="tag-list tag-list-large">
                {pet.personality.map((trait) => <li key={trait}>{trait}</li>)}
              </ul>
            </div>}
            {pet.care.length > 0 && <div className="info-box">
              <h3>Care requirements</h3>
              <ul className="check-list">
                {pet.care.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>}

            <div className="info-box">
              <h3>Medical status</h3>
              <p>{pet.medicalStatus || 'Medical information has not been recorded yet. Please ask our team.'}</p>
              <ul className="highlight-list highlight-list-plain">
                <StateLine item={highlights[1]} />
              </ul>
            </div>
            <div className="info-box">
              <h3>Vaccination records</h3>
              <p className="records-summary">{pet.vaccinated}</p>
              {pet.vaccinationRecords.length > 0 ? (
                <div className="table-scroll">
                  <table className="records-table">
                    <caption className="sr-only">Vaccination records for {pet.name}</caption>
                    <thead>
                      <tr><th scope="col">Vaccine</th><th scope="col">Given</th><th scope="col">Next due</th></tr>
                    </thead>
                    <tbody>
                      {pet.vaccinationRecords.map((record) => (
                        <tr key={record.name}>
                          <th scope="row">{record.name}</th>
                          <td>{record.date ? formatDate(record.date) : 'Not recorded'}</td>
                          <td>{record.nextDue ? formatDate(record.nextDue) : 'Not recorded'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No individual vaccination records have been added yet.</p>
              )}
            </div>

            <div className="info-box">
              <h3>{pet.name}’s rescue story</h3>
              <p>{pet.rescueStory || 'Rescue story coming soon.'}</p>
            </div>
            <div className="info-box">
              <h3>Adoption requirements</h3>
              {pet.adoptionRequirements.length > 0 ? (
                <ul className="check-list">
                  {pet.adoptionRequirements.map((item) => <li key={item}>{item}</li>)}
                </ul>
              ) : (
                <p>Our team will talk you through the requirements when you apply.</p>
              )}
            </div>

            <div className="info-box info-box-wide">
              <h3>Compatibility and habits</h3>
              <ul className="compat-list" aria-label={`${pet.name} compatibility`}>
                {compatibility.map((item) => (
                  <li key={item.label} className={`compat-item state-${item.state}`}>
                    <span className="compat-label">{item.label}</span>
                    <span className="state-line">
                      <span className="state-symbol" aria-hidden="true">{stateSymbol(item.state)}</span>
                      <span>{item.text}</span>
                      <span className="sr-only"> ({stateWord(item.state)})</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {related.length > 0 && <div className="related">
            <h2>Related {pet.species === 'Dog' ? 'dogs' : pet.species === 'Cat' ? 'cats' : 'pets'}</h2>
            <div className="pet-grid">
              {related.map((item) => <PetCard key={item.id} pet={item} />)}
            </div>
          </div>}
        </div>
      </section>
    </>
  );
}
