import { ageCategories, genders, sizes, speciesOptions } from '../data/pets';

// Filter controls. The parent page keeps the values (see PetListing.jsx).
export default function PetFilter({ filters, onChange, onReset, breeds, locations = [], showSpecies = false, resultCount, type }) {
  const handle = (event) => onChange(event.target.name, event.target.value);

  return (
    <form className="filter-panel" role="search" aria-label={`Filter ${type.toLowerCase()}s`} onSubmit={(event) => event.preventDefault()}>
      <div className="filter-field filter-search">
        <label htmlFor="search">Search by name</label>
        <input id="search" name="search" type="search" placeholder="e.g. Buddy" value={filters.search} onChange={handle} />
      </div>
      {showSpecies && (
        <div className="filter-field">
          <label htmlFor="species">Species</label>
          <select id="species" name="species" value={filters.species} onChange={handle}>
            <option value="">All species</option>
            {speciesOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
      )}
      <div className="filter-field">
        <label htmlFor="breed">Breed</label>
        <select id="breed" name="breed" value={filters.breed} onChange={handle}>
          <option value="">All breeds</option>
          {breeds.map((breed) => <option key={breed} value={breed}>{breed}</option>)}
        </select>
      </div>
      <div className="filter-field">
        <label htmlFor="age">Age</label>
        <select id="age" name="age" value={filters.age} onChange={handle}>
          <option value="">All ages</option>
          {ageCategories.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
      <div className="filter-field">
        <label htmlFor="gender">Gender</label>
        <select id="gender" name="gender" value={filters.gender} onChange={handle}>
          <option value="">Any gender</option>
          {genders.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
      <div className="filter-field">
        <label htmlFor="size">Size</label>
        <select id="size" name="size" value={filters.size} onChange={handle}>
          <option value="">Any size</option>
          {sizes.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
      <div className="filter-field">
        <label htmlFor="location">Location</label>
        <select id="location" name="location" value={filters.location} onChange={handle}>
          <option value="">All locations</option>
          {locations.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
      <div className="filter-footer">
        <p className="result-count" aria-live="polite">
          Showing <strong>{resultCount}</strong> {resultCount === 1 ? 'pet' : 'pets'}
        </p>
        <button type="button" className="btn btn-outline btn-sm" onClick={onReset}>Reset filters</button>
      </div>
    </form>
  );
}
