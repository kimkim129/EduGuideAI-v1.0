import { createApiApp } from '../server.ts';

const app = createApiApp();

export default function handler(req: any, res: any) {
  if (!req.url || !req.url.startsWith('/api/holland-nganh-nghe')) {
    const qs = req.url && req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    req.url = `/api/holland-nganh-nghe${qs}`;
  }
  return app(req, res);
}
