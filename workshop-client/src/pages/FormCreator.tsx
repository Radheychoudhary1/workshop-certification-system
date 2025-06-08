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
import { toast } from 'react-toastify';
import Loader from '../components/Loader';

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
  const [copiedLink, setCopiedLink] = useState('');
  const isFormValid = collegeName && workshopName && dateTime;

  const handleSaveDraft = async () => {
    if (!isFormValid) return;
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
        toast.success('Draft saved successfully!');
      } else {
        const docRef = doc(db, 'workshops', formId);
        await updateDoc(docRef, {
          collegeName,
          workshopName,
          dateTime,
          instructions,
        });
        toast.success('Draft updated successfully!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save draft. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    setLoading(true);
    try {
      if (!formId) await handleSaveDraft();

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
      toast.success(`Form ${!active ? 'activated' : 'deactivated'}!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(text);
    setTimeout(() => setCopiedLink(''), 2000);
  };

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center bg-dark rounded-3 px-4 py-3 shadow mb-4 gap-3">
        <h1 className="h4 m-0 text-white fw-bold">
          🎯 Create Workshop Feedback Form
        </h1>
        <button
          className="btn btn-warning text-dark fw-semibold"
          onClick={() => navigate('/dashboard')}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Form Container Card */}
      <div className="bg-white rounded-4 shadow-sm p-4 border border-light-subtle">
        {loading && <Loader />}

        <div className="mb-3">
          <label className="form-label fw-semibold text-dark">College Name</label>
          <input
            type="text"
            className="form-control bg-white text-dark"
            value={collegeName}
            onChange={(e) => setCollegeName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold text-dark">Workshop Name</label>
          <input
            type="text"
            className="form-control bg-white text-dark"
            value={workshopName}
            onChange={(e) => setWorkshopName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold text-dark">Date & Time</label>
          <input
            type="datetime-local"
            className="form-control bg-white text-dark"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold text-dark">Instructions</label>
          <textarea
            className="form-control bg-white text-dark"
            rows={4}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Enter instructions for attendees"
          />
        </div>

        {/* Action Buttons */}
        <div className="d-flex flex-wrap gap-3 mb-4">
          <button
            className="btn btn-warning text-dark fw-semibold"
            onClick={handleSaveDraft}
            disabled={loading || !isFormValid}
          >
            Save Draft
          </button>

          <button
            className={`btn fw-semibold ${active ? 'btn-danger' : 'btn-success'}`}
            onClick={handleToggleActive}
            disabled={loading || !formId}
          >
            {active ? 'Deactivate Form' : 'Activate Form'}
          </button>
        </div>

        {/* Private Link (Admin) */}
        {active && linkId && (
          <div className="mb-4">
            <p className="mb-2 text-success fw-semibold">✅ Admin Feedback Form (Private):</p>
            <div className="input-group">
              <input
                type="text"
                className="form-control bg-white text-dark"
                readOnly
                value={`${window.location.origin}/feedback/${linkId}`}
              />
              <button
                className="btn btn-outline-warning"
                onClick={() =>
                  handleCopy(`${window.location.origin}/feedback/${linkId}`)
                }
              >
                {copiedLink === `${window.location.origin}/feedback/${linkId}` ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        {/* Public Link (Student) */}
        {formId && (
          <div>
            <p className="mb-2 text-info fw-semibold">🎓 Student Feedback Form (Public):</p>
            <div className="input-group">
              <input
                type="text"
                className="form-control bg-white text-dark"
                readOnly
                value={`${window.location.origin}/form/${formId}`}
              />
              <button
                className="btn btn-outline-warning"
                onClick={() =>
                  handleCopy(`${window.location.origin}/form/${formId}`)
                }
              >
                {copiedLink === `${window.location.origin}/form/${formId}` ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormCreator;
