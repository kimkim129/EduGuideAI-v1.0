import { createApiApp } from '../server.ts';

const app = createApiApp();

export default function handler(req: any, res: any) {
  if (!req.url || !req.url.startsWith('/api/dai-hoc')) {
    const qs = req.url && req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    req.url = `/api/dai-hoc${qs}`;
  }
  return app(req, res);
}
