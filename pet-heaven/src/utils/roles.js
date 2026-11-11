// Account roles. The role is never chosen by the user: it comes from the email address.
// Only emails ending exactly with @petheaven.sg are employees; everything else is a customer.
export const EMPLOYEE_DOMAIN = '@petheaven.sg';

export const roleForEmail = (email) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  return normalizedEmail.endsWith(EMPLOYEE_DOMAIN) ? 'employee' : 'customer';
};
