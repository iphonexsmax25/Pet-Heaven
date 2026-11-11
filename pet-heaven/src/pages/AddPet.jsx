import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import FormInput from '../components/FormInput';
import useForm from '../hooks/useForm';
import { usePets } from '../context/PetsContext';
import { useAuth } from '../context/AuthContext';
import { singaporeAreas, sizes, speciesOptions } from '../data/pets';
import { deleteImage, saveImage, validateImageFile } from '../utils/imageDb';

const startValues = {
  name: '', species: '', breed: '', age: '', gender: '', size: '',
  location: '', description: '',
};

const ageLabel = (years) => {
  if (years < 1) {
    const months = Math.max(1, Math.round(years * 12));
    return `${months} ${months === 1 ? 'month' : 'months'}`;
  }
  return years === 1 ? '1 year' : `${years} years`;
};
const ageCategoryFor = (years) => (years < 1 ? 'Baby' : years < 4 ? 'Young' : years < 8 ? 'Adult' : 'Senior');

export default function AddPet() {
  const { addPet } = usePets();
  const { currentUser } = useAuth();
  const { values, errors, showErrors, handleChange, reset } = useForm(startValues);
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const imageInputRef = useRef(null);
  const previewUrlRef = useRef('');
  const [saving, setSaving] = useState(false);
  const [successPet, setSuccessPet] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Revoke the current preview URL (if any) so the browser can free the memory.
  const revokePreview = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = '';
    }
  };

  // Revoke the last preview URL when the component unmounts.
  useEffect(() => revokePreview, []);

  const clearImage = () => {
    revokePreview();
    setPreviewUrl('');
    setImageFile(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  // The file is only checked here. It is saved to IndexedDB when the form is submitted.
  const handleImage = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return; // dialog cancelled: keep the current image
    const problem = validateImageFile(file);
    clearImage();
    if (problem) {
      setImageError(problem);
      return;
    }
    setImageError('');
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setPreviewUrl(url);
    setImageFile(file);
  };

  const removeImage = () => {
    clearImage();
    setImageError('');
    if (imageInputRef.current) imageInputRef.current.focus();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');
    const found = {};
    if (values.name.trim().length < 2) found.name = 'Please enter the pet\'s name.';
    if (!values.species) found.species = 'Please choose a species.';
    if (!values.breed.trim()) found.breed = 'Please enter the breed (or "Mixed").';
    const age = Number(values.age);
    if (values.age === '') found.age = 'Please enter the pet\'s age in years.';
    else if (Number.isNaN(age) || age < 0 || age > 30) found.age = 'Age must be a number between 0 and 30.';
    if (!values.gender) found.gender = 'Please choose a gender.';
    if (!values.size) found.size = 'Please choose a size.';
    if (!values.location) found.location = 'Please choose a location in Singapore.';
    if (values.description.trim().length < 10) found.description = 'Please describe the pet (at least 10 characters).';
    if (imageError) found.image = imageError;

    if (Object.keys(found).length > 0) {
      setSuccessPet('');
      showErrors(found);
      return;
    }

    if (!currentUser) {
      setSuccessPet('');
      setSubmitError('Please log in to add a pet, so we can link the pet to your account.');
      return;
    }

    setSaving(true);
    let imageId = '';
    if (imageFile) {
      try {
        imageId = await saveImage(imageFile);
      } catch (error) {
        setSaving(false);
        setSuccessPet('');
        setSubmitError('Could not save the image in this browser. Please try again or choose another image.');
        return;
      }
    }

    const description = values.description.trim();
    // The pet joins the fleet as "available". The status is set here, never chosen by the customer.
    const result = addPet({
      name: values.name.trim(),
      species: values.species,
      breed: values.breed.trim(),
      age: ageLabel(age),
      ageCategory: ageCategoryFor(age),
      gender: values.gender,
      size: values.size,
      location: `${values.location}, Singapore`,
      status: 'available',
      shortDescription: description.length > 110 ? `${description.slice(0, 107).trim()}...` : description,
      fullDescription: description,
      imageId, // only the image ID is saved in the pet record
      ownerUserId: currentUser.id, // lets this customer later request a release for this pet
    });
    setSaving(false);

    if (!result.ok) {
      if (imageId) deleteImage(imageId).catch(() => {});
      setSuccessPet('');
      setSubmitError(result.error);
      return;
    }
    setSuccessPet(result.pet.name);
    reset();
    clearImage();
    setImageError('');
  };

  return (
    <>
      <PageHeader title="Add a Pet" intro="Add a pet you care for to Pet Heaven so we can help find them a loving home. You can later ask to release a pet from your account." />
      <section className="section">
        <div className="container narrow-form wide">
          {successPet && (
            <p className="success-message" role="status">
              <strong>💛 Pet added.</strong> Thank you for trusting us with {successPet}. They now appear in our available pets. <Link to="/pets">View available pets</Link> or <Link to="/release">request a release</Link> any time.
            </p>
          )}
          {submitError && <p className="error-text error-banner" role="alert">{submitError}</p>}
          <form className="form-card" onSubmit={handleSubmit} noValidate aria-label="Add a pet form">
            <fieldset>
              <legend>Pet details</legend>
              <div className="form-grid">
                <FormInput label="Pet name" name="name" value={values.name} onChange={handleChange} error={errors.name} required />
                <FormInput label="Species" name="species" as="select" value={values.species} onChange={handleChange} error={errors.species} required>
                  <option value="">Select…</option>
                  {speciesOptions.map((item) => <option key={item}>{item}</option>)}
                </FormInput>
                <FormInput label="Breed" name="breed" value={values.breed} onChange={handleChange} error={errors.breed} required />
                <FormInput label="Age (years)" name="age" type="number" min="0" max="30" step="0.5" inputMode="decimal" value={values.age} onChange={handleChange} error={errors.age} required hint="Use 0.5 for six months." />
                <FormInput label="Gender" name="gender" as="select" value={values.gender} onChange={handleChange} error={errors.gender} required>
                  <option value="">Select…</option>
                  <option>Male</option>
                  <option>Female</option>
                </FormInput>
                <FormInput label="Size" name="size" as="select" value={values.size} onChange={handleChange} error={errors.size} required>
                  <option value="">Select…</option>
                  {sizes.map((item) => <option key={item}>{item}</option>)}
                </FormInput>
                <FormInput label="Location (Singapore)" name="location" as="select" value={values.location} onChange={handleChange} error={errors.location} required>
                  <option value="">Select…</option>
                  {singaporeAreas.map((item) => <option key={item}>{item}</option>)}
                </FormInput>
              </div>
            </fieldset>

            <fieldset>
              <legend>About the pet</legend>
              <FormInput label="Description" name="description" as="textarea" rows={4} value={values.description} onChange={handleChange} error={errors.description} required hint="Personality, habits, health and how they get along with children or other pets." />
              <div className={`form-field pet-image-field${imageError || errors.image ? ' has-error' : ''}`}>
                <span className="pet-image-title">Pet image (optional)</span>
                <div className={`pet-image-upload${imageError || errors.image ? ' has-error' : ''}`}>
                  <input
                    ref={imageInputRef} id="pet-image" name="image" className="pet-image-input" type="file"
                    accept="image/jpeg,image/png,image/webp" onChange={handleImage}
                    aria-invalid={imageError || errors.image ? 'true' : 'false'}
                    aria-describedby={imageError || errors.image ? 'pet-image-error' : undefined}
                  />
                  {!previewUrl ? (
                    <label htmlFor="pet-image" className="pet-image-dropzone">
                      <svg className="pet-image-icon" viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="3" y="4" width="18" height="16" rx="3" />
                        <circle cx="9" cy="10" r="1.8" />
                        <path d="m4 18 5-5 4 4 3-3 4 4" />
                      </svg>
                      <span className="btn btn-primary pet-image-choose">Choose Pet Image</span>
                      <span className="pet-image-file-name">No file chosen</span>
                      <span className="pet-image-helper">JPG, PNG or WebP, maximum 20 MB.</span>
                    </label>
                  ) : (
                    <div className="pet-image-preview">
                      <img src={previewUrl} alt={`Preview of the selected pet image: ${imageFile ? imageFile.name : 'pet'}`} />
                      <p className="pet-image-file-name" title={imageFile ? imageFile.name : undefined}>{imageFile ? imageFile.name : ''}</p>
                      <div className="pet-image-actions">
                        <label htmlFor="pet-image" className="btn btn-outline pet-image-change">Change image</label>
                        <button type="button" className="btn btn-ghost pet-image-remove" onClick={removeImage}>Remove image</button>
                      </div>
                    </div>
                  )}
                </div>
                {(imageError || errors.image) && <p id="pet-image-error" className="error-text" role="alert">{imageError || errors.image}</p>}
              </div>
            </fieldset>

            <button type="submit" className="btn btn-primary btn-block" disabled={saving}>{saving ? 'Saving…' : 'Add Pet'}</button>
            <p className="note-text">Your pet details are saved only in this browser (localStorage) and the image in IndexedDB. Nothing is sent to any server.</p>
          </form>
        </div>
      </section>
    </>
  );
}
