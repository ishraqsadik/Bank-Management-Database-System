import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchTableData } from '../api';

function TableData() {
  const { tableName } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTableData = async () => {
      try {
        setLoading(true);
        const tableData = await fetchTableData(tableName);
        setData(tableData);
        setError(null);
      } catch (err) {
        setError(`Failed to load data for table: ${tableName}`);
        console.error(`Error loading data for table ${tableName}:`, err);
      } finally {
        setLoading(false);
      }
    };

    loadTableData();
  }, [tableName]);

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

  if (data.length === 0) {
    return <div className="alert alert-info" role="alert">No data found in the table: {tableName}</div>;
  }

  // Get column names from the first row
  const columns = Object.keys(data[0]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{tableName}</h2>
        <Link to="/" className="btn btn-outline-secondary">Back to Tables</Link>
      </div>
      
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column) => (
                  <td key={`${rowIndex}-${column}`}>
                    {row[column] === null 
                      ? <span className="text-muted fst-italic">null</span> 
                      : String(row[column])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TableData; 