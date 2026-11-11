import '../styles/adoption-journey.css';
import { getJourney } from '../utils/adoptionJourney';
import { formatDate } from '../utils/validators';

const STATE_TEXT = { done: 'completed', current: 'current stage', upcoming: 'upcoming', stopped: 'stopped here' };

// Read-only progress timeline for one adoption application.
// Employees pass their move buttons as children; customers get the timeline only.
export default function AdoptionJourney({ application, children }) {
  const journey = getJourney(application);
  return (
    <div className="journey" role="group" aria-label={`Adoption journey for ${application.petName || 'pet'}`}>
      <div className={`journey-summary journey-summary-${journey.tone}`}>
        <span className="journey-badge">{journey.statusLabel}</span>
        {journey.date && <time className="journey-date" dateTime={journey.date}>{formatDate(journey.date)}</time>}
        <p className="journey-message">{journey.message}</p>
        {journey.stopped && <p className="journey-reason"><strong>Reason:</strong> {journey.reason}</p>}
      </div>
      <ol className="journey-steps">
        {journey.steps.map((step) => (
          <li key={step.key} className={`journey-step is-${step.state}`} aria-current={step.state === 'current' ? 'step' : undefined}>
            <span className="journey-marker" aria-hidden="true">
              {step.state === 'done' ? '✓' : step.state === 'stopped' ? '✕' : step.index + 1}
            </span>
            <span className="journey-label">{step.label}<span className="sr-only"> ({STATE_TEXT[step.state]})</span></span>
            {step.date && <time className="journey-step-date" dateTime={step.date}>{formatDate(step.date)}</time>}
          </li>
        ))}
      </ol>
      {children}
    </div>
  );
}