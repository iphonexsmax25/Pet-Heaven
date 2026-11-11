import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import FormInput from '../components/FormInput';
import useForm from '../hooks/useForm';
import { usePets } from '../context/PetsContext';
import { appendToList } from '../utils/storage';
import { getApplications, isActiveApplication } from '../utils/adminData';
import { ALREADY_ADOPTED_MESSAGE, normalizeEmail } from '../utils/petRules';
import { isEmail, isSingaporePhone } from '../utils/validators';
import { useAuth } from '../context/AuthContext';

export default function AdoptPet() {
  const [searchParams] = useSearchParams();
  const { currentUser: user } = useAuth();
  const { pets, getPet } = usePets();
  // Only available pets can be adopted, including by customers who previously released them.
  const availablePets = pets.filter((pet) => pet.status === 'available');

  // If we arrived from a pet page (/adopt?pet=3), pre-select that pet
  const requestedId = searchParams.get('pet');
  const preselected = availablePets.find((pet) => String(pet.id) === requestedId);
  const requestedPet = requestedId ? getPet(requestedId) : null;
  let blockedNotice = '';
  if (requestedPet && !preselected) {
    blockedNotice = requestedPet.status === 'adopted'
      ? ALREADY_ADOPTED_MESSAGE
      : 'This pet is not available for adoption right now.';
  }

  const startValues = {
    fullName: user ? user.name : '', email: user ? user.email : '', phone: '', address: '',
    housing: '', experience: '', petId: preselected ? String(preselected.id) : '',
    reason: '', careAbility: '', agree: false,
  };
  const { values, errors, showErrors, handleChange, reset } = useForm(startValues);
  const [successName, setSuccessName] = useState('');
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitError('');

    if (!user || user.role !== 'customer') {
      setSuccessName('');
      setSubmitError(user
        ? 'Only customer accounts can submit adoption applications.'
        : 'Please sign up or log in to apply for adoption.');
      return;
    }

    // Rule check first, using the saved pet record (not just what the page shows).
    const chosenPet = values.petId ? getPet(values.petId) : null;

    // An adopted pet can never be adopted again, even if the form was opened from its address
    const adoptedTarget = [chosenPet, !chosenPet ? requestedPet : null].find((item) => item && item.status === 'adopted');
    if (adoptedTarget) {
      setSuccessName('');
      setSubmitError(ALREADY_ADOPTED_MESSAGE);
      return;
    }

    const found = {};
    if (values.fullName.trim().length < 2) found.fullName = 'Please enter your full name.';
    if (!values.email.trim()) found.email = 'Please enter your email.';
    else if (!isEmail(values.email)) found.email = 'Please enter a valid email, like name@example.com.';
    if (!values.phone.trim()) found.phone = 'Please enter your phone number.';
    else if (!isSingaporePhone(values.phone)) found.phone = 'Enter a Singapore number, e.g. 9123 4567 or +65 9123 4567.';
    if (values.address.trim().length < 10) found.address = 'Please enter your full address (at least 10 characters).';
    if (!values.housing) found.housing = 'Please choose your housing type.';
    if (!values.experience) found.experience = 'Please tell us about your pet experience.';
    if (!values.petId) found.petId = 'Please select the pet you would like to adopt.';
    if (values.reason.trim().length < 20) found.reason = 'Please tell us why you want to adopt (at least 20 characters).';
    if (values.careAbility.trim().length < 20) found.careAbility = 'Please describe how you will care for the pet (at least 20 characters).';
    if (!values.agree) found.agree = 'You must agree to the adoption terms to continue.';

    if (Object.keys(found).length > 0) {
      setSuccessName('');
      showErrors(found);
      return;
    }

    const pet = getPet(values.petId);
    if (pet && pet.status === 'adopted') {
      setSubmitError(ALREADY_ADOPTED_MESSAGE);
      return;
    }
    if (!pet || pet.status !== 'available') {
      showErrors({ petId: 'That pet is no longer available. Please choose another.' });
      return;
    }

    // One open application per person for each pet
    const alreadyApplied = getApplications().some((item) =>
      String(item.petId) === String(pet.id)
      && isActiveApplication(item)
      && (item.applicantUserId
        ? item.applicantUserId === user.id
        : normalizeEmail(item.email) === normalizeEmail(user.email)));
    if (alreadyApplied) {
      setSuccessName('');
      setSubmitError('You already have an application for this pet.');
      return;
    }

    // Saved in this browser so the Profile and Adoption history pages can list it
    const submittedAt = new Date().toISOString();
    const saved = appendToList('petheaven_applications', {
      id: `app-${Date.now().toString(36)}`, email: normalizeEmail(values.email), applicantUserId: user ? user.id : '',
      fullName: values.fullName.trim(), phone: values.phone.trim(),
      petId: pet.id, petName: pet.name, status: 'Pending', stage: 0, stageDates: { 0: submittedAt },
      stageUpdatedAt: submittedAt, journeyVersion: 2, submittedAt,
    });
    if (!saved) {
      setSubmitError('Could not save your application. Browser storage may be full or blocked.');
      return;
    }
    setSuccessName(pet.name);
    reset();
  };

  return (
    <>
      <PageHeader title="Adoption Application" intro="Tell us about your home so we can match you with the perfect companion." />
      <section className="section">
        <div className="container narrow-form wide">
          {successName && (
            <div className="success-message" role="status">
              <strong>🎉 Application received!</strong> Thank you. We saved your application for {successName} and our team will contact you soon.
              <div><Link to="/profile">View my profile</Link></div>
            </div>
          )}
          {blockedNotice && <p className="error-text error-banner" role="alert">{blockedNotice}</p>}
          {submitError && <p className="error-text error-banner" role="alert">{submitError}</p>}
          <form className="form-card" onSubmit={handleSubmit} noValidate aria-label="Adoption application form">
            <fieldset>
              <legend>Applicant details</legend>
              <div className="form-grid">
                <FormInput label="Full name" name="fullName" value={values.fullName} onChange={handleChange} error={errors.fullName} required autoComplete="name" />
                <FormInput label="Email" name="email" type="email" value={values.email} onChange={handleChange} error={errors.email} required autoComplete="email" />
                <FormInput label="Phone number" name="phone" type="tel" value={values.phone} onChange={handleChange} error={errors.phone} required autoComplete="tel" hint="Singapore number, e.g. 9123 4567" />
              </div>
              <FormInput label="Home address" name="address" value={values.address} onChange={handleChange} error={errors.address} required autoComplete="street-address" />
            </fieldset>

            <fieldset>
              <legend>Home and experience</legend>
              <div className="form-grid">
                <FormInput label="Housing type" name="housing" as="select" value={values.housing} onChange={handleChange} error={errors.housing} required>
                  <option value="">Select…</option>
                  <option>HDB flat</option>
                  <option>Condominium</option>
                  <option>Landed property</option>
                  <option>Other</option>
                </FormInput>
                <FormInput label="Pet ownership experience" name="experience" as="select" value={values.experience} onChange={handleChange} error={errors.experience} required>
                  <option value="">Select…</option>
                  <option>First-time owner</option>
                  <option>Some experience</option>
                  <option>Experienced owner</option>
                </FormInput>
              </div>
            </fieldset>

            <fieldset>
              <legend>About the adoption</legend>
              <FormInput label="Pet you would like to adopt" name="petId" as="select" value={values.petId} onChange={handleChange} error={errors.petId} required>
                <option value="">Select a pet…</option>
                {availablePets.map((pet) => (
                  <option key={pet.id} value={pet.id}>{pet.name} ({pet.breed})</option>
                ))}
              </FormInput>
              <FormInput label="Why do you want to adopt?" name="reason" as="textarea" rows={4} value={values.reason} onChange={handleChange} error={errors.reason} required />
              <FormInput label="How will you care for the pet?" name="careAbility" as="textarea" rows={4} value={values.careAbility} onChange={handleChange} error={errors.careAbility} required
                hint="Think about time, budget, vet care and who looks after the pet when you travel." />
              <FormInput label="I agree to the adoption terms and confirm all information is accurate." name="agree" type="checkbox" value={values.agree} onChange={handleChange} error={errors.agree} />
            </fieldset>

            <button type="submit" className="btn btn-primary btn-block">Submit Application</button>
            <p className="note-text">Your application is saved only in this browser (localStorage). This is a demonstration, so no real adoption is processed.</p>
          </form>
        </div>
      </section>
    </>
  );
}
