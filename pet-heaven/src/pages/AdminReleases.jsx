import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { usePets } from '../context/PetsContext';
import { addNotification } from '../utils/adminData';
import { sourceLabel, statusLabel } from '../utils/petRules';
import { formatDate } from '../utils/validators';

const requestLabel = (status) => (status === 'pending'
  ? 'Pending Review'
  : status.charAt(0).toUpperCase() + status.slice(1));

// Release requests sent by customers. Employees must open a request to review it
// before they can approve or reject it. A pet is never released without a pending request.
export default function AdminReleases() {
  const { releaseRequests, getPet, markReleaseRequestReviewed, approveRelease, rejectRelease } = usePets();
  const { currentUser } = useAuth();
  const [openId, setOpenId] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');

  // Pending requests first, then newest first
  const sorted = [...releaseRequests].sort((a, b) => {
    if ((a.status === 'pending') !== (b.status === 'pending')) return a.status === 'pending' ? -1 : 1;
    return new Date(b.submittedAt) - new Date(a.submittedAt);
  });
  const pendingCount = releaseRequests.filter((request) => request.status === 'pending').length;
  const openRequest = releaseRequests.find((request) => request.id === openId);

  // Opening a request is the review step
  const handleOpen = (request) => {
    setMessage('');
    setNote('');
    if (request.status === 'pending') {
      const result = markReleaseRequestReviewed(request.id, currentUser);
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
    }
    setOpenId(request.id);
  };

  const handleApprove = (requestId) => {
    const request = releaseRequests.find((item) => item.id === requestId);
    const result = approveRelease(requestId, currentUser);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setMessage(`${request.petName} release approved. ${request.petName} is now available for adoption.`);
    if (request.requestedByEmail) {
      addNotification({
        to: request.requestedByEmail,
        subject: `Your release request for ${request.petName} was approved`,
        body: `${request.petName} is now available for adoption by other customers.`,
      });
    }
  };

  const handleReject = (requestId) => {
    const request = releaseRequests.find((item) => item.id === requestId);
    const result = rejectRelease(requestId, currentUser, note);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setMessage(`The release request for ${request.petName} was rejected. The pet was not changed.`);
    if (request.requestedByEmail) {
      addNotification({
        to: request.requestedByEmail,
        subject: `Your release request for ${request.petName} was not approved`,
        body: note.trim() ? `Note from our team: ${note.trim()}` : 'Our team could not approve this release request.',
      });
    }
  };

  const pet = openRequest ? getPet(openRequest.petId) : null;
  // The only way to enable "Approve release": a request for this pet with status "pending"
  const pendingRequest = openRequest
    ? releaseRequests.find((request) => String(request.petId) === String(openRequest.petId) && request.status === 'pending')
    : null;

  return (
    <>
      <PageHeader title="Pet Releases" intro="Review release requests from customers. Open a request to review it, then approve or reject it. An approved pet becomes available for anyone to adopt." />
      <section className="section">
        <div className="container">
          {message && <p className="notice" role="status">{message}</p>}

          {openRequest && (
            <div className="info-box" aria-labelledby="release-review-title">
              <h2 id="release-review-title">Review: {openRequest.petName}</h2>
              <ul className="record-list">
                <li><strong>Pet</strong> <span>{pet ? <Link to={`/pets/${pet.id}`}>{pet.name}</Link> : openRequest.petName}{pet ? ` · ${statusLabel(pet.status)}` : ''}</span></li>
                <li><strong>Source</strong> <span>{sourceLabel(openRequest.sourceType)} pet</span></li>
                <li><strong>Requested by</strong> <span>{openRequest.requestedByEmail || 'Unknown'}</span></li>
                <li><strong>Submitted</strong> <span>{formatDate(openRequest.submittedAt)}</span></li>
                <li><strong>Reason</strong> <span>{openRequest.reason}</span></li>
                <li><strong>Details</strong> <span>{openRequest.details}</span></li>
                <li><strong>Request status</strong> <span>{requestLabel(openRequest.status)}</span></li>
                {openRequest.decidedAt && <li><strong>Decided</strong> <span>{formatDate(openRequest.decidedAt)}{openRequest.decidedBy ? ` by ${openRequest.decidedBy}` : ''}</span></li>}
              </ul>
              {pendingRequest ? (
                <div className="form-field">
                  <label htmlFor="decision-note">Note to the customer (optional, used if you reject)</label>
                  <input id="decision-note" type="text" value={note} onChange={(event) => setNote(event.target.value)} maxLength={200} />
                </div>
              ) : (
                openRequest.decisionNote && <p className="note-text">Note: {openRequest.decisionNote}</p>
              )}
              <div className="monthly-buttons">
                <button type="button" className="btn btn-primary" disabled={!pendingRequest} onClick={() => handleApprove(pendingRequest.id)}>
                  Approve release
                </button>
                <button type="button" className="btn btn-outline" disabled={!pendingRequest} onClick={() => handleReject(pendingRequest.id)}>
                  Reject request
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setOpenId('')}>Close</button>
              </div>
            </div>
          )}

          {releaseRequests.length === 0 ? (
            <div className="info-box"><p>No release requests yet.</p></div>
          ) : (
            <>
              <p className="result-count" aria-live="polite"><strong>{pendingCount}</strong> pending {pendingCount === 1 ? 'request' : 'requests'}</p>
              <div className="table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr><th>Pet</th><th>Source</th><th>Requested by</th><th>Submitted</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {sorted.map((request) => (
                      <tr key={request.id}>
                        <td>{request.petName}</td>
                        <td>{sourceLabel(request.sourceType)}</td>
                        <td>{request.requestedByEmail}</td>
                        <td>{formatDate(request.submittedAt)}</td>
                        <td>{requestLabel(request.status)}</td>
                        <td>
                          <button type="button" className="btn btn-outline btn-sm" onClick={() => handleOpen(request)}>
                            {request.status === 'pending' ? 'Review' : 'View'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
