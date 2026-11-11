import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import PetImage from '../components/PetImage';
import { usePets } from '../context/PetsContext';
import {
  EMPTY_MATCH_PREFERENCES,
  getPetMatches,
  loadMatchPreferences,
  saveMatchPreferences,
} from '../utils/petMatching';
import '../styles/pet-matching.css';

const fields = [
  {
    name: 'animalType', label: 'Animal type', options: [['dog', 'Dog'], ['cat', 'Cat'], ['any', 'No preference']],
  },
  {
    name: 'activityLevel', label: 'Activity level', options: [['low', 'Low-key'], ['moderate', 'Moderate'], ['high', 'Very active']],
  },
  {
    name: 'homeType', label: 'Home type', options: [['apartment', 'Apartment / condo'], ['house', 'House']],
  },
  {
    name: 'availableSpace', label: 'Available space', options: [['small', 'Compact'], ['medium', 'Moderate'], ['large', 'Generous']],
  },
  {
    name: 'children', label: 'Children in the household', options: [['yes', 'Yes'], ['no', 'No']],
  },
  {
    name: 'existingPets', label: 'Existing pets', options: [['none', 'No other pets'], ['cat', 'Cat(s)'], ['dog', 'Dog(s)'], ['both', 'Cats and dogs']],
  },
  {
    name: 'size', label: 'Preferred animal size', options: [['any', 'No preference'], ['small', 'Small'], ['medium', 'Medium'], ['large', 'Large']],
  },
  {
    name: 'age', label: 'Preferred age', options: [['any', 'No preference'], ['baby', 'Baby'], ['young', 'Young'], ['adult', 'Adult'], ['senior', 'Senior']],
  },
];

function MatchCard({ match }) {
  const { pet, matchPercentage, reason } = match;
  return (
    <article className="pet-card match-card">
      <Link to={`/pets/${pet.id}`} className="match-card-image" aria-label={`View ${pet.name}'s profile`}>
        <PetImage src={pet.image} imageId={pet.imageId} alt={pet.name} />
      </Link>
      <div className="match-card-body">
        <div className="match-card-heading">
          <div>
            <h3>{pet.name}</h3>
            <p className="pet-meta">{pet.breed}</p>
          </div>
          <span className="match-score" aria-label={`${matchPercentage}% match`}>{matchPercentage}%</span>
        </div>
        <p className="match-reason">{reason}</p>
        <div className="button-row">
          <Link to={`/pets/${pet.id}`} className="btn btn-outline btn-sm">View Profile</Link>
          <Link to={`/adopt?pet=${encodeURIComponent(pet.id)}`} className="btn btn-primary btn-sm">Apply</Link>
        </div>
      </div>
    </article>
  );
}

export default function PetMatching() {
  const { pets } = usePets();
  const [preferences, setPreferences] = useState(loadMatchPreferences);
  const [submitted, setSubmitted] = useState(() => Object.values(loadMatchPreferences()).every(Boolean));
  const [storageError, setStorageError] = useState('');
  const matches = useMemo(
    () => (submitted ? getPetMatches(pets, preferences) : []),
    [pets, preferences, submitted]
  );

  const updatePreference = (event) => {
    const { name, value } = event.target;
    setPreferences((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const saved = saveMatchPreferences(preferences);
    setStorageError(saved ? '' : 'Your matches are ready, but preferences could not be saved in this browser.');
    setSubmitted(true);
  };

  const reset = () => {
    setPreferences(EMPTY_MATCH_PREFERENCES);
    setSubmitted(false);
    setStorageError(saveMatchPreferences(EMPTY_MATCH_PREFERENCES)
      ? ''
      : 'Preferences could not be cleared from this browser.');
  };

  return (
    <>
      <PageHeader
        title="Pet Matching System"
        intro="Tell us what life looks like at home to find available animals that may suit your household."
      />
      <section className="section">
        <div className="container narrow">
          <form className="form-card match-form" onSubmit={handleSubmit}>
            <h2>Your preferences</h2>
            <p className="match-form-intro">We compare your answers with the animal profiles already on Pet Heaven. Matching is guidance, not an adoption decision.</p>
            <div className="form-grid">
              {fields.map((field) => (
                <div className="form-field" key={field.name}>
                  <label htmlFor={`match-${field.name}`}>{field.label}</label>
                  <select
                    id={`match-${field.name}`}
                    name={field.name}
                    value={preferences[field.name]}
                    onChange={updatePreference}
                    required
                  >
                    <option value="" disabled>Select an option</option>
                    {field.options.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div className="button-row match-form-actions">
              <button type="submit" className="btn btn-primary">Find my matches</button>
              <button type="button" className="btn btn-outline" onClick={reset}>Clear preferences</button>
            </div>
            {storageError && <p className="error-text" role="status">{storageError}</p>}
          </form>

          {submitted && (
            <section className="match-results" aria-labelledby="match-results-title">
              <div className="section-head">
                <h2 id="match-results-title">Your top matches</h2>
                <p>Only currently available pets are included. Pending and adopted animals are not shown.</p>
              </div>
              {matches.length > 0 ? (
                <div className="pet-grid match-grid">
                  {matches.map((match) => <MatchCard key={match.pet.id} match={match} />)}
                </div>
              ) : (
                <div className="empty-state">
                  <p className="empty-icon" aria-hidden="true">🐾</p>
                  <h3>No available matches yet</h3>
                  <p>Try adjusting your preferences or check back as new animals become available.</p>
                  <Link to="/pets" className="btn btn-outline">Browse all pets</Link>
                </div>
              )}
            </section>
          )}
        </div>
      </section>
    </>
  );
}
