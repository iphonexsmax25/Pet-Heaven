import { formatDate } from '../utils/validators';

export function Stars({ rating }) {
  return (
    <span className="stars" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rating ? 'star on' : 'star'} aria-hidden="true">★</span>
      ))}
    </span>
  );
}

export default function ReviewCard({ review }) {
  const initials = review.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  return (
    <article className="review-card">
      <div className="review-head">
        <span className="avatar" aria-hidden="true">{initials}</span>
        <div>
          <h3>{review.name}</h3>
          <p className="review-sub">{review.pet ? `${review.pet} · ` : ''}<time dateTime={review.date}>{formatDate(review.date)}</time></p>
        </div>
      </div>
      <Stars rating={review.rating} />
      <p className="review-text">{review.text}</p>
    </article>
  );
}
