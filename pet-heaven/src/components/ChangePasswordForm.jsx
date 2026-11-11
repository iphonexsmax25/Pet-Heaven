import { useState } from 'react';
import FormInput from './FormInput';
import PasswordField from './PasswordField';
import useForm from '../hooks/useForm';
import { useAuth } from '../context/AuthContext';
import { passwordProblems } from '../utils/validators';

// Lets a logged-in member change their password (same rules as registration)
export default function ChangePasswordForm() {
  const { changePassword } = useAuth();
  const { values, errors, showErrors, handleChange, reset } = useForm({ currentPassword: '', newPassword: '', confirm: '' });
  const [done, setDone] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setDone(false);
    const found = {};
    if (!values.currentPassword) found.currentPassword = 'Please enter your current password.';
    const problems = passwordProblems(values.newPassword);
    if (!values.newPassword) found.newPassword = 'Please enter a new password.';
    else if (problems.length > 0) found.newPassword = `Password must include ${problems.join(', ')}.`;
    if (!values.confirm) found.confirm = 'Please confirm your new password.';
    else if (values.confirm !== values.newPassword) found.confirm = 'Passwords do not match.';
    if (Object.keys(found).length > 0) return showErrors(found);

    const result = changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
    if (!result.ok) {
      return showErrors(Object.keys(result.errors).length > 0 ? result.errors : { currentPassword: result.error });
    }
    reset();
    setDone(true);
    return undefined;
  };

  return (
    <form className="form-card change-password" onSubmit={handleSubmit} noValidate aria-labelledby="change-password-title">
      <h2 id="change-password-title">Change password</h2>
      {done && <p className="success-message" role="status">✅ Your password has been changed.</p>}
      <PasswordField label="Current password" name="currentPassword" value={values.currentPassword} onChange={handleChange} error={errors.currentPassword} autoComplete="current-password" showChecklist={false} />
      <PasswordField label="New password" name="newPassword" value={values.newPassword} onChange={handleChange} error={errors.newPassword} />
      <FormInput label="Confirm new password" name="confirm" type="password" value={values.confirm} onChange={handleChange} error={errors.confirm} required autoComplete="new-password" />
      <button type="submit" className="btn btn-primary">Change password</button>
    </form>
  );
}
