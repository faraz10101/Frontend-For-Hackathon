import { useEffect, useState } from 'react';
import { Loader2, Radio } from 'lucide-react';
import { getLiveFeed } from '../../api/scamshield';
import { Card } from '../ui/card';
import { ErrorBox } from '../common/Bits';
import { Incidents, Result, timeAgo } from './LiveResult';

// PUBLIC live feed: visible to everyone (logged in or not). The server researches it automatically and saves it,
// so opening this page never costs an AI call.
export default function LiveFeed() {
  const [feed, setFeed] = useState(null);
  const [tab, setTab] = useState('latest');
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    getLiveFeed().then((d) => alive && setFeed(d)).catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, []);

  const current = feed?.topics?.find((t) => t.id === tab);

  return (
    <Card className="mb-6 border-red-200 p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" /></span>
            Live scam feed
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">What is happening in the real world right now. Updated automatically every 6 hours.</p>
        </div>
        {feed?.updatedAt && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Updated {timeAgo(feed.updatedAt)}</span>}
      </div>

      {!feed && !error && <p className="mt-4 flex items-center gap-2 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" />Loading the latest alerts...</p>}
      <div className="mt-3"><ErrorBox>{error}</ErrorBox></div>

      {feed?.mode === 'empty' && (
        <p className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-500"><Radio className="h-4 w-4" />The live feed is being prepared. Please check again in a few minutes.</p>
      )}

      {feed && feed.mode !== 'empty' && (
        <>
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Feed topic">
            {[{ id: 'latest', label: 'Latest' }, ...feed.topics.filter((t) => t.result)].map((t) => (
              <button key={t.id} type="button" onClick={() => setTab(t.id)} aria-pressed={tab === t.id}
                className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${tab === t.id ? 'border-primary bg-indigo-50 text-primary' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="mt-4">
            {tab === 'latest' || !current?.result
              ? <Incidents items={feed.incidents} title="Latest scam reports from the news" />
              : <div className="-mt-4"><Result r={current.result} footer={`Saved ${timeAgo(current.result.foundAt)}. AI can make mistakes, open the source to confirm.`} /></div>}
          </div>
        </>
      )}
    </Card>
  );
}
