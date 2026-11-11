import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import Reveal from '../components/Reveal';
import PetCard from '../components/PetCard';
import ReviewCard from '../components/ReviewCard';
import { pets as seedPets } from '../data/pets';
import { usePets } from '../context/PetsContext';
import { sampleReviews } from '../data/reviews';
import { careTopics } from '../data/petCareTips';

const steps = [
  { title: 'Browse', text: 'Explore our dogs and cats and save your favourites.' },
  { title: 'Apply', text: 'Complete a short adoption application online.' },
  { title: 'Meet', text: 'Visit your match and chat with our care team.' },
  { title: 'Welcome Home', text: 'Finish the paperwork and bring your friend home.' },
];

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  // One-time message after sign up or login (passed through the router)
  const [flash] = useState(() => location.state?.flash || '');
  useEffect(() => {
    if (location.state?.flash) navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);
  const { pets } = usePets();
  const available = pets.filter((pet) => pet.status === 'available');
  const newest = [...available].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
  const availableDogs = available.filter((pet) => pet.species === 'Dog').length;
  const availableCats = available.filter((pet) => pet.species === 'Cat').length;

  return (
    <div className="home-page">
      {flash && (
        <div className="container">
          <p className="success-message" role="status">✅ {flash}</p>
        </div>
      )}
      <Hero
        eyebrow="Welcome to Pet Heaven"
        title={<>Pet Heaven: <span className="accent">a home for every paw.</span></>}
        text="Adopt a loving dog or cat in Singapore, or let us help you find a caring new family for a pet you can no longer keep. Every pet deserves a second chance."
        image={seedPets[0].image}
        imageAlt="A friendly golden retriever smiling outdoors"
        badge={<><strong>{available.length}</strong> pets waiting for a home</>}
      >
        <Link to="/dogs" className="btn btn-primary">Find a Pet</Link>
        <Link to="/about" className="btn btn-outline">Learn More</Link>
      </Hero>

      <section className="section" aria-labelledby="featured-title">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <h2 id="featured-title">Newest Pets</h2>
              <p>Our latest arrivals, all looking for their forever homes.</p>
            </div>
            <div className="pet-grid">
              {newest.map((pet) => <PetCard key={pet.id} pet={pet} />)}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section-tint" aria-labelledby="category-title">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <h2 id="category-title">Choose Your Companion</h2>
              <p>Whether you dream of walks in the park or quiet evenings with a purring friend.</p>
            </div>
            <div className="category-grid">
              <Link to="/dogs" className="category-card category-dogs">
                <span className="category-emoji" aria-hidden="true">🐶</span>
                <h3>Dogs</h3>
                <p>{availableDogs} available now. Loyal, energetic and full of love.</p>
                <span className="category-link">Meet the dogs →</span>
              </Link>
              <Link to="/cats" className="category-card category-cats">
                <span className="category-emoji" aria-hidden="true">🐱</span>
                <h3>Cats</h3>
                <p>{availableCats} available now. Gentle, curious and wonderfully independent.</p>
                <span className="category-link">Meet the cats →</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section" aria-labelledby="process-title">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <h2 id="process-title">How Adoption Works</h2>
              <p>Four simple steps from meeting to bringing them home.</p>
            </div>
            <ol className="steps">
              {steps.map((step, index) => (
                <li key={step.title} className="step-card">
                  <span className="step-number" aria-hidden="true">{index + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      <section className="section section-green" aria-labelledby="mission-title">
        <div className="container split">
          <Reveal className="split-text">
            <h2 id="mission-title">Our Mission</h2>
            <p>
              Pet Heaven connects homeless pets with caring, responsible families. We believe in honest
              information, careful matching and support that lasts long after adoption day.
            </p>
            <Link to="/mission" className="btn btn-light">Read our mission</Link>
          </Reveal>
          <Reveal className="mission-points">
            <ul>
              <li>Responsible adoption for life</li>
              <li>Compassionate animal care</li>
              <li>Education for the community</li>
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="section" aria-labelledby="care-title">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <h2 id="care-title">Pet Care Tips</h2>
              <p>Simple guidance to keep your companion healthy and happy.</p>
            </div>
            <div className="card-grid-3">
              {careTopics.slice(0, 3).map((topic) => (
                <article key={topic.id} className="info-card">
                  <span className="info-icon" aria-hidden="true">{topic.icon}</span>
                  <h3>{topic.title}</h3>
                  <p>{topic.summary}</p>
                </article>
              ))}
            </div>
            <p className="center-row"><Link to="/pet-care" className="btn btn-outline">Explore all care guides</Link></p>
          </Reveal>
        </div>
      </section>

      <section className="section section-tint" aria-labelledby="reviews-title">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <h2 id="reviews-title">Member Reviews</h2>
              <p>Stories from families who found their friend through Pet Heaven.</p>
            </div>
            <div className="card-grid-3">
              {sampleReviews.slice(0, 3).map((review) => <ReviewCard key={review.id} review={review} />)}
            </div>
            <p className="center-row"><Link to="/reviews" className="btn btn-outline">Read more reviews</Link></p>
          </Reveal>
        </div>
      </section>

      <section className="section" aria-labelledby="cta-title">
        <div className="container">
          <Reveal className="cta-banner">
            <h2 id="cta-title">Ready to meet your new best friend?</h2>
            <p>Start your adoption application today, or tell us about a pet who needs a new home.</p>
            <div className="button-row button-row-center">
              <Link to="/adopt" className="btn btn-light">Adopt a Pet</Link>
              <Link to="/release" className="btn btn-outline-light">Release a Pet</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
