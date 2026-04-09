// App.js — Main router with telecom layout
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TicketList from './pages/TicketList';
import TicketDetail from './pages/TicketDetail';
import NewTicket from './pages/NewTicket';
import UsersAdmin from './pages/UsersAdmin';
import AuditLogs from './pages/AuditLogs';

const AppLayout = ({ children }) => {
  const { user } = useAuth();
  if (!user) return children;
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">{children}</div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/tickets" replace />} />

          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['admin','staff']}>
              <AppLayout><Dashboard /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/tickets" element={
            <ProtectedRoute><AppLayout><TicketList /></AppLayout></ProtectedRoute>
          } />
          <Route path="/my-tickets" element={
            <ProtectedRoute><AppLayout><TicketList /></AppLayout></ProtectedRoute>
          } />
          <Route path="/tickets/new" element={
            <ProtectedRoute><AppLayout><NewTicket /></AppLayout></ProtectedRoute>
          } />
          <Route path="/tickets/:id" element={
            <ProtectedRoute><AppLayout><TicketDetail /></AppLayout></ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute allowedRoles={['admin']}><AppLayout><UsersAdmin /></AppLayout></ProtectedRoute>
          } />
          <Route path="/logs" element={
            <ProtectedRoute allowedRoles={['admin']}><AppLayout><AuditLogs /></AppLayout></ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
