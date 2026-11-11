import PetImage from './PetImage';

// Large banner with text on one side and a photo on the other
export default function Hero({ eyebrow, title, text, image, imageAlt, badge, children }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container hero-grid">
        <div className="hero-text">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 id="hero-title">{title}</h1>
          <p className="hero-lead">{text}</p>
          <div className="button-row">{children}</div>
        </div>
        <div className="hero-media">
          <PetImage src={image} alt={imageAlt} loading="eager" />
          {badge && <div className="hero-badge">{badge}</div>}
        </div>
      </div>
    </section>
  );
}
