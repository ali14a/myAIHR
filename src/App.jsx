import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { 
  AuthProvider, 
  NotificationProvider
} from '@contexts';
import { 
  Layout, 
  ProtectedRoute, 
  Notification
} from '@components';
import {
  Login, 
  Register, 
  Dashboard,
  ResumeUpload, 
  ResumeAnalysis, 
  ResumeImprovement,
  JobMatching,
  CoverLetter,
  Profile
} from '@modules';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="App">
            <Notification />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Navigate to="/dashboard" replace />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/upload" element={
                <ProtectedRoute>
                  <Layout>
                    <ResumeUpload />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/analysis" element={
                <ProtectedRoute>
                  <Layout>
                    <ResumeAnalysis />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/matching" element={
                <ProtectedRoute>
                  <Layout>
                    <JobMatching />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/improvement" element={
                <ProtectedRoute>
                  <Layout>
                    <ResumeImprovement />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/cover-letter" element={
                <ProtectedRoute>
                  <Layout>
                    <CoverLetter />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;