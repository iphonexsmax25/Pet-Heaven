// Progress bar for the quiz: "Question 3 of 10" plus a bar that fills as questions are answered.
export default function QuizProgress({ step, total, answered }) {
  const percent = Math.round((answered / total) * 100);
  return (
    <div className="quiz-progress">
      <div className="quiz-progress-text">
        <span>Question {step + 1} of {total}</span>
        <span>{percent}% answered</span>
      </div>
      <div
        className="quiz-progress-bar"
        role="progressbar"
        aria-label="Quiz progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={`${answered} of ${total} questions answered`}
      >
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
