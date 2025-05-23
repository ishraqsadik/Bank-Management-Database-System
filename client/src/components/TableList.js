import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchTables } from '../api';

function TableList() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTables = async () => {
      try {
        setLoading(true);
        const data = await fetchTables();
        setTables(data);
        setError(null);
      } catch (err) {
        setError('Failed to load tables. Please try again later.');
        console.error('Error loading tables:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTables();
  }, []);

  if (loading) {
    return <div className="d-flex justify-content-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>;
  }

  if (error) {
    return <div className="alert alert-danger" role="alert">{error}</div>;
  }

  return (
    <div>
      <h2 className="mb-4">Database Tables</h2>
      <p>Select a table to view its data:</p>
      
      <div className="row row-cols-1 row-cols-md-3 g-4">
        {tables.map((table) => (
          <div className="col" key={table.table_name}>
            <Link to={`/tables/${table.table_name}`} className="text-decoration-none">
              <div className="card h-100 table-card">
                <div className="card-body">
                  <h5 className="card-title">{table.table_name}</h5>
                </div>
                <div className="card-footer bg-transparent border-top-0">
                  <small className="text-muted">Click to view data</small>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TableList; 