import { useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { usePets } from '../context/PetsContext';
import { speciesOptions, statuses } from '../data/pets';
import { getApplications } from '../utils/adminData';
import {
  MONTH_NAMES, buildAllReportsText, buildMonthlyReport, deleteReport, downloadTextFile, exportAllFileName,
  getSavedReports, parseDate, reportFileName, reportId, reportTitle, saveReport,
} from '../utils/monthlyReports';
import { statusLabel } from '../utils/petRules';
import { readStorage } from '../utils/storage';
import { roleForEmail } from '../utils/roles';
import { formatDate } from '../utils/validators';
import Forbidden from './Forbidden';

const APPLICATION_STATUSES = ['Pending', 'Approved', 'Completed', 'Rejected'];
const countBy = (list, key, values) => values.map((value) => [value, list.filter((item) => item[key] === value).length]);
const isEmployeeUser = (user) => (user.role || roleForEmail(user.email)) === 'employee';

// Saved accounts, read fresh from localStorage. Only counts and sign-up dates are ever used from them.
const readUsers = () => {
  const saved = readStorage('petheaven_users', []);
  return (Array.isArray(saved) ? saved : []).filter(Boolean);
};

function ReportTable({ title, rows }) {
  return (
    <div className="info-box">
      <h2>{title}</h2>
      <ul className="record-list">
        {rows.map(([label, count]) => <li key={label}><strong>{label}</strong> <span>{count}</span></li>)}
      </ul>
    </div>
  );
}

export default function AdminReports() {
  const { isEmployee } = useAuth();
  const { pets } = usePets();
  const applications = getApplications();
  const users = readUsers();

  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth() + 1;

  const [year, setYear] = useState(thisYear);
  const [month, setMonth] = useState(thisMonth);
  const [reports, setReports] = useState(getSavedReports);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text }

  // Years from the oldest dated record (at least 3 years back) up to this year, newest first
  const yearOptions = useMemo(() => {
    const dates = [
      ...pets.map((pet) => pet.createdAt), ...applications.map((item) => item.submittedAt), ...users.map((user) => user.createdAt),
    ].map(parseDate).filter(Boolean);
    const earliest = dates.length ? Math.min(...dates.map((date) => date.getFullYear())) : thisYear;
    const first = Math.min(earliest, thisYear - 2);
    return Array.from({ length: thisYear - first + 1 }, (_, index) => thisYear - index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pets, thisYear]);

  // Only employees can use this page (the route is guarded too; this is a second check)
  if (!isEmployee) return <Forbidden />;

  const selectedId = reportId(year, month);
  const selectedReport = reports.find((item) => item.id === selectedId);
  const isFutureMonth = (y, m) => y > thisYear || (y === thisYear && m > thisMonth);

  const changeYear = (value) => {
    const nextYear = Number(value);
    setYear(nextYear);
    if (isFutureMonth(nextYear, month)) setMonth(thisMonth); // never leave a future month selected
  };

  // Build the report from the current browser data, then add it or replace the one with the same YYYY-MM id
  const generate = (targetYear, targetMonth) => {
    const id = reportId(targetYear, targetMonth);
    const report = buildMonthlyReport({
      year: targetYear, month: targetMonth,
      existing: reports.find((item) => item.id === id),
      pets, applications: getApplications(), users: readUsers(),
      species: speciesOptions, statuses, applicationStatuses: APPLICATION_STATUSES, isEmployeeUser,
    });
    const result = saveReport(report);
    if (!result.ok) {
      setMessage({ type: 'error', text: 'Could not save the report. Browser storage may be full or blocked.' });
      return;
    }
    setReports(result.reports);
    setYear(targetYear);
    setMonth(targetMonth);
    setMessage({
      type: 'success',
      text: result.replaced ? `${reportTitle(id)} report updated with the latest data.` : `${reportTitle(id)} report generated and saved.`,
    });
  };

  const download = (fileName, text) => {
    if (downloadTextFile(fileName, text)) {
      setMessage({ type: 'success', text: `Downloading ${fileName}. It will be saved to your browser's normal Downloads location.` });
    } else {
      setMessage({ type: 'error', text: 'Could not start the download in this browser.' });
    }
  };

  const remove = (report) => {
    if (!window.confirm(`Delete the saved ${reportTitle(report.id)} report? This cannot be undone.`)) return;
    const result = deleteReport(report.id);
    if (!result.ok) {
      setMessage({ type: 'error', text: 'Could not delete the report. Browser storage may be blocked.' });
      return;
    }
    setReports(result.reports);
    setMessage({ type: 'success', text: `${reportTitle(report.id)} report deleted.` });
  };

  // Saved reports grouped by year, newest first (the list is already sorted newest first)
  const years = [...new Set(reports.map((item) => item.id.slice(0, 4)))];

  return (
    <>
      <PageHeader title="Reports" intro="Totals from this browser's saved data." />
      <section className="section">
        <div className="container">
          <div className="admin-stats">
            <div className="stat-card"><strong>{pets.length}</strong><span>Total pets</span></div>
            <div className="stat-card"><strong>{applications.length}</strong><span>Applications</span></div>
            <div className="stat-card"><strong>{users.length}</strong><span>Registered accounts</span></div>
          </div>
          <div className="two-col">
            <ReportTable title="Pets by status" rows={countBy(pets, 'status', statuses).map(([value, count]) => [statusLabel(value), count])} />
            <ReportTable title="Pets by species" rows={countBy(pets, 'species', speciesOptions)} />
            <ReportTable title="Applications by status" rows={countBy(applications, 'status', APPLICATION_STATUSES)} />
            <ReportTable title="Accounts by role" rows={[['Customers', users.filter((user) => !isEmployeeUser(user)).length], ['Employees', users.filter(isEmployeeUser).length]]} />
          </div>

          <div className="info-box monthly-report" aria-labelledby="monthly-report-title">
            <h2 id="monthly-report-title">Monthly report</h2>
            <p className="monthly-note">
              Choose a month, then generate a report with its totals. Records are matched by their saved dates, and records with no valid date are left out and counted.
              Downloads go to your browser's normal Downloads location.
            </p>
            <div className="monthly-controls">
              <div className="form-field">
                <label htmlFor="report-month">Month</label>
                <select id="report-month" value={month} onChange={(event) => setMonth(Number(event.target.value))}>
                  {MONTH_NAMES.map((name, index) => (
                    <option key={name} value={index + 1} disabled={isFutureMonth(year, index + 1)}>{name}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="report-year">Year</label>
                <select id="report-year" value={year} onChange={(event) => changeYear(event.target.value)}>
                  {yearOptions.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </div>
              <div className="monthly-buttons">
                <button type="button" className="btn btn-primary" onClick={() => generate(year, month)}>
                  {selectedReport ? 'Regenerate Monthly Report' : 'Generate Monthly Report'}
                </button>
                <button
                  type="button" className="btn btn-outline" disabled={!selectedReport}
                  onClick={() => selectedReport && download(reportFileName(selectedReport.id), selectedReport.content)}
                >
                  Download .txt
                </button>
              </div>
            </div>
            {!selectedReport && <p className="monthly-note">Generate the {reportTitle(selectedId)} report to enable the download.</p>}
            <div role="status" aria-live="polite">
              {message && <p className={message.type === 'error' ? 'error-text' : 'success-message monthly-message'}>{message.text}</p>}
            </div>
            {selectedReport && (
              <>
                <h3>{reportTitle(selectedReport.id)} preview</h3>
                <pre className="report-preview" tabIndex={0} aria-label={`${reportTitle(selectedReport.id)} report text`}>{selectedReport.content}</pre>
              </>
            )}
          </div>

          <div className="info-box monthly-archive" aria-labelledby="archive-title">
            <div className="archive-head">
              <h2 id="archive-title">Saved monthly reports</h2>
              <button
                type="button" className="btn btn-green btn-sm" disabled={reports.length === 0}
                onClick={() => download(exportAllFileName(), buildAllReportsText(reports))}
              >
                Export All Reports
              </button>
            </div>
            {reports.length === 0 ? (
              <p>No reports saved yet. Generate one above and it will appear here.</p>
            ) : (
              years.map((groupYear) => (
                <div className="archive-year" key={groupYear}>
                  <h3>{groupYear}</h3>
                  <ul className="archive-list">
                    {reports.filter((item) => item.id.startsWith(`${groupYear}-`)).map((report) => (
                      <li key={report.id} className={report.id === selectedId ? 'is-selected' : undefined}>
                        <div className="archive-info">
                          <strong>{MONTH_NAMES[Number(report.id.slice(5)) - 1]}</strong>
                          <span>{report.id} · updated {formatDate(report.generatedAt)}</span>
                        </div>
                        <div className="archive-actions">
                          <button type="button" className="btn btn-outline btn-sm" onClick={() => download(reportFileName(report.id), report.content)}>Download Again</button>
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => generate(Number(report.id.slice(0, 4)), Number(report.id.slice(5)))}>Regenerate</button>
                          <button type="button" className="btn btn-ghost btn-sm archive-delete" onClick={() => remove(report)}>Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}
