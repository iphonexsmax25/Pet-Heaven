import { useState } from 'react';

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const pad = (n) => String(n).padStart(2, '0');

// Simple month calendar. visits = [{ date: 'YYYY-MM-DD', label }]
export default function AppointmentCalendar({ visits }) {
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const first = new Date(cursor.year, cursor.month, 1);
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const blanks = first.getDay();
  const todayKey = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const move = (delta) => {
    const next = new Date(cursor.year, cursor.month + delta, 1);
    setCursor({ year: next.getFullYear(), month: next.getMonth() });
  };

  const cells = [];
  for (let i = 0; i < blanks; i += 1) cells.push(<div key={`b${i}`} aria-hidden="true" />);
  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = `${cursor.year}-${pad(cursor.month + 1)}-${pad(day)}`;
    const dayVisits = visits.filter((visit) => visit.date === key);
    const classes = ['cal-day', dayVisits.length ? 'has-visit' : '', key === todayKey ? 'today' : ''].filter(Boolean).join(' ');
    cells.push(
      <div key={key} className={classes}>
        <strong>{day}</strong>
        {dayVisits.map((visit) => <span key={visit.label} className="cal-visit">{visit.label}</span>)}
      </div>
    );
  }

  return (
    <div className="calendar-wrap">
      <div className="calendar-head">
        <button type="button" className="btn btn-outline btn-sm" onClick={() => move(-1)} aria-label="Previous month">←</button>
        <h3>{first.toLocaleDateString('en-SG', { month: 'long', year: 'numeric' })}</h3>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => move(1)} aria-label="Next month">→</button>
      </div>
      <div className="calendar" role="grid" aria-label="Adoption visit calendar">
        {weekdays.map((day) => <div key={day} className="cal-weekday" role="columnheader">{day}</div>)}
        {cells}
      </div>
    </div>
  );
}
