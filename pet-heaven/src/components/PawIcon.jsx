// Simple paw print icon drawn with SVG shapes
export default function PawIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <g fill="currentColor">
        <ellipse cx="32" cy="42" rx="13" ry="11" />
        <circle cx="15" cy="30" r="6" />
        <circle cx="26" cy="18" r="6.5" />
        <circle cx="38" cy="18" r="6.5" />
        <circle cx="49" cy="30" r="6" />
      </g>
    </svg>
  );
}
