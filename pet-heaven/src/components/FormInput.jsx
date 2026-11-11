// One labelled form field (input, textarea, select or checkbox) with an error message.
export default function FormInput({
  label, name, type = 'text', as = 'input', value, onChange, error, hint, required, children, ...rest
}) {
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  if (type === 'checkbox') {
    return (
      <div className={error ? 'form-field checkbox-field has-error' : 'form-field checkbox-field'}>
        <label className="agreement-label">
          <input
            type="checkbox" id={name} name={name} checked={value} onChange={onChange}
            aria-invalid={error ? 'true' : 'false'} aria-describedby={describedBy} {...rest}
          />
          <span>{label}</span>
        </label>
        {error && <p id={errorId} className="error-text" role="alert">{error}</p>}
      </div>
    );
  }

  const Field = as;
  return (
    <div className={error ? 'form-field has-error' : 'form-field'}>
      <label htmlFor={name}>
        {label}
        {required && <span className="req" aria-hidden="true"> *</span>}
      </label>
      <Field
        id={name} name={name} value={value} onChange={onChange}
        type={as === 'input' ? type : undefined}
        aria-required={required ? 'true' : undefined}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy}
        {...rest}
      >
        {children}
      </Field>
      {hint && <p id={hintId} className="hint-text">{hint}</p>}
      {error && <p id={errorId} className="error-text" role="alert">{error}</p>}
    </div>
  );
}
