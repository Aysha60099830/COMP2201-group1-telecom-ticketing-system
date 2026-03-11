// App.js — Main router with all pages

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TicketList from './pages/TicketList';
import TicketDetail from './pages/TicketDetail';
import NewTicket from './pages/NewTicket';
import UsersAdmin from './pages/UsersAdmin';
import AuditLogs from './pages/AuditLogs';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to="/tickets" replace />} />

            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['admin', 'staff']}>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/tickets" element={
              <ProtectedRoute><TicketList /></ProtectedRoute>
            } />

            <Route path="/my-tickets" element={
              <ProtectedRoute><TicketList /></ProtectedRoute>
            } />

            <Route path="/tickets/new" element={
              <ProtectedRoute><NewTicket /></ProtectedRoute>
            } />

            <Route path="/tickets/:id" element={
              <ProtectedRoute><TicketDetail /></ProtectedRoute>
            } />

            <Route path="/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UsersAdmin />
              </ProtectedRoute>
            } />

            <Route path="/logs" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AuditLogs />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
