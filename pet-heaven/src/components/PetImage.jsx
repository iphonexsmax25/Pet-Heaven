import { useEffect, useState } from 'react';
import { getImage } from '../utils/imageDb';

// Friendly placeholder shown if a photo cannot load
const fallback =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#ffe8d9"/><g fill="#c2410c" opacity="0.55"><ellipse cx="200" cy="175" rx="42" ry="34"/><circle cx="145" cy="135" r="19"/><circle cx="182" cy="105" r="20"/><circle cx="218" cy="105" r="20"/><circle cx="255" cy="135" r="19"/></g></svg>'
  );

// Shows a photo from a normal URL (src) or from IndexedDB (imageId).
export default function PetImage({ src, imageId, alt, className = '', ...rest }) {
  const [failed, setFailed] = useState(false);
  const [storedUrl, setStoredUrl] = useState('');

  useEffect(() => {
    setFailed(false);
    if (!imageId) {
      setStoredUrl('');
      return undefined;
    }
    let cancelled = false;
    let objectUrl = '';
    getImage(imageId)
      .then((blob) => {
        if (cancelled) return;
        if (blob) {
          objectUrl = URL.createObjectURL(blob);
          setStoredUrl(objectUrl);
        } else {
          setFailed(true);
        }
      })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [imageId]);

  const shown = imageId ? storedUrl : src;
  return (
    <img
      src={failed || !shown ? fallback : shown}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}
