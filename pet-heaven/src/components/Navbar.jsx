import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MESSAGES_CHANGED_EVENT, countUnresolvedMessages } from '../utils/adminData';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

const primaryLinks = [
  ['/', 'Home'],
  ['/dogs', 'Dogs'],
  ['/cats', 'Cats'],
  ['/pets', 'Available Pets'],
  ['/pet-care', 'Pet Care'],
  ['/pet-matching', 'Pet Matching'],
  ['/contact', 'Contact'],
  ['/personality-test', 'Personality Test'],
];

const aboutLinks = [
  ['/about', 'About Us'],
  ['/mission', 'Mission'],
  ['/reviews', 'Reviews'],
  ['/adopted-animals', 'Adopted Animals'],
];

const employeeLinks = [
  ['/admin/dashboard', 'Dashboard'],
  ['/admin/pets', 'Manage Pets'],
  ['/admin/applications', 'Applications'],
  ['/admin/releases', 'Releases'],
  ['/admin/reports', 'Reports'],
  ['/admin/messages', 'Messages'],
];

const customerLinks = [
  ['/adoption-history', 'My Applications'],
  ['/my-adopted-pets', 'My Adopted Pets'],
  ['/add-pet', 'Add a Pet'],
  ['/my-released-pets', 'My Released Pets'],
  ['/favourites', 'Favorites'],
];

const navClass = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');

function NavigationLink({ path, label, onNavigate, unresolved }) {
  return (
    <NavLink to={path} end={path === '/'} className={navClass} onClick={onNavigate}>
      {label}
      {path === '/admin/messages' && unresolved > 0 && (
        <>
          <span className="nav-badge" aria-hidden="true">{unresolved}</span>
          <span className="sr-only"> ({unresolved} unresolved)</span>
        </>
      )}
    </NavLink>
  );
}

function ActionLinks({ onNavigate }) {
  const { isEmployee } = useAuth();

  if (isEmployee) return null;

  return (
    <>
      <Link to="/adopt" className="btn btn-primary btn-sm" onClick={onNavigate}>Adopt a Pet</Link>
      <Link to="/release" className="btn btn-outline btn-sm" onClick={onNavigate}>Release a Pet</Link>
    </>
  );
}

function AccountControls({ onNavigate }) {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onNavigate();
    navigate('/');
  };

  return (
    <>
      {isAuthenticated ? (
        <>
          <Link
            to="/profile"
            className="nav-link"
            aria-label={`Open profile for ${currentUser.name.split(' ')[0]}`}
            onClick={onNavigate}
          >
            Hi, {currentUser.name.split(' ')[0]}
          </Link>
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>Log out</button>
        </>
      ) : (
        <>
          <NavLink to="/login" className={navClass} onClick={onNavigate}>Login</NavLink>
          <Link to="/signup" className="btn btn-green btn-sm" onClick={onNavigate}>Sign Up</Link>
        </>
      )}
      <ThemeToggle />
    </>
  );
}

function NavigationGroup({ id, label, items, open, onToggle, onNavigate, unresolved, activePath, buttonRef }) {
  const isActive = items.some(([path]) => activePath === path || activePath.startsWith(`${path}/`));

  return (
    <li className={`nav-group${open ? ' is-open' : ''}`}>
      <button
        ref={buttonRef}
        type="button"
        className={`nav-link nav-group-toggle${isActive ? ' active' : ''}`}
        aria-expanded={open}
        aria-controls={`${id}-links`}
        onClick={onToggle}
      >
        {label}<span className="nav-group-chevron" aria-hidden="true" />
      </button>
      <ul id={`${id}-links`} className="nav-group-links" hidden={!open}>
        {items.map(([path, itemLabel]) => (
          <li key={path}>
            <NavigationLink path={path} label={itemLabel} onNavigate={onNavigate} unresolved={unresolved} />
          </li>
        ))}
      </ul>
    </li>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);
  const location = useLocation();
  const { isAuthenticated: loggedIn, isEmployee: staff } = useAuth();
  const headerRef = useRef(null);
  const menuToggleRef = useRef(null);
  const groupButtons = useRef({});
  const [unresolved, setUnresolved] = useState(0);
  const visibleAboutLinks = aboutLinks.filter(([path]) => !(staff && path === '/reviews'));
  const roleLinks = loggedIn ? (staff ? employeeLinks : customerLinks) : [];

  const close = () => {
    setOpen(false);
    setOpenGroup(null);
  };

  const toggleGroup = (group) => {
    setOpenGroup((current) => current === group ? null : group);
  };

  useEffect(() => {
    if (!staff) {
      setUnresolved(0);
      return undefined;
    }
    const update = () => setUnresolved(countUnresolvedMessages());
    update();
    window.addEventListener(MESSAGES_CHANGED_EVENT, update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener(MESSAGES_CHANGED_EVENT, update);
      window.removeEventListener('storage', update);
    };
  }, [staff]);

  useEffect(() => {
    close();
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key !== 'Escape') return;
      if (!open && !openGroup) return;
      event.preventDefault();
      if (open) menuToggleRef.current?.focus();
      else if (openGroup) groupButtons.current[openGroup]?.focus();
      close();
    };
    const onPointerDown = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) close();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open, openGroup]);

  const renderGroup = (id, label, items) => (
    <NavigationGroup
      key={id}
      id={id}
      label={label}
      items={items}
      open={openGroup === id}
      onToggle={() => toggleGroup(id)}
      onNavigate={close}
      unresolved={unresolved}
      activePath={location.pathname}
      buttonRef={(element) => { groupButtons.current[id] = element; }}
    />
  );

  return (
    <header className="site-header" ref={headerRef}>
      <div className="container header-top">
        <Logo onClick={close} />
        <div className="header-actions desktop-only">
          <ActionLinks onNavigate={close} />
          <AccountControls onNavigate={close} />
        </div>
        <button
          ref={menuToggleRef}
          type="button"
          className={open ? 'menu-toggle is-open' : 'menu-toggle'}
          aria-expanded={open}
          aria-controls="main-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((value) => !value)}
        >
          <span /><span /><span />
        </button>
      </div>

      <nav id="main-nav" className={open ? 'site-nav open' : 'site-nav'} aria-label="Main navigation">
        <div className="container">
          <div className="mobile-actions mobile-actions-top mobile-only">
            <ActionLinks onNavigate={close} />
          </div>
          <ul className="nav-links">
            {primaryLinks
              .filter(([path]) => !(staff && path === '/contact'))
              .map(([path, label]) => (
                <li key={path}>
                  <NavigationLink path={path} label={label} onNavigate={close} unresolved={unresolved} />
                </li>
              ))}
            {renderGroup('about', 'About', visibleAboutLinks)}
            {roleLinks.length > 0 && renderGroup(staff ? 'staff' : 'account', staff ? 'Staff' : 'My Account', roleLinks)}
          </ul>
          <div className="mobile-actions mobile-actions-bottom mobile-only">
            <AccountControls onNavigate={close} />
          </div>
        </div>
      </nav>
    </header>
  );
}
