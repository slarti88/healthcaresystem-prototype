import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import UsersPage from './pages/UsersPage';
import PatientDetailPage from './pages/PatientDetailPage';
import MedicineInventoryPage from './pages/MedicineInventoryPage';
import InquiriesPage from './pages/InquiriesPage';
import './App.css';

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
            <Route path="/medicines" element={<MedicineInventoryPage />} />
            <Route path="/inquiries" element={<InquiriesPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
