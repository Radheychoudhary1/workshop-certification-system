import React, { useState } from 'react';
import {
  addDoc,
  collection,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

const FormCreator: React.FC = () => {
  const navigate = useNavigate();

  const [collegeName, setCollegeName] = useState('');
  const [workshopName, setWorkshopName] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [instructions, setInstructions] = useState('');
  const [active, setActive] = useState(false);
  const [linkId, setLinkId] = useState<string | null>(null);
  const [formId, setFormId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const isFormValid = collegeName && workshopName && dateTime;

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      if (!formId) {
        const docRef = await addDoc(collection(db, 'workshops'), {
          collegeName,
          workshopName,
          dateTime,
          instructions,
          active: false,
          linkId: null,
          createdAt: serverTimestamp(),
        });
        setFormId(docRef.id);
      } else {
        const docRef = doc(db, 'workshops', formId);
        await updateDoc(docRef, {
          collegeName,
          workshopName,
          dateTime,
          instructions,
        });
      }
      setError('');
    } catch (err: any) {
      console.error(err);
      setError('Failed to save draft. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    setLoading(true);
    try {
      if (!formId) {
        await handleSaveDraft();
      }

      const docRef = doc(db, 'workshops', formId!);
      let newLinkId = linkId;

      if (!active) {
        newLinkId = uuidv4();
        setLinkId(newLinkId);
      }

      await updateDoc(docRef, {
        active: !active,
        linkId: newLinkId,
        updatedAt: serverTimestamp(),
      });

      setActive(!active);
    } catch (err: any) {
      console.error(err);
      setError('Failed to toggle status. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (linkId) {
      const url = `${window.location.origin}/feedback/${linkId}`;
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard:\n' + url);
    }
  };

  const handleCopyPublicLink = () => {
    if (formId) {
      const url = `${window.location.origin}/form/${formId}`;
      navigator.clipboard.writeText(url);
      alert('Student feedback form link copied:\n' + url);
    }
  };

  return (
    <div className="container py-5 min-vh-100 bg-light">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Create Workshop Feedback Form</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="mb-3">
            <label className="form-label fw-semibold">College Name</label>
            <input
              type="text"
              className="form-control"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Workshop Name</label>
            <input
              type="text"
              className="form-control"
              value={workshopName}
              onChange={(e) => setWorkshopName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Date & Time</label>
            <input
              type="datetime-local"
              className="form-control"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Instructions</label>
            <textarea
              className="form-control"
              rows={4}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Enter instructions for attendees"
            />
          </div>

          <div className="d-flex flex-wrap gap-2 mb-4">
            <button
              className="btn btn-primary"
              onClick={handleSaveDraft}
              disabled={loading || !isFormValid}
            >
              {loading ? 'Saving...' : 'Save Draft'}
            </button>

            <button
              className={`btn ${active ? 'btn-danger' : 'btn-success'}`}
              onClick={handleToggleActive}
              disabled={loading || !formId}
            >
              {loading ? 'Updating...' : active ? 'Deactivate Form' : 'Activate Form'}
            </button>
          </div>

          {/* Authenticated Feedback Link */}
          {active && linkId && (
            <div className="mt-3">
              <p className="mb-2 text-success fw-semibold">
                ✅ Admin Feedback Form (Private):
              </p>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  readOnly
                  value={`${window.location.origin}/feedback/${linkId}`}
                />
                <div className="btn-group">
                  <button className="btn btn-outline-dark" onClick={handleCopyLink}>
                    Copy
                  </button>
                  <a
                    href={`${window.location.origin}/feedback/${linkId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-secondary"
                  >
                    Preview
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Public Student Feedback Link */}
          {formId && (
            <div className="mt-4">
              <p className="mb-2 text-primary fw-semibold">
                🎓 Public Student Feedback Form Link:
              </p>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  readOnly
                  value={`${window.location.origin}/form/${formId}`}
                />
                <div className="btn-group">
                  <button className="btn btn-outline-dark" onClick={handleCopyPublicLink}>
                    Copy
                  </button>
                  <a
                    href={`${window.location.origin}/form/${formId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-secondary"
                  >
                    Open
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormCreator;
