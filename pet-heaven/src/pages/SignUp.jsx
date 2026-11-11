import { Link, Navigate, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import FormInput from '../components/FormInput';
import PasswordField from '../components/PasswordField';
import useForm from '../hooks/useForm';
import { useAuth } from '../context/AuthContext';
import { isEmail, passwordProblems } from '../utils/validators';

export default function SignUp() {
  const { isAuthenticated, isEmployee, signup } = useAuth();
  const navigate = useNavigate();
  const { values, errors, showErrors, handleChange } = useForm({ name: '', email: '', password: '', confirm: '' });

  if (isAuthenticated) return <Navigate to={isEmployee ? '/admin/dashboard' : '/'} replace />;

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = {};
    if (values.name.trim().length < 2) found.name = 'Please enter your full name.';
    const email = values.email.trim().toLowerCase();
    if (!email) found.email = 'Please enter your email.';
    else if (!isEmail(email)) found.email = 'Please enter a valid email address.';

    const problems = passwordProblems(values.password);
    if (!values.password) found.password = 'Please create a password.';
    else if (problems.length > 0) found.password = `Password must include ${problems.join(', ')}.`;

    if (!values.confirm) found.confirm = 'Please confirm your password.';
    else if (values.confirm !== values.password) found.confirm = 'Passwords do not match.';

    if (Object.keys(found).length > 0) return showErrors(found);

    const result = signup({ name: values.name, email: values.email, password: values.password });
    if (!result.ok) {
      return showErrors(Object.keys(result.errors).length > 0 ? result.errors : { email: result.error });
    }
    // The account is created and the member is already logged in
    navigate(result.user.role === 'employee' ? '/admin/dashboard' : '/', { replace: true, state: { flash: `Account created! Welcome to Pet Heaven, ${result.user.name}.` } });
    return undefined;
  };

  return (
    <>
      <PageHeader title="Become a Member" intro="Create an account to save favourite pets and share your story." />
      <section className="section">
        <div className="container narrow-form">
          <form className="form-card" onSubmit={handleSubmit} noValidate aria-label="Sign up form">
            <FormInput label="Full name" name="name" value={values.name} onChange={handleChange} error={errors.name} required autoComplete="name" />
            <FormInput label="Email" name="email" type="email" value={values.email} onChange={handleChange} error={errors.email} required autoComplete="email" />
            <PasswordField label="Password" name="password" value={values.password} onChange={handleChange} error={errors.password} />
            <FormInput label="Confirm password" name="confirm" type="password" value={values.confirm} onChange={handleChange} error={errors.confirm} required autoComplete="new-password" />
            <button type="submit" className="btn btn-primary btn-block">Create Account</button>
            <p className="form-switch">Already a member? <Link to="/login">Log in</Link></p>
            <p className="note-text">Accounts are saved only in this browser (localStorage). This is a student demo, so please do not use a real password.</p>
          </form>
        </div>
      </section>
    </>
  );
}
