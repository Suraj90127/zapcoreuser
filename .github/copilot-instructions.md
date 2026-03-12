# Copilot Instructions for AI Agents

## Project Overview
This codebase is a full-stack web application with a Node.js/Express backend and a React/Vite frontend. It manages users, providers, and games, with MongoDB as the database. The backend exposes RESTful APIs, and the frontend is a SPA using React Router.

## Architecture & Key Components
- **Backend (API Server)**
  - Entry: `server.js` (Express app)
  - Database: MongoDB, connection via `config/db.js` (uses `MONGO_URI` from environment)
  - Main routes: `routes/userRoute.js`, `routes/providerRoute.js`, `routes/gameRoute.js`
  - Controllers: Business logic in `controllers/`
  - Models: Mongoose schemas in `models/`
  - Middleware: Auth logic in `middelware/authUser.js`
  - Error handling: Centralized in `server.js`
  - Health check: `/health` endpoint
  - Static views: Served from `/views`

- **Frontend (Client)**
  - Entry: `client/src/main.jsx`, main app in `client/src/App.jsx`
  - Routing: React Router (`react-router-dom`)
  - Styling: Tailwind CSS (`tailwind.config.js`, `postcss.config.js`)
  - Components: `client/src/components/`, pages in `client/src/pages/`
  - Build tool: Vite

## Developer Workflows
- **Start Backend (API):**
  - Dev mode (auto-reload): `npm run dev` (uses `nodemon`)
  - Production: `npm start`
- **Start Frontend (Client):**
  - Dev server: `npm run dev` (from `client/` directory)
  - Build: `npm run build` (from `client/`)
  - Preview: `npm run preview` (from `client/`)
- **Linting:**
  - Frontend: `npm run lint` (from `client/`)
- **Environment Variables:**
  - Backend: `.env` file required with `MONGO_URI`, `JWT_SECRET`, etc.

## Patterns & Conventions
- **API routes** are grouped under `/api` (see `server.js`).
- **User authentication** uses JWT, with tokens set as HTTP-only cookies.
- **Error responses** use JSON with `error` or `message` fields.
- **Frontend routing** is managed via React Router, with pages/components split by feature.
- **Database models** use Mongoose, with schemas in `models/`.
- **Sensitive config** is loaded via `dotenv`.
- **Health check** endpoint is `/health`.

## Integration Points
- **MongoDB**: Connection via `config/db.js`, models in `models/`.
- **JWT**: Used for user authentication (`jsonwebtoken` in controllers).
- **Axios**: Used for HTTP requests in backend and/or frontend.
- **Tailwind CSS**: Used for frontend styling.

## Examples
- **Add a new API route:**
  - Create controller in `controllers/`
  - Add route in `routes/`
  - Mount in `server.js` under `/api`
- **Add a new frontend page:**
  - Create component in `client/src/pages/`
  - Add `<Route>` in `client/src/App.jsx`

## References
- Backend entry: `server.js`
- Frontend entry: `client/src/main.jsx`, `client/src/App.jsx`
- API routes: `routes/`
- Models: `models/`
- Controllers: `controllers/`
- Middleware: `middelware/`
- Frontend components: `client/src/components/`
- Frontend pages: `client/src/pages/`

---
_If any section is unclear or missing, please provide feedback to improve these instructions._
