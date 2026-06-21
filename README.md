# EventLens — Dashboard Client

React frontend for [EventLens](https://github.com/ydv-ankit/eventlens-server) — an open-source, self-hostable analytics platform. Visualise event volume, explore user flows, manage projects and API keys, and monitor system health in real time.

## Related Repositories

| Repo | Description |
|---|---|
| [eventlens-server](https://github.com/ydv-ankit/eventlens-server) | API server, Kafka worker, and infrastructure |
| [eventlens-sdk](https://github.com/ydv-ankit/eventlens-sdk) | JavaScript browser SDK (`eventlens-js` on npm) |

## Tech Stack

- **React 19** + TypeScript + Vite
- **shadcn/ui** (New York style, dark mode default)
- **TanStack Query** for server state
- **Zustand** for client state (selected project)
- **Recharts** for all charts
- **React Router v6**
- **Clerk** for authentication

## Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/arch` | System architecture diagram |
| `/docs` | Documentation (SDK, REST API, self-hosting) |
| `/dashboard` | KPI cards, event volume chart, recent events, system health |
| `/projects` | Project grid — create, edit, delete |
| `/projects/:id` | Project detail — Overview, API Keys, Events, Analytics, Settings tabs |
| `/events` | Event Explorer — filter sidebar, infinite scroll table, event detail drawer |
| `/analytics` | Charts — volume, top events, active users, distribution, heatmap |
| `/users/:id` | User timeline — chronological event history |
| `/system` | System health — Kafka, DB, worker metrics |
| `/settings` | General settings |

## Getting Started

```bash
# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
# Set VITE_CLERK_PUBLISHABLE_KEY and VITE_API_URL

# Start dev server
npm run dev
```

The app runs on `http://localhost:5173` by default. It expects the API server running on `http://localhost:8080` — see [eventlens-server](https://github.com/ydv-ankit/eventlens-server) for setup.

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key — get it from [clerk.com](https://clerk.com) |
| `VITE_API_URL` | Base URL of the EventLens server (default: `http://localhost:8080`) |

## Integrating the SDK

To track events from your own site, use the JavaScript SDK:

```bash
npm install eventlens-js
```

```ts
import EventLens from "eventlens-js";

const el = new EventLens({ apiKey: "el_your_api_key" });
el.identify("user_123");
el.track("purchase_completed", { plan: "pro" });
```

See [eventlens-sdk](https://github.com/ydv-ankit/eventlens-sdk) for full documentation.
