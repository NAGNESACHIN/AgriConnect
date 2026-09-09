# AgriConnect

Hackathon-ready agricultural procurement platform focused on reducing farmer waiting time and uncertainty.

## Current MVP

- Responsive landing page with farmer-first UX
- Live procurement-centre slot availability
- Slot booking flow
- Queue/capacity visualization
- Express backend API
- Server-side AI assistant integration
- Environment-based secrets; no API keys in frontend code

## Run locally

```bash
npm install
cp .env.example .env
npm start
```

Open `http://localhost:3000`.

### Enable AI

Set `OPENAI_API_KEY` in `.env`. Optionally set `OPENAI_MODEL` to a model available to your API account. The browser only calls `/api/ai/chat`; the provider key remains on the server.

## API

- `GET /api/health`
- `GET /api/procurement/slots`
- `POST /api/procurement/book`
- `POST /api/ai/chat`

## Next hackathon build phases

1. Persistent PostgreSQL/Supabase database
2. Farmer/buyer/admin authentication with secure sessions
3. Procurement queue and payment-status workflows
4. SMS/WhatsApp notifications
5. Government procurement-centre integration where APIs/data are available
6. AI crop/procurement assistant with retrieval over verified scheme and centre data
7. Deployment + CI/CD + monitoring
