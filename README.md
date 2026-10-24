# ResQnet

**AI-assisted emergency incident management and disaster-response platform**

ResQnet connects citizens, an Emergency Operations Center (EOC), rescue teams, hospitals, and shelters through a shared, real-time incident map. It combines incident reporting, AI-assisted triage, role-based dashboards, facility-capacity updates, and real-time alerts in one platform.

Built with the **MERN stack**: MongoDB, Express.js, React, and Node.js.

> **Project status:** This README describes the current project scope and its demo workflow. ResQnet is a portfolio/demo project, not a certified emergency dispatch system. AI output, trust scores, resource recommendations, and demo data must not be treated as a substitute for professional emergency services or operational validation.

## Contents

- [Highlights](#highlights)
- [Technology stack](#technology-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
  - [Option A: Docker](#option-a-run-with-docker)
  - [Option B: Manual setup](#option-b-run-without-docker)
- [Demo accounts](#demo-accounts)
- [Environment variables](#environment-variables)
- [Deployment](#deployment)
- [Architecture notes](#architecture-notes)
- [Roadmap](#roadmap)
- [Skills demonstrated](#skills-demonstrated)
- [Contributing](#contributing)
- [License](#license)

## Highlights

### Incident reporting and AI-assisted triage
- Citizens can submit SOS alerts and incident reports on a Leaflet map using OpenStreetMap tiles.
- The AI triage service suggests an incident category, severity, and relevant resources. A deterministic fallback classifier can be used when the Gemini API is unavailable or not configured.
- Incident summaries provide concise briefings intended to help dashboard users scan reports.
- A rule-based resource checklist suggests response resources based on incident type and severity.

### Real-time incident operations
- Socket.IO broadcasts incident creation, status changes, facility updates, and EOC alerts to connected dashboards.
- The EOC dashboard includes an operational map, a situation summary, incident filters, and status advancement.
- The rescue team console shows assigned work and high-priority unassigned incidents that eligible users can self-assign.
- Incident status flow includes reported, acknowledged, dispatched, in progress, and resolved states.

### Incident trust and verification
- A weighted trust score combines GPS consistency, community votes, authority verification, and AI text confidence.
- Trust states include Pending, Suspicious, Verified, and Highly Trusted.
- Community members can confirm or dispute reports; authorized EOC/rescue users can verify or reject incidents.
- Duplicate detection uses geographic proximity and text similarity to identify likely duplicate reports.

### Facilities and emergency communication
- Hospital and shelter portals allow facility users to register a facility and update status and capacity information.
- EOC users can review organization verification documents.
- EOC users can issue and retract broadcast alerts displayed on connected dashboards.
- An emergency directory brings facility and response-organization contact details together.

### Role-aware assistant
- The shared assistant provides citizen-facing safety guidance and can help EOC users search incidents using natural-language queries.
- Responses depend on the user's role and available application data.

### Repeatable demo scenario
- A seed script creates a Mumbai Flood demo scenario with sample accounts, facilities, and incidents in varied trust states.
- The AI fallback and seeded data make it easier to demonstrate the application without relying entirely on external AI services.

## Technology stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router, TanStack Query |
| Maps | Leaflet, React Leaflet, OpenStreetMap |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose, 2dsphere geospatial indexes |
| Authentication | JWT access tokens and HTTP-only refresh-token cookie |
| Real-time updates | Socket.IO |
| AI | Google Gemini API with rule-based/mock fallback |
| Deployment options | Vercel (frontend), Render or Railway (backend), MongoDB Atlas (database) |
| Local development | Docker Compose or separate frontend/backend development servers |

## Project structure

```text
resqnet/
├── backend/
│   ├── src/
│   │   ├── config/             # Database connection
│   │   ├── models/             # User, Incident, Facility schemas
│   │   ├── middleware/         # Authentication, authorization, errors
│   │   ├── controllers/        # Request/business logic
│   │   ├── routes/             # Express API routes
│   │   ├── services/           # AI, duplicate detection, Socket.IO, etc.
│   │   ├── seed/               # Demo data seed script
│   │   └── server.js           # Backend entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/                # API client
│   │   ├── context/            # Authentication and socket context
│   │   ├── components/         # Shared UI components
│   │   ├── pages/              # Landing, auth, reporting, dashboards
│   │   └── App.jsx
│   ├── package.json
│   └── .env.example
├── docs/                       # Project documentation, if included
├── docker-compose.yml
├── DEPLOYMENT.md
└── README.md
```

> This is a guide to the main areas of the repository. If your actual filenames differ, keep this section aligned with the files in your GitHub repository. Existing documentation may still use the original internal project name, `CrisisGrid`.

## Getting started

### Requirements

Choose the setup method that works for you:

- **Docker option:** Docker Desktop (including Docker Compose).
- **Manual option:** a supported Node.js version, npm, and a MongoDB connection. A free MongoDB Atlas cluster can be used for development.

Clone your repository and enter its root directory:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_REPOSITORY_FOLDER>
```

Replace the placeholders with your actual GitHub URL and local folder name.

### Option A: Run with Docker

Docker Compose is intended to start MongoDB, the backend, and the frontend together for local development.

1. Create the backend environment file:

   ```bash
   cp backend/.env.example backend/.env
   ```

2. Edit `backend/.env`. Set strong, unique values for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`. For local development, the Docker Compose configuration may provide the MongoDB connection string. Leave the Gemini API key empty if you want to use the fallback AI behavior.

   Generate a random secret with Node.js:

   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

   Run the command separately for each secret.

3. Start the services from the repository root:

   ```bash
   docker compose up --build
   ```

4. In another terminal, seed the demo data:

   ```bash
   docker compose exec backend npm run seed
   ```

5. Open the frontend at **http://localhost:5173**. The backend is expected at **http://localhost:5000** when using the default development configuration.

Useful commands:

```bash
docker compose down                 # Stop the services
docker compose down -v              # Stop services and remove the MongoDB data volume
docker compose logs -f backend      # Follow backend logs
docker compose up --build           # Rebuild and start services
```

The development containers may support hot reload for source changes. Rebuild the services after dependency or Dockerfile changes.

### Option B: Run without Docker

#### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
```

Edit `backend/.env` and configure the required values. At minimum, use a valid MongoDB connection string for database-backed features and unique JWT secrets. Set `GEMINI_API_KEY` if you want to use Gemini; otherwise, use the configured fallback behavior.

Start the backend and seed demo data:

```bash
npm run seed
npm run dev
```

With the default development configuration, the API runs at **http://localhost:5000**.

#### 2. Frontend

Open a second terminal from the repository root:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open **http://localhost:5173**. Configure the frontend environment variables to point to the backend URL required by your setup.

> Check the `package.json` scripts and each `.env.example` file in your current checkout if a command or variable differs. Those files are the source of truth for your version of the project.

## Demo accounts

After running the seed script, the following demo accounts are documented for the seeded scenario:

| Role | Email | Password |
|---|---|---|
| Citizen | `citizen@demo.crisisgrid.app` | `Demo@1234` |
| EOC Control | `eoc@demo.crisisgrid.app` | `Demo@1234` |
| Rescue Team | `rescue@demo.crisisgrid.app` | `Demo@1234` |
| Hospital | `hospital@demo.crisisgrid.app` | `Demo@1234` |
| Shelter | `shelter@demo.crisisgrid.app` | `Demo@1234` |

These are **demo credentials only**. Never reuse them for real accounts or production systems. If you deploy a public demo, consider whether seeded accounts should be enabled and restrict their permissions and data accordingly.

## Environment variables

Use the checked-in `.env.example` files to see the exact variables supported by your version of the project.

Typical configuration includes:

- **Backend:** MongoDB URI, JWT access and refresh secrets, client/origin URL, and optional Gemini API key.
- **Frontend:** API base URL and any other `VITE_` variables required by the app.

Important:
- Never commit `.env` files, API keys, database credentials, JWT secrets, or other private values.
- Keep real secrets in your hosting provider's environment-variable settings.
- Variables prefixed with `VITE_` are exposed to frontend code after build. Do not put secrets in them.
- Rotate any secret immediately if it is accidentally pushed to a public repository.

## Deployment

For a step-by-step deployment guide, see [`DEPLOYMENT.md`](DEPLOYMENT.md), if that file is present in the repository.

The intended deployment layout is:

1. **MongoDB Atlas** for the database.
2. **Render or Railway** for the Node.js/Express backend.
3. **Vercel** for the Vite frontend.

Typical deployment checklist:

- Configure the production MongoDB URI and restrict database network access appropriately.
- Set unique production JWT secrets and any optional AI API key in the backend host.
- Configure the backend's allowed client origin to the deployed frontend URL.
- Configure the frontend API URL to point to the deployed backend.
- Confirm WebSocket/Socket.IO connectivity through the production hosting setup.
- Run any required seed process only if you intentionally want demo data in the target database.
- Test authentication, role authorization, incident creation, maps, facility updates, and real-time alerts after deployment.

**Deployment status:** Add your live frontend and backend URLs here after deployment is complete. Do not publish placeholder URLs as if they were live.

- Live application: _Not added yet_
- Backend/API: _Not added yet_

## Architecture notes

- **Role-based access:** A shared user model with a role field keeps authentication consistent. Facility-specific details can live in a separate facility model.
- **Token handling:** The documented approach uses an in-memory access token and an HTTP-only refresh-token cookie, avoiding persistent JWT storage in `localStorage`.
- **Graceful AI fallback:** The AI service attempts Gemini when configured and can fall back to deterministic classification if the API is unavailable or returns unusable output.
- **Explainable duplicate detection:** Geographic proximity narrows candidate incidents before text similarity is used to identify likely duplicates.
- **Real-time updates:** Socket.IO communicates changes to connected clients; the frontend can refresh relevant server-state queries in response.
- **Explainable trust scoring:** GPS, crowd, authority, and AI signals contribute to a weighted score. Missing signals should be handled neutrally where the implementation specifies.
- **Rule-based resource suggestions:** Resource checklists are generated from defined rules rather than asking a language model to invent dispatch quantities. These suggestions still require human review and real-world validation.

## Roadmap

The following items were identified as potential future improvements; confirm against the current code before treating any item as unfinished.

- Add dedicated volunteer, NGO, and administrator portals.
- Add image-based incident verification and a proper, secure file-upload service.
- Introduce dedicated police, fire, and municipal authority roles.
- Develop an offline-first Progressive Web App with local report queuing and background synchronization.
- Add background jobs and queues for workloads such as batch re-analysis and notifications.
- Explore a local-model option for AI-assisted classification.
- Add SMS alerts through a suitable provider and/or email notifications.
- Add weather/GIS overlays and validated route optimization.
- Add a donations/funding module with a safe payment integration.
- Expand demo data to include cyclone, earthquake, and wildfire scenarios.

## Skills demonstrated

- Full-stack MERN development and CRUD APIs
- JWT authentication and role-based authorization
- MongoDB schema design and geospatial queries
- Real-time communication with Socket.IO
- AI API integration with graceful fallback behavior
- Geographic and text-based duplicate detection
- Explainable, multi-signal trust scoring
- React Query server-state management
- Protected routing and responsive Tailwind UI
- Local development and deployment configuration

## Contributing

Contributions and suggestions are welcome.

1. Create a branch for your change.
2. Keep changes focused and document new environment variables.
3. Test the affected frontend and backend behavior.
4. Open a pull request describing the change and any setup steps.

For significant changes, especially those affecting incident severity, verification, dispatch suggestions, or user permissions, include tests and document the expected behavior.

## License

No license is specified in this README. Add a `LICENSE` file and name the license here if you intend to make the project open source. Without a license, others generally do not have explicit permission to reuse, modify, or distribute the code.
