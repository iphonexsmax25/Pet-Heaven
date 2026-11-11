import { useState } from 'react';

// A small helper hook that keeps form values and errors together.
export default function useForm(initialValues) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target;
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    // Clear the error for this field as soon as the user edits it
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  // Show errors and move keyboard focus to the first invalid field
  const showErrors = (newErrors) => {
    setErrors(newErrors);
    const firstName = Object.keys(newErrors)[0];
    if (firstName) {
      const field = document.getElementsByName(firstName)[0];
      if (field) field.focus();
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };

  return { values, setValues, errors, showErrors, handleChange, reset };
}
