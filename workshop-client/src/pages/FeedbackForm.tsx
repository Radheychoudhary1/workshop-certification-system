import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

const FeedbackForm: React.FC = () => {
  const { id } = useParams(); // id = linkId
  const [workshop, setWorkshop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [copied, setCopied] = useState(false); // ✅ New state for copy feedback

  useEffect(() => {
    const fetchWorkshop = async () => {
      try {
        if (!id) return;

        const q = query(collection(db, 'workshops'), where('linkId', '==', id));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          if (doc.exists() && doc.data().active) {
            setWorkshop({ ...doc.data(), docId: doc.id });
          }
        }
      } catch (error) {
        console.error('Error loading workshop:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshop();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !workshop?.docId) return;

    try {
      await addDoc(collection(db, 'workshops', workshop.docId, 'responses'), {
        rating,
        suggestion,
        submittedAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  if (loading) return null;

  if (!workshop) {
    return (
      <div className="container py-5 text-center">
        <h5 className="text-danger">Invalid or Inactive Feedback Form</h5>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="container py-5 text-center">
        <h4 className="text-success">✅ Feedback Submitted</h4>
        <p>Thank you for your time!</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h3 className="mb-2">{workshop.workshopName}</h3>
              <p className="text-muted mb-1">at {workshop.collegeName}</p>
              <p className="text-muted mb-3">
                {new Date(workshop.dateTime).toLocaleString()}
              </p>

              {/* ✅ Copy Button */}
              <div className="mb-4 d-flex justify-content-end">
                <button
                  type="button"
                  className={`btn btn-sm ${copied ? 'btn-success' : 'btn-outline-secondary'}`}
                  onClick={handleCopyLink}
                >
                  {copied ? 'Copied' : 'Copy Link'}
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">How would you rate this workshop?</label>
                  <select
                    className="form-select"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    required
                  >
                    <option value="">Choose rating</option>
                    <option value="5">Excellent (5)</option>
                    <option value="4">Good (4)</option>
                    <option value="3">Average (3)</option>
                    <option value="2">Poor (2)</option>
                    <option value="1">Very Poor (1)</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Suggestions (optional)</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={suggestion}
                    onChange={(e) => setSuggestion(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100">
                  Submit Feedback
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;
