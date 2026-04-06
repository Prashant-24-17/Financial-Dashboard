# Finance Dashboard System

A full-stack finance dashboard built with React, Node.js, Express, and MongoDB.

This project demonstrates how to design a backend for a finance dashboard where different users interact with financial data based on their role. It includes role-based access control, financial record management, dashboard analytics, validation, and MongoDB persistence, along with a React frontend that consumes the APIs.

## Demo Overview

The application supports three roles:

- `Viewer` can view records and dashboard data
- `Analyst` can view records and insights
- `Admin` can manage users and perform full record CRUD operations

For demo simplicity, the app uses a session-switching approach instead of full login/authentication. The frontend sends the selected user ID in the `x-user-id` header, and the backend enforces access rules from that user record.

## Features

### User And Role Management

- Create and manage users
- Assign roles: `viewer`, `analyst`, `admin`
- Mark users as `active` or `inactive`
- Restrict backend actions based on role

### Financial Records Management

- Create financial entries
- View all entries with pagination
- Update existing entries
- Delete entries
- Filter by `type`, `category`, `startDate`, and `endDate`

### Dashboard Summary APIs

- Total income
- Total expenses
- Net balance
- Category-wise totals
- Recent activity
- Monthly trends

### Validation And Error Handling

- Request validation using `Zod`
- Proper HTTP status codes
- Friendly JSON error responses
- Protection against invalid IDs, duplicate users, and malformed payloads

### Data Persistence

- MongoDB is used as the primary database
- Mongoose models manage users and financial records
- Seed data is inserted automatically on first backend startup

## Tech Stack

### Frontend

- React
- Vite
- Fetch API
- Plain CSS

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- Zod

## Project Structure

```text
finance-dashboard-system/
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── .env.example
│   ├── index.html
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.js
│   │   └── server.js
│   └── .env.example
├── package.json
└── README.md
```

## How It Works

### 1. Frontend Request Flow

- A user is selected from the session dropdown
- The frontend sends requests to the backend with `x-user-id`
- The frontend fetches:
  - current user profile
  - dashboard summary
  - financial records
- Admin users also fetch the user management list

### 2. Backend Access Control Flow

- Express reads `x-user-id`
- The backend finds the user in MongoDB
- If the user is missing or inactive, the request is rejected
- The `authorize()` middleware checks whether the role can access the route
- If allowed, the request proceeds to validation and business logic

### 3. Database Flow

- Mongoose models define the data shape
- Records are stored in the `financialrecords` collection
- Users are stored in the `users` collection
- Aggregation queries generate dashboard summaries directly from MongoDB

## Role Access Matrix

| Action | Viewer | Analyst | Admin |
|--------|--------|---------|-------|
| View dashboard summary | Yes | Yes | Yes |
| View financial records | Yes | Yes | Yes |
| Create records | No | No | Yes |
| Update records | No | No | Yes |
| Delete records | No | No | Yes |
| View all users | No | No | Yes |
| Create users | No | No | Yes |
| Update users | No | No | Yes |

## Setup Instructions

### Prerequisites

- Node.js installed
- MongoDB installed and running locally on `localhost:27017`
  or
- MongoDB Atlas connection string

### 1. Clone The Repository

```bash
git clone <your-repo-url>
cd <your-project-folder>
```

### 2. Install Dependencies

```bash
npm run install:all
```

### 3. Configure Environment Variables

Create `server/.env` using `server/.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/finance_dashboard
CLIENT_URL=http://localhost:5173
```

Optional frontend environment file using `client/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Start The Backend

```bash
npm run dev:server
```

### 5. Start The Frontend

In another terminal:

```bash
npm run dev:client
```

### 6. Open The Application

Frontend:

[http://localhost:5173](http://localhost:5173)

Backend health check:

[http://localhost:5000/api/health](http://localhost:5000/api/health)

## Seeded Demo Users

The backend automatically seeds demo users and sample financial records when the database is empty.

- `Admin User`
- `Ava Analyst`
- `Victor Viewer`

These users appear in the frontend session selector and help demonstrate role-based behavior.

## API Overview

### Session

- `GET /api/session/users`

Returns active users available for session switching.

### Users

- `GET /api/users/me`
- `GET /api/users`
- `POST /api/users`
- `PATCH /api/users/:id`

### Financial Records

- `GET /api/records`
- `POST /api/records`
- `PATCH /api/records/:id`
- `DELETE /api/records/:id`

Supported query parameters for `GET /api/records`:

- `type`
- `category`
- `startDate`
- `endDate`
- `page`
- `limit`

### Dashboard

- `GET /api/dashboard/summary`


## Design Decisions

### Why MongoDB?

MongoDB is a good fit for this project because:

- it is easy to set up for local development
- it works well with flexible financial record documents
- aggregation pipelines make summary analytics straightforward

### Why Session Switching Instead Of Full Authentication?

This project focuses on:

- backend structure
- access control
- CRUD operations
- validation
- dashboard summaries

So instead of adding passwords and JWT authentication, the app uses a simpler demo model to make the RBAC behavior easier to test and explain.

### Why Compute Summaries In The Backend?

Summary values such as total income, expenses, net balance, and monthly trends are generated on the backend so:

- the frontend stays lighter
- aggregation logic is centralized
- the API can serve multiple clients consistently

## Future Improvements

- Add JWT-based authentication and password hashing
- Add unit and integration tests
- Add search, sorting, and export functionality
- Support charts with richer analytics
- Add audit logs for admin actions
- Add Docker setup for easier deployment

