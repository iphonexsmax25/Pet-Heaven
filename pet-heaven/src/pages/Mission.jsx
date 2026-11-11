import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';

const values = [
  { icon: '💛', title: 'Compassion', text: 'We treat every animal and every person with kindness.' },
  { icon: '🔎', title: 'Transparency', text: 'We share honest information about every pet\'s health and temperament.' },
  { icon: '⚖️', title: 'Responsibility', text: 'Adoption is a lifelong promise, and we help families keep it.' },
  { icon: '🌱', title: 'Community', text: 'We learn, volunteer and grow together.' },
];

export default function Mission() {
  return (
    <>
      <PageHeader title="Mission and Purpose" intro="Why Pet Heaven exists and the values that guide everything we do." />

      <section className="section">
        <div className="container">
          <Reveal>
            <div className="two-col">
              <div className="info-box">
                <h2>🎯 Our mission</h2>
                <p>To connect every homeless pet with a caring, responsible family, and to support owners with compassion when rehoming is the best choice.</p>
              </div>
              <div className="info-box">
                <h2>🔭 Our vision</h2>
                <p>A Singapore where no companion animal is left without a home, and where every adoption lasts a lifetime.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section-tint" aria-labelledby="values-title">
        <div className="container">
          <Reveal>
            <div className="section-head"><h2 id="values-title">Core values</h2></div>
            <div className="card-grid-4">
              {values.map((value) => (
                <article key={value.title} className="info-card">
                  <span className="info-icon" aria-hidden="true">{value.icon}</span>
                  <h3>{value.title}</h3>
                  <p>{value.text}</p>
                </article>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container narrow">
          <Reveal>
            <h2>Responsible adoption</h2>
            <p>
              Bringing a pet home is a commitment of 10 to 20 years. We ask thoughtful questions about your home,
              time and budget so that the match is right for both you and the animal. Adopted pets are never
              abandoned: if circumstances change, we will help you rehome them safely.
            </p>
            <h2>Animal care</h2>
            <p>
              Our pets receive health checks, vaccinations, nutritious meals and gentle socialisation before they
              are adopted. Behaviour notes and care instructions go home with every adopter.
            </p>
            <h2>Community education</h2>
            <p>
              We share free guides, videos and advice about responsible pet ownership, and encourage the community
              to volunteer, foster and spay or neuter their pets to reduce the number of animals without homes.
            </p>
            <div className="button-row">
              <Link to="/pet-care" className="btn btn-primary">Read pet care tips</Link>
              <Link to="/adopt" className="btn btn-outline">Adopt a pet</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
