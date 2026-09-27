# Frontend

See the [integrated project setup](../README.md).

- Start: `npm run dev`
- URL: http://127.0.0.1:3100/register
- Build: `npm run build`
- Production: `npm start`
- Tests: `npm test`
- API proxy: `BACKEND_URL` in `.env.local`, default http://127.0.0.1:4000

The UI reads and writes real backend records. Sign-in tokens are memory-only. Refreshing requires another login; database records and preferences are retained.
