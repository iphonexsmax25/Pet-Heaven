import { useState } from 'react';

// Expandable sections. items = [{ id, title, content }]
export default function Accordion({ items, defaultOpen = null }) {
  const [openId, setOpenId] = useState(defaultOpen);

  return (
    <div className="accordion">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className={isOpen ? 'acc-item open' : 'acc-item'}>
            <h3 className="acc-heading">
              <button
                type="button"
                className="acc-button"
                aria-expanded={isOpen}
                aria-controls={`panel-${item.id}`}
                id={`button-${item.id}`}
                onClick={() => setOpenId(isOpen ? null : item.id)}
              >
                <span>{item.title}</span>
                <span className="acc-icon" aria-hidden="true">+</span>
              </button>
            </h3>
            <div id={`panel-${item.id}`} role="region" aria-labelledby={`button-${item.id}`} className="acc-panel">
              <div className="acc-inner">{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
