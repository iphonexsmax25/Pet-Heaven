import { useEffect } from 'react';

// Title area at the top of inner pages. It also sets the browser tab title.
export default function PageHeader({ title, intro }) {
  useEffect(() => {
    document.title = `${title} | Pet Heaven`;
  }, [title]);

  return (
    <div className="page-header">
      <div className="container">
        <h1>{title}</h1>
        {intro && <p>{intro}</p>}
      </div>
    </div>
  );
}
