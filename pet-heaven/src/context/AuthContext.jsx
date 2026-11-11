import { createContext, useContext, useEffect, useState } from 'react';
import { readStorage, writeStorage } from '../utils/storage';
import { isEmail, passwordProblems } from '../utils/validators';
import { roleForEmail } from '../utils/roles';

// Front-end only authentication. Everything is saved in the browser's localStorage:
//   petheaven_users         -> [{ id, name, email, password, role, createdAt, updatedAt }]
//   petheaven_current_user  -> { id, name, email, role }   (the logged-in member; no password)
// role is "customer" or "employee" (employee = @petheaven.sg email). There is no server, so the role is
// only checked in the browser: this is a demo, not real security.
// This is a student demo. Passwords are stored in plain text, so never use real passwords.
export const USERS_KEY = 'petheaven_users';
export const CURRENT_USER_KEY = 'petheaven_current_user';

const AuthContext = createContext(null);

const makeId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

const toSession = (member) => ({ id: member.id, name: member.name, email: member.email, role: member.role });

const readUsers = () => {
  const list = readStorage(USERS_KEY, []);
  return Array.isArray(list)
    ? list
      .filter((item) => item && item.email && item.password)
      .map((item) => ({ ...item, role: item.role === 'employee' || item.role === 'customer' ? item.role : roleForEmail(item.email) }))
    : [];
};

// Read the saved session once; ignore anything that is not a valid { id, name, email } object
const readCurrentUser = () => {
  const saved = readStorage(CURRENT_USER_KEY, null);
  if (!saved || typeof saved !== 'object' || !saved.id || !saved.email || !saved.name) return null;
  // The saved account is the source of truth for the role; no matching account means no session
  const account = readUsers().find((item) => item.id === saved.id);
  return account ? toSession(account) : null;
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(readCurrentUser);

  // Favourites are saved separately for each member (and for guests)
  const favouritesKey = `petheaven_favourites_${currentUser ? currentUser.email : 'guest'}`;
  const [favourites, setFavourites] = useState(() => readStorage(favouritesKey, []));

  useEffect(() => {
    setFavourites(readStorage(favouritesKey, []));
  }, [favouritesKey]);

  // Keep several open tabs in sync (login in one tab, logout in another)
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === CURRENT_USER_KEY || event.key === null) setCurrentUser(readCurrentUser());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const startSession = (member) => {
    const session = toSession(member);
    if (!writeStorage(CURRENT_USER_KEY, session)) return false;
    setCurrentUser(session);
    return true;
  };

  const signup = ({ name = '', email = '', password = '' }) => {
    const errors = {};
    if (name.trim().length < 2) errors.name = 'Please enter your full name.';
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) errors.email = 'Please enter your email.';
    else if (!isEmail(cleanEmail)) errors.email = 'Please enter a valid email address.';
    const problems = passwordProblems(password);
    if (!password) errors.password = 'Please create a password.';
    else if (problems.length > 0) errors.password = `Password must include ${problems.join(', ')}.`;
    if (Object.keys(errors).length > 0) return { ok: false, error: Object.values(errors)[0], errors };

    const users = readUsers();
    if (users.some((item) => item.email.toLowerCase() === cleanEmail)) {
      const message = 'An account with this email already exists. Please log in instead.';
      return { ok: false, error: message, errors: { email: message } };
    }

    const now = new Date().toISOString();
    const user = {
      id: makeId(), name: name.trim(), email: cleanEmail, password,
      // Role is decided only by the email: @petheaven.sg = employee, everything else = customer
      role: roleForEmail(cleanEmail), createdAt: now, updatedAt: now,
    };
    if (!writeStorage(USERS_KEY, [...users, user]) || !startSession(user)) {
      const message = 'Could not save your account. Browser storage may be full or blocked.';
      return { ok: false, error: message, errors: { email: message } };
    }
    return { ok: true, user: toSession(user) };
  };

  const login = ({ email = '', password = '' }) => {
    const cleanEmail = email.trim().toLowerCase();
    const match = readUsers().find((item) => item.email.toLowerCase() === cleanEmail && item.password === password);
    if (!match) return { ok: false, error: 'Incorrect email or password.' };
    if (!startSession(match)) return { ok: false, error: 'Could not start your session. Browser storage may be blocked.' };
    return { ok: true, user: toSession(match) };
  };

  const logout = () => {
    try {
      window.localStorage.removeItem(CURRENT_USER_KEY);
    } catch (error) {
      /* ignore: the state below still logs the member out of this page */
    }
    setCurrentUser(null);
  };

  const changePassword = ({ currentPassword, newPassword }) => {
    if (!currentUser) return { ok: false, error: 'Please log in first.', errors: {} };
    const users = readUsers();
    const target = users.find((item) => item.id === currentUser.id);
    if (!target || target.password !== currentPassword) {
      const message = 'Your current password is incorrect.';
      return { ok: false, error: message, errors: { currentPassword: message } };
    }
    const problems = passwordProblems(newPassword);
    if (problems.length > 0) {
      const message = `Password must include ${problems.join(', ')}.`;
      return { ok: false, error: message, errors: { newPassword: message } };
    }
    const updated = users.map((item) => (item.id === target.id ? { ...item, password: newPassword, updatedAt: new Date().toISOString() } : item));
    if (!writeStorage(USERS_KEY, updated)) {
      return { ok: false, error: 'Could not save the new password.', errors: {} };
    }
    return { ok: true };
  };

  const toggleFavourite = (petId) => {
    setFavourites((current) => {
      const updated = current.includes(petId) ? current.filter((id) => id !== petId) : [...current, petId];
      writeStorage(favouritesKey, updated);
      return updated;
    });
  };

  const value = {
    currentUser, isAuthenticated: Boolean(currentUser),
    role: currentUser ? currentUser.role : null, isEmployee: Boolean(currentUser && currentUser.role === 'employee'),
    signup, login, logout, changePassword, favourites, toggleFavourite,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
