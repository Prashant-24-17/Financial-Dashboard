# Finance Dashboard System

A full-stack finance dashboard built with React, Node.js, Express, and MongoDB.

## Features

- Role-based user management with `viewer`, `analyst`, and `admin`
- Financial record CRUD with filtering by type, category, and date
- Dashboard summary APIs for totals, trends, category breakdowns, and recent activity
- Backend validation and structured error handling
- Demo session switching so the frontend can preview permissions without a full auth system

## Project Structure

- `client/` React dashboard built with Vite
- `server/` Express API with MongoDB and Mongoose

## Quick Start

1. Install MongoDB locally or use MongoDB Atlas.
2. Create `server/.env` from `server/.env.example`.
3. Install dependencies:

```bash
npm run install:all
```

4. Start the backend:

```bash
npm run dev:server
```

5. Start the frontend in another terminal:

```bash
npm run dev:client
```

## Demo Access Model

For simplicity, authentication is represented by selecting a seeded user in the frontend. The selected user ID is sent as `x-user-id`, and the backend enforces role-based access from that user.

Seeded demo users:

- `Admin User` for full access
- `Ava Analyst` for read-only analytics access
- `Victor Viewer` for view-only dashboard access

## Notes

- MongoDB is the persistence layer for users and financial records.
- The session-switching flow is intentionally simplified for demo and portfolio use.
