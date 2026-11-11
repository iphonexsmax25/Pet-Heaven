import { Link } from 'react-router-dom';
import PawIcon from './PawIcon';

export default function Logo({ onClick }) {
  return (
    <Link to="/" className="logo" onClick={onClick} aria-label="Pet Heaven home">
      <span className="logo-icon"><PawIcon size={26} /></span>
      <span className="logo-text">Pet <span className="logo-three">Heaven</span></span>
    </Link>
  );
}
