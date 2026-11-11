import { readStorage, writeStorage } from './storage';
import { getJourney, migrateJourneyApplication, stopPatch } from './adoptionJourney';
import { normalizeEmail } from './petRules';

// Adoption applications and simulated email notifications (browser localStorage only)
export const APPLICATIONS_KEY = 'petheaven_applications';
export const NOTIFICATIONS_KEY = 'petheaven_notifications';

const asList = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);
const TERMINAL_APPLICATION_STATUSES = ['completed', 'rejected', 'withdrawn', 'cancelled'];

export const isActiveApplication = (application) =>
  !TERMINAL_APPLICATION_STATUSES.includes(String(application.status || 'Pending').toLowerCase());

export const ownsApplication = (application, user) => Boolean(user && (
  application.applicantUserId
    ? String(application.applicantUserId) === String(user.id)
    : normalizeEmail(application.email) === normalizeEmail(user.email)
));

// Older saved applications had no status, so treat them as Pending and migrate their journey stages once.
export const getApplications = () => {
  const stored = asList(readStorage(APPLICATIONS_KEY, []));
  const applications = stored.map((item) => migrateJourneyApplication({ status: 'Pending', ...item }));
  if (applications.some((item, index) => item !== stored[index])) {
    writeStorage(APPLICATIONS_KEY, applications);
  }
  return applications;
};

export function updateApplication(id, patch) {
  const list = getApplications().map((item) => (item.id === id ? { ...item, ...patch } : item));
  return writeStorage(APPLICATIONS_KEY, list);
}

export function cancelApplication(id, user) {
  if (!user || !user.id || user.role !== 'customer') {
    return { ok: false, error: 'Only customers can cancel an adoption application.' };
  }
  const application = getApplications().find((item) => item.id === id);
  if (!application) return { ok: false, error: 'This application could not be found.' };
  if (!ownsApplication(application, user)) {
    return { ok: false, error: 'You can only cancel your own applications.' };
  }
  if (!isActiveApplication(application) || getJourney(application).complete) {
    return { ok: false, error: 'This application can no longer be cancelled.' };
  }
  const saved = updateApplication(application.id, {
    status: 'Cancelled',
    ...stopPatch(application, 'The applicant cancelled this application.'),
  });
  return saved
    ? { ok: true }
    : { ok: false, error: 'Could not save the change. Browser storage may be full or blocked.' };
}

export const getNotifications = () => asList(readStorage(NOTIFICATIONS_KEY, []));

// No real email is sent. The message is only logged here so employees can see it.
export function addNotification({ to, subject, body }) {
  const entry = { id: `mail-${Date.now().toString(36)}`, to, subject, body, createdAt: new Date().toISOString() };
  return writeStorage(NOTIFICATIONS_KEY, [entry, ...getNotifications()].slice(0, 50));
}

// ----- Contact messages (browser localStorage only; no email is ever sent) -----
// Each message: { id, name, email, subject, message, status: 'unresolved' | 'resolved', submittedAt, resolvedAt }
export const MESSAGES_KEY = 'petheaven_messages';
export const MESSAGES_CHANGED_EVENT = 'petheaven:messages-changed';

// Older saved messages used "sentAt" and had no status, so they are treated as unresolved
const normalizeMessage = (item) => ({
  ...item,
  status: item.status === 'resolved' ? 'resolved' : 'unresolved',
  submittedAt: item.submittedAt || item.sentAt || null,
  resolvedAt: item.resolvedAt || null,
});

const saveMessages = (list) => {
  const saved = writeStorage(MESSAGES_KEY, list);
  if (saved && typeof window !== 'undefined') window.dispatchEvent(new Event(MESSAGES_CHANGED_EVENT));
  return saved;
};

// Newest first
export const getContactMessages = () =>
  asList(readStorage(MESSAGES_KEY, []))
    .map(normalizeMessage)
    .sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));

export const countUnresolvedMessages = () =>
  getContactMessages().filter((item) => item.status === 'unresolved').length;

export function addContactMessage({ name, email, subject, message }) {
  const entry = {
    id: `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    name, email, subject, message,
    status: 'unresolved',
    submittedAt: new Date().toISOString(),
    resolvedAt: null,
  };
  return saveMessages([...getContactMessages(), entry]);
}

export function resolveContactMessage(id) {
  const list = getContactMessages().map((item) => (
    item.id === id && item.status !== 'resolved'
      ? { ...item, status: 'resolved', resolvedAt: new Date().toISOString() }
      : item
  ));
  return saveMessages(list);
}
