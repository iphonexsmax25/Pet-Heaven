import { Link } from 'react-router-dom';
import Logo from './Logo';
import ContactIcon from './ContactIcon';
import { contactInfo } from '../data/contact';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Logo />
          <p className="footer-tagline">Find a friend. Change a life. Adopt, don&apos;t shop.</p>
        </div>
        <div>
          <h2 className="footer-heading">Explore</h2>
          <ul className="footer-links">
            <li><Link to="/dogs">Dogs</Link></li>
            <li><Link to="/cats">Cats</Link></li>
            <li><Link to="/pets">Available Pets</Link></li>
            <li><Link to="/pet-care">Pet Care Tips</Link></li>
            <li><Link to="/reviews">Member Reviews</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="footer-heading">Get Involved</h2>
          <ul className="footer-links">
            <li><Link to="/adopt">Adopt a Pet</Link></li>
            <li><Link to="/release">Release a Pet</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/mission">Our Mission</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="footer-heading">Contact</h2>
          <address className="footer-address">
            <ul className="footer-contact">
              <li><ContactIcon name="location" size={18} /><span>{contactInfo.address}</span></li>
              <li><ContactIcon name="phone" size={18} /><a href={contactInfo.phone.href}>{contactInfo.phone.label}</a></li>
              <li>
                <ContactIcon name="whatsapp" size={18} />
                <a href={contactInfo.whatsapp.href} target="_blank" rel="noopener noreferrer">
                  {contactInfo.whatsapp.label} (WhatsApp)<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
              <li><ContactIcon name="email" size={18} /><a href={contactInfo.email.href}>{contactInfo.email.label}</a></li>
            </ul>
          </address>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>&copy; {new Date().getFullYear()} Pet Heaven. Student demonstration project: all contact details, pets and reviews are fictional.</p>
      </div>
    </footer>
  );
}
