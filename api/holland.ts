import { createApiApp } from '../server.ts';

const app = createApiApp();

export default function handler(req: any, res: any) {
  if (!req.url || !req.url.startsWith('/api/holland')) {
    const qs = req.url && req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    req.url = `/api/holland${qs}`;
  }
  return app(req, res);
}
