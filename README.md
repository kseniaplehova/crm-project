# CRM Project

A small CRM web application for managing clients, orders, shipping and order cancellations, with a React front end and a Node.js/Express REST API backed by SQLite.

**University project — BSU, Faculty of Mechanics and Mathematics**

## Features

- JWT authentication (login and registration); passwords are hashed with bcrypt; tokens are verified by an Express middleware.
- Two roles, `admin` and `client`, enforced on the server by `authorize(...)` / role middleware and on the client by a protected-route component.
- **Admin dashboard:** CRUD for clients and shipping records, order list, and management of cancellation requests (including status changes).
- **Client dashboard:** a client creates orders and cancels them; the order list is filtered by the logged-in client.
- SQLite database created from `server/sql/init.sql` on startup; read queries for orders, shipping and cancellations live in separate files in `server/sql/queries/`.
- Tables: `Clients`, `Orders`, `Shipping`, `Cancellations`, `Products`, `OrderDetails`.

## REST API

Auth: `POST /api/auth/login`. Data routes are under `/api/data`:

| Resource | Endpoints | Access |
|---|---|---|
| Registration | `POST /register` | public |
| Clients | `GET`, `POST`, `PUT /:id`, `DELETE /:id` on `/clients` | admin |
| Orders | `GET /orders`, `POST /orders` | admin, client |
| Orders | `PATCH /orders/:id/cancel`, `GET /orders/:id/details` | any authenticated user |
| Shipping | `GET`, `POST`, `PUT /:id`, `DELETE /:id` on `/shipping` | admin |
| Cancellations | `GET`, `POST`, `DELETE /:id`, `PATCH /:id/status` on `/cancellations` | admin |

## Project structure

```
client/   React app (Create React App): Login, Register, Admin/, Clients/, Orders/,
          Shipping/, Cancel/ components, AuthContext, ProtectedRoute
server/   index.js, config/db.js, routes/ (authRoutes, dataRoutes),
          middleware/ (authMiddleware, roleMiddleware), sql/ (init.sql, queries/)
```

## Tech stack

- Client: React 19, React Router 7, Ant Design, React-Bootstrap, Axios.
- Server: Node.js, Express 5, SQLite (`sqlite3`), `jsonwebtoken`, `bcryptjs`, `dotenv`, `cors`.

## How to run

The server reads `JWT_SECRET` (and optionally `PORT`, default 5000) from environment variables or a local environment file loaded by `dotenv`; set them before starting.

```bash
# server (http://localhost:5000)
cd server
npm install
npm start          # or: npm run dev  (nodemon)

# client (http://localhost:3000, proxies API calls to port 5000)
cd client
npm install
npm start
```

## Tests

No automated tests for the server; the client contains only the default Create React App test stub (`App.test.js`).

## Author

Ksenia Plehova — [GitHub](https://github.com/kseniaplehova)
