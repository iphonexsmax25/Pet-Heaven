import { Fragment, useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import AdoptionJourney from '../components/AdoptionJourney';
import { usePets } from '../context/PetsContext';
import { addNotification, APPLICATIONS_KEY, getApplications, updateApplication } from '../utils/adminData';
import { JOURNEY_STAGES, LAST_STAGE, getJourney, journeyPatch, stopPatch } from '../utils/adoptionJourney';
import { formatDate } from '../utils/validators';

export default function AdminApplications() {
  const { getPet, updatePet, completeAdoption, reopenCompletedAdoption } = usePets();
  const [applications, setApplications] = useState(getApplications);
  const [decisions, setDecisions] = useState({});
  const [reasons, setReasons] = useState({});
  const [message, setMessage] = useState('');

  const refresh = () => setApplications(getApplications());

  useEffect(() => {
    const syncApplications = (event) => {
      if (!event.key || event.key === APPLICATIONS_KEY) refresh();
    };
    window.addEventListener('storage', syncApplications);
    return () => window.removeEventListener('storage', syncApplications);
  }, []);

  const rejectApplication = (application) => {
    if (getJourney(application).stage !== 0 || application.status !== 'Pending') return;
    const reason = (reasons[application.id] || '').trim();
    if (!window.confirm(`Reject the application for ${application.petName}?${reason ? `\n\nReason: ${reason}` : ''}`)) return;
    if (!updateApplication(application.id, { status: 'Rejected', ...stopPatch(application, reason) })) {
      setMessage('Could not save the change. Browser storage may be full or blocked.');
      return;
    }
    addNotification({
      to: application.email,
      subject: `Your adoption application for ${application.petName} was rejected`,
      body: `Thank you for applying. We are unable to proceed with this application.${reason ? ` Reason: ${reason}` : ''}`,
    });
    setDecisions((current) => ({ ...current, [application.id]: '' }));
    refresh();
    setMessage(`Application for ${application.petName} rejected. A notification was logged for ${application.email}.`);
  };

  const complete = (application) => {
    const pet = getPet(application.petId);
    if (!pet) {
      setMessage('Pet not found.');
      return;
    }
    const completedAt = new Date().toISOString();
    const patch = journeyPatch(application, LAST_STAGE, {
      status: 'Completed',
      completedAt,
    });
    if (!updateApplication(application.id, patch)) {
      setMessage('Could not save the change. Browser storage may be full or blocked.');
      return;
    }
    const result = completeAdoption(application.petId, application);
    if (!result.ok) {
      const restored = updateApplication(application.id, {
        ...application,
        completedAt: application.completedAt || '',
      });
      setMessage(restored
        ? result.error
        : `${result.error} The application status could not be restored; refresh the page and check its saved status.`);
      return;
    }
    getApplications()
      .filter((item) => String(item.petId) === String(application.petId) && item.id !== application.id && item.status === 'Pending')
      .forEach((item) => {
        updateApplication(item.id, { status: 'Rejected', ...stopPatch(item, `${item.petName} has found a home.`) });
        addNotification({
          to: item.email,
          subject: `Your adoption application for ${item.petName} was rejected`,
          body: `${item.petName} has found a home. Thank you for applying.`,
        });
      });
    addNotification({
      to: application.email,
      subject: `Your adoption of ${application.petName} is complete`,
      body: `Congratulations! ${application.petName} is now officially adopted.`,
    });
    refresh();
    setMessage(`${application.petName} is now marked as adopted.`);
  };

  const moveStage = (application, direction) => {
    const { stage, stopped, complete: finished } = getJourney(application);
    const target = stage + direction;
    if (stopped || target < 0 || target > LAST_STAGE || (finished && direction > 0)) return;

    if (direction > 0 && stage === 0) {
      if (decisions[application.id] !== 'approve') return;
      if (!window.confirm(`Approve the application for ${application.petName} and move it to Meet & Greet?`)) return;
      const pet = getPet(application.petId);
      if (!pet || pet.status !== 'available') {
        setMessage(`${application.petName} is not available any more, so this application cannot be approved.`);
        return;
      }
      const patch = journeyPatch(application, 1, { status: 'Approved', visitDate: '' });
      if (!updateApplication(application.id, patch)) {
        setMessage('Could not save the change. Browser storage may be full or blocked.');
        return;
      }
      const petUpdate = updatePet(application.petId, { status: 'pending' });
      if (!petUpdate.ok) {
        const restored = updateApplication(application.id, application);
        setMessage(restored
          ? petUpdate.error
          : `${petUpdate.error} The application status could not be restored; refresh the page and check its saved status.`);
        return;
      }
      addNotification({
        to: application.email,
        subject: `Your adoption application for ${application.petName} was approved`,
        body: `Good news! Your application has been approved and moved to the Meet & Greet stage.`,
      });
      setDecisions((current) => ({ ...current, [application.id]: '' }));
      refresh();
      setMessage(`Application for ${application.petName} approved and moved to Meet & Greet.`);
      return;
    }

    const targetLabel = JOURNEY_STAGES[target].label;
    const directionText = direction > 0 ? 'forward' : 'back';
    if (!window.confirm(`Move the application for ${application.petName} ${directionText} to ${targetLabel}?`)) return;

    if (direction > 0 && target === LAST_STAGE) {
      complete(application);
      return;
    }

    if (finished && direction < 0) {
      const patch = journeyPatch(application, target, {
        status: 'Approved',
        completedAt: '',
      });
      if (!updateApplication(application.id, patch)) {
        setMessage('Could not save the change. Browser storage may be full or blocked.');
        return;
      }
      const result = reopenCompletedAdoption(application.petId, application);
      if (!result.ok) {
        const restored = updateApplication(application.id, application);
        setMessage(restored
          ? result.error
          : `${result.error} The application status could not be restored; refresh the page and check its saved status.`);
        return;
      }
      refresh();
      setMessage(`Application for ${application.petName} moved back to ${targetLabel}.`);
      return;
    }

    const backToReview = direction < 0 && target === 0;
    const patch = journeyPatch(application, target, backToReview
      ? { status: 'Pending', visitDate: '' }
      : {});
    if (!updateApplication(application.id, patch)) {
      setMessage('Could not save the change. Browser storage may be full or blocked.');
      return;
    }
    if (backToReview && application.petId !== undefined) {
      const pet = getPet(application.petId);
      const heldByOther = getApplications().some((item) => item.id !== application.id
        && String(item.petId) === String(application.petId) && item.status === 'Approved');
      if (pet && pet.status === 'pending' && !heldByOther) {
        const petUpdate = updatePet(application.petId, { status: 'available' });
        if (!petUpdate.ok) {
          const restored = updateApplication(application.id, application);
          setMessage(restored
            ? petUpdate.error
            : `${petUpdate.error} The application status could not be restored; refresh the page and check its saved status.`);
          return;
        }
      }
      setDecisions((current) => ({ ...current, [application.id]: '' }));
    }
    refresh();
    setMessage(`Application for ${application.petName} moved to ${targetLabel}.`);
  };

  return (
    <>
      <PageHeader title="Adoption Applications" intro="Review applications submitted by customers." />
      <section className="section">
        <div className="container">
          {message && <p className="notice" role="status">{message}</p>}
          {applications.length === 0 ? (
            <div className="info-box"><p>No applications yet.</p></div>
          ) : (
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Applicant</th><th>Pet</th><th>Submitted</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {applications.map((item) => {
                    const journey = getJourney(item);
                    const decision = decisions[item.id] || '';
                    return (
                      <Fragment key={item.id}>
                        <tr className="journey-parent">
                          <td>{item.fullName || item.email}<br /><small>{item.email}</small></td>
                          <td>{item.petName}</td>
                          <td>{formatDate(item.submittedAt)}</td>
                          <td>{item.status}</td>
                        </tr>
                        <tr className="journey-row">
                          <td colSpan={4}>
                            <AdoptionJourney application={item}>
                              <div className="journey-controls">
                                {journey.stopped ? (
                                  <p className="journey-note">A stopped application cannot be moved.</p>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      className="btn btn-outline btn-sm"
                                      disabled={journey.stage === 0}
                                      onClick={() => moveStage(item, -1)}
                                    >{journey.stage === 0 ? 'Move back' : `← Back to ${JOURNEY_STAGES[journey.stage - 1].label}`}</button>
                                    {journey.stage === 0 && (
                                      <>
                                        <button
                                          type="button"
                                          className={`btn btn-sm ${decision === 'approve' ? 'btn-primary' : 'btn-outline'}`}
                                          aria-pressed={decision === 'approve'}
                                          onClick={() => setDecisions((current) => ({ ...current, [item.id]: 'approve' }))}
                                        >Approve</button>
                                        <button
                                          type="button"
                                          className={`btn btn-sm ${decision === 'reject' ? 'btn-primary' : 'btn-outline'}`}
                                          aria-pressed={decision === 'reject'}
                                          onClick={() => setDecisions((current) => ({ ...current, [item.id]: 'reject' }))}
                                        >Reject</button>
                                        {decision === 'reject' && (
                                          <>
                                            <input
                                              type="text"
                                              maxLength={140}
                                              placeholder="Rejection reason (optional)"
                                              value={reasons[item.id] || ''}
                                              aria-label={`Optional rejection reason for ${item.petName}`}
                                              onChange={(event) => setReasons((current) => ({ ...current, [item.id]: event.target.value }))}
                                            />
                                            <button type="button" className="btn btn-outline btn-sm" onClick={() => rejectApplication(item)}>
                                              Reject application
                                            </button>
                                          </>
                                        )}
                                      </>
                                    )}
                                    {!journey.complete && (
                                      <button
                                        type="button"
                                        className="btn btn-primary btn-sm"
                                        disabled={journey.stage === 0 && decision !== 'approve'}
                                        onClick={() => moveStage(item, 1)}
                                      >{`Move to ${JOURNEY_STAGES[journey.stage + 1].label} →`}</button>
                                    )}
                                  </>
                                )}
                              </div>
                            </AdoptionJourney>
                          </td>
                        </tr>
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
