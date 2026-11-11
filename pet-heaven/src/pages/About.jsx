import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import { useAuth } from '../context/AuthContext';

const services = [
  { icon: '🏡', title: 'Pet adoption', text: 'Carefully matched dogs and cats, each with a health check and vaccination record.' },
  { icon: '🤝', title: 'Rehoming support', text: 'A kind, judgement-free service for owners who can no longer care for their pet.' },
  { icon: '📚', title: 'Care education', text: 'Guides, videos and advice for first-time and experienced pet owners.' },
  { icon: '🧡', title: 'Foster network', text: 'Volunteer foster families who give animals a safe place while they wait.' },
];

const process = [
  'Browse our available pets and save your favourites.',
  'Submit an adoption application describing your home and experience.',
  'Our team reviews your application and contacts you within a few days.',
  'Meet your match, ask questions and spend time together.',
  'Sign the adoption agreement and take your new friend home.',
  'Stay in touch: we offer follow-up advice after adoption.',
];

export default function About() {
  const { currentUser } = useAuth();
  const isEmployee = currentUser?.role === 'employee';
  return (
    <>
      <PageHeader title="About Pet Heaven" intro="A small team and a big community, working together so that every pet has a home." />

      <section className="section">
        <div className="container narrow">
          <Reveal>
            <h2>What is Pet Heaven?</h2>
            <p>
              Pet Heaven is a pet adoption and rehoming service based in Singapore. We connect dogs and cats who
              need a home with responsible, loving families, and we support owners who face difficult circumstances
              and must rehome a pet.
            </p>
            <h2>Our history</h2>
            <p>
              Pet Heaven began in 2015 as a small group of friends fostering rescued animals from their flats. As
              word spread, volunteers joined, and the group grew into a registered community project with a
              dedicated care team. Today we help hundreds of animals each year find safe, happy homes.
            </p>
            <p className="note-text">
              Note: Pet Heaven is a fictional organisation created for a student website assignment.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section section-tint" aria-labelledby="services-title">
        <div className="container">
          <Reveal>
            <div className="section-head"><h2 id="services-title">Our services</h2></div>
            <div className="card-grid-4">
              {services.map((service) => (
                <article key={service.title} className="info-card">
                  <span className="info-icon" aria-hidden="true">{service.icon}</span>
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                </article>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section" aria-labelledby="process-title">
        <div className="container narrow">
          <Reveal>
            <h2 id="process-title">Our adoption process</h2>
            <ol className="number-list">
              {process.map((step) => <li key={step}>{step}</li>)}
            </ol>
          </Reveal>
        </div>
      </section>

      <section className="section section-green" aria-labelledby="welfare-title">
        <div className="container narrow">
          <Reveal>
            <h2 id="welfare-title">Our commitment to animal welfare</h2>
            <p>
              Every animal in our care receives veterinary checks, nutritious food, a safe place to rest and plenty
              of affection. We never place a pet in a home that we do not believe is ready, and we will always take a
              pet back if an adoption does not work out.
            </p>
            <div className="button-row">
              <Link to="/mission" className="btn btn-light">Our mission</Link>
              {!isEmployee && <Link to="/contact" className="btn btn-outline-light">Contact us</Link>}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
