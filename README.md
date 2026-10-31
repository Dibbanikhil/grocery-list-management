# Grocery List Management System

A full-stack Grocery List Management System built using Node.js, Express.js, MongoDB, HTML, CSS, and JavaScript.

## Features

- Add new grocery items
- View all grocery items
- Update existing items
- Delete grocery items
- Mark items as purchased
- Search and filter grocery items
- Track grocery list summaries
- Responsive user interface

## Technologies Used

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **ODM:** Mongoose

## Installation and Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/Dibbanikhil/grocery-list-management.git
   ```

2. Navigate to the project folder:

   ```bash
   cd grocery-list-management
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory:

   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   ```

5. Start the application:

   ```bash
   npm run dev
   ```

6. Open your browser:

   `http://localhost:5000`

## Project Structure

```text
grocery-list-management/
├── models/
│   └── Grocery.js
├── public/
│   ├── app.js
│   ├── index.html
│   └── style.css
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── server.js
```

## Environment Variables

Keep your MongoDB connection string and credentials in `.env`. Never commit this file to GitHub.

## License

This project is licensed under the MIT License.