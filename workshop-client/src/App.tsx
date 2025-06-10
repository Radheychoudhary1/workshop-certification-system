// src/App.tsx
import { Suspense, lazy } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import GlobalLoader from './components/GlobalLoader';
import PrivateRoute from './components/PrivateRoute';

// Lazy load all major pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const FormCreator = lazy(() => import('./pages/FormCreator'));
const StudentFeedbackForm = lazy(() => import('./pages/StudentFeedbackForm'));
const FormResponses = lazy(() => import('./pages/FormResponses'));

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
          <Route path="/form/:formId" element={<StudentFeedbackForm />} />
          <Route path="/dashboard/form/:id" element={<FormResponses />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
