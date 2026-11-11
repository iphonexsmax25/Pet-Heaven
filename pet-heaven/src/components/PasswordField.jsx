import { useState } from 'react';
import { PASSWORD_MAX, passwordChecks } from '../utils/validators';

// Password input with Show/Hide button, live requirements checklist and accessible errors.
export default function PasswordField({
  label, name, value, onChange, error, required = true,
  autoComplete = 'new-password', showChecklist = true,
}) {
  const [visible, setVisible] = useState(false);
  const errorId = `${name}-error`;
  const rulesId = `${name}-requirements`;
  const checks = passwordChecks(value);

  return (
    <div className={error ? 'form-field has-error' : 'form-field'}>
      <label htmlFor={name}>
        {label}
        {required && <span className="req" aria-hidden="true"> *</span>}
      </label>

      <div className="password-wrap">
        <input
          id={name} name={name} value={value} onChange={onChange}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete} maxLength={PASSWORD_MAX}
          aria-required={required ? 'true' : undefined}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={showChecklist ? `${rulesId} ${errorId}` : errorId}
        />
        <button
          type="button" className="btn btn-ghost btn-sm password-toggle"
          aria-controls={name}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>

      {showChecklist && (
        <ul id={rulesId} className="password-rules" aria-label="Password requirements">
          {checks.map((check) => (
            <li key={check.id} className={check.met ? 'met' : ''}>
              <span aria-hidden="true">{check.met ? '✓' : '○'}</span>
              {check.label}
              <span className="sr-only">{check.met ? ' (met)' : ' (not met)'}</span>
            </li>
          ))}
        </ul>
      )}

      {/* aria-live: screen readers announce the message when it appears */}
      <div id={errorId} aria-live="polite">
        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
}
