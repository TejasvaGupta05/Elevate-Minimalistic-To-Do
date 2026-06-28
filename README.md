# Task Tracker

A simple React + Express task tracker app with filter, sort, and priority support.

## Setup

### Backend

1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set environment variables in `.env` or on your host:
   - `MONGO_URI` — MongoDB connection string
   - `CLIENT_URL` — frontend origin (optional)
4. Start the backend:
   ```bash
   npm start
   ```

### Frontend

1. Navigate to the client folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure `VITE_API_URL` in `client/.env` if the backend is deployed elsewhere.
4. Start the frontend in development:
   ```bash
   npm run dev
   ```

## API Endpoints

The backend exposes the following endpoints under `/api/tasks`:

- `GET /api/tasks` — list tasks
- `GET /api/tasks/:id` — get a single task
- `POST /api/tasks` — create a new task
- `PUT /api/tasks/:id` — update an existing task
- `DELETE /api/tasks/:id` — delete a task

## Deployment

The project is configured for Render:

- `render.yaml` defines the backend service at `server/`
- `render.yaml` defines the frontend static site at `client/`

### Required environment variables on Render

- `MONGO_URI` — MongoDB Atlas connection string
- `CLIENT_URL` — frontend origin
- `VITE_API_URL` — backend base URL for the frontend service

## Notes

- Priority badges are color-coded in the UI:
  - `high` = red
  - `medium` = yellow
  - `low` = green
- Toast notifications appear for success and error messages.
