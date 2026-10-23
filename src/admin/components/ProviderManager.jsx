import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, RefreshCw, Trash2, Zap, Lock, Activity, Globe, Loader2 } from 'lucide-react';
import { adminApi } from '../../api/scamshield';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { PageShell, Spinner, ErrorBox, SuccessBox } from '../../components/common/Bits';

const BLANK = { name: '', type: 'gemini', model: '', embedModel: '', baseUrl: '', apiKey: '', priority: 10 };

export default function ProviderManager({ adminKey, onLock }) {
  const api = useMemo(() => adminApi(adminKey), [adminKey]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [tests, setTests] = useState({});
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [health, setHealth] = useState(null);
  const [busy, setBusy] = useState('');
  const [research, setResearch] = useState(null);

  const testAll = async () => {
    setBusy('health'); setError(''); setHealth(null);
    try { setHealth(await api.health(true)); await load(); } catch (e) { setError(e.message); }
    finally { setBusy(''); }
  };
  const runResearch = async () => {
    setBusy('research'); setError(''); setResearch(null);
    try { setResearch(await api.researchRun()); } catch (e) { setError(e.message); }
    finally { setBusy(''); }
  };

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setItems(await api.list()); }
    catch (e) { setError(e.status === 401 || e.status === 403 ? 'Wrong admin key.' : e.message); if (e.status === 401 || e.status === 403) onLock(); }
    finally { setLoading(false); }
  }, [api, onLock]);

  useEffect(() => { load(); }, [load]);

  const run = async (fn, okMsg) => {
    setError(''); setInfo('');
    try { await fn(); if (okMsg) setInfo(okMsg); await load(); } catch (e) { setError(e.message); }
  };

  const test = async (id) => {
    setTests((t) => ({ ...t, [id]: { loading: true } }));
    try { const d = await api.test(id); setTests((t) => ({ ...t, [id]: { data: d } })); }
    catch (e) { setTests((t) => ({ ...t, [id]: { data: { ok: false, error: e.message } } })); }
  };

  const create = async (e) => {
    e.preventDefault(); setSaving(true); setError(''); setInfo('');
    try {
      const body = { ...form, priority: Number(form.priority) || 10 };
      if (body.type !== 'openai') delete body.baseUrl;
      await api.create(body);
      setForm(BLANK); setInfo('Provider added.'); await load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const f = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  return (
    <PageShell title="AI providers" subtitle="Providers are tried by priority (lowest number first). Failing ones cool down automatically.">
      <div className="mb-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={load}><RefreshCw className="mr-1.5 h-3.5 w-3.5" />Refresh</Button>
        <Button variant="outline" size="sm" onClick={() => run(api.resetCooldowns, 'All cooldowns cleared.')}>Reset cooldowns</Button>
        <Button size="sm" onClick={testAll} disabled={!!busy}>{busy === 'health' ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Activity className="mr-1.5 h-3.5 w-3.5" />}Test all providers</Button>
        <Button size="sm" variant="secondary" onClick={runResearch} disabled={!!busy}>{busy === 'research' ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Globe className="mr-1.5 h-3.5 w-3.5" />}Run web research now</Button>
        <Button variant="ghost" size="sm" onClick={onLock}><Lock className="mr-1.5 h-3.5 w-3.5" />Lock</Button>
      </div>

      {health && (
        <Card className="mb-4 p-4">
          <p className="mb-2 text-sm font-semibold text-slate-900">{health.working}/{health.total} provider(s) working</p>
          <ul className="space-y-1.5 text-xs">
            {health.providers.map((p) => (
              <li key={p.name} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="w-24 font-semibold text-slate-800">{p.name}</span>
                {p.skipped ? <span className="text-slate-400">skipped ({p.skipped})</span> : (
                  <>
                    {['generate', 'embed', 'search'].filter((k) => p[k]).map((k) => (
                      <span key={k} className={p[k].ok ? 'text-emerald-700' : 'text-red-600'}>
                        {k === 'generate' ? 'answer' : k === 'search' ? 'web search' : 'embedding'}: {p[k].ok ? `OK ${p[k].ms} ms` : `FAILED (${p[k].error})`}
                      </span>
                    ))}
                  </>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {research && (
        <Card className="mb-4 p-4 text-sm">
          <p className="font-semibold text-slate-900">Research result: {research.status}{research.saved !== undefined ? ` (${research.saved} saved)` : ''}</p>
          {research.error && <p className="mt-1 text-xs text-red-600">{research.error}</p>}
          {research.status === 'empty' && <p className="mt-1 text-xs text-slate-500">AI answered, but nothing passed the safety checks (real source, recent, not duplicate).</p>}
          {research.alerts?.map((a, i) => <p key={i} className="mt-2 text-xs text-slate-600"><b>{a.title}</b> · <a className="text-primary underline" href={a.sourceUrl} target="_blank" rel="noopener noreferrer">{a.sourceName}</a></p>)}
        </Card>
      )}
      <div className="mb-4 space-y-2"><ErrorBox>{error}</ErrorBox><SuccessBox>{info}</SuccessBox></div>

      {loading && !items.length ? <Spinner /> : (
        <div className="space-y-3">
          {items.length === 0 && <p className="text-sm text-slate-500">No providers yet. Add one below. Without any, the backend uses rule-based fallbacks.</p>}
          {items.map((p) => {
            const t = tests[p._id];
            const cooling = p.cooldownUntil && new Date(p.cooldownUntil) > new Date();
            return (
              <Card key={p._id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{p.name} <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-500">{p.type}</span></p>
                    <p className="text-xs text-slate-500">{p.model}{p.embedModel ? ` · embed: ${p.embedModel}` : ''}{p.baseUrl ? ` · ${p.baseUrl}` : ''}</p>
                    <p className="mt-1 text-xs text-slate-500">✓ {p.successCount} · ✗ {p.failCount}{cooling ? ` · cooling until ${new Date(p.cooldownUntil).toLocaleTimeString()}` : ''}</p>
                    {p.lastError && <p className="mt-1 text-xs text-red-600">Last error: {p.lastError}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="flex items-center gap-1.5 text-xs text-slate-600">Priority
                      <input type="number" defaultValue={p.priority} className="h-8 w-16 rounded-md border border-slate-200 px-2 text-sm"
                        onBlur={(e) => Number(e.target.value) !== p.priority && run(() => api.update(p._id, { priority: Number(e.target.value) }))} />
                    </label>
                    <Button size="sm" variant={p.enabled ? 'secondary' : 'outline'} onClick={() => run(() => api.update(p._id, { enabled: !p.enabled }))}>{p.enabled ? 'Enabled' : 'Disabled'}</Button>
                    <Button size="sm" variant="outline" onClick={() => test(p._id)} disabled={t?.loading}><Zap className="mr-1 h-3.5 w-3.5" />{t?.loading ? 'Testing...' : 'Test'}</Button>
                    <Button size="sm" variant="destructive" onClick={() => window.confirm(`Delete ${p.name}?`) && run(() => api.remove(p._id), 'Provider removed.')}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                {t?.data && (
                  <p className={`mt-2 rounded-lg px-3 py-2 text-xs font-medium ${t.data.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {t.data.ok ? `Working (${t.data.ms} ms)` : `Failed: ${t.data.error}`}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Card className="mt-8">
        <form onSubmit={create} className="grid gap-4 p-5 sm:grid-cols-2">
          <h2 className="text-sm font-semibold text-slate-900 sm:col-span-2">Add provider</h2>
          <div className="space-y-1.5"><Label htmlFor="pn">Name</Label><Input id="pn" value={form.name} onChange={f('name')} required placeholder="gemini-main" /></div>
          <div className="space-y-1.5"><Label htmlFor="pt">Type</Label>
            <select id="pt" value={form.type} onChange={f('type')} className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm">
              <option value="gemini">gemini</option><option value="openai">openai (any compatible API)</option>
            </select></div>
          <div className="space-y-1.5"><Label htmlFor="pm">Model</Label><Input id="pm" value={form.model} onChange={f('model')} required placeholder="gemini-2.0-flash" /></div>
          <div className="space-y-1.5"><Label htmlFor="pe">Embed model (optional)</Label><Input id="pe" value={form.embedModel} onChange={f('embedModel')} placeholder="text-embedding-004" /></div>
          {form.type === 'openai' && <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="pb">Base URL</Label><Input id="pb" value={form.baseUrl} onChange={f('baseUrl')} required placeholder="https://api.groq.com/openai/v1" /></div>}
          <div className="space-y-1.5"><Label htmlFor="pk">API key</Label><Input id="pk" type="password" value={form.apiKey} onChange={f('apiKey')} required autoComplete="off" /></div>
          <div className="space-y-1.5"><Label htmlFor="pp">Priority</Label><Input id="pp" type="number" value={form.priority} onChange={f('priority')} /></div>
          <Button type="submit" disabled={saving} className="sm:col-span-2"><Plus className="mr-1.5 h-4 w-4" />{saving ? 'Adding...' : 'Add provider'}</Button>
        </form>
      </Card>
    </PageShell>
  );
}
