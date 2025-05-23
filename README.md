# Banking Database UI

A React application for interacting with a PostgreSQL banking database.

## Features

- View data from all tables in the database
- Insert, update, and delete records
- View complex database views
- Execute predefined complex SQL queries
- Modern, responsive UI using Bootstrap

## Prerequisites

- Node.js (v14+)
- PostgreSQL (v12+) database server
- npm or yarn

## Project Structure

```
banking-ui/
├── client/              # React frontend
├── server/              # Node.js backend
└── README.md
```

## Complete Setup Instructions

### 1. Database Setup

1. Ensure PostgreSQL is installed and running on your system
2. Create a new database for this application:
   ```sql
   CREATE DATABASE banking_db;
   ```
3. Connect to the new database:
   ```bash
   psql -U postgres -d banking_db
   ```
4. Run the combined SQL script:
   ```sql
   \i RunAllSQLFiles.sql
   ```

The RunAllSQLFiles.sql script contains all necessary table definitions, views, procedures, triggers, and sample data.

### 2. Install Dependencies

Install server and client dependencies separately:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Configure Backend

1. Update the database connection settings in the server/.env file:
   ```
   DB_USER=postgres                  # Your PostgreSQL username
   DB_PASSWORD=your_password_here    # Your PostgreSQL password
   DB_HOST=localhost                 # Database server hostname
   DB_PORT=5432                      # PostgreSQL port
   DB_DATABASE=banking_db            # Database name you created
   PORT=5000                         # Server port
   ```
2. Make sure these values match your actual PostgreSQL configuration

### 4. Start the Application

The backend server and frontend must be run separately in different terminal windows:

#### Terminal 1: Start the Backend Server
```bash
cd server
npm run dev
```

#### Terminal 2: Start the Frontend
```bash
cd client
npm start
```

The backend server will run on http://localhost:5000, and the frontend will be accessible at http://localhost:3000.

## Usage Guide

### Tables Screen

- View a list of all tables in the database
- Click on a table to view its data
- The system automatically adapts to your database schema
- All records from the selected table will be displayed in a formatted table

### Manage Data Screen

- Select a table from the dropdown menu
- Choose an operation: Insert, Update, or Delete
- For Insert: Fill in the form fields and click "Insert Record"
- For Update/Delete: Select a record from the list, modify fields if updating, and click the appropriate button
- Data validation is applied automatically based on the schema constraints
- Required fields are marked with an asterisk (*)

### Views Screen

- Select a view from the dropdown menu
- View the results of complex database views
- Each view includes a description explaining its purpose
- Results are displayed in a formatted table

### Queries Screen

- Select a predefined query from the dropdown menu
- Results of the SQL query will execute and display automatically
- Each query includes a description of its purpose
- Complex queries like customer credit scores, branch performance, and more are available
- Results are displayed in a formatted table with proper formatting

## API Endpoints

The backend provides the following API endpoints:

- `GET /api/tables` - Get a list of all tables
- `GET /api/tables/:tableName` - Get all records from a table
- `GET /api/tables/:tableName/schema` - Get the schema of a table
- `POST /api/tables/:tableName` - Insert a new record
- `PUT /api/tables/:tableName/:id` - Update a record
- `DELETE /api/tables/:tableName/:id` - Delete a record
- `GET /api/views` - Get a list of all views
- `GET /api/views/:viewName` - Get data from a view
- `POST /api/execute-query` - Execute a predefined SQL query 