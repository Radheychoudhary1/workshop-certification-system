import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import FormCreator from './pages/FormCreator';
import FeedbackForm from './pages/FeedbackForm';
import StudentFeedbackForm from './pages/StudentFeedbackForm';
import FormResponses from './pages/FormResponses';
import TestBackend from "./pages/TestBackend";
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Login Route */}
        <Route path="/" element={<Login />} />

        {/* Protected Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Protected Form Creator Route */}
        <Route
          path="/dashboard/create"
          element={
            <PrivateRoute>
              <FormCreator />
            </PrivateRoute>
          }
        />

        {/* You can add more protected sub-routes later (e.g. /dashboard/manage) */}
        {/* <Route path="/feedback/:id" element={<FeedbackForm />} /> */}
        <Route
          path="/feedback/:id"
          element={
            <PrivateRoute>
              <FeedbackForm />
            </PrivateRoute>
          }
        />
        {/* <Route path="/student/feedbackform" element={<StudentFeedbackForm />} /> */}
        <Route path="/form/:formId" element={<StudentFeedbackForm />} />
        <Route path="/dashboard/form/:id" element={<FormResponses />} />
        <Route path="/test-backend" element={<TestBackend />} />
      </Routes>
    </Router>
  );
}

export default App;
