// src/App.tsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import GlobalLoader from './components/GlobalLoader';

// Lazy load all major pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const FormCreator = lazy(() => import('./pages/FormCreator'));
const FeedbackForm = lazy(() => import('./pages/FeedbackForm'));
const StudentFeedbackForm = lazy(() => import('./pages/StudentFeedbackForm'));
const FormResponses = lazy(() => import('./pages/FormResponses'));
const TestBackend = lazy(() => import('./pages/TestBackend'));

function App() {
  return (
    <Router>
      <Suspense fallback={<GlobalLoader />}>
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/create"
            element={
              <PrivateRoute>
                <FormCreator />
              </PrivateRoute>
            }
          />
          <Route
            path="/feedback/:id"
            element={
              <PrivateRoute>
                <FeedbackForm />
              </PrivateRoute>
            }
          />
          <Route path="/form/:formId" element={<StudentFeedbackForm />} />
          <Route path="/dashboard/form/:id" element={<FormResponses />} />
          <Route path="/test-backend" element={<TestBackend />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
