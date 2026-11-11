import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import QuizProgress from '../components/QuizProgress';
import QuizQuestion from '../components/QuizQuestion';
import QuizResult from '../components/QuizResult';
import { QUESTIONS, calculateResult, emptyQuiz, loadQuiz, saveQuiz } from '../utils/adoptionQuiz';

// Adoption Readiness Quiz. State lives in React; progress and the finished result are saved in localStorage.
export default function AdoptionQuiz() {
  const [quiz, setQuiz] = useState(loadQuiz);
  const [error, setError] = useState('');
  const headingRef = useRef(null);
  const shouldFocus = useRef(false);

  const question = QUESTIONS[quiz.step];
  const answered = QUESTIONS.filter((item) => quiz.answers[item.id]).length;
  const result = useMemo(() => (quiz.completed ? calculateResult(quiz.answers) : null), [quiz.completed, quiz.answers]);
  const isLast = quiz.step === QUESTIONS.length - 1;

  // Move keyboard and screen-reader focus to the new question (or the result) after the user moves on
  useEffect(() => {
    if (!shouldFocus.current) return;
    shouldFocus.current = false;
    if (quiz.completed) {
      const title = document.getElementById('quiz-result-title');
      if (title) title.focus();
    } else if (headingRef.current) {
      headingRef.current.focus();
    }
  }, [quiz.step, quiz.completed]);

  const update = (next, { focus = false } = {}) => {
    shouldFocus.current = focus;
    setQuiz(next);
    saveQuiz(next);
  };

  const handleAnswer = (id, value) => {
    setError('');
    update({ ...quiz, answers: { ...quiz.answers, [id]: value } });
  };

  const handleNext = () => {
    if (!quiz.answers[question.id]) {
      setError('Please choose an answer to continue.');
      return;
    }
    setError('');
    if (isLast) update({ ...quiz, completed: true, completedAt: new Date().toISOString() }, { focus: true });
    else update({ ...quiz, step: quiz.step + 1 }, { focus: true });
  };

  const handleBack = () => {
    setError('');
    if (quiz.step > 0) update({ ...quiz, step: quiz.step - 1 }, { focus: true });
  };

  const handleRetake = () => {
    setError('');
    update(emptyQuiz(), { focus: true });
  };

  return (
    <>
      <PageHeader
        title="Adoption Readiness Quiz"
        intro="Answer 10 short questions to see how ready you are to adopt and which animals could suit your home."
      />
      <section className="section">
        <div className="container narrow">
          {result ? (
            <div className="form-card quiz-card">
              <QuizResult result={result} onRetake={handleRetake} />
            </div>
          ) : (
            <div className="form-card quiz-card">
              <QuizProgress step={quiz.step} total={QUESTIONS.length} answered={answered} />
              <QuizQuestion question={question} value={quiz.answers[question.id]} onChange={handleAnswer} error={error} ref={headingRef} />
              <div className="quiz-actions">
                <button type="button" className="btn btn-outline" onClick={handleBack} disabled={quiz.step === 0}>Back</button>
                <button type="button" className="btn btn-primary" onClick={handleNext}>{isLast ? 'See my results' : 'Next'}</button>
              </div>
              <p className="quiz-disclaimer">
                Guidance only. Your answers stay in this browser and the quiz never approves or rejects an adoption application.
              </p>
            </div>
          )}
          <p className="center-text quiz-links">
            <Link to="/pet-care">Read our Pet Care guide</Link> · <Link to="/pets">Browse available pets</Link>
          </p>
        </div>
      </section>
    </>
  );
}
