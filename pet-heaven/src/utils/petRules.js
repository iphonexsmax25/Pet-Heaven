// Shared pet rules: status labels and the "you cannot adopt a pet you released" check.
export const ALREADY_ADOPTED_MESSAGE = 'This pet has already been adopted.';

// The only statuses a pet can have. Anything else becomes "available".
export const VALID_STATUSES = ['available', 'pending', 'adopted'];
export const normalizeStatus = (status) => {
  const value = String(status).trim().toLowerCase();
  return VALID_STATUSES.includes(value) ? value : 'available';
};

// Fixes missing, empty or invalid statuses. Valid "adopted" and "pending" pets are never changed.
// "changed" is true only when at least one record really changed, so callers save only when needed.
export function migratePetStatuses(pets) {
  let changed = false;
  const migratedPets = pets.map((pet) => {
    if (!pet || typeof pet !== 'object') return pet;
    const status = normalizeStatus(pet.status);
    if (pet.status === status) return pet;
    changed = true;
    return { ...pet, status };
  });
  return { pets: migratedPets, changed };
}

// Pet statuses are stored in lowercase: "available", "pending", "adopted"
export const statusLabel = (status = '') => {
  const text = String(status);
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const normalizeEmail = (email = '') => String(email || '').trim().toLowerCase();

// True when this user ID appears in the pet's releaseHistory (it is never cleared, even after
// approval or adoption). Used only to LIST a member's released pets (My Released Pets).
// It is never used to block adoption: a previous owner or adopter may adopt the pet again.
// Entries without a user id (very old data) fall back to the normalized email.
export const releasedByUser = (pet, user) => {
  if (!pet || !user) return false;
  const history = Array.isArray(pet.releaseHistory) ? pet.releaseHistory : [];
  const email = normalizeEmail(user.email);
  return history.some((entry) => {
    if (!entry) return false;
    if (entry.userId && user.id) return entry.userId === user.id;
    if (entry.userId) return false;
    return email !== '' && normalizeEmail(entry.email) === email;
  });
};

// Name kept so existing imports still work. It now reads releaseHistory.
export const wasReleasedByCurrentUser = releasedByUser;

// Release eligibility. A customer may release a pet only when
//   pet.adoptedByUserId === user.id  (source "adopted")  OR  pet.ownerUserId === user.id  (source "owned").
// Returns 'adopted', 'owned', or '' when the pet is not theirs to release.
// A pet that is adopted by someone else can never be released by its owner.
export const releaseSource = (pet, user) => {
  if (!pet || !user || !user.id) return '';
  if (pet.adoptedByUserId && pet.adoptedByUserId === user.id) return 'adopted';
  if (pet.status === 'adopted') return '';
  return pet.ownerUserId && pet.ownerUserId === user.id ? 'owned' : '';
};
export const sourceLabel = (source) => (source === 'adopted' ? 'Adopted' : source === 'owned' ? 'Owned' : '');
