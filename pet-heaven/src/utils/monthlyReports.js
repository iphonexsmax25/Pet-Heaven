// Monthly reports for employees. Everything lives in the browser (localStorage) - there is no backend.
//
//   petHeavenMonthlyReports -> [{ id: 'YYYY-MM', year, month, createdAt, generatedAt, totals, content }]
//
// "YYYY-MM" is the unique id, so generating the same month again updates the saved report
// instead of adding a duplicate. Reports only contain counts: no passwords, emails or names.
import { readStorage, writeStorage } from './storage';

export const REPORTS_KEY = 'petHeavenMonthlyReports';
export const TXT_MIME = 'text/plain;charset=utf-8';
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const ID_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;
const pad = (number) => String(number).padStart(2, '0');

export const reportId = (year, month) => `${year}-${pad(month)}`; // month is 1-12
export const reportFileName = (id) => `pet-heaven-report-${id}.txt`;
export const reportTitle = (id) => {
  const match = ID_PATTERN.exec(id);
  return match ? `${MONTH_NAMES[Number(match[2]) - 1]} ${match[1]}` : id;
};

// ---------- Date filtering ----------

// Returns a valid Date, or null when the value is missing or not a real date. Nothing is guessed.
// 1 January 1970 is the app's "unknown date" placeholder (see PetsContext), so it counts as missing too.
export function parseDate(value) {
  if (value === undefined || value === null || value === '') return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.getTime() === 0) return null;
  return date;
}

// Months are matched in this browser's local time zone, the same way dates are shown on screen.
const inMonth = (date, year, month) => Boolean(date) && date.getFullYear() === year && date.getMonth() + 1 === month;

// Keep records whose timestamp falls in the month; count the ones with no usable date separately.
function filterByMonth(records, getTimestamp, year, month) {
  const inside = [];
  let excluded = 0;
  records.forEach((record) => {
    const date = parseDate(getTimestamp(record));
    if (!date) excluded += 1;
    else if (inMonth(date, year, month)) inside.push(record);
  });
  return { inside, excluded };
}

const countBy = (list, key, knownValues) => {
  const rows = knownValues.map((value) => [value, list.filter((item) => item[key] === value).length]);
  const other = list.length - rows.reduce((sum, [, count]) => sum + count, 0);
  return other > 0 ? [...rows, ['Other / unlisted', other]] : rows;
};

const capitalise = (text) => String(text).charAt(0).toUpperCase() + String(text).slice(1).toLowerCase();

// ---------- Building a report ----------

export function calculateTotals({ year, month, pets = [], applications = [], users = [], species = [], statuses = [], applicationStatuses = [], isEmployeeUser }) {
  const addedPets = filterByMonth(pets, (pet) => pet.createdAt, year, month);
  const newApplications = filterByMonth(applications, (item) => item.submittedAt, year, month);
  const completed = filterByMonth(
    applications.filter((item) => item.status === 'Completed'), (item) => item.completedAt, year, month
  );
  // A release is an approved entry in a pet's releaseHistory (dated by its approval date)
  const releaseEntries = pets.flatMap((pet) => (Array.isArray(pet.releaseHistory) ? pet.releaseHistory : [])
    .filter((entry) => entry && (entry.status === 'Approved' || entry.status === 'Released')));
  const releasedPets = filterByMonth(releaseEntries, (entry) => entry.approvedAt || entry.requestedAt, year, month);
  const newAccounts = filterByMonth(users, (user) => user.createdAt, year, month);

  return {
    // Current fleet snapshot: every pet record counted once, by its current status
    fleet: {
      total: pets.length,
      byStatus: statuses.map((value) => [capitalise(value), pets.filter((pet) => pet.status === value).length]),
    },
    pets: {
      total: addedPets.inside.length,
      byStatus: countBy(addedPets.inside, 'status', statuses).map(([value, count]) => [capitalise(value), count]),
      bySpecies: countBy(addedPets.inside, 'species', species),
    },
    applications: {
      total: newApplications.inside.length,
      byStatus: countBy(newApplications.inside, 'status', applicationStatuses),
    },
    completedAdoptions: completed.inside.length,
    releases: releasedPets.inside.length,
    accounts: {
      total: newAccounts.inside.length,
      customers: newAccounts.inside.filter((user) => !isEmployeeUser(user)).length,
      employees: newAccounts.inside.filter(isEmployeeUser).length,
    },
    excluded: {
      pets: addedPets.excluded,
      applications: newApplications.excluded,
      completedAdoptions: completed.excluded,
      releases: releasedPets.excluded,
      accounts: newAccounts.excluded,
    },
  };
}

const formatGenerated = (date) =>
  date.toLocaleString('en-SG', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });

export function formatReportText({ id, generatedAt, totals }) {
  const rows = (list) => list.map(([label, count]) => `  - ${label}: ${count}`);
  const lines = [
    'PET HEAVEN - MONTHLY REPORT',
    '===========================',
    `Report month: ${reportTitle(id)} (${id})`,
    `Generated: ${formatGenerated(new Date(generatedAt))}`,
    "Source: this browser's saved data. Months use this browser's local time zone.",
    '',
    'PET FLEET (CURRENT)',
    `Total pets: ${totals.fleet ? totals.fleet.total : 0}`,
    ...rows(totals.fleet ? totals.fleet.byStatus : []),
    '',
    'PETS ADDED THIS MONTH',
    `Total pets: ${totals.pets.total}`,
    'Pet statuses (current status of these pets):',
    ...rows(totals.pets.byStatus),
    'Species:',
    ...rows(totals.pets.bySpecies),
    '',
    'ADOPTION APPLICATIONS RECEIVED',
    `Total applications: ${totals.applications.total}`,
    'Application statuses (current status of these applications):',
    ...rows(totals.applications.byStatus),
    '',
    'ADOPTIONS AND RELEASES',
    `Completed adoptions: ${totals.completedAdoptions}`,
    `Pets released by members: ${totals.releases}`,
    '',
    'NEWLY REGISTERED ACCOUNTS',
    `Total new accounts: ${totals.accounts.total}`,
    `  - Customers: ${totals.accounts.customers}`,
    `  - Employees: ${totals.accounts.employees}`,
    '',
    'RECORDS EXCLUDED (missing or invalid date)',
    `  - Pets: ${totals.excluded.pets}`,
    `  - Applications: ${totals.excluded.applications}`,
    `  - Completed adoptions: ${totals.excluded.completedAdoptions}`,
    `  - Releases: ${totals.excluded.releases}`,
    `  - Accounts: ${totals.excluded.accounts}`,
    '',
    'This report contains totals only. It does not include passwords or customer personal information.',
  ];
  return `${lines.join('\n')}\n`;
}

// Build one report object (not saved yet). Pass the existing report, if any, so its first-created date is kept.
export function buildMonthlyReport({ year, month, existing, ...data }) {
  const id = reportId(year, month);
  const generatedAt = new Date().toISOString();
  const totals = calculateTotals({ year, month, ...data });
  return {
    id, year, month,
    createdAt: existing && existing.createdAt ? existing.createdAt : generatedAt,
    generatedAt,
    totals,
    content: formatReportText({ id, generatedAt, totals }),
  };
}

// ---------- Saved reports (localStorage) ----------

// Only keep well-formed reports and never more than one per YYYY-MM id. Newest month first.
export function getSavedReports() {
  const saved = readStorage(REPORTS_KEY, []);
  const byId = new Map();
  (Array.isArray(saved) ? saved : []).forEach((item) => {
    if (!item || typeof item.id !== 'string' || !ID_PATTERN.test(item.id) || typeof item.content !== 'string') return;
    const previous = byId.get(item.id);
    if (!previous || String(item.generatedAt) > String(previous.generatedAt)) byId.set(item.id, item);
  });
  return [...byId.values()].sort((a, b) => (a.id < b.id ? 1 : -1));
}

// Add the report, or replace the one with the same id. Returns { ok, reports, replaced }.
export function saveReport(report) {
  const current = getSavedReports();
  const replaced = current.some((item) => item.id === report.id);
  const next = [report, ...current.filter((item) => item.id !== report.id)].sort((a, b) => (a.id < b.id ? 1 : -1));
  return { ok: writeStorage(REPORTS_KEY, next), reports: next, replaced };
}

export function deleteReport(id) {
  const next = getSavedReports().filter((item) => item.id !== id);
  return { ok: writeStorage(REPORTS_KEY, next), reports: next };
}

// ---------- Downloading ----------

// One .txt file with every saved report, newest month first
export function buildAllReportsText(reports) {
  return reports.map((report) => report.content.trimEnd()).join('\n\n\n') + '\n';
}

export const exportAllFileName = (date = new Date()) =>
  `pet-heaven-all-reports-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.txt`;

// Browsers cannot create folders, so the file goes to the browser's normal Downloads location.
export function downloadTextFile(fileName, text) {
  try {
    const blob = new Blob([text], { type: TXT_MIME });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch (error) {
    return false;
  }
}
