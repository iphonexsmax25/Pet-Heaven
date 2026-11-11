import { Link } from 'react-router-dom';
import { usePets } from '../context/PetsContext';
import { MATCH_CATEGORIES, petMatchesAny, petMatchesCategory } from '../utils/adoptionQuiz';

// Shows the quiz result: score, level, best matches, advice and the button to see matching animals.
// It is guidance only. It never approves or rejects an adoption application.
export default function QuizResult({ result, onRetake }) {
  const { pets } = usePets();
  const available = pets.filter((pet) => pet.status === 'available');
  const matchingCount = available.filter((pet) => petMatchesAny(pet, result.matches)).length;
  const matchLink = `/pets?match=${result.matches.join(',')}`;
  const { level } = result;

  return (
    <div className="quiz-result">
      <div className={`quiz-score-card quiz-tone-${level.tone}`}>
        <div className="quiz-score-number" aria-hidden="true">
          <strong>{result.score}</strong>
          <span>/ 100</span>
        </div>
        <div className="quiz-score-info">
          <h2 id="quiz-result-title" tabIndex={-1}>Your readiness score: {result.score} out of 100</h2>
          <p className="quiz-level"><span aria-hidden="true">{level.icon} </span>{level.label}</p>
          <div className="quiz-score-bar" aria-hidden="true"><span style={{ width: `${result.score}%` }} /></div>
        </div>
      </div>

      <p>{result.explanation}</p>
      {result.note && <p className="quiz-note" role="note">{result.note}</p>}

      <h3>Your best matches</h3>
      <ul className="quiz-matches">
        {result.matches.map((id) => {
          const category = MATCH_CATEGORIES[id];
          const count = available.filter((pet) => petMatchesCategory(pet, id)).length;
          return (
            <li key={id}>
              <strong>{category.label}</strong>
              <span>{category.description}</span>
              <span className="quiz-match-count">{count} available now</span>
            </li>
          );
        })}
      </ul>

      <h3>Practical recommendations</h3>
      <ul className="check-list">
        {result.recommendations.map((tip) => <li key={tip}>{tip}</li>)}
      </ul>

      <div className="button-row">
        <Link to={matchLink} className="btn btn-primary">View matching available animals</Link>
        <button type="button" className="btn btn-outline" onClick={onRetake}>Retake the quiz</button>
      </div>
      <p className="quiz-count" role="status">
        {matchingCount > 0
          ? `${matchingCount} available ${matchingCount === 1 ? 'animal matches' : 'animals match'} your results.`
          : 'No available animals match right now. You can still browse everyone who is waiting for a home.'}
      </p>
      <p className="quiz-disclaimer">
        This quiz is guidance only. It does not approve or reject any adoption application. Our team reviews every application separately.
      </p>
    </div>
  );
}
