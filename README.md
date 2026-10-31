# FreshList — Grocery List Management System

A full-stack grocery list management application built with HTML, CSS, JavaScript, Node.js, Express, and MongoDB.

## Features

- Create, read, update, and delete grocery items (CRUD)
- Track item quantity, category, price, and purchased status
- Mark items as purchased or unpurchased
- Search by grocery name or category
- Filter all items, items to buy, and purchased items
- Dashboard summary for total items, remaining items, and estimated cost
- Server-side validation and clear API error responses
- Responsive layout for desktop and mobile

## Tech stack

- Frontend: HTML, CSS, vanilla JavaScript
- Backend: Node.js and Express.js
- Database: MongoDB with Mongoose
- API: REST endpoints returning JSON

## Prerequisites

- Node.js (LTS recommended)
- npm
- MongoDB Community Server running locally, or a MongoDB Atlas database

## Setup

1. Clone or download this repository.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env`.
4. Set `MONGODB_URI` in `.env`. The example uses a local MongoDB server:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/groceryDB
   ```

   For MongoDB Atlas, replace the value with your Atlas connection string.

5. Start the app:

   ```bash
   npm run dev
   ```

   Or use `npm start` for a normal start.

6. Open http://localhost:5000 in your browser.

## REST API

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/health` | Check server/database status |
| GET | `/api/groceries` | Get all grocery items |
| POST | `/api/groceries` | Create a grocery item |
| PUT | `/api/groceries/:id` | Update an item |
| DELETE | `/api/groceries/:id` | Delete an item |

### Example create request

`POST /api/groceries`

```json
{
  "name": "Milk",
  "quantity": 2,
  "category": "Dairy",
  "price": 30
}
```

Price is the price per item; the dashboard estimates total cost as quantity multiplied by price.

## Important note about users

This starter project currently stores a single shared grocery list. It does **not** implement individual user accounts or user-specific lists. Authentication and per-user authorization should be added before describing it as a multi-user application or deploying it for multiple users.

## Security notes

- Keep `.env` private and never commit database credentials.
- The API validates input and validates MongoDB document IDs.
- Add authentication, authorization, rate limiting, and production logging before public deployment.

## License

MIT
