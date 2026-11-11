import { readStorage, writeStorage } from './storage.js';

export const PERSONALITY_TEST_KEY = 'petheaven_personality_test';
export const MAX_TRAITS = 3;

// Each step has one or more questions. "multi" questions allow several answers (up to maxChoices).
export const STEPS = [
  {
    id: 'lifestyle',
    title: 'What is your lifestyle like?',
    help: 'Pick the one that sounds most like your normal week.',
    questions: [
      {
        name: 'lifestyle',
        label: 'Lifestyle',
        options: [
          ['active', 'Active', 'Gym, sports and busy weekends'],
          ['relaxed', 'Relaxed', 'Quiet evenings and slow weekends at home'],
          ['busy', 'Busy', 'Long work or study days, often out'],
          ['outdoor', 'Outdoor', 'Parks, trails and time outside'],
        ],
      },
    ],
  },
  {
    id: 'home',
    title: 'Tell us about your home',
    help: 'This helps us leave out animals that would not be comfortable in your space.',
    questions: [
      {
        name: 'homeType',
        label: 'Home type',
        options: [
          ['apartment', 'Apartment / condo', 'HDB flat, condo or similar'],
          ['house', 'House', 'Landed home or a house with a garden'],
        ],
      },
      {
        name: 'space',
        label: 'Available space for a pet',
        options: [
          ['small', 'Compact', 'Limited floor space'],
          ['medium', 'Moderate', 'Room to move around'],
          ['large', 'Generous', 'Plenty of indoor or outdoor room'],
        ],
      },
    ],
  },
  {
    id: 'energy',
    title: 'What pet energy level do you prefer?',
    help: 'Think about how much play and exercise you want in a day.',
    questions: [
      {
        name: 'energy',
        label: 'Preferred pet energy level',
        options: [
          ['low', 'Low', 'Calm, happy to relax'],
          ['moderate', 'Moderate', 'A mix of play and rest'],
          ['high', 'High', 'Lively and always up for fun'],
        ],
      },
    ],
  },
  {
    id: 'alone',
    title: 'How long will the pet be alone each day?',
    help: 'Be honest: some animals cope with time alone much better than others.',
    questions: [
      {
        name: 'alone',
        label: 'Hours alone per day',
        options: [
          ['short', 'Under 4 hours', 'Someone is usually home'],
          ['medium', '4 to 8 hours', 'A typical work day'],
          ['long', 'More than 8 hours', 'Long days away from home'],
        ],
      },
    ],
  },
  {
    id: 'grooming',
    title: 'How much grooming can you commit to?',
    help: 'Longer coats need brushing and professional grooming.',
    questions: [
      {
        name: 'grooming',
        label: 'Grooming commitment',
        options: [
          ['low', 'Minimal', 'Occasional brushing only'],
          ['medium', 'Regular', 'Brushing a few times a week'],
          ['high', 'Dedicated', 'Daily brushing and grooming visits'],
        ],
      },
    ],
  },
  {
    id: 'experience',
    title: 'What is your pet-care experience?',
    help: 'Some animals need a confident, experienced owner.',
    questions: [
      {
        name: 'experience',
        label: 'Pet-care experience',
        options: [
          ['first', 'First-time owner', 'New to caring for a pet'],
          ['some', 'Some experience', 'Have looked after a pet before'],
          ['experienced', 'Experienced', 'Comfortable with training and health care'],
        ],
      },
    ],
  },
  {
    id: 'household',
    title: 'Who else lives in your home?',
    help: 'We only suggest animals whose profile does not rule out your household.',
    questions: [
      {
        name: 'children',
        label: 'Children in the household',
        options: [
          ['yes', 'Yes', 'Children live in or often visit my home'],
          ['no', 'No', 'No children'],
        ],
      },
      {
        name: 'existingPets',
        label: 'Existing pets',
        options: [
          ['none', 'No other pets', ''],
          ['cat', 'Cat(s)', ''],
          ['dog', 'Dog(s)', ''],
          ['both', 'Cats and dogs', ''],
        ],
      },
    ],
  },
  {
    id: 'traits',
    title: 'Which personality traits do you love?',
    help: `Choose up to ${MAX_TRAITS}.`,
    questions: [
      {
        name: 'traits',
        label: 'Preferred personality traits',
        multi: true,
        maxChoices: MAX_TRAITS,
        options: [
          ['playful', 'Playful', ''],
          ['calm', 'Calm and gentle', ''],
          ['affectionate', 'Affectionate', ''],
          ['independent', 'Independent', ''],
          ['social', 'Friendly and social', ''],
          ['clever', 'Clever and curious', ''],
          ['quiet', 'Quiet', ''],
        ],
      },
    ],
  },
];

const QUESTIONS = STEPS.flatMap((step) => step.questions);
const optionIds = (question) => question.options.map((option) => option[0]);

export const EMPTY_ANSWERS = QUESTIONS.reduce((answers, question) => ({
  ...answers,
  [question.name]: question.multi ? [] : '',
}), {});

export const emptyTest = () => ({ answers: { ...EMPTY_ANSWERS, traits: [] }, step: 0, completed: false, results: [] });

export const isQuestionAnswered = (question, answers) => (
  question.multi ? Array.isArray(answers[question.name]) && answers[question.name].length > 0 : Boolean(answers[question.name])
);
export const isStepComplete = (step, answers) => step.questions.every((question) => isQuestionAnswered(question, answers));
export const isTestComplete = (answers) => STEPS.every((step) => isStepComplete(step, answers));

// Reads the saved test and throws away anything that is not a valid option
export function loadPersonalityTest() {
  const saved = readStorage(PERSONALITY_TEST_KEY, null);
  const fresh = emptyTest();
  if (!saved || typeof saved !== 'object' || Array.isArray(saved) || !saved.answers || typeof saved.answers !== 'object') return fresh;
  const answers = QUESTIONS.reduce((clean, question) => {
    const ids = optionIds(question);
    const value = saved.answers[question.name];
    if (question.multi) {
      return { ...clean, [question.name]: Array.isArray(value) ? [...new Set(value)].filter((id) => ids.includes(id)).slice(0, question.maxChoices) : [] };
    }
    return { ...clean, [question.name]: typeof value === 'string' && ids.includes(value) ? value : '' };
  }, {});
  const completed = saved.completed === true && isTestComplete(answers);
  const step = Number.isInteger(saved.step) ? Math.min(Math.max(saved.step, 0), STEPS.length - 1) : 0;
  return { answers, step, completed, results: Array.isArray(saved.results) ? saved.results : [] };
}

export const savePersonalityTest = (state) => writeStorage(PERSONALITY_TEST_KEY, state);

// ---------- Reading each animal's profile ----------
const normal = (value) => String(value || '').trim().toLowerCase();
const textOf = (pet) => [
  ...(Array.isArray(pet.personality) ? pet.personality : []),
  ...(Array.isArray(pet.care) ? pet.care : []),
  pet.shortDescription,
  pet.fullDescription,
].join(' ').toLowerCase();
const traitText = (pet) => [...(Array.isArray(pet.personality) ? pet.personality : []), pet.shortDescription].join(' ').toLowerCase();
const speciesOf = (pet) => normal(pet.species || pet.type);
const sizeOf = (pet) => normal(pet.size);
const ageOf = (pet) => normal(pet.ageCategory);
const LEVELS = ['low', 'moderate', 'high'];
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const HIGH_ENERGY_BREEDS = /husky|shepherd|border collie|bengal|golden retriever/;

function energyOf(pet) {
  const age = ageOf(pet);
  if (age === 'senior') return 'low';
  if (age === 'baby') return 'high';
  if (HIGH_ENERGY_BREEDS.test(normal(pet.breed))) return 'high';
  const text = textOf(pet);
  const low = (text.match(/calm|gentle|quiet|cuddl|lap|short walks?|relaxed|low.energy|sofa|laid-back|easygoing|serene|docile/g) || []).length;
  const high = (text.match(/energetic|active|long walks?|long daily|exercise|playful|high.energy|runs|athletic|adventurous|bouncy/g) || []).length;
  if (high > low + 1) return 'high';
  if (low > high) return 'low';
  return 'moderate';
}

function groomingOf(pet) {
  const care = (Array.isArray(pet.care) ? pet.care : []).join(' ').toLowerCase();
  if (/daily brushing|brush\w* daily|professional grooming|grooming every|grooming appointments/.test(care)) return 'high';
  if (/brush\w*.*(2 to 3 times|several times|weekly)|weekly brush|regular grooming|thick coat/.test(care)) return 'medium';
  return 'low';
}

function independenceOf(pet) {
  let value = speciesOf(pet) === 'cat' ? 0.7 : 0.3;
  if (/independent|quiet|calm|laid-back|routine|dignified/.test(traitText(pet))) value += 0.2;
  if (ageOf(pet) === 'baby') value -= 0.3;
  if (speciesOf(pet) === 'dog' && energyOf(pet) === 'high') value -= 0.1;
  return clamp(value);
}

function experienceNeeded(pet) {
  const breed = normal(pet.breed);
  if (/husky|shepherd|border collie|shiba|rottweiler|bengal/.test(breed)) return 2;
  if (ageOf(pet) === 'baby') return 1;
  if (speciesOf(pet) === 'dog' && sizeOf(pet) === 'large') return 1;
  return 0;
}

const TRAIT_WORDS = {
  playful: /playful|bouncy|cheeky|adventurous|energetic|athletic/,
  calm: /calm|gentle|laid-back|easygoing|docile|serene|patient|well-mannered|relaxed/,
  affectionate: /affectionate|cuddl|loving|lap|warm|sweet|devoted|loyal/,
  independent: /independent|confident|dignified|routine/,
  social: /friendly|sociable|social|chatty|cheerful|good with|talkative|chirpy/,
  clever: /clever|intelligent|smart|quick learner|eager|curious/,
  quiet: /quiet|shy|serene|calm indoors/,
};
const traitsOf = (pet) => Object.keys(TRAIT_WORDS).filter((id) => TRAIT_WORDS[id].test(traitText(pet)));
const TRAIT_LABELS = { playful: 'playful', calm: 'calm', affectionate: 'affectionate', independent: 'independent', social: 'friendly', clever: 'clever', quiet: 'quiet' };

// ---------- Hard exclusions ----------
// Returns true when the animal's profile rules it out for the adopter's home, space, children or pets.
export function isExcluded(pet, answers) {
  if (normal(pet.status) !== 'available') return true;
  const isDog = speciesOf(pet) === 'dog';
  const size = sizeOf(pet);
  if (answers.homeType === 'apartment' && isDog && size === 'large') return true;
  if (answers.space === 'small' && size === 'large') return true;
  if (answers.space === 'medium' && isDog && size === 'large') return true;
  if (answers.children === 'yes' && normal(pet.goodWithChildren) === 'no') return true;
  const hasCats = answers.existingPets === 'cat' || answers.existingPets === 'both';
  const hasDogs = answers.existingPets === 'dog' || answers.existingPets === 'both';
  if (hasCats && normal(pet.goodWithCats) === 'no') return true;
  if (hasDogs && normal(pet.goodWithDogs) === 'no') return true;
  return false;
}

// ---------- Scoring (0 to 1 per factor, weights add up to 100) ----------
const WEIGHTS = { energy: 16, lifestyle: 14, alone: 14, grooming: 10, experience: 12, traits: 18, household: 10, space: 6 };

const levelGap = (first, second) => Math.abs(LEVELS.indexOf(first) - LEVELS.indexOf(second));
const certainty = (value) => (normal(value) === 'yes' ? 1 : 0.4); // "Unknown" is allowed but scores lower

function lifestyleScore(answers, pet, energy, independence) {
  const isDog = speciesOf(pet) === 'dog';
  switch (answers.lifestyle) {
    case 'active': return { high: 1, moderate: 0.7, low: 0.25 }[energy];
    case 'relaxed': return { low: 1, moderate: 0.65, high: 0.2 }[energy];
    case 'outdoor': return isDog ? { high: 1, moderate: 0.9, low: 0.5 }[energy] : { high: 0.6, moderate: 0.45, low: 0.3 }[energy];
    default: return clamp(0.6 * independence + 0.4 * (energy === 'low' ? 1 : energy === 'moderate' ? 0.6 : 0.2)); // busy
  }
}

function aloneScore(answers, independence) {
  if (answers.alone === 'short') return 1;
  if (answers.alone === 'medium') return 0.4 + 0.6 * independence;
  return clamp((independence - 0.2) / 0.6);
}

function spaceScore(answers, pet) {
  const fit = {
    small: { small: 1, medium: 0.6, large: 0 },
    medium: { small: 0.85, medium: 1, large: 0.6 },
    large: { small: 0.75, medium: 0.9, large: 1 },
  };
  return fit[answers.space]?.[sizeOf(pet)] ?? 0.5;
}

const shortfallScore = (have, need) => (have >= need ? 1 : have === need - 1 ? 0.5 : 0.1);

export function getPersonalityMatches(pets, answers) {
  const groomingLevels = ['low', 'medium', 'high'];
  const experienceLevels = ['first', 'some', 'experienced'];

  return pets
    .filter((pet) => pet && !isExcluded(pet, answers))
    .map((pet) => {
      const energy = energyOf(pet);
      const independence = independenceOf(pet);
      const groomNeed = groomingOf(pet);
      const petTraits = traitsOf(pet);
      const wanted = answers.traits || [];
      const matchedTraits = wanted.filter((id) => petTraits.includes(id));
      const hasCats = answers.existingPets === 'cat' || answers.existingPets === 'both';
      const hasDogs = answers.existingPets === 'dog' || answers.existingPets === 'both';
      const household = [
        answers.children === 'yes' ? certainty(pet.goodWithChildren) : 1,
        hasCats ? certainty(pet.goodWithCats) : 1,
        hasDogs ? certainty(pet.goodWithDogs) : 1,
      ];

      const scores = {
        energy: [1, 0.55, 0.1][levelGap(answers.energy, energy)],
        lifestyle: lifestyleScore(answers, pet, energy, independence),
        alone: aloneScore(answers, independence),
        grooming: groomingLevels.indexOf(answers.grooming) >= groomingLevels.indexOf(groomNeed)
          ? (answers.grooming === 'high' && groomNeed === 'low' ? 0.85 : 1)
          : shortfallScore(groomingLevels.indexOf(answers.grooming), groomingLevels.indexOf(groomNeed)),
        experience: shortfallScore(experienceLevels.indexOf(answers.experience), experienceNeeded(pet)),
        traits: wanted.length ? matchedTraits.length / wanted.length : 0,
        household: household.reduce((sum, value) => sum + value, 0) / household.length,
        space: spaceScore(answers, pet),
      };

      const total = Object.keys(WEIGHTS).reduce((sum, key) => sum + WEIGHTS[key] * clamp(scores[key]), 0);

      const phrases = [];
      if (matchedTraits.length) phrases.push(`has the ${matchedTraits.slice(0, 2).map((id) => TRAIT_LABELS[id]).join(' and ')} personality you wanted`);
      if (scores.energy >= 0.99) phrases.push(`has the ${energy} energy level you prefer`);
      if (answers.alone !== 'short' && scores.alone >= 0.75) phrases.push('copes well with time on its own');
      if (scores.grooming >= 0.99 && groomNeed === 'low' && answers.grooming === 'low') phrases.push('needs very little grooming');
      if (scores.space >= 0.99 && sizeOf(pet)) phrases.push(`is a ${sizeOf(pet)} size that suits your space`);
      if (answers.children === 'yes' && normal(pet.goodWithChildren) === 'yes') phrases.push('is known to be good with children');
      if (answers.existingPets !== 'none' && household.slice(1).every((value) => value === 1)) phrases.push('gets along with your existing pets');
      if (!phrases.length && scores.lifestyle >= 0.7) phrases.push(`suits your ${answers.lifestyle} lifestyle`);
      const picked = phrases.slice(0, 3);
      const reason = picked.length
        ? `${pet.name} ${picked.length > 1 ? `${picked.slice(0, -1).join(', ')} and ${picked[picked.length - 1]}` : picked[0]}.`
        : `${pet.name} shares some qualities with the home and lifestyle you described.`;

      return { pet, matchPercentage: Math.round(clamp(total / 100) * 100), reason };
    })
    .sort((first, second) => second.matchPercentage - first.matchPercentage || String(first.pet.name).localeCompare(String(second.pet.name)))
    .slice(0, 3);
}
