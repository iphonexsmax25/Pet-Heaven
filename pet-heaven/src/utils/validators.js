export const isEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

// Singapore numbers: optional +65, then 8 digits starting with 3, 6, 8 or 9
export const isSingaporePhone = (value) =>
  /^(\+?65[\s-]?)?[3689]\d{3}[\s-]?\d{4}$/.test(value.trim());

export const isHttpUrl = (value) => {
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (error) {
    return false;
  }
};

// Password rules (checked in the browser).
export const PASSWORD_MAX = 72;

// One entry per rule, used for the live checklist
export function passwordChecks(password) {
  return [
    { id: 'length', label: 'At least 8 characters', met: password.length >= 8 },
    { id: 'upper', label: 'One uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { id: 'lower', label: 'One lowercase letter (a-z)', met: /[a-z]/.test(password) },
    { id: 'number', label: 'One number (0-9)', met: /[0-9]/.test(password) },
  ];
}

// Returns a list of unmet rules (empty list = password is valid)
export function passwordProblems(password) {
  const problems = passwordChecks(password).filter((check) => !check.met).map((check) => check.label.toLowerCase());
  if (password.length > PASSWORD_MAX) problems.push(`no more than ${PASSWORD_MAX} characters`);
  return problems;
}

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const formatDate = (iso) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
};
