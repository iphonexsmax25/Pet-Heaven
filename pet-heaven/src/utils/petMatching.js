import { readStorage, writeStorage } from './storage.js';

export const PET_MATCHING_KEY = 'petheaven_matching_preferences';

export const EMPTY_MATCH_PREFERENCES = {
  animalType: '',
  activityLevel: '',
  homeType: '',
  availableSpace: '',
  children: '',
  existingPets: '',
  size: '',
  age: '',
};

const MATCH_FIELDS = Object.keys(EMPTY_MATCH_PREFERENCES);
const WEIGHTS = {
  animalType: 20,
  activityLevel: 15,
  homeType: 10,
  availableSpace: 10,
  children: 15,
  existingPets: 15,
  size: 7.5,
  age: 7.5,
};

export function loadMatchPreferences() {
  const saved = readStorage(PET_MATCHING_KEY, null);
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return EMPTY_MATCH_PREFERENCES;
  return MATCH_FIELDS.reduce((preferences, field) => ({
    ...preferences,
    [field]: typeof saved[field] === 'string' ? saved[field] : '',
  }), {});
}

export function saveMatchPreferences(preferences) {
  return writeStorage(PET_MATCHING_KEY, preferences);
}

const normal = (value) => String(value || '').trim().toLowerCase();
const petType = (pet) => normal(pet.species || pet.type);
const ageCategory = (pet) => {
  if (pet.ageCategory) return normal(pet.ageCategory);
  const age = normal(pet.age);
  if (/month|week|baby|puppy|kitten/.test(age)) return 'baby';
  if (/senior|old/.test(age)) return 'senior';
  return 'adult';
};

function activityFor(pet) {
  const details = [
    ...(Array.isArray(pet.personality) ? pet.personality : []),
    ...(Array.isArray(pet.care) ? pet.care : []),
    pet.shortDescription,
    pet.fullDescription,
  ].join(' ').toLowerCase();
  const low = (details.match(/calm|gentle|quiet|cuddl|lap|short walks?|relaxed|low.energy|sofa/g) || []).length;
  const high = (details.match(/energetic|active|long walks?|exercise|playful|curious|high.energy|runs|training/g) || []).length;
  if (high > low) return 'high';
  if (low > high) return 'low';
  return 'moderate';
}

function compatibilityScore(value) {
  const answer = normal(value);
  if (answer === 'yes' || answer === 'true') return 1;
  if (answer === 'no' || answer === 'false') return 0;
  return 0.5;
}

function homeScore(preference, pet) {
  if (preference === 'house') return 1;
  const size = normal(pet.size);
  if (petType(pet) === 'cat' || size === 'small') return 1;
  if (size === 'medium') return 0.75;
  if (size === 'large') return 0.4;
  return 0.65;
}

function spaceScore(preference, pet) {
  const size = normal(pet.size);
  const fit = {
    small: { small: 1, medium: 0.65, large: 0.3 },
    medium: { small: 0.85, medium: 1, large: 0.7 },
    large: { small: 0.75, medium: 0.9, large: 1 },
  };
  return fit[preference]?.[size] ?? 0.5;
}

function existingPetsScore(preference, pet) {
  if (preference === 'none') return 1;
  const compatibility = [];
  if (preference === 'cat' || preference === 'both') compatibility.push(compatibilityScore(pet.goodWithCats));
  if (preference === 'dog' || preference === 'both') compatibility.push(compatibilityScore(pet.goodWithDogs));
  return compatibility.reduce((sum, score) => sum + score, 0) / compatibility.length;
}

export function getPetMatches(pets, preferences) {
  const availablePets = pets.filter((pet) => normal(pet.status) === 'available');
  return availablePets
    .map((pet) => {
      const factors = [
        {
          key: 'animalType',
          score: normal(preferences.animalType) === 'any' || petType(pet) === normal(preferences.animalType) ? 1 : 0,
          reason: `${pet.species || pet.type} matches your preferred animal type`,
        },
        {
          key: 'activityLevel',
          score: activityFor(pet) === preferences.activityLevel ? 1 : 0.45,
          reason: `a ${activityFor(pet)}-energy companion`,
        },
        {
          key: 'homeType',
          score: homeScore(preferences.homeType, pet),
          reason: preferences.homeType === 'apartment' ? 'a good fit for apartment living' : 'suited to a house',
        },
        {
          key: 'availableSpace',
          score: spaceScore(preferences.availableSpace, pet),
          reason: `${normal(pet.size) || 'unknown'} size fits your available space`,
        },
        {
          key: 'children',
          score: preferences.children === 'no' ? 1 : compatibilityScore(pet.goodWithChildren),
          reason: 'has a positive child-compatibility record',
        },
        {
          key: 'existingPets',
          score: existingPetsScore(preferences.existingPets, pet),
          reason: 'has a positive compatibility record with your existing pets',
        },
        {
          key: 'size',
          score: preferences.size === 'any' || normal(pet.size) === preferences.size ? 1 : 0,
          reason: `${normal(pet.size) || 'unknown'} size matches your preference`,
        },
        {
          key: 'age',
          score: preferences.age === 'any' || ageCategory(pet) === preferences.age ? 1 : 0,
          reason: `${ageCategory(pet)} age matches your preference`,
        },
      ];

      const points = factors.reduce((total, factor) => total + WEIGHTS[factor.key] * factor.score, 0);
      const positiveReasons = factors
        .filter((factor) => factor.score >= 0.8 && factor.key !== 'children' && factor.key !== 'existingPets')
        .slice(0, 2)
        .map((factor) => factor.reason);
      if (preferences.children === 'yes' && compatibilityScore(pet.goodWithChildren) === 1) {
        positiveReasons.unshift('has a positive child-compatibility record');
      }
      if (preferences.existingPets !== 'none' && existingPetsScore(preferences.existingPets, pet) === 1) {
        positiveReasons.push('has a positive compatibility record with your existing pets');
      }

      return {
        pet,
        matchPercentage: Math.round(points),
        reason: positiveReasons.slice(0, 2).join(' and ') || 'This pet has some qualities that fit your preferences.',
      };
    })
    .sort((first, second) => second.matchPercentage - first.matchPercentage || String(first.pet.name).localeCompare(String(second.pet.name)))
    .slice(0, 3);
}
