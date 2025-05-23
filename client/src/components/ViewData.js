import React, { useState, useEffect } from 'react';
import { fetchViews, fetchViewData } from '../api';

function ViewData() {
  const [views, setViews] = useState([]);
  const [selectedView, setSelectedView] = useState('');
  const [viewData, setViewData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadViews = async () => {
      try {
        setLoading(true);
        const data = await fetchViews();
        setViews(data);
        setError(null);
      } catch (err) {
        setError('Failed to load views. Please try again later.');
        console.error('Error loading views:', err);
      } finally {
        setLoading(false);
      }
    };

    loadViews();
  }, []);

  useEffect(() => {
    if (selectedView) {
      const loadViewData = async () => {
        try {
          setLoading(true);
          const data = await fetchViewData(selectedView);
          setViewData(data);
          setError(null);
        } catch (err) {
          setError(`Failed to load data for view: ${selectedView}`);
          console.error(`Error loading data for view ${selectedView}:`, err);
          setViewData([]);
        } finally {
          setLoading(false);
        }
      };

      loadViewData();
    } else {
      setViewData([]);
    }
  }, [selectedView]);

  const handleViewChange = (e) => {
    setSelectedView(e.target.value);
  };

  if (loading && !selectedView) {
    return <div className="d-flex justify-content-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>;
  }

  if (error && !selectedView) {
    return <div className="alert alert-danger" role="alert">{error}</div>;
  }

  // Get column names from the first row if data exists
  const columns = viewData.length > 0 ? Object.keys(viewData[0]) : [];

  return (
    <div>
      <h2 className="mb-4">Complex Database Views</h2>
      
      <div className="mb-4">
        <label htmlFor="viewSelect" className="form-label">Select a View:</label>
        <select 
          id="viewSelect" 
          className="form-select" 
          value={selectedView} 
          onChange={handleViewChange}
        >
          <option value="">-- Select a view --</option>
          {views.map((view) => (
            <option key={view.table_name} value={view.table_name}>
              {view.table_name}
            </option>
          ))}
        </select>
      </div>
      
      {selectedView && (
        <div className="view-data-container">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">{selectedView}</h4>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="d-flex justify-content-center my-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="alert alert-danger" role="alert">{error}</div>
              ) : viewData.length === 0 ? (
                <div className="alert alert-info" role="alert">No data found in this view.</div>
              ) : (
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
                      {viewData.map((row, rowIndex) => (
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
              )}
            </div>
          </div>
          
          {selectedView.startsWith('vw_') && (
            <div className="card mt-4">
              <div className="card-header bg-secondary text-white">
                View Description
              </div>
              <div className="card-body">
                <p>
                  {selectedView === 'vw_branch_performance' && 
                    'This view shows aggregated performance metrics for each branch, including the total number of customers, total loan amounts, and total transaction amounts.'}
                  
                  {selectedView === 'vw_customer_transaction_stats' && 
                    'This view displays statistics for customer transactions, including the number of transactions and the average transaction amount for each customer.'}
                  
                  {selectedView === 'vw_high_balance_branches' && 
                    'This view shows branches with above-average total account balances. It uses subqueries to calculate the average total balance across all branches.'}
                  
                  {selectedView === 'vw_active_accounts' && 
                    'This is an updatable view that shows only active accounts. It includes a CHECK OPTION to ensure that any updates maintain the active status.'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {!selectedView && views.length > 0 && (
        <div className="select-table-message">
          <p>Please select a view to see its data</p>
        </div>
      )}
    </div>
  );
}

export default ViewData; 