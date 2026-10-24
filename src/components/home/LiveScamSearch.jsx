import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Loader2, LogIn, Search, Sparkles } from 'lucide-react';
import { getLiveInfo, liveSearch } from '../../api/scamshield';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { ErrorBox } from '../common/Bits';
import { useAuth } from '../../context/AuthContext';
import { Result, fmtTime } from './LiveResult';

const FALLBACK_TOPICS = [
  { id: 'today', label: "Today's biggest scam" },
  { id: 'wallet', label: 'Bank & wallet fraud' },
  { id: 'job', label: 'Job & investment' },
  { id: 'govt', label: 'Fake govt messages' },
];

// Personal fresh search (login needed, 5 a day). The result is saved in the user's account, so a reload keeps it.
export default function LiveScamSearch() {
  const { user } = useAuth();
  const [topics, setTopics] = useState(FALLBACK_TOPICS);
  const [topic, setTopic] = useState('today');
  const [text, setText] = useState('');
  const [quota, setQuota] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false); // true = this is the old result loaded from the account

  useEffect(() => {
    if (!user) return undefined;
    let alive = true;
    getLiveInfo()
      .then((d) => { if (!alive) return; setTopics(d.topics); setQuota(d.quota); if (d.latest) { setResult(d.latest); setSaved(true); } })
      .catch(() => { /* the button still works, the counter just stays hidden */ });
    return () => { alive = false; };
  }, [user]);

  const run = async (e) => {
    e?.preventDefault();
    const q = text.trim();
    setLoading(true); setError('');
    try {
      const d = await liveSearch(topic, q.length >= 3 ? q : '');
      setResult(d.result); setQuota(d.quota); setSaved(false);
    } catch (err) {
      setError(err.message);
      if (err.status === 429) setQuota((x) => (x ? { ...x, remaining: 0 } : x));
    } finally { setLoading(false); }
  };

  const left = quota?.remaining;
  const noneLeft = left === 0;
  const typed = text.trim().length >= 3;

  return (
    <Card className="mb-6 border-indigo-200 p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900"><Sparkles className="h-4 w-4 text-primary" /> Get current data now</h2>
          <p className="mt-0.5 text-sm text-slate-500">Pick a topic or type your own search. You get a fresh short answer, saved in your account.</p>
        </div>
        {user && quota && (
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${noneLeft ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
            {quota.remaining} of {quota.limit} searches left today
          </span>
        )}
      </div>

      {user ? (
        <form onSubmit={run}>
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Topic">
            {topics.map((t) => (
              <button key={t.id} type="button" onClick={() => { setTopic(t.id); setText(''); }} disabled={loading} aria-pressed={!typed && topic === t.id}
                className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60 ${!typed && topic === t.id ? 'border-primary bg-indigo-50 text-primary' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Input value={text} onChange={(e) => setText(e.target.value.slice(0, 60))} disabled={loading} placeholder="Or type your own, e.g. Easypaisa lottery, fake job Dubai" className="h-10" aria-label="Your own search" />
            <Button type="submit" disabled={loading || noneLeft} className="h-10 shrink-0">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Searching...</> : <>{typed ? <Search className="mr-2 h-4 w-4" /> : <Globe className="mr-2 h-4 w-4" />}{noneLeft ? 'No searches left today' : typed ? 'Search' : 'Fetch current data'}</>}
            </Button>
          </div>
          {loading && <p className="mt-2 text-xs text-slate-400">This can take up to a minute.</p>}
        </form>
      ) : (
        <div className="mt-3">
          <Link to="/login" state={{ from: '/' }}>
            <Button className="h-10 w-full sm:w-auto"><LogIn className="mr-2 h-4 w-4" />Log in to fetch fresh data (free, 5 a day)</Button>
          </Link>
          <p className="mt-2 text-xs text-slate-400">The live feed above is open to everyone. Log in only if you want your own fresh search.</p>
        </div>
      )}

      <div className="mt-3"><ErrorBox>{error}</ErrorBox></div>
      {result && (
        <>
          {saved && <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Your last search{result.query ? `: "${result.query}"` : ''}</p>}
          <Result r={result} footer={`${result.mode === 'live' ? 'Fresh search' : 'Saved result'} · ${fmtTime(result.savedAt || result.foundAt)}. AI can make mistakes, open the source to confirm.`} />
        </>
      )}
    </Card>
  );
}
