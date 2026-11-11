import { useState } from 'react';
import PetImage from './PetImage';

// Photo gallery for the details page: a large photo, previous / next buttons and a thumbnail strip.
// Keyboard: Left and Right arrow keys change the photo while focus is inside the gallery.
// "children" is drawn on top of the large photo (the availability badge).
export default function PetGallery({ items, name, children }) {
  const [index, setIndex] = useState(0);
  const total = items.length;
  const current = items[Math.min(index, total - 1)];
  const go = (next) => setIndex((next + total) % total);

  const handleKeyDown = (event) => {
    if (total < 2) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); go(index + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); go(index - 1); }
  };

  const zoomStyle = (item) => (item.zoom ? { transform: `scale(${item.zoom})`, transformOrigin: item.origin || 'center' } : undefined);

  return (
    <div className="pet-gallery" role="group" aria-roledescription="carousel" aria-label={`${name} photo gallery`} onKeyDown={handleKeyDown}>
      <div className="gallery-main">
        <PetImage
          key={`${current.imageId || current.src}-${index}`}
          src={current.src}
          imageId={current.imageId}
          alt={`${name}, photo ${index + 1} of ${total}`}
          loading="eager"
          style={zoomStyle(current)}
        />
        {children}
        {total > 1 && (
          <>
            <button type="button" className="gallery-nav gallery-prev" onClick={() => go(index - 1)} aria-label="Previous photo">‹</button>
            <button type="button" className="gallery-nav gallery-next" onClick={() => go(index + 1)} aria-label="Next photo">›</button>
            <span className="gallery-counter" aria-live="polite">Photo {index + 1} of {total}</span>
          </>
        )}
      </div>
      {total > 1 && (
        <ul className="gallery-thumbs" aria-label={`${name} photos`}>
          {items.map((item, position) => (
            <li key={`${item.imageId || item.src}-${position}`}>
              <button
                type="button"
                className={position === index ? 'gallery-thumb is-current' : 'gallery-thumb'}
                aria-label={`Show photo ${position + 1} of ${total}`}
                aria-current={position === index ? 'true' : undefined}
                onClick={() => setIndex(position)}
              >
                <PetImage src={item.src} imageId={item.imageId} alt="" style={zoomStyle(item)} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
