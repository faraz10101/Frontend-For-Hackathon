import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { Card } from '../ui/card';

// Page wrapper: consistent width, padding and optional heading.
export function PageShell({ title, subtitle, narrow = false, children }) {
  return (
    <main className={`mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 ${narrow ? 'max-w-2xl' : 'max-w-5xl'}`}>
      {title && (
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>}
        </header>
      )}
      {children}
    </main>
  );
}

export function Spinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500" role="status">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span>{label}</span>
    </div>
  );
}

// Renders nothing when there is no message, so it can always be placed in a form.
export function ErrorBox({ children, onRetry }) {
  if (!children) return null;
  return (
    <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1">{children}</div>
      {onRetry && (
        <button type="button" onClick={onRetry} className="inline-flex shrink-0 cursor-pointer items-center gap-1 font-semibold hover:underline">
          <RefreshCw className="h-3.5 w-3.5" />Retry
        </button>
      )}
    </div>
  );
}

export function SuccessBox({ children }) {
  if (!children) return null;
  return (
    <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-700">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1">{children}</div>
    </div>
  );
}

// Matches backend levels: none | suspicious | dangerous | critical (see config/constants.js)
const LEVELS = {
  none: { label: 'Not reported', badge: 'bg-slate-100 text-slate-600', border: 'border-slate-200' },
  suspicious: { label: 'Suspicious', badge: 'bg-yellow-100 text-yellow-800', border: 'border-yellow-200' },
  dangerous: { label: 'Dangerous', badge: 'bg-orange-100 text-orange-800', border: 'border-orange-200' },
  critical: { label: 'Critical', badge: 'bg-red-100 text-red-700', border: 'border-red-200' },
};

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null);

// One number / link with its community reputation. `children` is for extra actions under the row.
export function ReputationRow({ item, children }) {
  const l = LEVELS[item.level] || LEVELS.none;
  const people = item.uniqueReporters;
  return (
    <Card className={`p-4 ${l.border}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="break-all font-mono text-sm font-semibold text-slate-900">{item.value}</span>
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${l.badge}`}>{l.label}</span>
      </div>
      <p className="mt-1.5 text-sm text-slate-600">
        {people > 0
          ? <>Reported by <b>{people}</b> different {people === 1 ? 'person' : 'people'}{item.totalReports > people ? ` (${item.totalReports} reports)` : ''}.</>
          : 'No community reports yet.'}
        {item.lastReportedAt && <span className="text-slate-400"> Last report: {fmtDate(item.lastReportedAt)}.</span>}
      </p>
      {children}
    </Card>
  );
}
