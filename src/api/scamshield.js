import axios from 'axios';
import API from './client';

// GET /api/feed?city=  -> homepage "scam weather"
export const getFeed = async (city) => {
  const { data } = await API.get('/feed', { params: city ? { city } : {} });
  return data.data;
};

// POST /api/check  { content }  -> verdict (AI can take a while, so longer timeout)
export const checkContent = async (content) => {
  const { data } = await API.post('/check', { content }, { timeout: 60000 });
  return data.data;
};

// POST /api/reports  (login + verified email) -> { message, data:{ reportId, reputation, complaintReady } }
export const submitReport = async (payload) => {
  const { data } = await API.post('/reports', payload, { timeout: 60000 });
  return data;
};

// GET /api/reports/lookup?q=  -> { numbers:[], hosts:[] }
export const lookupReputation = async (q) => {
  const { data } = await API.get('/reports/lookup', { params: { q } });
  return data.data;
};

// GET /api/reports/complaint?target=  -> { text, summary, uniqueReporters, ... }
export const getComplaint = async (target) => {
  const { data } = await API.get('/reports/complaint', { params: { target }, timeout: 30000 });
  return data.data;
};

// GET /api/live/info  (login) -> { topics:[{id,label}], quota:{ limit, used, remaining, resetsAt } }
export const getLiveInfo = async () => (await API.get('/live/info')).data.data;

// POST /api/live/search { topic } (login) -> { result, quota }. Web search can take up to a minute.
export const liveSearch = async (topic, query = '') =>
  (await API.post('/live/search', query ? { query } : { topic }, { timeout: 95000 })).data.data;

// GET /api/live/feed  (NO login) -> { mode, topics:[{id,label,result}], incidents:[...], updatedAt, nextUpdateAt }
export const getLiveFeed = async () => (await API.get('/live/feed', { timeout: 20000 })).data.data;

/* ---------- Admin (x-admin-key header) ---------- */
const adminClient = (key) => {
  const c = axios.create({
    baseURL: API.defaults.baseURL,
    headers: { 'x-admin-key': key, 'Content-Type': 'application/json' },
    timeout: 30000,
  });
  c.interceptors.response.use((r) => r, (e) =>
    Promise.reject({ message: e.response?.data?.message || (e.response ? 'Request failed.' : 'Cannot reach the server.'), status: e.response?.status })
  );
  return c;
};

export const adminApi = (key) => {
  const c = adminClient(key);
  return {
    list: async () => (await c.get('/admin/providers')).data.data,
    // returns { data: provider, note }. Empty model = the server picks and tests one automatically (can take a while).
    create: async (body) => (await c.post('/admin/providers', body, { timeout: 150000 })).data,
    autoModel: async (id) => (await c.post(`/admin/providers/${id}/auto-model`, {}, { timeout: 150000 })).data,
    refreshLive: async () => (await c.post('/admin/live/refresh', {}, { timeout: 300000 })).data.data,
    update: async (id, patch) => (await c.patch(`/admin/providers/${id}`, patch)).data.data,
    remove: async (id) => (await c.delete(`/admin/providers/${id}`)).data,
    previewModels: async (body) => (await c.post('/admin/providers/preview-models', body, { timeout: 30000 })).data.data,
    models: async (id) => (await c.get(`/admin/providers/${id}/models`)).data.data,
    test: async (id) => (await c.post(`/admin/providers/${id}/test`, {}, { timeout: 60000 })).data.data,
    resetCooldowns: async () => (await c.post('/admin/providers/reset-cooldowns', {})).data,
    health: async (search = false) => (await c.get('/admin/ai/health', { params: search ? { search: 1 } : {}, timeout: 120000 })).data.data,
    researchStatus: async () => (await c.get('/admin/research/status')).data.data,
    researchRun: async () => (await c.post('/admin/research/run', {}, { timeout: 180000 })).data.data,
  };
};
