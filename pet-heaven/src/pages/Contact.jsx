import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import FormInput from '../components/FormInput';
import Accordion from '../components/Accordion';
import useForm from '../hooks/useForm';
import { useAuth } from '../context/AuthContext';
import ContactIcon from '../components/ContactIcon';
import { contactInfo } from '../data/contact';
import { addContactMessage } from '../utils/adminData';
import { isEmail } from '../utils/validators';

const faqs = [
  { id: 'faq1', title: 'How long does the adoption process take?',
    content: <p>Most applications are reviewed within 3 to 5 working days. After approval, you can arrange a meeting with the pet and finish the paperwork on the same visit.</p> },
  { id: 'faq2', title: 'What is included in the adoption fee?',
    content: <p>The demonstration fee covers vaccinations, a health check, microchipping and sterilisation where suitable. Fees are fictional in this project.</p> },
  { id: 'faq3', title: 'Can I adopt if I live in a flat?',
    content: <p>Yes. Many of our pets are happy in HDB flats and condominiums. We will help you choose a pet whose size and energy suit your home. Cats need window safety netting.</p> },
  { id: 'faq4', title: 'What if the adoption does not work out?',
    content: <p>Please contact us. We will always take a pet back and help find a better match, so no animal is left without a home.</p> },
  { id: 'faq5', title: 'Can I visit the pets before applying?',
    content: <p>Yes. Visits are by appointment during opening hours so that the animals are not overwhelmed. Send us a message to book a slot.</p> },
];

export default function Contact() {
  const { currentUser } = useAuth();
  // Logged-in customers get their name and email filled in, but can still edit them
  const { values, setValues, errors, showErrors, handleChange } = useForm({
    name: currentUser ? currentUser.name : '',
    email: currentUser ? currentUser.email : '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // If the member logs in while this page is open, fill in the empty name and email fields
  useEffect(() => {
    if (!currentUser) return;
    setValues((current) => ({
      ...current,
      name: current.name || currentUser.name,
      email: current.email || currentUser.email,
    }));
  }, [currentUser, setValues]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitError('');
    const clean = {
      name: values.name.trim(),
      email: values.email.trim(),
      subject: values.subject.trim(),
      message: values.message.trim(),
    };
    const found = {};
    if (clean.name.length < 2) found.name = 'Please enter your name.';
    if (!clean.email) found.email = 'Please enter your email address.';
    else if (!isEmail(clean.email)) found.email = 'Please enter a valid email, like name@example.com.';
    if (!clean.subject) found.subject = 'Please choose a subject.';
    if (!clean.message) found.message = 'Please enter your message.';
    else if (clean.message.length < 10) found.message = 'Your message must be at least 10 characters.';

    if (Object.keys(found).length > 0) {
      setSubmitted(false);
      showErrors(found);
      return;
    }
    if (!addContactMessage(clean)) {
      setSubmitted(false);
      setSubmitError('Could not save your message. Browser storage may be full or blocked.');
      return;
    }
    // Clear the whole form after a successful submission
    setValues({ name: '', email: '', subject: '', message: '' });
    setSubmitted(true);
  };

  return (
    <>
      <PageHeader title="Contact Us" intro="Questions, partnerships, or just want to say hello? We would love to hear from you." />

      <section className="section">
        <div className="container contact-grid">
          <div className="contact-info">
            <div className="contact-card"><span className="contact-icon"><ContactIcon name="location" /></span><div><h2>Location</h2><p>{contactInfo.address}</p></div></div>
            <div className="contact-card"><span className="contact-icon"><ContactIcon name="phone" /></span><div><h2>Phone</h2><p><a href={contactInfo.phone.href}>{contactInfo.phone.label}</a></p></div></div>
            <div className="contact-card"><span className="contact-icon"><span className="whatsapp-icon" style={{ '--whatsapp-icon': `url(/images/whatsapp.png)` }} aria-hidden="true" /></span><div><h2>WhatsApp</h2><p><a href={contactInfo.whatsapp.href} target="_blank" rel="noopener noreferrer">{contactInfo.whatsapp.label}<span className="sr-only"> (opens in a new tab)</span></a></p></div></div>
            <div className="contact-card"><span className="contact-icon"><ContactIcon name="email" /></span><div><h2>Email</h2><p><a href={contactInfo.email.href}>{contactInfo.email.label}</a></p></div></div>
            <div className="contact-card"><span className="contact-icon"><ContactIcon name="clock" /></span><div><h2>Opening hours</h2><p>Mon to Sat: 9am to 6pm<br />Sun: 10am to 4pm</p></div></div>
          </div>

          <form className="form-card" onSubmit={handleSubmit} noValidate aria-labelledby="contact-form-title">
            <h2 id="contact-form-title">Send us a message</h2>
            {submitted && (
              <p className="success-message" role="status">Thank you for contacting Pet Heaven. We have received your message and will reply to your email within 3 working days.</p>
            )}
            {submitError && <p className="error-text error-banner" role="alert">{submitError}</p>}
            <div className="form-grid">
              <FormInput label="Name" name="name" value={values.name} onChange={handleChange} error={errors.name} required autoComplete="name" />
              <FormInput label="Email" name="email" type="email" value={values.email} onChange={handleChange} error={errors.email} required autoComplete="email" />
            </div>
            <FormInput label="Subject" name="subject" as="select" value={values.subject} onChange={handleChange} error={errors.subject} required>
              <option value="">Select a subject…</option>
              <option>Adoption question</option>
              <option>Rehoming a pet</option>
              <option>Volunteering or fostering</option>
              <option>Other</option>
            </FormInput>
            <FormInput label="Message" name="message" as="textarea" rows={5} value={values.message} onChange={handleChange} error={errors.message} required />
            <button type="submit" className="btn btn-primary btn-block">Send Message</button>
          </form>
        </div>
        <div className="container">
          <div className="contact-map">
            <iframe
              src="https://www.google.com/maps?q=The+Star+Vista,+1+Vista+Exchange+Green,+Singapore+138617&output=embed"
              title="Pet Heaven location map"
              loading="lazy"
            />
            <a
              className="contact-map-link"
              href="https://www.google.com/maps/search/?api=1&query=The+Star+Vista%2C+1+Vista+Exchange+Green%2C+Singapore+138617"
              target="_blank"
              rel="noopener noreferrer"
            >
              View larger map
            </a>
          </div>
        </div>
      </section>

      <section className="section section-tint" aria-labelledby="faq-title">
        <div className="container narrow">
          <div className="section-head"><h2 id="faq-title">Frequently Asked Questions</h2></div>
          <Accordion items={faqs} />
        </div>
      </section>
    </>
  );
}
