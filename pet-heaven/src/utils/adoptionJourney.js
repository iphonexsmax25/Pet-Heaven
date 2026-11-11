import { formatDate } from './validators';

export const JOURNEY_STAGES = [
  { key: 'review', label: 'Review' },
  { key: 'meet', label: 'Meet & Greet' },
  { key: 'home', label: 'Home Visit' },
  { key: 'complete', label: 'Adoption Complete' },
];

export const LAST_STAGE = JOURNEY_STAGES.length - 1;
const STOPPED_STATUSES = ['Rejected', 'Withdrawn', 'Cancelled'];
const JOURNEY_VERSION = 2;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function migrateLegacyStage(stage) {
  if (!Number.isInteger(stage)) return null;
  if (stage <= 2) return 0;
  return Math.min(stage - 2, LAST_STAGE);
}

export function migrateJourneyApplication(application) {
  if (application.journeyVersion === JOURNEY_VERSION) return application;

  const status = application.status || 'Pending';
  const oldStage = Number.isInteger(application.stage) ? application.stage : null;
  let stage;

  if (status === 'Completed') stage = LAST_STAGE;
  else if (status === 'Approved') {
    const migrated = migrateLegacyStage(oldStage);
    stage = migrated === 2 ? 2 : 1;
  } else if (STOPPED_STATUSES.includes(status)) {
    stage = clamp(migrateLegacyStage(oldStage) ?? 0, 0, LAST_STAGE - 1);
  } else {
    stage = 0;
  }

  const oldDates = application.stageDates || {};
  const stageDates = {};
  const reviewDate = oldStage !== null && oldStage <= 2
    ? oldDates[oldStage] || oldDates[1] || oldDates[0] || oldDates[2]
    : oldDates[0] || oldDates[1] || oldDates[2];
  if (reviewDate || application.submittedAt) stageDates[0] = reviewDate || application.submittedAt;
  [3, 4, 5].forEach((oldIndex, index) => {
    if (oldDates[oldIndex]) stageDates[index + 1] = oldDates[oldIndex];
  });
  if (status === 'Approved' && application.visitDate && !stageDates[1]) {
    stageDates[1] = application.visitDate;
  }
  if (status === 'Completed' && application.completedAt) stageDates[LAST_STAGE] = application.completedAt;

  return {
    ...application,
    stage,
    stageDates,
    stageUpdatedAt: application.stageUpdatedAt || stageDates[stage] || application.submittedAt || '',
    journeyVersion: JOURNEY_VERSION,
  };
}

function stageMessage(application, stage) {
  const pet = application.petName || 'your pet';
  switch (stage) {
    case 0: return `Our team is reviewing the application for ${pet}.`;
    case 1: return application.visitDate
      ? `The meet & greet with ${pet} is on ${formatDate(application.visitDate)}.`
      : `The meet & greet with ${pet} is being arranged.`;
    case 2: return `We will visit the home to check that it suits ${pet}.`;
    default: return `Congratulations! ${pet} is now officially adopted.`;
  }
}

function fallbackDate(application, index) {
  if (index === 0) return application.submittedAt || '';
  if (index === 1) return application.visitDate || '';
  if (index === LAST_STAGE) return application.completedAt || '';
  return '';
}

export function getJourney(application) {
  const normalized = migrateJourneyApplication(application);
  const status = normalized.status || 'Pending';
  const stopped = STOPPED_STATUSES.includes(status);
  const complete = status === 'Completed';
  const stage = stopped
    ? clamp(Number.isInteger(normalized.stage) ? normalized.stage : 0, 0, LAST_STAGE - 1)
    : complete
      ? LAST_STAGE
      : status === 'Approved'
        ? clamp(Number.isInteger(normalized.stage) ? normalized.stage : 1, 1, 2)
        : 0;
  const dates = normalized.stageDates || {};
  const dateFor = (index) => dates[index] || fallbackDate(normalized, index);

  const steps = JOURNEY_STAGES.map((item, index) => {
    let state = 'upcoming';
    if (complete || index < stage) state = 'done';
    else if (index === stage) state = stopped ? 'stopped' : 'current';
    return { ...item, index, state, date: state === 'upcoming' ? '' : dateFor(index) };
  });

  const reason = normalized.stopReason
    || (status === 'Cancelled'
      ? 'The applicant cancelled this application.'
      : status === 'Withdrawn'
        ? 'The applicant withdrew this application.'
        : 'This application was not approved.');
  const date = stopped
    ? normalized.stoppedAt || normalized.stageUpdatedAt || ''
    : dateFor(stage) || normalized.stageUpdatedAt || normalized.submittedAt || '';

  return {
    stage,
    stopped,
    complete,
    steps,
    date,
    tone: stopped ? 'stopped' : complete ? 'complete' : 'active',
    statusLabel: stopped ? `${status} at ${JOURNEY_STAGES[stage].label}` : JOURNEY_STAGES[stage].label,
    message: stopped ? 'This application has stopped and will not move forward.' : stageMessage(normalized, stage),
    reason: stopped ? reason : '',
  };
}

export function journeyPatch(application, stage, extra = {}) {
  const now = new Date().toISOString();
  const stageDates = {};
  Object.entries(application.stageDates || {}).forEach(([key, value]) => {
    if (Number(key) < stage) stageDates[key] = value;
  });
  stageDates[stage] = now;
  return {
    stage,
    stageDates,
    stageUpdatedAt: now,
    journeyVersion: JOURNEY_VERSION,
    ...extra,
  };
}

export function stopPatch(application, reason) {
  const now = new Date().toISOString();
  return {
    stage: getJourney(application).stage,
    stageDates: { ...(application.stageDates || {}), [getJourney(application).stage]: now },
    stopReason: String(reason || '').trim() || 'This application was not approved.',
    stoppedAt: now,
    stageUpdatedAt: now,
    journeyVersion: JOURNEY_VERSION,
  };
}
