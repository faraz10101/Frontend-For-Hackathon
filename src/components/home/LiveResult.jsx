import { AlertTriangle, CheckCircle2, ExternalLink, XCircle } from 'lucide-react';

const LEVEL = {
  high: { label: 'High risk', cls: 'bg-red-600 text-white' },
  medium: { label: 'Medium risk', cls: 'bg-amber-500 text-white' },
  low: { label: 'Low risk', cls: 'bg-emerald-600 text-white' },
};

export const fmtTime = (iso) => (iso ? new Date(iso).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');
export const timeAgo = (iso) => {
  const m = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`;
};

export function Incidents({ items, title = 'Reported in the news' }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {items.map((a, i) => (
          <li key={a.sourceUrl || i} className="p-3">
            <p className="text-sm font-semibold text-slate-900">{a.title}</p>
            <p className="mt-0.5 text-xs text-slate-500">{a.where}{a.date ? ` · ${a.date}` : ''}</p>
            <p className="mt-1 text-sm text-slate-600">{a.what}</p>
            <a href={a.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
              {a.sourceName || 'Source'} <ExternalLink className="h-3 w-3" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Short answer: risk pill + headline, red "Watch out", green "Protect yourself", then the news items.
export function Result({ r, footer }) {
  const lv = LEVEL[r.level] || LEVEL.medium;
  return (
    <div className="mt-4 space-y-3">
      {r.notice && <p className="rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800">{r.notice}</p>}

      <div>
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${lv.cls}`}>{lv.label}</span>
        <h3 className="mt-2 text-lg font-bold leading-snug text-slate-900">{r.headline}</h3>
        {r.summary && <p className="mt-1 text-sm text-slate-600">{r.summary}</p>}
      </div>

      {r.dangers?.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3.5">
          <p className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-red-700"><AlertTriangle className="h-4 w-4" />Watch out</p>
          <ul className="space-y-1.5 text-sm text-red-900">
            {r.dangers.map((d, i) => <li key={i} className="flex gap-2"><XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />{d}</li>)}
          </ul>
        </div>
      )}

      {r.protect?.length > 0 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5">
          <p className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-emerald-700"><CheckCircle2 className="h-4 w-4" />Protect yourself</p>
          <ul className="space-y-1.5 text-sm text-emerald-900">
            {r.protect.map((d, i) => <li key={i} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />{d}</li>)}
          </ul>
        </div>
      )}

      <Incidents items={r.incidents} />
      <p className="text-xs text-slate-400">{footer || `${fmtTime(r.foundAt)}. AI can make mistakes, open the source to confirm.`}</p>
    </div>
  );
}
