import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import FormInput from '../components/FormInput';
import PasswordField from '../components/PasswordField';
import useForm from '../hooks/useForm';
import { useAuth } from '../context/AuthContext';
import { isEmail } from '../utils/validators';

export default function Login() {
  const { isAuthenticated, isEmployee, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { values, errors, showErrors, handleChange } = useForm({ email: '', password: '' });

  // Already logged in? Go to the homepage.
  if (isAuthenticated) return <Navigate to={isEmployee ? '/admin/dashboard' : '/'} replace />;

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = {};
    if (!values.email.trim()) found.email = 'Please enter your email.';
    else if (!isEmail(values.email)) found.email = 'Please enter a valid email address.';
    if (!values.password) found.password = 'Please enter your password.';
    if (Object.keys(found).length > 0) return showErrors(found);

    const result = login(values);
    if (!result.ok) return showErrors({ password: result.error });
    // Employees go to the dashboard. Customers go back to the page they tried to open, or the homepage.
    const from = location.state?.from;
    const target = result.user.role === 'employee'
      ? (from && from.startsWith('/admin') ? from : '/admin/dashboard')
      : (from || '/');
    navigate(target, { replace: true, state: { flash: `Welcome back, ${result.user.name}!` } });
    return undefined;
  };

  return (
    <>
      <PageHeader title="Member Login" intro="Log in to manage your favourites and write reviews." />
      <section className="section">
        <div className="container narrow-form">
          {location.state?.from && <p className="notice">Please log in to view that page.</p>}
          <form className="form-card" onSubmit={handleSubmit} noValidate aria-label="Log in form">
            <FormInput label="Email" name="email" type="email" value={values.email} onChange={handleChange} error={errors.email} required autoComplete="email" />
            <PasswordField label="Password" name="password" value={values.password} onChange={handleChange} error={errors.password} autoComplete="current-password" showChecklist={false} />
            <button type="submit" className="btn btn-primary btn-block">Log In</button>
            <p className="form-switch">No account yet? <Link to="/signup">Sign up</Link></p>
          </form>
        </div>
      </section>
    </>
  );
}
