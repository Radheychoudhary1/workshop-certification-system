// src/pages/FormResponses.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface FeedbackData {
  name: string;
  course: string;
  phone: string;
  email: string;
  feedback: string;
  timestamp: { seconds: number; nanoseconds: number };
}

const FormResponses: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [responses, setResponses] = useState<FeedbackData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const submissionsRef = collection(db, 'submissions');
        const q = query(submissionsRef, where('formId', '==', id));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => doc.data() as FeedbackData);
        setResponses(data);
      } catch (error) {
        console.error('Error fetching responses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, [id]);

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Form Responses</h2>
        <Link to="/dashboard" className="btn btn-secondary">← Back to Dashboard</Link>
      </div>

      {loading ? (
        <div className="text-center">Loading responses...</div>
      ) : responses.length === 0 ? (
        <div className="alert alert-warning text-center">No responses yet.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Course</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Feedback</th>
                <th>Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {responses.map((resp, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{resp.name}</td>
                  <td>{resp.course}</td>
                  <td>{resp.phone}</td>
                  <td>{resp.email}</td>
                  <td>{resp.feedback}</td>
                  <td>{new Date(resp.timestamp.seconds * 1000).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FormResponses;
