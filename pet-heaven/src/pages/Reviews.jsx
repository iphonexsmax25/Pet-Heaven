import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import ReviewCard from '../components/ReviewCard';
import FormInput from '../components/FormInput';
import CustomerOrPublicRoute from '../components/CustomerOrPublicRoute';
import useForm from '../hooks/useForm';
import { useAuth } from '../context/AuthContext';
import { sampleReviews } from '../data/reviews';
import { readStorage, writeStorage } from '../utils/storage';
import { todayISO } from '../utils/validators';

const REVIEWS_KEY = 'petheaven_reviews';
const REVIEW_DRAFT_KEY = 'petheaven_review_draft';

export default function Reviews() {
  const { currentUser: user, role } = useAuth();
  const canWriteReview = Boolean(user && role === 'customer');
  // Reviews saved by members are read from localStorage when the page loads
  const [savedReviews, setSavedReviews] = useState(() => readStorage(REVIEWS_KEY, []));
  const { values, errors, showErrors, handleChange, reset } = useForm({ rating: '', text: '' });
  const [posted, setPosted] = useState(false);

  useEffect(() => {
    if (role !== 'employee') return;
    try {
      window.localStorage.removeItem(REVIEW_DRAFT_KEY);
    } catch (error) {
      console.error('Could not clear the employee review draft from localStorage.', error);
    }
  }, [role]);

  // Newest first
  const allReviews = [...savedReviews, ...sampleReviews].sort((a, b) => (a.date < b.date ? 1 : -1));
  const average = allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canWriteReview) return;
    const found = {};
    if (!values.rating) found.rating = 'Please choose a star rating.';
    if (values.text.trim().length < 10) found.text = 'Please write at least 10 characters.';
    if (Object.keys(found).length > 0) {
      setPosted(false);
      showErrors(found);
      return;
    }
    const newReview = {
      id: `m${Date.now()}`, name: user.name, rating: Number(values.rating),
      text: values.text.trim(), date: todayISO(), pet: 'Member feedback',
    };
    const updated = [newReview, ...savedReviews];
    setSavedReviews(updated); // shows the new review immediately
    writeStorage(REVIEWS_KEY, updated);
    reset();
    setPosted(true);
  };

  const reviewsContent = (
    <>
      <PageHeader title="Member Reviews and Feedback" intro="Stories from families who found their friend through Pet Heaven." />

      <section className="section">
        <div className="container">
          <p className="rating-summary">
            <strong>{average.toFixed(1)}</strong> average from {allReviews.length} reviews
          </p>
          <div className="card-grid-3">
            {allReviews.map((review) => <ReviewCard key={review.id} review={review} />)}
          </div>
        </div>
      </section>

      <section className="section section-tint" aria-labelledby="write-title">
        <div className="container narrow-form">
          <h2 id="write-title" className="center-text">Write a review</h2>
          {canWriteReview ? (
            <form className="form-card" onSubmit={handleSubmit} noValidate aria-labelledby="write-title">
              {posted && <p className="success-message" role="status">✅ Thank you! Your review has been posted.</p>}
              <p className="posting-as">Posting as <strong>{user.name}</strong></p>

              <fieldset className={errors.rating ? 'rating-fieldset has-error' : 'rating-fieldset'}>
                <legend>Star rating <span className="req" aria-hidden="true">*</span></legend>
                <div className="star-picker">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <label key={n} className={Number(values.rating) >= n ? 'star-label on' : 'star-label'}>
                      <input type="radio" name="rating" value={n} checked={values.rating === String(n)} onChange={handleChange} />
                      <span aria-hidden="true">★</span>
                      <span className="sr-only">{n} {n === 1 ? 'star' : 'stars'}</span>
                    </label>
                  ))}
                </div>
                {errors.rating && <p className="error-text" role="alert">{errors.rating}</p>}
              </fieldset>

              <FormInput label="Your review" name="text" as="textarea" rows={5} value={values.text} onChange={handleChange} error={errors.text} required />
              <button type="submit" className="btn btn-primary btn-block">Post Review</button>
            </form>
          ) : (
            <div className="form-card center-text">
              <p>Please log in to share your feedback.</p>
              <div className="button-row button-row-center">
                <Link to="/login" className="btn btn-primary">Log in</Link>
                <Link to="/signup" className="btn btn-outline">Sign up</Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
  return <CustomerOrPublicRoute>{reviewsContent}</CustomerOrPublicRoute>;
}
