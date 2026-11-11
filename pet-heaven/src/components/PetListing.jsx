import { useMemo, useState } from 'react';
import { usePets } from '../context/PetsContext';
import PetFilter from './PetFilter';
import PetGrid from './PetGrid';

const emptyFilters = { search: '', species: '', breed: '', age: '', gender: '', size: '', location: '' };

// Shared by the Dogs, Cats and Available Pets pages: filters + grid.
// Dogs and Cats (pass type="Dog" or "Cat") are fleet pages: they list matching pets of EVERY status
// (available, pending, adopted), so searching for an adopted pet still finds it, with its badge.
// Only the Available Pets page passes availableOnly, which is the one place that filters by status.
export default function PetListing({ type, availableOnly = false }) {
  const { pets: allPets } = usePets();
  const [filters, setFilters] = useState(emptyFilters);

  // 1) choose the list from the full fleet; 2) the text, breed, age, gender, size and location filters run on it below
  const petsInScope = useMemo(() => {
    if (availableOnly) {
      return allPets.filter((pet) => pet.status === 'available');
    }
    return type ? allPets.filter((pet) => pet.species === type) : allPets;
  }, [allPets, type, availableOnly]);
  const optionPets = filters.species ? petsInScope.filter((pet) => pet.species === filters.species) : petsInScope;
  const breeds = useMemo(() => [...new Set(optionPets.map((pet) => pet.breed))].sort(), [optionPets]);
  const locations = useMemo(() => [...new Set(petsInScope.map((pet) => pet.location))].sort(), [petsInScope]);

  const filtered = petsInScope.filter((pet) => {
    const search = filters.search.trim().toLowerCase();
    return (
      (!search || pet.name.toLowerCase().includes(search)) &&
      (!filters.species || pet.species === filters.species) &&
      (!filters.breed || pet.breed === filters.breed) &&
      (!filters.age || pet.ageCategory === filters.age) &&
      (!filters.gender || pet.gender === filters.gender) &&
      (!filters.size || pet.size === filters.size) &&
      (!filters.location || pet.location === filters.location)
    );
  });

  const handleChange = (name, value) =>
    setFilters((current) => ({ ...current, [name]: value, ...(name === 'species' ? { breed: '' } : {}) }));

  return (
    <>
      <PetFilter
        filters={filters}
        breeds={breeds}
        locations={locations}
        showSpecies={!type}
        type={type || 'Pet'}
        resultCount={filtered.length}
        onChange={handleChange}
        onReset={() => setFilters(emptyFilters)}
      />
      <PetGrid pets={filtered} emptyMessage="Try a different search or press “Reset filters” to see every pet again." />
    </>
  );
}
