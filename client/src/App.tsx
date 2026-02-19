import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import UsersPage from './pages/UsersPage';
import PatientDetailPage from './pages/PatientDetailPage';
import MedicineInventoryPage from './pages/MedicineInventoryPage';
import InquiriesPage from './pages/InquiriesPage';
import './App.css';

function RoleRoute({ allowedRoles, children }: { allowedRoles: string[]; children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/users" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/users" element={<UsersPage />} />
            <Route path="/patients/:id" element={<PatientDetailPage />} />
            <Route path="/medicines" element={<RoleRoute allowedRoles={['admin', 'staff']}><MedicineInventoryPage /></RoleRoute>} />
            <Route path="/inquiries" element={<RoleRoute allowedRoles={['admin', 'family']}><InquiriesPage /></RoleRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/users" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
