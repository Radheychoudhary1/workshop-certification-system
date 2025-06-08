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
import { toast } from 'react-toastify';
import bannerImage from '../assets/images/login-bg.jpg'; // Ensure this path is correct

const FeedbackForm: React.FC = () => {
  const { id } = useParams();
  const [workshop, setWorkshop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [copied, setCopied] = useState(false);

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
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
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
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="text-center p-5 rounded-4 shadow-sm bg-white border-0" style={{ maxWidth: '600px' }}>
          <div
            className="d-inline-flex justify-content-center align-items-center bg-success text-white rounded-circle mb-3"
            style={{ width: '60px', height: '60px', fontSize: '30px' }}
          >
            ✓
          </div>
          <h4 className="fw-bold text-dark">Feedback Submitted</h4>
          <p className="text-secondary">Thanks for your valuable feedback!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      {/* Banner/Header */}
      <div
        className="w-100 position-relative"
        style={{
          height: '220px',
          backgroundImage: `url(${bannerImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderBottom: '5px solid var(--bs-warning)',
        }}
      >
        <div className="position-absolute translate-middle text-white text-center px-3 top-40 start-50">
          <h2 className="fw-bold" style={{ textShadow: '1px 1px 4px #000' }}>
            Workshop Feedback
          </h2>
          <p className="text-white" style={{ textShadow: '1px 1px 4px #000' }}>
            Please take a moment to share your thoughts.
          </p>
        </div>
      </div>

      {/* Feedback Card */}
      <div className="container" style={{ marginTop: '-90px' }}>
        <div className="card shadow-sm border-0 p-4 rounded-4 bg-white mx-auto" style={{ maxWidth: '600px' }}>
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h4 className="fw-bold text-dark mb-1">{workshop.workshopName}</h4>
                <p className="text-muted mb-1">at {workshop.collegeName}</p>
                <p className="text-muted mb-0">
                  {new Date(workshop.dateTime).toLocaleString()}
                </p>
              </div>
              <button className="btn btn-outline-dark btn-sm" onClick={handleCopyLink}>
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-medium">Rate this workshop</label>
                <select
                  className="form-select border-dark"
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

              <div className="mb-4">
                <label className="form-label fw-medium">Suggestions (optional)</label>
                <textarea
                  className="form-control border-dark"
                  placeholder="Any improvements or feedback?"
                  rows={4}
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-warning fw-bold text-black w-100">
                Submit Feedback
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;
