import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const fetchTables = async () => {
  try {
    const response = await axios.get(`${API_URL}/tables`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tables:', error);
    throw error;
  }
};

export const fetchTableData = async (tableName) => {
  try {
    const response = await axios.get(`${API_URL}/tables/${tableName}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${tableName} data:`, error);
    throw error;
  }
};

export const fetchTableSchema = async (tableName) => {
  try {
    const response = await axios.get(`${API_URL}/tables/${tableName}/schema`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${tableName} schema:`, error);
    throw error;
  }
};

export const insertRecord = async (tableName, data) => {
  try {
    const response = await axios.post(`${API_URL}/tables/${tableName}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error inserting into ${tableName}:`, error);
    throw error;
  }
};

export const updateRecord = async (tableName, id, data) => {
  try {
    const response = await axios.put(`${API_URL}/tables/${tableName}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating ${tableName}:`, error);
    throw error;
  }
};

export const deleteRecord = async (tableName, id) => {
  try {
    const response = await axios.delete(`${API_URL}/tables/${tableName}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting from ${tableName}:`, error);
    throw error;
  }
};

export const fetchViews = async () => {
  try {
    const response = await axios.get(`${API_URL}/views`);
    return response.data;
  } catch (error) {
    console.error('Error fetching views:', error);
    throw error;
  }
};

export const fetchViewData = async (viewName) => {
  try {
    const response = await axios.get(`${API_URL}/views/${viewName}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${viewName} data:`, error);
    throw error;
  }
}; 