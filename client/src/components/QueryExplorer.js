import React, { useState, useEffect } from 'react';
import axios from 'axios';

function QueryExplorer() {
  const [selectedQuery, setSelectedQuery] = useState('');
  const [queryResult, setQueryResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [queryDescription, setQueryDescription] = useState('');

  // List of predefined queries from queries.txt
  const predefinedQueries = [
    {
      id: 'query1',
      name: 'Customer Account Details',
      description: 'List customers with their account details and branch name.',
      query: `
        SELECT c.customer_id, c.first_name, c.last_name, a.account_type, a.balance, b.branch_name
        FROM Customer c
        JOIN Account a ON c.customer_id = a.customer_id
        JOIN Branch b ON a.branch_id = b.branch_id
      `
    },
    {
      id: 'query2',
      name: 'Transactions with Customer Details',
      description: 'List transactions along with customer and branch details for a specific branch.',
      query: `
        SELECT t.transaction_id, t.amount, t.transaction_date, c.first_name, c.last_name, b.branch_name
        FROM Transaction t
        JOIN Account a ON t.account_id = a.account_id
        JOIN Customer c ON a.customer_id = c.customer_id
        JOIN Branch b ON a.branch_id = b.branch_id
        WHERE b.branch_name = 'Downtown Branch'
      `,
      parameters: {
        branchName: 'Downtown Branch'
      }
    },
    {
      id: 'query3',
      name: 'Branch Account Statistics',
      description: 'Total number of accounts and average balance per branch.',
      query: `
        SELECT b.branch_id, b.branch_name, COUNT(a.account_id) AS num_accounts, AVG(a.balance) AS avg_balance
        FROM Branch b
        JOIN Account a ON b.branch_id = a.branch_id
        GROUP BY b.branch_id, b.branch_name
        HAVING COUNT(a.account_id) > 0
      `
    },
    {
      id: 'query4',
      name: 'Employee Customer Service Performance',
      description: 'List each employee with their branch and the number of distinct customers served.',
      query: `
        SELECT e.employee_id, e.first_name, e.last_name, b.branch_name, COUNT(DISTINCT a.customer_id) AS num_customers
        FROM Employee e
        JOIN Branch b ON e.branch_id = b.branch_id
        JOIN Account a ON b.branch_id = a.branch_id
        GROUP BY e.employee_id, e.first_name, e.last_name, b.branch_name
      `
    },
    {
      id: 'query5',
      name: 'Transaction Amount by Account Type',
      description: 'For each account type, calculate the total transaction amount.',
      query: `
        SELECT a.account_type, SUM(t.amount) AS total_transaction_amount
        FROM Account a
        JOIN Transaction t ON a.account_id = t.account_id
        GROUP BY a.account_type
        HAVING SUM(t.amount) > 0
      `
    },
    {
      id: 'query6',
      name: 'Customers with Above-Average Credit Scores',
      description: 'Retrieve customers whose credit score is above the overall average.',
      query: `
        SELECT c.customer_id, c.first_name, c.last_name, c.credit_score, a.account_id
        FROM Customer c
        JOIN Account a ON c.customer_id = a.customer_id
        WHERE c.credit_score > (SELECT AVG(credit_score) FROM Customer)
      `
    },
    {
      id: 'query7',
      name: 'Transactions per Customer',
      description: 'List each customer along with the total number of transactions they have performed.',
      query: `
        SELECT c.customer_id, c.first_name, c.last_name, COUNT(t.transaction_id) AS transaction_count
        FROM Customer c
        JOIN Account a ON c.customer_id = a.customer_id
        JOIN Transaction t ON a.account_id = t.account_id
        GROUP BY c.customer_id, c.first_name, c.last_name
      `
    },
    {
      id: 'query8',
      name: 'Branches with Above-Average Account Balances',
      description: 'Retrieve branches whose combined account balances exceed the average across all branches.',
      query: `
        SELECT b.branch_id, b.branch_name, SUM(a.balance) AS branch_total_balance
        FROM Branch b
        JOIN Account a ON b.branch_id = a.branch_id
        GROUP BY b.branch_id, b.branch_name
        HAVING SUM(a.balance) > (
            SELECT AVG(total_balance)
            FROM (
                SELECT SUM(balance) AS total_balance
                FROM Account GROUP BY branch_id
            ) AS sub
        )
      `
    },
    {
      id: 'query9',
      name: 'Employees with Above-Average Audit Logs',
      description: 'Retrieve employees with their branch and log count if their audit log count is at least the average.',
      query: `
        SELECT
            e.employee_id,
            e.first_name,
            e.last_name,
            b.branch_name,
            (SELECT COUNT(*)
             FROM AuditLog al
             WHERE al.user_type = 'Employee'
               AND al.user_id = e.employee_id) AS log_count
        FROM Employee e
        JOIN Branch b ON e.branch_id = b.branch_id
        WHERE (SELECT COUNT(*)
               FROM AuditLog al
               WHERE al.user_type = 'Employee'
                 AND al.user_id = e.employee_id) >=
              (SELECT AVG(logs)
               FROM (
                    SELECT COUNT(*) AS logs
                    FROM AuditLog
                    WHERE user_type = 'Employee'
                    GROUP BY user_id
               ) AS avg_logs)
      `
    },
    {
      id: 'query10',
      name: 'Customers with At Least One Account',
      description: 'Retrieve customers who hold at least one account along with their representative branch.',
      query: `
        SELECT
            c.customer_id,
            c.first_name,
            c.last_name,
            MIN(b.branch_name) AS representative_branch,
            (SELECT COUNT(*) FROM Account a2 WHERE a2.customer_id = c.customer_id) AS account_count
        FROM Customer c
        JOIN Account a ON c.customer_id = a.customer_id
        JOIN Branch b ON a.branch_id = b.branch_id
        GROUP BY c.customer_id, c.first_name, c.last_name
        HAVING (SELECT COUNT(*) FROM Account a2 WHERE a2.customer_id = c.customer_id) >= 1
      `
    },
    {
      id: 'query11',
      name: 'Credit Card and Loan Overview',
      description: 'For each customer, show their credit card details along with the total amount of their loans.',
      query: `
        SELECT c.customer_id, c.first_name, c.last_name, cc.card_number,
               (SELECT SUM(l.amount) FROM Loan l WHERE l.customer_id = c.customer_id) AS total_loan_amount
        FROM Customer c
        JOIN CreditCard cc ON c.customer_id = cc.customer_id
      `
    },
    {
      id: 'query12',
      name: 'Branch Performance Metrics',
      description: 'For each branch, display customers, loans, and transaction metrics.',
      query: `
        SELECT b.branch_id, b.branch_name,
               COUNT(DISTINCT a.customer_id) AS total_customers,
               COALESCE(SUM(l.amount), 0) AS total_loans,
               COALESCE(SUM(t.amount), 0) AS total_transactions
        FROM Branch b
        JOIN Account a ON b.branch_id = a.branch_id
        LEFT JOIN Loan l ON a.customer_id = l.customer_id
        LEFT JOIN Transaction t ON a.account_id = t.account_id
        GROUP BY b.branch_id, b.branch_name
      `
    }
  ];

  const handleQuerySelect = (e) => {
    const queryId = e.target.value;
    setSelectedQuery(queryId);
    
    if (queryId) {
      const selectedQueryObj = predefinedQueries.find(q => q.id === queryId);
      setQueryDescription(selectedQueryObj.description);
    } else {
      setQueryDescription('');
      setQueryResult([]);
    }
  };

  const executeQuery = async () => {
    if (!selectedQuery) return;
    
    setLoading(true);
    setError(null);
    
    const selectedQueryObj = predefinedQueries.find(q => q.id === selectedQuery);
    
    try {
      const response = await axios.post('http://localhost:5000/api/execute-query', {
        query: selectedQueryObj.query,
        parameters: selectedQueryObj.parameters || {}
      });
      
      setQueryResult(response.data);
    } catch (err) {
      console.error('Error executing query:', err);
      setError(`Failed to execute query: ${err.response?.data?.error || err.message}`);
      setQueryResult([]);
    } finally {
      setLoading(false);
    }
  };

  // Run query when selected
  useEffect(() => {
    if (selectedQuery) {
      executeQuery();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedQuery]);

  // Get column names from the first result row if available
  const columns = queryResult.length > 0 ? Object.keys(queryResult[0]) : [];

  return (
    <div>
      <h2 className="mb-4">Database Query Explorer</h2>
      
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">Select and Execute Predefined Queries</h4>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label htmlFor="querySelect" className="form-label">Select a Query:</label>
            <select 
              id="querySelect" 
              className="form-select" 
              value={selectedQuery} 
              onChange={handleQuerySelect}
            >
              <option value="">-- Select a query --</option>
              {predefinedQueries.map(query => (
                <option key={query.id} value={query.id}>
                  {query.name}
                </option>
              ))}
            </select>
          </div>
          
          {queryDescription && (
            <div className="alert alert-info">
              <strong>Description:</strong> {queryDescription}
            </div>
          )}
        </div>
      </div>
      
      {selectedQuery && (
        <div className="card">
          <div className="card-header bg-secondary text-white">
            <h4 className="mb-0">Query Results</h4>
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
            ) : queryResult.length === 0 ? (
              <div className="alert alert-info" role="alert">No results found for this query.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      {columns.map((column) => (
                        <th key={column}>{column.replace(/_/g, ' ').split(' ').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResult.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {columns.map((column) => (
                          <td key={`${rowIndex}-${column}`}>
                            {row[column] === null 
                              ? <span className="text-muted fst-italic">null</span> 
                              : typeof row[column] === 'number' && !column.includes('id') 
                                  ? Number(row[column]).toLocaleString(undefined, {
                                      minimumFractionDigits: column.includes('balance') || column.includes('amount') ? 2 : 0,
                                      maximumFractionDigits: column.includes('balance') || column.includes('amount') ? 2 : 0
                                    })
                                  : String(row[column])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {queryResult.length > 0 && (
              <div className="mt-3">
                <p className="text-muted">Total Results: {queryResult.length}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {!selectedQuery && (
        <div className="select-table-message">
          <p>Please select a query to view its results</p>
        </div>
      )}
    </div>
  );
}

export default QueryExplorer; 