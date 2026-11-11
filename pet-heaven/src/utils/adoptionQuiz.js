// Adoption Readiness Quiz: questions, scoring and matching. Guidance only: nothing here approves or rejects
// an adoption application. Progress and the last result are kept in this browser's localStorage only.
import { readStorage, writeStorage } from './storage';

export const QUIZ_KEY = 'petheaven_quiz';

// "weight" is how many of the 100 points a question can earn (the weights add up to exactly 100).
// Each option has a "score" from 0 to 1. Questions with weight 0 (animal type) are only used for matching.
export const QUESTIONS = [
  {
    id: 'type', weight: 0, title: 'What type of animal do you prefer?',
    help: 'This helps us suggest the right kind of match.',
    options: [
      { value: 'dog', label: 'A dog', score: 1 },
      { value: 'cat', label: 'A cat', score: 1 },
      { value: 'either', label: 'Either a dog or a cat', score: 1 },
      { value: 'unsure', label: 'I am not sure yet', score: 1 },
    ],
  },
  {
    id: 'yard', weight: 4, title: 'Do you have a backyard?',
    help: 'Outdoor space is helpful, but it is not required.',
    options: [
      { value: 'private', label: 'Yes, a private yard or garden', score: 1 },
      { value: 'nearby', label: 'No yard, but a park or green space is close by', score: 0.85 },
      { value: 'none', label: 'No yard and no green space nearby', score: 0.6 },
    ],
  },
  {
    id: 'experience', weight: 12, title: 'Have you owned pets before?',
    help: 'First-time owners are welcome. This only helps us suggest an easier match.',
    options: [
      { value: 'current', label: 'Yes, I have a pet now', score: 1 },
      { value: 'past', label: 'Yes, I have owned pets in the past', score: 0.9 },
      { value: 'researched', label: 'No, but I have researched, fostered or looked after a friend’s pet', score: 0.7 },
      { value: 'first', label: 'No, this would be my first pet', score: 0.4 },
    ],
  },
  {
    id: 'home', weight: 4, title: 'What is your home type?',
    options: [
      { value: 'hdb', label: 'HDB flat', score: 0.9 },
      { value: 'condo', label: 'Condominium or apartment', score: 0.9 },
      { value: 'landed', label: 'Landed house', score: 1 },
      { value: 'room', label: 'Rented room or shared home', score: 0.5 },
    ],
  },
  {
    id: 'permission', weight: 20, title: 'Are pets allowed in your home?',
    help: 'Housing and tenancy rules can limit which animals you may keep.',
    options: [
      { value: 'yes', label: 'Yes, pets are allowed', score: 1 },
      { value: 'check', label: 'I am not sure and need to check', score: 0.4 },
      { value: 'no', label: 'No, pets are not allowed', score: 0 },
    ],
  },
  {
    id: 'hoursAlone', weight: 16, title: 'How many hours will the animal be alone each day?',
    options: [
      { value: 'under4', label: 'Less than 4 hours', score: 1 },
      { value: '4to6', label: '4 to 6 hours', score: 0.8 },
      { value: '6to8', label: '6 to 8 hours', score: 0.5 },
      { value: 'over8', label: 'More than 8 hours', score: 0.15 },
    ],
  },
  {
    id: 'household', weight: 4, title: 'Do you have children or other pets?',
    options: [
      { value: 'none', label: 'No children or other pets', score: 1 },
      { value: 'children', label: 'Children only', score: 0.9 },
      { value: 'pets', label: 'Other pets only', score: 0.9 },
      { value: 'both', label: 'Both children and other pets', score: 0.8 },
    ],
  },
  {
    id: 'activity', weight: 4, title: 'What activity level can you support?',
    options: [
      { value: 'low', label: 'Low: short walks and a relaxed home', score: 0.8 },
      { value: 'moderate', label: 'Moderate: a daily walk and playtime', score: 1 },
      { value: 'high', label: 'High: long walks, runs or outdoor adventures', score: 1 },
    ],
  },
  {
    id: 'budget', weight: 18, title: 'Can you afford food, medical care and emergencies?',
    help: 'Think about food, vaccinations, check-ups, grooming and unexpected vet bills.',
    options: [
      { value: 'yes', label: 'Yes, I have a budget and savings for emergencies', score: 1 },
      { value: 'routine', label: 'I can cover food and routine care, but an emergency would be hard', score: 0.55 },
      { value: 'unsure', label: 'I am not sure yet', score: 0.25 },
      { value: 'no', label: 'No, it would be difficult', score: 0 },
    ],
  },
  {
    id: 'commitment', weight: 18, title: 'Are you ready for a long-term commitment?',
    help: 'Dogs and cats can live for 10 to 20 years.',
    options: [
      { value: 'yes', label: 'Yes, I am ready to care for an animal for its whole life', score: 1 },
      { value: 'mostly', label: 'Mostly, but I have some worries', score: 0.6 },
      { value: 'unsure', label: 'I am not sure yet', score: 0.25 },
      { value: 'no', label: 'No, not right now', score: 0 },
    ],
  },
];

export const LEVELS = {
  ready: { key: 'ready', label: 'Ready to Adopt', tone: 'success', icon: '✓' },
  needs: { key: 'needs', label: 'Needs Preparation', tone: 'warning', icon: '…' },
  notReady: { key: 'notReady', label: 'Not Ready', tone: 'danger', icon: '!' },
};

// ---------- Matching categories ----------
// Each category says which animals it covers. The "View matching available animals" button uses these ids.
const isDog = (pet) => pet.species === 'Dog';
const isCat = (pet) => pet.species === 'Cat';
const isYoung = (pet) => pet.ageCategory === 'Baby' || pet.ageCategory === 'Young';

export const MATCH_CATEGORIES = {
  'small-dogs': { label: 'Small Dogs', description: 'Compact dogs that suit flats and condos.', test: (pet) => isDog(pet) && pet.size === 'Small' },
  'medium-dogs': { label: 'Medium Dogs', description: 'Balanced dogs for homes with some space and regular walks.', test: (pet) => isDog(pet) && pet.size === 'Medium' },
  'large-dogs': { label: 'Large Dogs', description: 'Big dogs that need space, exercise and an experienced owner.', test: (pet) => isDog(pet) && pet.size === 'Large' },
  'young-dogs': { label: 'Puppies & Young Dogs', description: 'Energetic dogs that need time, training and play.', test: (pet) => isDog(pet) && isYoung(pet) },
  'adult-cats': { label: 'Adult Cats', description: 'Settled, independent cats that cope well with a busy routine.', test: (pet) => isCat(pet) && pet.ageCategory === 'Adult' },
  'young-cats': { label: 'Kittens & Young Cats', description: 'Playful cats that enjoy company and daily play.', test: (pet) => isCat(pet) && isYoung(pet) },
  'senior-dogs': { label: 'Senior Dogs', description: 'Calm, grateful dogs that are happy with gentle routines.', test: (pet) => isDog(pet) && pet.ageCategory === 'Senior' },
  'senior-cats': { label: 'Senior Cats', description: 'Calm, affectionate cats that love a quiet home.', test: (pet) => isCat(pet) && pet.ageCategory === 'Senior' },
  'senior-pets': { label: 'Senior Pets', description: 'Calm older animals that are often overlooked and make gentle companions.', test: (pet) => pet.ageCategory === 'Senior' },
};

export const petMatchesCategory = (pet, id) => Boolean(MATCH_CATEGORIES[id] && MATCH_CATEGORIES[id].test(pet));
export const petMatchesAny = (pet, ids) => ids.some((id) => petMatchesCategory(pet, id));
export const parseMatchIds = (text) => String(text || '').split(',').map((item) => item.trim()).filter((item) => MATCH_CATEGORIES[item]);

// ---------- Scoring ----------
const optionFor = (question, value) => question.options.find((option) => option.value === value);

export const isComplete = (answers) => QUESTIONS.every((question) => optionFor(question, answers[question.id]));

function scoreCategories(a) {
  const wantsDog = a.type !== 'cat';
  const wantsCat = a.type !== 'dog';
  const smallHome = a.home === 'hdb' || a.home === 'condo' || a.home === 'room';
  const spacious = a.home === 'landed' && a.yard === 'private';
  const beginner = a.experience === 'first' || a.experience === 'researched';
  const veryAlone = a.hoursAlone === 'over8';
  const longAlone = a.hoursAlone === '6to8' || veryAlone;
  const shortAlone = a.hoursAlone === 'under4' || a.hoursAlone === '4to6';
  const NO = -99;

  const dogsPenalty = (veryAlone ? -2 : 0) + (a.hoursAlone === '6to8' ? -1 : 0);
  return {
    'small-dogs': wantsDog ? 3 + (smallHome ? 2 : 0) + (a.activity !== 'high' ? 1 : 0) + (beginner ? 1 : 0) + dogsPenalty : NO,
    'medium-dogs': wantsDog
      ? 2 + (spacious ? 2 : 0) + (a.yard !== 'none' && a.activity !== 'low' ? 1 : 0) + (a.home === 'landed' ? 1 : 0)
        - (a.home === 'room' ? 2 : 0) - (smallHome && a.activity === 'low' ? 1 : 0) + dogsPenalty
      : NO,
    'large-dogs': wantsDog
      ? (spacious && a.activity !== 'low' && !beginner ? 5 : smallHome ? -3 : 0) - (beginner ? 2 : 0) + dogsPenalty
      : NO,
    'young-dogs': wantsDog
      ? 1 + (a.activity === 'high' && a.hoursAlone === 'under4' && !beginner ? 3 : 0) + (a.activity === 'high' ? 1 : 0) - (beginner ? 2 : 0) - (!shortAlone ? 3 : 0)
      : NO,
    'adult-cats': wantsCat ? 3 + (longAlone ? 2 : 0) + (beginner ? 1 : 0) + (smallHome ? 1 : 0) + (a.activity !== 'high' ? 1 : 0) : NO,
    'young-cats': wantsCat ? 2 + (shortAlone && a.activity !== 'low' ? 2 : 0) - (longAlone ? 1 : 0) : NO,
    'senior-dogs': a.type === 'dog' ? 2 + (a.activity === 'low' ? 3 : 0) + (beginner ? 1 : 0) + (smallHome ? 1 : 0) + dogsPenalty : NO,
    'senior-cats': a.type === 'cat' ? 2 + (a.activity === 'low' ? 3 : 0) + (beginner ? 1 : 0) + (longAlone ? 1 : 0) : NO,
    'senior-pets': wantsDog && wantsCat ? 2 + (a.activity === 'low' ? 3 : 0) + (beginner ? 1 : 0) + (smallHome ? 1 : 0) : NO,
  };
}

// Best matches: the top three categories that suit the answers (at least two are always returned).
// When the person likes both dogs and cats, the list always includes at least one of each when possible.
export function getMatches(a) {
  const scores = scoreCategories(a);
  const ranked = Object.keys(MATCH_CATEGORIES)
    .map((id, order) => ({ id, score: scores[id], order }))
    .filter((item) => item.score > -50)
    .sort((x, y) => y.score - x.score || x.order - y.order);
  const strong = ranked.filter((item) => item.score >= 3);
  let picked = (strong.length >= 2 ? strong : ranked.filter((item) => item.score > 0)).slice(0, 3);
  if (picked.length < 2) picked = ranked.slice(0, 2);

  if (a.type === 'either' || a.type === 'unsure') {
    const kindOf = (id) => (id.includes('dog') ? 'dog' : id.includes('cat') ? 'cat' : 'any');
    ['dog', 'cat'].forEach((kind) => {
      if (picked.some((item) => kindOf(item.id) === kind || kindOf(item.id) === 'any')) return;
      const best = ranked.find((item) => kindOf(item.id) === kind && item.score > 0);
      if (best) picked = [...picked.slice(0, 2), best];
    });
  }
  return picked.map((item) => item.id);
}

function getRecommendations(a) {
  const tips = [];
  if (a.permission === 'no') tips.push('Pets are not allowed where you live. Please wait until you have written permission or a pet-friendly home before applying.');
  if (a.permission === 'check') tips.push('Check your tenancy agreement and your HDB or condominium rules, and get approval in writing before you apply.');
  if (a.hoursAlone === 'over8') tips.push('More than 8 hours alone every day is a lot for most animals. Arrange a pet sitter, day care or a family member to help, or consider a calm adult cat.');
  if (a.hoursAlone === '6to8') tips.push('Plan a midday visit or a pet sitter. Adult cats and calm senior animals usually cope better with longer days.');
  if (a.budget !== 'yes') tips.push('Work out a monthly pet budget for food, vaccinations, check-ups and grooming, and save an emergency fund for unexpected vet bills.');
  if (a.commitment !== 'yes') tips.push('Adoption can last 10 to 20 years. Talk it over with everyone at home, and consider fostering first to see how it feels.');
  if (a.experience === 'first' || a.experience === 'researched') tips.push('Read our Pet Care guide, and think about an adult or senior animal with a calm personality, which can be easier for a first-time owner.');
  if (a.yard === 'none' && a.type !== 'cat') tips.push('Without a yard, a dog needs a walk every day, whatever the weather. Plan regular outings.');
  if (a.household === 'children' || a.household === 'both') tips.push('Look for animals marked “Friendly with children” on their profile, and supervise early meetings.');
  if (a.household === 'pets' || a.household === 'both') tips.push('Introduce a new animal to your current pets slowly. Check each profile to see if the animal gets along with cats or dogs.');
  tips.push('Visit the centre to meet the animals and talk to our team about the best fit for your home.');
  return tips.slice(0, 6);
}

// Turns the answers into a result. The quiz is guidance only: it never approves or rejects an application.
export function calculateResult(answers) {
  const total = QUESTIONS.reduce((sum, question) => sum + question.weight, 0);
  const earned = QUESTIONS.reduce((sum, question) => {
    const option = optionFor(question, answers[question.id]);
    return sum + (option ? question.weight * option.score : 0);
  }, 0);
  const rawScore = Math.round((earned / total) * 100);

  // Key requirements. If one is missing the score is held down so the score and the level always agree.
  const notReadyReasons = [];
  if (answers.permission === 'no') notReadyReasons.push('pets are not allowed in your home');
  if (answers.budget === 'no') notReadyReasons.push('the costs of care would be difficult for you right now');
  if (answers.commitment === 'no') notReadyReasons.push('you are not ready for a long-term commitment yet');
  const prepReasons = [];
  if (answers.permission === 'check') prepReasons.push('you still need to confirm that pets are allowed in your home');
  if (answers.hoursAlone === 'over8') prepReasons.push('the animal would be alone for more than 8 hours a day');
  if (answers.budget === 'routine' || answers.budget === 'unsure') prepReasons.push('you are not yet sure you could cover emergency vet costs');
  if (answers.commitment === 'mostly' || answers.commitment === 'unsure') prepReasons.push('you still have doubts about the long-term commitment');

  let score = rawScore;
  if (notReadyReasons.length) score = Math.min(score, 49);
  else if (prepReasons.length) score = Math.min(score, 74);
  const capped = score < rawScore;

  const level = notReadyReasons.length || score < 50 ? LEVELS.notReady : score < 75 ? LEVELS.needs : LEVELS.ready;

  let explanation;
  if (level.key === 'ready') {
    explanation = 'Your answers suggest you have the time, home, budget and commitment to give an animal a stable, loving home. The next step is to meet the animals and talk to our team.';
  } else if (level.key === 'needs') {
    explanation = 'You have a good start, but a few areas need attention before adopting. A little preparation will help you and your future pet settle in happily.';
  } else {
    explanation = 'Some important things are not in place yet. That is okay: preparing first is kinder for you and for the animal, and you are welcome to retake the quiz at any time.';
  }
  const reasons = level.key === 'notReady' && notReadyReasons.length ? notReadyReasons : level.key === 'ready' ? [] : prepReasons;
  const joined = reasons.length > 1 ? `${reasons.slice(0, -1).join(', ')} and ${reasons[reasons.length - 1]}` : reasons[0];
  const note = reasons.length ? `Your result is held at this level because ${joined}.` : '';

  return { score, rawScore, capped, level, explanation, note, matches: getMatches(answers), recommendations: getRecommendations(answers) };
}

// ---------- Saving (localStorage only) ----------
export const emptyQuiz = () => ({ answers: {}, step: 0, completed: false, completedAt: '' });

// Only answers that match a real option are accepted, so broken saved data can never crash the page.
export function loadQuiz() {
  const saved = readStorage(QUIZ_KEY, null);
  if (!saved || typeof saved !== 'object') return emptyQuiz();
  const answers = {};
  QUESTIONS.forEach((question) => {
    if (saved.answers && optionFor(question, saved.answers[question.id])) answers[question.id] = saved.answers[question.id];
  });
  const completed = Boolean(saved.completed) && isComplete(answers);
  const step = Math.min(Math.max(Number(saved.step) || 0, 0), QUESTIONS.length - 1);
  return { answers, step, completed, completedAt: completed ? String(saved.completedAt || '') : '' };
}

export const saveQuiz = (state) => writeStorage(QUIZ_KEY, state);
