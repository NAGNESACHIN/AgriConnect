# AgriConnect merge notes

The current `main` application keeps the procurement/queue/AI experience as the primary entry point and incorporates the previous AgriConnect marketplace concepts into the same app.

## Merged capabilities
- Smart procurement slot discovery and booking
- Live slot capacity/queue visibility
- Farmer/buyer role selection for the demo account flow
- Direct crop marketplace with categories, search and sorting
- Direct buyer offers with quantity, price and notes
- Farmer/buyer dashboard with offer history
- Server-side AI assistant integration
- Persistent demo offer storage in `data/offers.json`

The earlier project used a premium agricultural marketplace UI, farmer/buyer role flows and crop search/filter concepts; those concepts are now integrated into the current procurement-first application rather than being kept as a disconnected second app.

For production, replace the JSON demo store with PostgreSQL/SQLite and replace demo account handling with the full authenticated user model before accepting real transactions.
