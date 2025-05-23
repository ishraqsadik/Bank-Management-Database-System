const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Get all tables
app.get('/api/tables', async (req, res) => {
  try {
    const query = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get table schema
app.get('/api/tables/:tableName/schema', async (req, res) => {
  try {
    const { tableName } = req.params;
    const query = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position;
    `;
    const result = await db.query(query, [tableName]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching schema:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Generic route to get all records from a table
app.get('/api/tables/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    const query = `SELECT * FROM ${tableName} LIMIT 100`;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(`Error fetching from ${req.params.tableName}:`, error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Insert a new record
app.post('/api/tables/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    const data = req.body;
    
    const columns = Object.keys(data).join(', ');
    const values = Object.keys(data).map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `INSERT INTO ${tableName} (${columns}) VALUES (${values}) RETURNING *`;
    const result = await db.query(query, Object.values(data));
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(`Error inserting into ${req.params.tableName}:`, error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a record
app.put('/api/tables/:tableName/:id', async (req, res) => {
  try {
    const { tableName, id } = req.params;
    const data = req.body;
    const idColumn = `${tableName.toLowerCase()}_id`; // Assuming primary key follows convention
    
    const setClause = Object.keys(data)
      .map((key, i) => `${key} = $${i + 1}`)
      .join(', ');
    
    const query = `UPDATE ${tableName} SET ${setClause} WHERE ${idColumn} = $${Object.keys(data).length + 1} RETURNING *`;
    const values = [...Object.values(data), id];
    
    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error updating ${req.params.tableName}:`, error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a record
app.delete('/api/tables/:tableName/:id', async (req, res) => {
  try {
    const { tableName, id } = req.params;
    const idColumn = `${tableName.toLowerCase()}_id`; // Assuming primary key follows convention
    
    const query = `DELETE FROM ${tableName} WHERE ${idColumn} = $1 RETURNING *`;
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error(`Error deleting from ${req.params.tableName}:`, error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get the data for a specific view
app.get('/api/views/:viewName', async (req, res) => {
  try {
    const { viewName } = req.params;
    const query = `SELECT * FROM ${viewName} LIMIT 100`;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(`Error fetching from view ${req.params.viewName}:`, error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all views
app.get('/api/views', async (req, res) => {
  try {
    const query = `
      SELECT table_name
      FROM information_schema.views
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching views:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Execute a predefined SQL query
app.post('/api/execute-query', async (req, res) => {
  try {
    const { query, parameters } = req.body;
    
    // Validate query to prevent SQL injection
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return res.status(400).json({ error: 'Invalid query' });
    }
    
    // Prepare the query - replace any parameter placeholders
    let preparedQuery = query;
    if (parameters && typeof parameters === 'object') {
      // Replace parameters (basic implementation - for more complex needs, use parameterized queries)
      Object.keys(parameters).forEach(key => {
        const value = parameters[key];
        // Simple validation - only strings and numbers allowed as parameters
        if (typeof value === 'string' || typeof value === 'number') {
          const regex = new RegExp(`'${key}'`, 'g');
          preparedQuery = preparedQuery.replace(regex, typeof value === 'string' ? `'${value}'` : value);
        }
      });
    }
    
    console.log('Executing query:', preparedQuery);
    const result = await db.query(preparedQuery);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).json({ error: 'Error executing query', details: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 