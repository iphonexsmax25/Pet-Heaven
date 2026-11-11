// Small outline icons for the contact details (decorative: the text next to them carries the meaning).
const paths = {
  phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />,
  whatsapp: (
    <>
      <path d="M3 21l1.7-4.9A9 9 0 1 1 8 19.4L3 21Z" />
      <path d="M9 8.6c.2 2.6 2.8 5.2 5.4 5.4l1.1-1.2a.8.8 0 0 0-.1-1.1l-1.2-.7a.8.8 0 0 0-1 .2l-.4.5a4.2 4.2 0 0 1-1.9-1.9l.5-.4a.8.8 0 0 0 .2-1L10.4 7a.8.8 0 0 0-1.1-.1L9 8.6Z" />
    </>
  ),
  email: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="3" />
      <path d="m2.5 6.5 9.5 7 9.5-7" />
    </>
  ),
  location: (
    <>
      <path d="M12 21.5s7-6.1 7-11.5a7 7 0 0 0-14 0c0 5.4 7 11.5 7 11.5Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 6.5V12l3.5 2" />
    </>
  ),
};

export default function ContactIcon({ name, size = 24 }) {
  return (
    <svg
      className="contact-icon-svg" viewBox="0 0 24 24" width={size} height={size} fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
