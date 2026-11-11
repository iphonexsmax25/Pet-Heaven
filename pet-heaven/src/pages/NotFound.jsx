import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="section">
      <div className="container narrow center-text">
        <p className="empty-icon" aria-hidden="true">🐾</p>
        <h1>404: Page not found</h1>
        <p>Oops! This page wandered off. The link may be broken or the page may have moved.</p>
        <div className="button-row button-row-center">
          <Link to="/" className="btn btn-primary">Back to Home</Link>
          <Link to="/dogs" className="btn btn-outline">Browse pets</Link>
        </div>
      </div>
    </section>
  );
}
