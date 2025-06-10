import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Loader from '../components/Loader';
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
    <div className="container-fluid bg-light min-vh-100 py-4 px-3 px-md-5">
      {/* Header */}

      <div className="d-flex justify-content-between align-items-center mb-4 bg-dark text-white p-3 rounded shadow-sm">
        <h1 className="h4 m-0">📋 Form Responses</h1>
        <div>
          <Link to="/dashboard" className="btn btn-warning text-dark fw-semibold w-100 w-md-auto">
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Main Card */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          {loading ? (
            <div className="d-flex justify-content-center align-items-center py-5">
              <Loader />
            </div>
          ) : responses.length === 0 ? (
            <div className="text-center text-muted py-4">
              No responses found for this form.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered align-middle text-center">
                <thead className="table-dark">
                  <tr>
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
                      <td>{resp.name}</td>
                      <td>{resp.course}</td>
                      <td>{resp.phone}</td>
                      <td>{resp.email}</td>
                      <td className="text-start">{resp.feedback}</td>
                      <td className="white-space-nowrap">
                        {new Date(resp.timestamp.seconds * 1000).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormResponses;
