# AgriConnect

Hackathon-ready agricultural procurement, marketplace and AI assistant platform focused on reducing farmer waiting time and uncertainty.

## Current MVP

- Responsive farmer-first UX
- Live procurement-centre slot availability
- Authenticated slot booking
- Marketplace crop search, filtering and direct offers
- Farmer/buyer account flow with JWT authentication
- Express backend API
- Official OpenAI SDK + Responses API integration
- Server-side environment secrets; no API keys in frontend code

## Run locally

```bash
npm install
cp .env.example .env
npm start
```

Open `http://localhost:3000`.

## Enable OpenAI AI assistant

1. Create an OpenAI API key in your OpenAI account.
2. Put it only in the server environment as `OPENAI_API_KEY`.
3. Set `OPENAI_MODEL` to a model available to your API account. The default is `gpt-5.6-luna`.
4. Restart the server.

Example `.env`:

```env
OPENAI_API_KEY=your_real_key_here
OPENAI_MODEL=gpt-5.6-luna
JWT_SECRET=replace-with-a-long-random-secret
CORS_ORIGIN=http://localhost:3000
PORT=3000
```

**Never commit `.env` or expose the API key in browser JavaScript.** The browser calls `/api/ai/chat`; the Express server calls OpenAI.

## API

- `GET /api/health` — API and AI configuration health
- `POST /api/auth/register` — create farmer/buyer account
- `POST /api/auth/login` — authenticate
- `GET /api/auth/me` — current authenticated user
- `GET /api/procurement/slots` — procurement slots
- `POST /api/procurement/book` — authenticated slot booking
- `GET /api/crops` — marketplace crops
- `GET /api/offers` — authenticated buyer's offers
- `POST /api/offers` — create authenticated buyer offer
- `POST /api/ai/chat` — AgriConnect AI assistant

## Security note

For deployment, configure secrets through the hosting provider's environment-variable/secret manager. Do not store API keys in GitHub source files.

## Next hackathon build phases

1. Persistent PostgreSQL/Supabase database
2. Role-based farmer/buyer/admin authorization
3. Procurement queue and payment-status workflows
4. SMS/WhatsApp notifications
5. Government procurement-centre integration where APIs/data are available
6. AI crop/procurement assistant with retrieval over verified scheme and centre data
7. Deployment + CI/CD + monitoring
