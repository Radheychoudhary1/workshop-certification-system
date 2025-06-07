// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

interface FormData {
  id: string;
  collegeName: string;
  workshopName: string;
  dateTime: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'workshops'));
        const fetchedForms: FormData[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedForms.push({
            id: doc.id,
            collegeName: data.collegeName,
            workshopName: data.workshopName,
            dateTime: data.dateTime,
          });
        });
        setForms(fetchedForms);
      } catch (error) {
        console.error("Error fetching forms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  return (
    <div className="container-fluid min-vh-100 bg-light py-5 px-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0 fw-bold">Admin Dashboard</h1>
        <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
      </div>

      {/* Main Card */}
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h5 mb-0">Forms</h2>
            <Link to="/dashboard/create" className="btn btn-primary">+ Create New Form</Link>
          </div>

          {loading ? (
            <p className="text-muted">Loading forms...</p>
          ) : forms.length === 0 ? (
            <p className="text-muted">No forms created yet. Start by creating a new form.</p>
          ) : (
            <ul className="list-group">
              {forms.map((form) => (
                <li key={form.id} className="list-group-item">
                  <h5 className="mb-1">{form.workshopName}</h5>
                  <p className="mb-0"><strong>College:</strong> {form.collegeName}</p>
                  <p className="mb-0"><strong>Date & Time:</strong> {form.dateTime}</p>
                  <Link to={`/dashboard/form/${form.id}`} className="btn btn-sm btn-outline-primary mt-2">View Responses</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
