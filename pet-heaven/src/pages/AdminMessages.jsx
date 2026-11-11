import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { MESSAGES_CHANGED_EVENT, getContactMessages, resolveContactMessage } from '../utils/adminData';

const filters = [
  ['all', 'All'],
  ['unresolved', 'Unresolved'],
  ['resolved', 'Resolved'],
];

const formatDateTime = (iso) => {
  const date = new Date(iso);
  if (!iso || Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleString('en-SG', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
};

// Employees can read contact messages and mark them as resolved. They cannot reply, edit or delete from the website.
export default function AdminMessages() {
  const [messages, setMessages] = useState(getContactMessages);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');

  // Refresh when messages change in this tab or another tab
  useEffect(() => {
    const refresh = () => setMessages(getContactMessages());
    window.addEventListener(MESSAGES_CHANGED_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(MESSAGES_CHANGED_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return messages.filter((item) => {
      if (filter !== 'all' && item.status !== filter) return false;
      if (!term) return true;
      return [item.email, item.name, item.subject, item.message]
        .some((field) => String(field || '').toLowerCase().includes(term));
    });
  }, [messages, filter, search]);

  const resolve = (item) => {
    if (item.status === 'resolved') return;
    if (!window.confirm(`Mark the message from ${item.name} ("${item.subject}") as resolved?`)) return;
    if (!resolveContactMessage(item.id)) {
      setNotice('Could not save the change. Browser storage may be full or blocked.');
      return;
    }
    setMessages(getContactMessages());
    setNotice(`Message from ${item.name} marked as resolved.`);
  };

  return (
    <>
      <PageHeader title="Contact Messages" intro="Read messages sent through the Contact Us form. Replies are sent outside this website." />
      <section className="section">
        <div className="container">
          {notice && <p className="notice" role="status">{notice}</p>}

          <div className="message-tools">
            <div className="filter-field">
              <label htmlFor="message-search">Search messages</label>
              <input
                id="message-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by email, name, subject or message"
              />
            </div>
            <div className="message-filters" role="group" aria-label="Filter messages by status">
              {filters.map(([value, label]) => (
                <button
                  key={value} type="button" aria-pressed={filter === value}
                  className={filter === value ? 'btn btn-outline btn-sm is-active' : 'btn btn-outline btn-sm'}
                  onClick={() => setFilter(value)}
                >{label}</button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="info-box"><p>No contact messages found.</p></div>
          ) : (
            <div className="message-list">
              {visible.map((item) => {
                const resolved = item.status === 'resolved';
                return (
                  <article key={item.id} className="message-card" aria-label={`Message from ${item.name}: ${item.subject}`}>
                    <div className="message-card-head">
                      <h2>{item.subject}</h2>
                      <span className={resolved ? 'status-pill status-pill-resolved' : 'status-pill status-pill-unresolved'}>
                        {resolved ? 'Resolved' : 'Unresolved'}
                      </span>
                    </div>
                    <p className="message-meta">
                      <strong>{item.name}</strong> · {item.email}<br />
                      Submitted {formatDateTime(item.submittedAt)}
                    </p>
                    <p className="message-body">{item.message}</p>
                    <div className="message-card-foot">
                      <small>{resolved ? `Resolved ${formatDateTime(item.resolvedAt)}` : 'Awaiting a reply'}</small>
                      <button
                        type="button" className={resolved ? 'btn btn-ghost btn-sm' : 'btn btn-primary btn-sm'}
                        disabled={resolved} onClick={() => resolve(item)}
                      >{resolved ? 'Resolved' : 'Mark as Resolved'}</button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
