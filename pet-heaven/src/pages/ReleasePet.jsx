import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import FormInput from '../components/FormInput';
import useForm from '../hooks/useForm';
import { useAuth } from '../context/AuthContext';
import { usePets } from '../context/PetsContext';
import { releaseSource, sourceLabel, statusLabel } from '../utils/petRules';

const reasons = ['Moving or relocating', 'Allergies or health', 'Cost of care', 'Not enough time', 'Other'];

// One Release Pet form for both kinds of pet:
//   "owned"   - a pet this customer added to Pet Heaven (pet.ownerUserId === currentUser.id)
//   "adopted" - a pet this customer adopted through Pet Heaven (pet.adoptedByUserId === currentUser.id)
// Submitting creates a pending release request. The pet itself is not changed until an employee approves it.
export default function ReleasePet() {
  const { currentUser } = useAuth();
  const { pets, releaseRequests, submitReleaseRequest } = usePets();
  const [searchParams] = useSearchParams();
  const { values, errors, showErrors, handleChange, reset } = useForm({ petId: searchParams.get('pet') || '', reason: '', details: '' });
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(null);

  const hasPending = (pet) => releaseRequests.some((item) => String(item.petId) === String(pet.id) && item.status === 'pending');
  const eligible = pets.filter((pet) => releaseSource(pet, currentUser));
  const chosen = eligible.find((pet) => String(pet.id) === String(values.petId));
  const source = chosen ? releaseSource(chosen, currentUser) : '';

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitError('');
    setSubmitted(null);
    const found = {};
    if (!values.petId) found.petId = 'Please choose the pet you want to release.';
    else if (!chosen) found.petId = 'You can only release a pet that you added or adopted yourself.';
    else if (hasPending(chosen)) found.petId = `There is already a pending release request for ${chosen.name}.`;
    if (!values.reason) found.reason = 'Please choose a reason.';
    if (values.details.trim().length < 10) found.details = 'Please add a few details (at least 10 characters).';
    if (Object.keys(found).length > 0) {
      showErrors(found);
      return;
    }

    const result = submitReleaseRequest({
      petId: chosen.id, user: currentUser, reason: values.reason, details: values.details.trim(),
    });
    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }
    setSubmitted(result.request);
    reset();
  };

  return (
    <>
      <PageHeader title="Release a Pet" intro="If you can no longer care for a pet you added or adopted, send a release request. A Pet Heaven employee will review it." />
      <section className="section">
        <div className="container narrow-form wide">
          {submitted && (
            <p className="success-message" role="status">
              <strong>💛 Release request sent.</strong> Thank you. An employee will review the request for {submitted.petName}.
              Until it is approved, {submitted.petName} stays {submitted.sourceType === 'adopted' ? 'adopted' : 'in the fleet'} and nothing changes.{' '}
              <Link to="/profile">View my requests</Link>
            </p>
          )}
          {submitError && <p className="error-text error-banner" role="alert">{submitError}</p>}

          {eligible.length === 0 ? (
            <div className="info-box">
              <p>
                You have no pets to release yet. You can release a pet you added to Pet Heaven or a pet you adopted through us.{' '}
                <Link to="/add-pet">Add a pet</Link> or <Link to="/pets">find a pet to adopt</Link>.
              </p>
            </div>
          ) : (
            <form className="form-card" onSubmit={handleSubmit} noValidate aria-label="Release a pet form">
              <fieldset>
                <legend>Which pet?</legend>
                <div className="form-grid">
                  <FormInput label="Pet" name="petId" as="select" value={values.petId} onChange={handleChange} error={errors.petId} required>
                    <option value="">Select…</option>
                    {eligible.map((pet) => (
                      <option key={pet.id} value={pet.id} disabled={hasPending(pet)}>
                        {pet.name} ({sourceLabel(releaseSource(pet, currentUser)).toLowerCase()}{hasPending(pet) ? ', request pending' : ''})
                      </option>
                    ))}
                  </FormInput>
                  <FormInput
                    label="Source" name="sourceType" value={source} readOnly
                    onChange={() => {}} hint="Set automatically: “owned” if you added the pet, “adopted” if you adopted it."
                    placeholder="Choose a pet first"
                  />
                </div>
                {chosen && <p className="note-text">Current status: {statusLabel(chosen.status)}. It does not change until an employee approves your request.</p>}
              </fieldset>

              <fieldset>
                <legend>Your request</legend>
                <FormInput label="Reason" name="reason" as="select" value={values.reason} onChange={handleChange} error={errors.reason} required>
                  <option value="">Select…</option>
                  {reasons.map((item) => <option key={item}>{item}</option>)}
                </FormInput>
                <FormInput label="Details" name="details" as="textarea" rows={4} value={values.details} onChange={handleChange} error={errors.details} required hint="Tell us what happened and anything we should know about the pet." />
              </fieldset>

              <button type="submit" className="btn btn-primary btn-block">Send Release Request</button>
              <p className="note-text">
                If your request is approved, the pet becomes available for adoption again. Anyone can apply to adopt, including you, through the normal adoption process.
                Your request is saved only in this browser (localStorage). Nothing is sent to any server.
              </p>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
