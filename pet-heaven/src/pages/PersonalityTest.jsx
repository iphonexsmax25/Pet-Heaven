import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import PetImage from '../components/PetImage';
import { usePets } from '../context/PetsContext';
import {
  STEPS,
  emptyTest,
  getPersonalityMatches,
  isQuestionAnswered,
  isStepComplete,
  loadPersonalityTest,
  savePersonalityTest,
} from '../utils/personalityTest';
import '../styles/pet-matching.css';
import '../styles/personality-test.css';

function MatchCard({ match }) {
  const { pet, matchPercentage, reason } = match;
  return (
    <article className="pet-card match-card">
      <Link to={`/pets/${pet.id}`} className="match-card-image" aria-label={`View ${pet.name}'s profile`}>
        <PetImage src={pet.image} imageId={pet.imageId} alt={pet.name} />
      </Link>
      <div className="match-card-body">
        <div className="match-card-heading">
          <div>
            <h3>{pet.name}</h3>
            <p className="pet-meta">{pet.breed}</p>
          </div>
          <span className="match-score" aria-label={`${matchPercentage}% compatible`}>{matchPercentage}%</span>
        </div>
        <p className="match-reason">{reason}</p>
        <div className="button-row">
          <Link to={`/pets/${pet.id}`} className="btn btn-outline btn-sm">View Profile</Link>
          <Link to={`/adopt?pet=${encodeURIComponent(pet.id)}`} className="btn btn-primary btn-sm">Apply</Link>
        </div>
      </div>
    </article>
  );
}

export default function PersonalityTest() {
  const { pets } = usePets();
  const [test, setTest] = useState(loadPersonalityTest);
  const [error, setError] = useState('');
  const [storageError, setStorageError] = useState('');
  const headingRef = useRef(null);
  const firstRender = useRef(true);

  const { answers, step, completed } = test;
  const current = STEPS[step];

  // Results are always worked out from the live animal list, so Pending and Adopted animals never appear
  const matches = useMemo(() => (completed ? getPersonalityMatches(pets, answers) : []), [completed, pets, answers]);

  // Save answers, position and results in localStorage
  useEffect(() => {
    const results = matches.map(({ pet, matchPercentage, reason }) => ({ id: pet.id, matchPercentage, reason }));
    setStorageError(savePersonalityTest({ ...test, results }) ? '' : 'Your answers could not be saved in this browser, but the test still works.');
  }, [test, matches]);

  // Move keyboard focus to the new step or the results heading
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    if (headingRef.current) headingRef.current.focus();
  }, [step, completed]);

  const setAnswer = (question, value) => {
    setError('');
    setTest((previous) => {
      if (!question.multi) return { ...previous, answers: { ...previous.answers, [question.name]: value } };
      const chosen = previous.answers[question.name];
      const next = chosen.includes(value)
        ? chosen.filter((id) => id !== value)
        : chosen.length < question.maxChoices ? [...chosen, value] : chosen;
      return { ...previous, answers: { ...previous.answers, [question.name]: next } };
    });
  };

  const goNext = () => {
    if (!isStepComplete(current, answers)) {
      setError(current.questions.some((question) => question.multi)
        ? 'Please choose at least one trait to continue.'
        : 'Please answer every question on this page to continue.');
      return;
    }
    setError('');
    if (step === STEPS.length - 1) setTest((previous) => ({ ...previous, completed: true }));
    else setTest((previous) => ({ ...previous, step: previous.step + 1 }));
  };

  const goBack = () => {
    setError('');
    setTest((previous) => ({ ...previous, step: Math.max(previous.step - 1, 0) }));
  };

  const retake = () => {
    setError('');
    setTest(emptyTest());
  };

  const percent = completed ? 100 : Math.round((step / STEPS.length) * 100);

  return (
    <>
      <PageHeader
        title="Virtual Pet Personality Test"
        intro="Answer a few quick questions about your life and we will suggest the available animals that suit you best."
      />
      <section className="section">
        <div className="container narrow">
          {!completed ? (
            <div className="form-card pt-card">
              <div className="pt-progress">
                <div className="pt-progress-text">
                  <span>Step {step + 1} of {STEPS.length}</span>
                  <span>{percent}% complete</span>
                </div>
                <div
                  className="pt-progress-bar"
                  role="progressbar"
                  aria-label="Personality test progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={percent}
                >
                  <span style={{ width: `${percent}%` }} />
                </div>
              </div>

              <h2 className="pt-title" tabIndex={-1} ref={headingRef}>{current.title}</h2>
              <p className="pt-help">{current.help}</p>

              {current.questions.map((question) => {
                const missing = error && !isQuestionAnswered(question, answers);
                return (
                  <fieldset className="pt-fieldset" key={question.name} aria-describedby={missing ? 'pt-error' : undefined}>
                    <legend className="pt-legend">
                      {question.label}
                      {question.multi && <span className="pt-legend-note"> (choose up to {question.maxChoices})</span>}
                    </legend>
                    <div className="pt-options">
                      {question.options.map(([value, label, hint]) => {
                        const selected = question.multi ? answers[question.name].includes(value) : answers[question.name] === value;
                        const locked = question.multi && !selected && answers[question.name].length >= question.maxChoices;
                        return (
                          <label className={`pt-option${selected ? ' is-selected' : ''}${locked ? ' is-locked' : ''}`} key={value}>
                            <input
                              type={question.multi ? 'checkbox' : 'radio'}
                              name={question.name}
                              value={value}
                              checked={selected}
                              disabled={locked}
                              onChange={() => setAnswer(question, value)}
                            />
                            <span className="pt-option-text">
                              <strong>{label}</strong>
                              {hint && <small>{hint}</small>}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                );
              })}

              {error && <p className="error-text" id="pt-error" role="alert">{error}</p>}

              <div className="pt-actions">
                <button type="button" className="btn btn-outline" onClick={goBack} disabled={step === 0}>Back</button>
                <button type="button" className="btn btn-primary" onClick={goNext}>
                  {step === STEPS.length - 1 ? 'See my matches' : 'Next'}
                </button>
              </div>
              {storageError && <p className="error-text" role="status">{storageError}</p>}
            </div>
          ) : (
            <section className="match-results pt-results" aria-labelledby="pt-results-title">
              <div className="section-head">
                <h2 id="pt-results-title" tabIndex={-1} ref={headingRef}>Your top 3 matches</h2>
                <p>Only available animals that suit your home, space, children and existing pets are shown. This is guidance, not an adoption decision.</p>
              </div>
              {matches.length > 0 ? (
                <div className="pet-grid match-grid">
                  {matches.map((match) => <MatchCard key={match.pet.id} match={match} />)}
                </div>
              ) : (
                <div className="empty-state">
                  <p className="empty-icon" aria-hidden="true">🐾</p>
                  <h3>No suitable animals right now</h3>
                  <p>No available animal fits every home, space, children and pet requirement you chose. Try different answers or check back soon.</p>
                  <Link to="/pets" className="btn btn-outline">Browse all pets</Link>
                </div>
              )}
              <div className="button-row button-row-center pt-retake">
                <button type="button" className="btn btn-primary" onClick={retake}>Retake Test</button>
              </div>
              {storageError && <p className="error-text" role="status">{storageError}</p>}
            </section>
          )}
        </div>
      </section>
    </>
  );
}
