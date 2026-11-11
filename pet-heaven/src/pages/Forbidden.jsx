import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

export default function Forbidden() {
  return (
    <>
      <PageHeader title="403 Forbidden" intro="Access denied" />
      <section className="section">
        <div className="container narrow center-text">
          <p className="empty-icon" aria-hidden="true">🔒</p>
          <p>This area is for Pet Heaven employees only. Your account does not have permission to view it.</p>
          <div className="button-row button-row-center">
            <Link to="/" className="btn btn-primary">Back to Home</Link>
          </div>
        </div>
      </section>
    </>
  );
}
