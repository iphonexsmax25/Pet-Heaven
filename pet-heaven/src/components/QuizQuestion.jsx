import { forwardRef } from 'react';

// One multiple-choice question. Native radio buttons keep it keyboard and screen-reader friendly.
const QuizQuestion = forwardRef(function QuizQuestion({ question, value, onChange, error }, headingRef) {
  const helpId = `${question.id}-help`;
  const errorId = `${question.id}-error`;
  return (
    <fieldset className="quiz-fieldset" aria-describedby={[question.help ? helpId : '', error ? errorId : ''].filter(Boolean).join(' ') || undefined}>
      <legend className="quiz-legend">
        <h2 className="quiz-question-title" tabIndex={-1} ref={headingRef}>{question.title}</h2>
      </legend>
      {question.help && <p id={helpId} className="quiz-help">{question.help}</p>}
      <div className="quiz-options">
        {question.options.map((option) => {
          const selected = value === option.value;
          return (
            <label key={option.value} className={selected ? 'quiz-option is-selected' : 'quiz-option'}>
              <input type="radio" name={question.id} value={option.value} checked={selected} onChange={() => onChange(question.id, option.value)} />
              <span className="quiz-option-text">{option.label}</span>
            </label>
          );
        })}
      </div>
      {error && <p id={errorId} className="error-text" role="alert">{error}</p>}
    </fieldset>
  );
});

export default QuizQuestion;
