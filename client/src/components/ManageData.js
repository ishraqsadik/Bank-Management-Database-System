import React, { useState, useEffect } from 'react';
import { fetchTables, fetchTableSchema, fetchTableData, insertRecord, updateRecord, deleteRecord } from '../api';

function ManageData() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [schema, setSchema] = useState([]);
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({});
  const [operation, setOperation] = useState('insert');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [fieldErrors, setFieldErrors] = useState({});

  // Field descriptions and format hints
  const fieldDescriptions = {
    // Customer fields
    'customer_id': 'Unique identifier for the customer',
    'first_name': 'Customer\'s first name',
    'last_name': 'Customer\'s last name',
    'date_of_birth': 'Customer\'s birth date (YYYY-MM-DD)',
    'email': 'Customer\'s email address (e.g., user@example.com)',
    'phone': 'Phone number (e.g., 555-123-4567)',
    'address': 'Customer\'s full address',
    'identification_number': 'Government-issued ID number',
    'credit_score': 'Credit score (300-850)',
    
    // Account fields
    'account_id': 'Unique identifier for the account',
    'account_type': 'Type of account (Checking, Savings, Credit)',
    'balance': 'Current account balance in dollars',
    'account_interest_rate': 'Annual interest rate for the account (percentage)',
    'status': 'Account status (Active, Inactive, Flagged)',
    
    // Branch fields
    'branch_id': 'Unique identifier for the branch',
    'branch_name': 'Name of the branch',
    
    // Transaction fields
    'transaction_id': 'Unique identifier for the transaction',
    'transaction_type': 'Type of transaction (Deposit, Withdrawal, Transfer, Payment)',
    'amount': 'Transaction amount in dollars (must be positive)',
    'transaction_date': 'Date of transaction (YYYY-MM-DD)',
    
    // Credit Card fields
    'card_id': 'Unique identifier for the credit card',
    'card_number': '16-digit credit card number',
    'expiration_date': 'Card expiration date (YYYY-MM-DD)',
    'credit_limit': 'Credit limit in dollars',
    
    // Loan fields
    'loan_id': 'Unique identifier for the loan',
    'loan_type': 'Type of loan (Personal, Home, Auto, Business)',
    'loan_interest_rate': 'Annual interest rate for the loan (percentage)',
    'term_months': 'Loan term length in months',
    'date_taken_out': 'Date when loan was issued (YYYY-MM-DD)',
    
    // Employee fields
    'employee_id': 'Unique identifier for the employee',
    'role': 'Employee role (Teller, Loan Officer, Administrator, IT, Manager)',
    'password_hash': 'Hashed password for employee access',
    
    // Beneficiary fields
    'beneficiary_id': 'Unique identifier for the beneficiary',
    'beneficiary_name': 'Full name of the beneficiary',
    'relationship': 'Relationship to the account holder',
    
    // Payment fields
    'payment_id': 'Unique identifier for the payment',
    'amount_paid': 'Payment amount in dollars (must be positive)',
    'payment_date': 'Date payment was made (YYYY-MM-DD)',
  };

  // Field type helpers
  const isDateField = (columnName, dataType) => {
    return dataType === 'date' || columnName.includes('date') || columnName === 'date_of_birth';
  };

  const isNumberField = (dataType) => {
    return dataType.includes('int') || dataType.includes('decimal') || dataType.includes('numeric');
  };

  const isEnumField = (dataType) => {
    return dataType.includes('enum');
  };

  const getEnumOptions = (dataType) => {
    const enumTypes = {
      'account_type_enum': ['Checking', 'Savings', 'Credit'],
      'account_status_enum': ['Active', 'Inactive', 'Flagged'],
      'transaction_type_enum': ['Deposit', 'Withdrawal', 'Transfer', 'Payment'],
      'credit_card_status_enum': ['Active', 'Blocked', 'Closed'],
      'loan_type_enum': ['Personal', 'Home', 'Auto', 'Business'],
      'loan_status_enum': ['Pending', 'Approved', 'Rejected', 'Active', 'Closed'],
      'employee_role_enum': ['Teller', 'Loan Officer', 'Administrator', 'IT', 'Manager'],
      'user_type_enum': ['Customer', 'Employee']
    };
    
    return enumTypes[dataType] || [];
  };

  // Map database column names to our description field names
  const getDescriptionKey = (columnName) => {
    if (columnName === 'interest_rate') {
      // If we're in the loan table, use the loan-specific key
      if (selectedTable === 'Loan') {
        return 'loan_interest_rate';
      }
      // Otherwise use the account-specific key
      return 'account_interest_rate';
    }
    return columnName;
  };

  const shouldSkipField = (columnName, columnDefault) => {
    // Skip fields that should be auto-generated
    return columnName.includes('timestamp') || 
           columnName === 'created_at' || 
           (columnDefault && columnDefault.includes('now()'));
  };

  // Get a user-friendly label for a column
  const getFieldLabel = (columnName) => {
    // Convert snake_case to Title Case and remove _id suffix
    return columnName
      .replace(/_id$/, ' ID')
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    const loadTables = async () => {
      try {
        const tablesData = await fetchTables();
        setTables(tablesData);
      } catch (error) {
        console.error('Error loading tables:', error);
        setMessage({ text: 'Failed to load tables', type: 'danger' });
      }
    };

    loadTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      const loadTableDetails = async () => {
        setLoading(true);
        try {
          const [schemaData, tableData] = await Promise.all([
            fetchTableSchema(selectedTable),
            fetchTableData(selectedTable)
          ]);
          
          setSchema(schemaData);
          setData(tableData);
          
          // Initialize form data
          const initialFormData = {};
          schemaData.forEach(column => {
            // Skip timestamp fields and auto-generated fields
            if (!shouldSkipField(column.column_name, column.column_default)) {
              initialFormData[column.column_name] = '';
            }
          });
          setFormData(initialFormData);
          
        } catch (error) {
          console.error(`Error loading data for ${selectedTable}:`, error);
          setMessage({ text: `Failed to load data for ${selectedTable}`, type: 'danger' });
        } finally {
          setLoading(false);
        }
      };

      loadTableDetails();
    }
  }, [selectedTable]);

  const handleTableChange = (e) => {
    setSelectedTable(e.target.value);
    setOperation('insert');
    setSelectedRecord(null);
    setMessage({ text: '', type: '' });
    setFieldErrors({});
  };

  const handleOperationChange = (e) => {
    setOperation(e.target.value);
    setSelectedRecord(null);
    setMessage({ text: '', type: '' });
    setFieldErrors({});
    
    // Reset form data when changing operations
    if (e.target.value === 'insert') {
      const initialFormData = {};
      schema.forEach(column => {
        if (!shouldSkipField(column.column_name, column.column_default)) {
          initialFormData[column.column_name] = '';
        }
      });
      setFormData(initialFormData);
    }
  };

  const validateField = (column, value) => {
    const { column_name, data_type, is_nullable } = column;
    
    // Required field validation
    if (is_nullable === 'NO' && (value === '' || value === null) && 
        !column_name.endsWith('_id') && !shouldSkipField(column_name, column.column_default)) {
      return `${getFieldLabel(column_name)} is required`;
    }
    
    if (value === '' || value === null) {
      return null; // No further validation needed for empty optional fields
    }
    
    // Type validations
    if (isNumberField(data_type)) {
      if (isNaN(Number(value))) {
        return `${getFieldLabel(column_name)} must be a number`;
      }
      
      if (data_type.includes('int') && !Number.isInteger(Number(value))) {
        return `${getFieldLabel(column_name)} must be an integer`;
      }
      
      // Credit score validation
      if (column_name === 'credit_score' && (Number(value) < 300 || Number(value) > 850)) {
        return 'Credit score must be between 300 and 850';
      }
      
      // Balance validation
      if (column_name === 'balance' && Number(value) < 0) {
        return 'Balance cannot be negative';
      }
      
      // Amount validation
      if ((column_name === 'amount' || column_name === 'amount_paid') && Number(value) <= 0) {
        return `${getFieldLabel(column_name)} must be greater than 0`;
      }
    }
    
    // Email validation
    if (column_name === 'email' && !/\S+@\S+\.\S+/.test(value)) {
      return 'Please enter a valid email address (e.g., user@example.com)';
    }
    
    // Phone validation
    if (column_name === 'phone' && !/^\d{3}-?\d{3}-?\d{4}$/.test(value)) {
      return 'Please enter a valid phone number (e.g., 555-123-4567)';
    }
    
    // Card number validation
    if (column_name === 'card_number' && !/^\d{16}$/.test(value)) {
      return 'Card number must be exactly 16 digits without spaces or dashes';
    }
    
    // Date validation
    if (isDateField(column_name, data_type) && isNaN(Date.parse(value))) {
      return `Please enter a valid date in YYYY-MM-DD format`;
    }
    
    return null;
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;
    
    schema.forEach(column => {
      const error = validateField(column, formData[column.column_name]);
      if (error) {
        errors[column.column_name] = error;
        isValid = false;
      }
    });
    
    setFieldErrors(errors);
    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Find the column schema
    const column = schema.find(col => col.column_name === name);
    
    // Validate field
    const error = validateField(column, value);
    
    // Update field errors
    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleRecordSelect = (record) => {
    setSelectedRecord(record);
    
    // Filter out timestamp fields when selecting record for update/delete
    const filteredRecord = {};
    for (const key in record) {
      if (!shouldSkipField(key)) {
        filteredRecord[key] = record[key];
      }
    }
    
    setFormData(filteredRecord);
    setFieldErrors({});
  };

  const prepareDataForSubmission = () => {
    // Create a copy of the form data
    const dataToSubmit = { ...formData };
    
    // Convert numeric strings to actual numbers
    schema.forEach(column => {
      if (column.column_name in dataToSubmit && isNumberField(column.data_type)) {
        dataToSubmit[column.column_name] = Number(dataToSubmit[column.column_name]);
      }
    });
    
    return dataToSubmit;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      setMessage({ text: 'Please correct the errors in the form', type: 'danger' });
      return;
    }
    
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const idColumn = `${selectedTable.toLowerCase()}_id`;
      const dataToSubmit = prepareDataForSubmission();
      
      if (operation === 'insert') {
        await insertRecord(selectedTable, dataToSubmit);
        setMessage({ text: 'Record inserted successfully', type: 'success' });
      } else if (operation === 'update' && selectedRecord) {
        await updateRecord(selectedTable, selectedRecord[idColumn], dataToSubmit);
        setMessage({ text: 'Record updated successfully', type: 'success' });
      } else if (operation === 'delete' && selectedRecord) {
        await deleteRecord(selectedTable, selectedRecord[idColumn]);
        setMessage({ text: 'Record deleted successfully', type: 'success' });
      }

      // Refresh data
      const refreshedData = await fetchTableData(selectedTable);
      setData(refreshedData);
      
      // Reset form after operation
      if (operation === 'insert' || operation === 'delete') {
        const initialFormData = {};
        schema.forEach(column => {
          if (!shouldSkipField(column.column_name, column.column_default)) {
            initialFormData[column.column_name] = '';
          }
        });
        setFormData(initialFormData);
        setSelectedRecord(null);
        setFieldErrors({});
      }
    } catch (error) {
      console.error(`Error performing ${operation} operation:`, error);
      setMessage({ 
        text: `Failed to ${operation} record: ${error.response?.data?.error || error.message}`, 
        type: 'danger' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to get appropriate input field based on column type
  const renderInputField = (column) => {
    const { column_name, data_type, is_nullable, column_default } = column;
    
    // Skip auto-generated fields
    if (shouldSkipField(column_name, column_default)) {
      return null;
    }
    
    // Check if this field has an error
    const hasError = !!fieldErrors[column_name];
    
    // Get the field label
    const fieldLabel = getFieldLabel(column_name);
    
    // Get field description and hint using the mapping function
    const descriptionKey = getDescriptionKey(column_name);
    const description = fieldDescriptions[descriptionKey] || '';
    
    // For enum fields, render a select dropdown
    if (isEnumField(data_type)) {
      const options = getEnumOptions(data_type);
      
      return (
        <div className="mb-3" key={column_name}>
          <label htmlFor={column_name} className="form-label">
            {fieldLabel}
            {is_nullable === 'NO' && <span className="text-danger">*</span>}
          </label>
          {description && <div className="form-text text-muted mb-2">{description}</div>}
          <select
            className={`form-select ${hasError ? 'is-invalid' : ''}`}
            id={column_name}
            name={column_name}
            value={formData[column_name] || ''}
            onChange={handleInputChange}
            disabled={operation === 'delete' || (column_name.endsWith('_id') && operation === 'update')}
            required={is_nullable === 'NO' && !column_default}
          >
            <option value="">Select {fieldLabel}</option>
            {options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {hasError && <div className="invalid-feedback">{fieldErrors[column_name]}</div>}
        </div>
      );
    }
    
    // For date fields
    if (isDateField(column_name, data_type)) {
      return (
        <div className="mb-3" key={column_name}>
          <label htmlFor={column_name} className="form-label">
            {fieldLabel}
            {is_nullable === 'NO' && <span className="text-danger">*</span>}
          </label>
          {description && <div className="form-text text-muted mb-2">{description}</div>}
          <input
            type="date"
            className={`form-control ${hasError ? 'is-invalid' : ''}`}
            id={column_name}
            name={column_name}
            value={formData[column_name] || ''}
            onChange={handleInputChange}
            disabled={operation === 'delete' || (column_name.endsWith('_id') && operation === 'update')}
            required={is_nullable === 'NO' && !column_default}
          />
          {hasError && <div className="invalid-feedback">{fieldErrors[column_name]}</div>}
        </div>
      );
    }
    
    // For numeric fields
    if (isNumberField(data_type)) {
      // Add specific placeholders for certain fields
      let placeholder = '';
      if (column_name === 'credit_score') placeholder = 'Enter value between 300-850';
      else if (column_name === 'balance' || column_name === 'amount' || column_name === 'credit_limit') placeholder = 'Enter amount in dollars';
      else if (column_name === 'interest_rate') placeholder = 'Enter rate (e.g., 3.5 for 3.5%)';
      
      return (
        <div className="mb-3" key={column_name}>
          <label htmlFor={column_name} className="form-label">
            {fieldLabel}
            {is_nullable === 'NO' && <span className="text-danger">*</span>}
          </label>
          {description && <div className="form-text text-muted mb-2">{description}</div>}
          <input
            type="text"
            className={`form-control ${hasError ? 'is-invalid' : ''}`}
            id={column_name}
            name={column_name}
            placeholder={placeholder}
            value={formData[column_name] || ''}
            onChange={handleInputChange}
            disabled={operation === 'delete' || (column_name.endsWith('_id') && operation === 'update')}
            required={is_nullable === 'NO' && !column_default}
            pattern={data_type.includes('int') ? "[0-9]*" : "[0-9]*(\\.[0-9]+)?"}
            inputMode="numeric"
          />
          {hasError && <div className="invalid-feedback">{fieldErrors[column_name]}</div>}
        </div>
      );
    }
    
    // Special handling for specific field types
    let inputType = 'text';
    let placeholder = '';
    
    // Assign specific input types and placeholders
    if (column_name === 'email') {
      inputType = 'email';
      placeholder = 'user@example.com';
    } else if (column_name === 'phone') {
      placeholder = '555-123-4567';
    } else if (column_name === 'card_number') {
      placeholder = '1234567890123456';
      inputType = 'tel';
    } else if (column_name === 'address') {
      placeholder = 'Full street address';
    } else if (column_name === 'identification_number') {
      placeholder = 'Government ID number';
    }
    
    // Default to text input for other types
    return (
      <div className="mb-3" key={column_name}>
        <label htmlFor={column_name} className="form-label">
          {fieldLabel}
          {is_nullable === 'NO' && <span className="text-danger">*</span>}
        </label>
        {description && <div className="form-text text-muted mb-2">{description}</div>}
        <input
          type={inputType}
          className={`form-control ${hasError ? 'is-invalid' : ''}`}
          id={column_name}
          name={column_name}
          placeholder={placeholder}
          value={formData[column_name] || ''}
          onChange={handleInputChange}
          disabled={operation === 'delete' || (column_name.endsWith('_id') && operation === 'update')}
          required={is_nullable === 'NO' && !column_default}
        />
        {hasError && <div className="invalid-feedback">{fieldErrors[column_name]}</div>}
      </div>
    );
  };

  return (
    <div>
      <h2 className="mb-4">Manage Database Records</h2>
      
      <div className="row mb-4">
        <div className="col-md-6">
          <label htmlFor="tableSelect" className="form-label">Select Table:</label>
          <select 
            id="tableSelect" 
            className="form-select" 
            value={selectedTable} 
            onChange={handleTableChange}
          >
            <option value="">-- Select a table --</option>
            {tables.map(table => (
              <option key={table.table_name} value={table.table_name}>
                {table.table_name}
              </option>
            ))}
          </select>
        </div>
        
        {selectedTable && (
          <div className="col-md-6">
            <label htmlFor="operationSelect" className="form-label">Select Operation:</label>
            <select 
              id="operationSelect" 
              className="form-select" 
              value={operation} 
              onChange={handleOperationChange}
            >
              <option value="insert">Insert</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
            </select>
          </div>
        )}
      </div>
      
      {message.text && (
        <div className={`alert alert-${message.type}`} role="alert">
          {message.text}
        </div>
      )}
      
      {selectedTable && (
        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header bg-primary text-white">
                {operation === 'insert' ? 'Add New Record' : 
                 operation === 'update' ? 'Update Record' : 'Delete Record'}
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit} className="form-container">
                  {operation === 'insert' && (
                    <div className="alert alert-info mb-3">
                      <i className="bi bi-info-circle me-2"></i>
                      Fields marked with <span className="text-danger">*</span> are required. Hover over fields for format instructions.
                    </div>
                  )}
                  
                  {/* ID field information for insert operations */}
                  {operation === 'insert' && (
                    <div className="alert alert-warning mb-3">
                      <strong>Note:</strong> For this demonstration, you must specify ID values manually. In a production system, 
                      these would typically be auto-generated.
                    </div>
                  )}

                  {schema.map(column => renderInputField(column))}
                  
                  <button 
                    type="submit" 
                    className={`btn btn-${operation === 'delete' ? 'danger' : 'primary'}`}
                    disabled={loading || (operation !== 'insert' && !selectedRecord)}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Loading...
                      </>
                    ) : (
                      operation === 'insert' ? 'Insert Record' : 
                      operation === 'update' ? 'Update Record' : 'Delete Record'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
          
          {(operation === 'update' || operation === 'delete') && (
            <div className="col-md-6">
              <div className="card">
                <div className="card-header bg-secondary text-white">
                  Select a Record
                </div>
                <div className="card-body table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {data.length > 0 ? (
                    <table className="table table-sm table-hover">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Details</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.map((record, index) => {
                          const idColumn = `${selectedTable.toLowerCase()}_id`;
                          return (
                            <tr key={index} className={selectedRecord && selectedRecord[idColumn] === record[idColumn] ? 'table-active' : ''}>
                              <td>{record[idColumn]}</td>
                              <td>
                                {Object.keys(record)
                                  .filter(key => key !== idColumn && record[key] !== null)
                                  .slice(0, 2)
                                  .map(key => `${getFieldLabel(key)}: ${record[key]}`)
                                  .join(', ')}
                                {Object.keys(record).filter(key => key !== idColumn && record[key] !== null).length > 2 && '...'}
                              </td>
                              <td>
                                <button 
                                  className="btn btn-sm btn-outline-primary" 
                                  onClick={() => handleRecordSelect(record)}
                                >
                                  Select
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-center">No records found</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {!selectedTable && (
        <div className="select-table-message">
          <p>Please select a table to manage its data</p>
        </div>
      )}
    </div>
  );
}

export default ManageData; 