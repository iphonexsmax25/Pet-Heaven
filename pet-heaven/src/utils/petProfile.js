// Helpers for the animal details page: highlights, compatibility rows, vaccination summary and gallery photos.
// Missing information is shown as "Not recorded yet" / "Not tested yet" instead of guessing.

export const toYesNoUnknown = (value) => {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  const text = String(value === undefined || value === null ? '' : value).trim().toLowerCase();
  if (text === 'yes' || text === 'true') return 'Yes';
  if (text === 'no' || text === 'false') return 'No';
  return 'Unknown';
};

// "Neutered" for males, "Spayed" for females
export const neuterWord = (gender) => (gender === 'Female' ? 'Spayed' : gender === 'Male' ? 'Neutered' : 'Neutered or spayed');

// One row for a yes / no / unknown fact. "state" drives the symbol: ✓ yes, ✗ no, ? unknown, … in progress.
// The words are always shown too, so meaning never depends on colour alone.
const row = (label, value, yesText, noText, unknownText) => {
  const answer = toYesNoUnknown(value);
  const state = answer === 'Yes' ? 'yes' : answer === 'No' ? 'no' : 'unknown';
  return { label, state, text: answer === 'Yes' ? yesText : answer === 'No' ? noText : unknownText };
};

export function getVaccinationState(pet) {
  const text = String(pet.vaccinated || '').toLowerCase();
  if (text.startsWith('fully')) return 'yes';
  if (text.includes('first') || text.includes('progress') || text.includes('partial')) return 'partial';
  return 'unknown';
}

// Quick checklist shown at the top of the details page, for example:
// ✓ Vaccinated  ✓ Neutered  ✓ Friendly with children  ✓ House trained
export function getHighlights(pet) {
  const word = neuterWord(pet.gender);
  const vacc = getVaccinationState(pet);
  const neutered = row(word, pet.neutered, word, `Not yet ${word.toLowerCase()}`, `${word}: not recorded yet`);
  const kids = row('Children', pet.goodWithChildren, 'Friendly with children', 'Not suited to young children', 'Children: not tested yet');
  const house = row('House trained', pet.houseTrained, 'House trained', 'Still learning house training', 'House training: not recorded yet');
  return [
    {
      label: 'Vaccinated',
      state: vacc,
      text: vacc === 'yes' ? 'Vaccinated' : vacc === 'partial' ? 'Vaccinations in progress' : 'Vaccination: not recorded yet',
    },
    neutered,
    kids,
    house,
  ];
}

// Compatibility table: children, cats, dogs
export function getCompatibility(pet) {
  return [
    row('Children', pet.goodWithChildren, 'Friendly with children', 'Not suited to young children', 'Not tested with children yet'),
    row('Cats', pet.goodWithCats, 'Gets along with cats', 'Should live without cats', 'Not tested with cats yet'),
    row('Dogs', pet.goodWithDogs, 'Gets along with dogs', 'Should live without other dogs', 'Not tested with dogs yet'),
    row('House training', pet.houseTrained, 'House trained', 'Still learning house training', 'Not recorded yet'),
  ];
}

export const stateSymbol = (state) => (state === 'yes' ? '✓' : state === 'no' ? '✗' : state === 'partial' ? '…' : '?');
export const stateWord = (state) => (state === 'yes' ? 'Yes' : state === 'no' ? 'No' : state === 'partial' ? 'In progress' : 'Not known');

// Photos for the gallery. A gallery item can be a text path or { src, zoom, origin }.
// A pet with an uploaded photo (imageId) always shows that photo first.
export function getGalleryItems(pet) {
  const items = [];
  if (pet.imageId) items.push({ imageId: pet.imageId });
  (Array.isArray(pet.gallery) ? pet.gallery : []).forEach((entry) => {
    if (!entry) return;
    if (typeof entry === 'string') items.push({ src: entry });
    else if (entry.src || entry.imageId) items.push({ src: entry.src, imageId: entry.imageId, zoom: entry.zoom, origin: entry.origin });
  });
  if (items.length === 0) items.push({ src: pet.image || '' });
  return items;
}
