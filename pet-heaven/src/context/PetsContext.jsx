import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { pets as seedPets } from '../data/pets';
import { readStorage, writeStorage } from '../utils/storage';
import { normalizeEmail, normalizeStatus, migratePetStatuses, releaseSource } from '../utils/petRules';
import { toYesNoUnknown } from '../utils/petProfile';
import { saveImage } from '../utils/imageDb';

export const PETS_KEY = 'petheaven_pets';
export const RELEASE_REQUESTS_KEY = 'petheaven_release_requests';
const PetsContext = createContext(null);

// Pets are never deleted. Each pet record keeps its own history:
//   releaseHistory:  [{ id, requestId, type, sourceType, userId, email, status, requestedAt, approvedAt, approvedBy }]
//   adoptionHistory: [{ id, applicationId, userId, email, adoptedAt, returnedAt? }]
// Images are not stored here: a pet only keeps imageId (the image itself is in IndexedDB).
//
// Release requests are separate records in their own localStorage key (RELEASE_REQUESTS_KEY):
//   { id, petId, petName, requestedByUserId, requestedByEmail, sourceType: 'owned' | 'adopted',
//     reason, details, submittedAt, status: 'pending' | 'approved' | 'rejected',
//     reviewedAt, reviewedBy, decidedAt, decidedBy, decisionNote }
const asList = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);

// Animal profile fields (details page). Pets saved before these fields existed get them from the built-in
// pet with the same id (see loadPets); new pets without them show "not recorded yet" on the details page.
const PROFILE_KEYS = [
  'gallery', 'medicalStatus', 'vaccinationRecords', 'neutered', 'houseTrained',
  'goodWithChildren', 'goodWithCats', 'goodWithDogs', 'rescueStory', 'adoptionRequirements',
];
const seedProfiles = new Map(seedPets.map((pet) => [String(pet.id), pet]));
const withSeedProfile = (pet) => {
  const seed = seedProfiles.get(String(pet.id));
  if (!seed) return pet;
  const filled = { ...pet };
  PROFILE_KEYS.forEach((key) => {
    if (filled[key] === undefined && seed[key] !== undefined) filled[key] = seed[key];
  });
  return filled;
};

const asRecords = (value) => (Array.isArray(value)
  ? value.filter((item) => item && typeof item === 'object' && item.name).map((item) => ({
    name: String(item.name), date: String(item.date || ''), nextDue: String(item.nextDue || ''),
  }))
  : []);

// Fill any missing fields so every pet works with PetCard and PetDetails.
// Built-in pets use "type"; the shared list uses "species".
function normalizePet(pet, fallbackCreatedAt) {
  const { ownerEmail, releaseStatus, ...rest } = pet; // releaseStatus: old field, no longer used
  const releasedByEmail = normalizeEmail(pet.releasedByEmail || ownerEmail || '');
  const releasedByUserId = pet.releasedByUserId || '';
  const createdAt = pet.createdAt || fallbackCreatedAt;
  const releasedAt = pet.releasedAt || (releasedByUserId || releasedByEmail ? createdAt : '');
  const status = normalizeStatus(pet.status);

  let releaseHistory = asList(pet.releaseHistory);
  if (releaseHistory.length === 0 && (releasedByUserId || releasedByEmail)) {
    releaseHistory = [{
      id: `rel-${pet.id}`, userId: releasedByUserId, email: releasedByEmail,
      status: 'Approved', requestedAt: releasedAt, approvedAt: releasedAt, approvedBy: '',
    }];
  }
  const adoptionHistory = asList(pet.adoptionHistory);
  const lastAdoption = adoptionHistory[adoptionHistory.length - 1];

  return {
    ...rest,
    species: pet.species || pet.type || 'Other',
    colour: pet.colour || 'Not specified',
    vaccinated: pet.vaccinated || 'Not specified',
    status,
    image: pet.image || '',
    imageId: pet.imageId || '',
    releasedByUserId,
    releasedByEmail,
    releasedAt,
    // The customer who added the pet. Pets saved before this field existed belong to whoever added them.
    ownerUserId: pet.ownerUserId !== undefined ? pet.ownerUserId : releasedByUserId,
    releaseHistory,
    adoptionHistory,
    adoptedAt: pet.adoptedAt || '',
    // Adoptions saved before adoptedByUserId existed: take the adopter from adoptionHistory
    adoptedByUserId: pet.adoptedByUserId || (status === 'adopted' && lastAdoption ? lastAdoption.userId || '' : ''),
    shortDescription: pet.shortDescription || pet.fullDescription || '',
    fullDescription: pet.fullDescription || pet.shortDescription || '',
    personality: Array.isArray(pet.personality) ? pet.personality : [],
    care: Array.isArray(pet.care) ? pet.care : [],
    // Animal profile
    gallery: asList(pet.gallery),
    medicalStatus: pet.medicalStatus || '',
    vaccinationRecords: asRecords(pet.vaccinationRecords),
    neutered: toYesNoUnknown(pet.neutered),
    houseTrained: toYesNoUnknown(pet.houseTrained),
    goodWithChildren: toYesNoUnknown(pet.goodWithChildren),
    goodWithCats: toYesNoUnknown(pet.goodWithCats),
    goodWithDogs: toYesNoUnknown(pet.goodWithDogs),
    rescueStory: pet.rescueStory || '',
    adoptionRequirements: asList(pet.adoptionRequirements),
    createdAt,
  };
}

// Built-in pets get older dates the higher their id, so new pets always sort first
const seedList = seedPets.map((pet) =>
  normalizePet(pet, new Date(Date.UTC(2026, 0, 1) - Number(pet.id) * 86400000).toISOString())
);

// Saved pets + built-in pets, merged by id so nothing is duplicated after reload
function loadPets() {
  const stored = readStorage(PETS_KEY, []);
  const byId = new Map();
  seedList.forEach((pet) => byId.set(String(pet.id), pet));
  if (Array.isArray(stored)) {
    stored.forEach((pet) => {
      if (pet && pet.id !== undefined && pet.name && (pet.image !== undefined || pet.imageId)) {
        byId.set(String(pet.id), normalizePet(withSeedProfile(pet), new Date(0).toISOString()));
      }
    });
  }
  return [...byId.values()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function loadRequests() {
  const stored = readStorage(RELEASE_REQUESTS_KEY, []);
  return Array.isArray(stored) ? stored.filter((item) => item && item.id && item.petId !== undefined) : [];
}

// Fix missing, empty or invalid statuses in the saved fleet. Saves only when a record really changed,
// so opening the app does not rewrite storage or cause extra renders.
function migrateStoredStatuses() {
  const stored = readStorage(PETS_KEY, null);
  if (!Array.isArray(stored)) return;
  const { pets: migrated, changed } = migratePetStatuses(stored);
  if (changed) writeStorage(PETS_KEY, migrated);
}

// Older versions saved uploaded photos as base64 text inside localStorage.
// Move them to IndexedDB once and keep only the image ID in the pet record.
async function moveLegacyImages() {
  const current = loadPets();
  const legacy = current.filter((pet) => typeof pet.image === 'string' && pet.image.startsWith('data:'));
  if (legacy.length === 0) return null;
  const converted = new Map();
  for (const pet of legacy) {
    try {
      const blob = await (await fetch(pet.image)).blob();
      converted.set(String(pet.id), await saveImage(blob));
    } catch (error) {
      /* leave this pet as it is; it keeps working with its old image */
    }
  }
  if (converted.size === 0) return null;
  // Re-read so changes made while the images were moving are not lost
  const next = loadPets().map((pet) => {
    const imageId = converted.get(String(pet.id));
    return imageId && String(pet.image).startsWith('data:') ? { ...pet, image: '', imageId } : pet;
  });
  return writeStorage(PETS_KEY, next) ? next : null;
}

const samePet = (a, b) => String(a) === String(b);
const newId = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function PetsProvider({ children }) {
  const [pets, setPets] = useState(() => {
    migrateStoredStatuses();
    return loadPets();
  });
  const [releaseRequests, setReleaseRequests] = useState(loadRequests);

  useEffect(() => {
    let active = true;
    moveLegacyImages().then((next) => { if (active && next) setPets(next); }).catch(() => {});
    return () => { active = false; };
  }, []);

  // Saves first; only updates the shared list if storage worked, so the two never disagree
  const addPet = useCallback((pet) => {
    const newPet = normalizePet(
      // Every new pet starts as "available"; the status can never be chosen when a pet is created
      { ...pet, id: newId('pet'), status: 'available' },
      new Date().toISOString()
    );
    const current = loadPets();
    if (current.some((item) => samePet(item.id, newPet.id))) return { ok: false, error: 'Please try again.' };
    const next = [newPet, ...current];
    if (!writeStorage(PETS_KEY, next)) {
      return { ok: false, error: 'Could not save this pet. Browser storage may be full or blocked.' };
    }
    setPets(next);
    return { ok: true, pet: newPet };
  }, []);

  const saveList = (next, id) => {
    if (!writeStorage(PETS_KEY, next)) return { ok: false, error: 'Could not save the change. Browser storage may be full or blocked.' };
    setPets(next);
    return { ok: true, pet: next.find((pet) => samePet(pet.id, id)) };
  };

  // Employees: change a pet's status between available and pending (and other details).
  // Adopting goes through completeAdoption; an adopted pet becomes available only through an approved release request.
  const updatePet = useCallback((id, patch) => {
    const found = loadPets().find((pet) => samePet(pet.id, id));
    if (!found) return { ok: false, error: 'Pet not found.' };
    if (patch.status !== undefined && found.status === 'adopted' && String(patch.status).toLowerCase() !== 'adopted') {
      return { ok: false, error: 'An adopted pet becomes available only when its release request is approved.' };
    }
    const next = loadPets().map((pet) => {
      if (!samePet(pet.id, id)) return pet;
      const merged = { ...pet, ...patch };
      if (patch.status !== undefined) {
        merged.adoptedAt = String(merged.status).toLowerCase() === 'adopted'
          ? (patch.adoptedAt || pet.adoptedAt || new Date().toISOString())
          : '';
      }
      return normalizePet(merged, pet.createdAt);
    });
    return saveList(next, id);
  }, []);

  // Employee completes an adoption: only now does the pet become "adopted".
  // The same record is updated with map() (never removed); releaseHistory and adoptionHistory are kept.
  const completeAdoption = useCallback((id, application) => {
    const found = loadPets().find((pet) => samePet(pet.id, id));
    if (!found) return { ok: false, error: 'Pet not found.' };
    if (found.status === 'adopted') return { ok: false, error: `${found.name} is already adopted.` };
    const now = new Date().toISOString();
    const next = loadPets().map((pet) => (!samePet(pet.id, id) ? pet : normalizePet({
      ...pet,
      status: 'adopted',
      adoptedByUserId: application.applicantUserId || '',
      adoptedAt: now,
      ownerUserId: '', // whoever owned the pet before no longer owns it once someone adopts it
      adoptionHistory: [...pet.adoptionHistory, {
        id: `adopt-${Date.now().toString(36)}`, applicationId: application.id,
        userId: application.applicantUserId || '', email: normalizeEmail(application.email), adoptedAt: now,
      }],
    }, pet.createdAt)));
    return saveList(next, id);
  }, []);

  const reopenCompletedAdoption = useCallback((id, application) => {
    const found = loadPets().find((pet) => samePet(pet.id, id));
    if (!found || found.status !== 'adopted') {
      return { ok: false, error: 'This pet is no longer marked as adopted.' };
    }
    const historyIndex = found.adoptionHistory.findIndex((entry) => entry.applicationId === application.id && !entry.cancelledAt);
    if (historyIndex < 0 || historyIndex !== found.adoptionHistory.length - 1) {
      return { ok: false, error: 'This adoption cannot be moved back because a later adoption is recorded.' };
    }
    const now = new Date().toISOString();
    const next = loadPets().map((pet) => (!samePet(pet.id, id) ? pet : normalizePet({
      ...pet,
      status: 'pending',
      adoptedByUserId: '',
      adoptedAt: '',
      ownerUserId: application.previousOwnerUserId || '',
      adoptionHistory: pet.adoptionHistory.map((entry) => (
        entry.applicationId === application.id ? { ...entry, cancelledAt: now } : entry
      )),
    }, pet.createdAt)));
    return saveList(next, id);
  }, []);

  // ---------- Release requests ----------

  const saveRequests = (next) => {
    if (!writeStorage(RELEASE_REQUESTS_KEY, next)) {
      return { ok: false, error: 'Could not save the change. Browser storage may be full or blocked.' };
    }
    setReleaseRequests(next);
    return { ok: true };
  };

  // A customer asks to release a pet. This only creates a pending request: the pet is NOT changed
  // (an adopted pet stays "adopted"; an owned pet keeps its current status).
  const submitReleaseRequest = useCallback(({ petId, user, reason, details }) => {
    if (!user || !user.id) return { ok: false, error: 'Please log in to request a release.' };
    const pet = loadPets().find((item) => samePet(item.id, petId));
    if (!pet) return { ok: false, error: 'Pet not found.' };
    // Checked on the saved pet record, so a customer can never release another customer's pet
    const sourceType = releaseSource(pet, user);
    if (!sourceType) return { ok: false, error: 'You can only release a pet that you added or adopted yourself.' };
    const current = loadRequests();
    if (current.some((item) => samePet(item.petId, pet.id) && item.status === 'pending')) {
      return { ok: false, error: `There is already a pending release request for ${pet.name}.` };
    }
    const request = {
      id: newId('req'),
      petId: pet.id,
      petName: pet.name,
      requestedByUserId: user.id,
      requestedByEmail: normalizeEmail(user.email),
      sourceType,
      reason,
      details,
      submittedAt: new Date().toISOString(),
      status: 'pending',
      reviewedAt: '', reviewedBy: '', decidedAt: '', decidedBy: '', decisionNote: '',
    };
    const saved = saveRequests([request, ...current]);
    return saved.ok ? { ok: true, request } : saved;
  }, []);

  // Employee opens a pending request to review it. Approving or rejecting needs this first.
  const markReleaseRequestReviewed = useCallback((requestId, employee) => {
    const current = loadRequests();
    const request = current.find((item) => item.id === requestId);
    if (!request || request.status !== 'pending') return { ok: false, error: 'This request is no longer pending.' };
    if (request.reviewedAt) return { ok: true, request };
    const updated = { ...request, reviewedAt: new Date().toISOString(), reviewedBy: employee ? employee.email : '' };
    const saved = saveRequests(current.map((item) => (item.id === requestId ? updated : item)));
    return saved.ok ? { ok: true, request: updated } : saved;
  }, []);

  // Employee approves a PENDING, reviewed request. The same pet record and ID become "available" again
  // (anyone may adopt it, including the customer who released it). adoptionHistory and releaseHistory are kept.
  const approveRelease = useCallback((requestId, employee) => {
    const requests = loadRequests();
    const request = requests.find((item) => item.id === requestId);
    if (!request || request.status !== 'pending') return { ok: false, error: 'There is no pending release request to approve.' };
    if (!request.reviewedAt) return { ok: false, error: 'Open and review the request before approving it.' };
    const allPets = loadPets();
    const found = allPets.find((pet) => samePet(pet.id, request.petId));
    if (!found) return { ok: false, error: 'Pet not found.' };
    if (releaseSource(found, { id: request.requestedByUserId }) !== request.sourceType) {
      return { ok: false, error: 'This pet no longer matches the request, so it cannot be released.' };
    }
    const now = new Date().toISOString();
    const nextPets = allPets.map((pet) => {
      if (!samePet(pet.id, request.petId)) return pet;
      const entry = {
        id: `rel-${request.id}`, requestId: request.id, type: 'release', sourceType: request.sourceType,
        userId: request.requestedByUserId, email: request.requestedByEmail,
        status: 'Approved', requestedAt: request.submittedAt, approvedAt: now, approvedBy: employee ? employee.email : '',
      };
      // Clear who currently owns / has adopted the pet. Both histories are kept.
      const ownership = {
        ownerUserId: '',
        adoptedAt: '',
        adoptedByUserId: '',
        adoptionHistory: request.sourceType === 'adopted'
          ? pet.adoptionHistory.map((item, index) =>
            (index === pet.adoptionHistory.length - 1 && !item.returnedAt ? { ...item, returnedAt: now } : item))
          : pet.adoptionHistory,
      };
      return normalizePet({
        ...pet,
        ...ownership,
        status: 'available',
        releasedAt: now,
        releasedByUserId: request.requestedByUserId,
        releasedByEmail: request.requestedByEmail,
        releaseHistory: [...pet.releaseHistory, entry],
      }, pet.createdAt);
    });
    if (!writeStorage(PETS_KEY, nextPets)) return { ok: false, error: 'Could not save the change. Browser storage may be full or blocked.' };
    const nextRequests = requests.map((item) => (item.id === requestId
      ? { ...item, status: 'approved', decidedAt: now, decidedBy: employee ? employee.email : '' } : item));
    const saved = saveRequests(nextRequests);
    if (!saved.ok) {
      writeStorage(PETS_KEY, allPets); // keep the pet and the request in agreement
      return saved;
    }
    setPets(nextPets);
    return { ok: true, request: nextRequests.find((item) => item.id === requestId) };
  }, []);

  // Employee rejects a pending, reviewed request. The pet keeps its status and stays with its owner or adopter.
  const rejectRelease = useCallback((requestId, employee, note = '') => {
    const requests = loadRequests();
    const request = requests.find((item) => item.id === requestId);
    if (!request || request.status !== 'pending') return { ok: false, error: 'There is no pending release request to reject.' };
    if (!request.reviewedAt) return { ok: false, error: 'Open and review the request before rejecting it.' };
    const updated = { ...request, status: 'rejected', decidedAt: new Date().toISOString(), decidedBy: employee ? employee.email : '', decisionNote: String(note).trim() };
    const saved = saveRequests(requests.map((item) => (item.id === requestId ? updated : item)));
    return saved.ok ? { ok: true, request: updated } : saved;
  }, []);

  const getPet = useCallback((id) => pets.find((pet) => samePet(pet.id, id)), [pets]);
  const value = useMemo(
    () => ({
      pets, releaseRequests, addPet, updatePet, completeAdoption, reopenCompletedAdoption, getPet,
      submitReleaseRequest, markReleaseRequestReviewed, approveRelease, rejectRelease,
    }),
    [pets, releaseRequests, addPet, updatePet, completeAdoption, reopenCompletedAdoption, getPet,
      submitReleaseRequest, markReleaseRequestReviewed, approveRelease, rejectRelease]
  );
  return <PetsContext.Provider value={value}>{children}</PetsContext.Provider>;
}

export function usePets() {
  const context = useContext(PetsContext);
  if (!context) throw new Error('usePets must be used inside PetsProvider');
  return context;
}
