import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Components
import TableList from './components/TableList';
import TableData from './components/TableData';
import ManageData from './components/ManageData';
import ViewData from './components/ViewData';
import QueryExplorer from './components/QueryExplorer';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
          <div className="container-fluid">
            <Link className="navbar-brand" to="/">Banking Database UI</Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link className="nav-link" to="/">Tables</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/manage">Manage Data</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/views">Views</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/queries">Queries</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<TableList />} />
            <Route path="/tables/:tableName" element={<TableData />} />
            <Route path="/manage" element={<ManageData />} />
            <Route path="/views" element={<ViewData />} />
            <Route path="/queries" element={<QueryExplorer />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
