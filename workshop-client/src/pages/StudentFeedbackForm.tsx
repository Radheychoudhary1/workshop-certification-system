import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import bannerImage from '../assets/images/page-banner.jpg';
import { db } from '../firebase';
interface FormData {
  collegeName: string;
  workshopName: string;
  dateTime: string;
  instructions: string;
}

const StudentFeedbackForm: React.FC = () => {
  const { formId = '' } = useParams<{ formId: string }>();
  const [formDetails, setFormDetails] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [course, setCourse] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');

  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'verifying' | 'verified'>('idle');

  const [showTwilioAlert, setShowTwilioAlert] = useState(false);
  const [twilioAlertShown, setTwilioAlertShown] = useState(false);

  const isFormVerified = emailVerified;

  useEffect(() => {
    const fetchForm = async () => {
      if (!formId) return setLoading(false);
      try {
        const formRef = doc(db, 'workshops', formId);
        const formSnap = await getDoc(formRef);
        if (formSnap.exists()) {
          setFormDetails(formSnap.data() as FormData);
        }
      } catch (error) {
        console.error('Error fetching form:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [formId]);

  const [cooldown, setCooldown] = useState(0);

  // Cooldown countdown effect
  useEffect(() => {
    if (cooldown > 0) {
      const interval = setInterval(() => setCooldown(c => c - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [cooldown]);

  const handleSendEmailOtp = async () => {
    if (!email || cooldown > 0) return;
    setEmailStatus('sending');
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE}/sendEmailOtp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailOtpSent(true);
        setCooldown(60); // Start 60s cooldown
      }
    } catch (err) {
      console.error('Error sending OTP:', err);
    } finally {
      setEmailStatus('idle');
    }
  };

  const handleVerifyEmailOtp = async () => {
    setEmailStatus('verifying');
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE}/verifyEmailOtp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: emailOtp }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailVerified(true);
        setEmailStatus('verified');
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
    } finally {
      if (emailStatus !== 'verified') setEmailStatus('idle');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const submissionRef = doc(db, 'submissions', `${formId}_${email}`);
      const existing = await getDoc(submissionRef);
      if (existing.exists()) {
        alert('You have already submitted feedback.');
        return;
      }

      await setDoc(submissionRef, {
        formId,
        name,
        course,
        phone,
        email,
        feedback,
        timestamp: new Date(),
      });

      const res = await fetch(`${process.env.REACT_APP_API_BASE}/generate-certificate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId, name, course, phone, email }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Certificate generation failed');
      }

      setFormSubmitted(true);
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit feedback or generate certificate. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
    if (!twilioAlertShown && e.target.value.trim().length >= 10) {
      setShowTwilioAlert(true);
      setTwilioAlertShown(true);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-warning" role="status" />
      </div>
    );
  }

  if (!formDetails) {
    return (
      <div className="alert alert-danger text-center mt-5">
        Invalid or inactive form link.
      </div>
    );
  }

  if (formSubmitted) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="text-center p-5 rounded-4 shadow-sm bg-white border-0" style={{ maxWidth: '600px' }}>
          <div className="mb-4">
            <div className="d-inline-flex justify-content-center align-items-center bg-success text-white rounded-circle" style={{ width: '60px', height: '60px', fontSize: '30px' }}>✓
            </div>
          </div>
          <h4 className="fw-bold text-dark mb-2">Thank you! 🎉</h4>
          <p className="text-secondary mb-3">
            Your feedback has been successfully submitted.
          </p>
          <p className="text-dark fw-medium mb-4">
            Your certificate will be generated and sent shortly to your verified:
          </p>
          <div className="d-flex flex-column align-items-center mb-4">
            <p className="mb-2">
              <strong className="text-dark">📱 WhatsApp:</strong>{' '}
              <span className="text-secondary">{phone}</span>
            </p>
            <p className="mb-0">
              <strong className="text-dark">📧 Email:</strong>{' '}
              <span className="text-secondary">{email}</span>
            </p>
          </div>
          <hr className="my-4" />
          <p className="text-muted small">
            Please ensure your contact details are correct. For any issues, contact the coordinator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <div className="w-100 position-relative" style={{ height: '220px', backgroundImage: `url(${bannerImage})`, backgroundSize: 'cover', backgroundPosition: 'center', borderBottom: '5px solid var(--bs-warning)' }}>
        <div className="position-absolute translate-middle text-white text-center px-3 top-40 start-50">
          <h2 className="fw-semibold" style={{ textShadow: '1px 1px 4px #000' }}>
            Feedback Form
          </h2>
        </div>
      </div>

      <div className="container-fluid" style={{ marginTop: '-90px' }}>
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8">
            <div className="card shadow-sm border-0 p-4 rounded-4 bg-white">
              <h2 className="fw-semibold">
                Please fill out the details to receive your certificate!
              </h2>
              <h3 className="text-center fw-bold text-warning mb-3">{formDetails.workshopName}</h3>
              <p className="mb-1"><strong>College:</strong> {formDetails.collegeName}</p>
              <p className="mb-3"><strong>Date & Time:</strong> {formDetails.dateTime}</p>
              {formDetails.instructions && (
                <div className="alert alert-info small">{formDetails.instructions}</div>
              )}

              {showTwilioAlert && (
                <div className="alert alert-warning alert-dismissible fade show small" role="alert">
                  📲 To receive your certificate via WhatsApp, please send <strong>"join angle-particles"</strong> from the number you entered to{' '}
                  <strong>+1 415 523 8886</strong>. If already send this message then please Ignore it.
                  <button type="button" className="btn-close" onClick={() => setShowTwilioAlert(false)} />
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Course</label>
                  <input type="text" className="form-control" value={course} onChange={e => setCourse(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone</label>
                  <input type="tel" className="form-control" value={phone} onChange={handlePhoneChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  {!emailVerified && (
                    <div className="d-flex flex-column gap-2 mt-2">
                      {!emailOtpSent ? (
                        <button type="button" onClick={handleSendEmailOtp} className="btn btn-secondary btn-sm" disabled={emailStatus === 'sending'}>
                          {emailStatus === 'sending' ? 'Sending...' : 'Send OTP'}
                        </button>
                      ) : (
                        <>
                          <div className="d-flex gap-2">
                            <input type="text" className="form-control form-control-sm" placeholder="Enter OTP" value={emailOtp} onChange={(e) => setEmailOtp(e.target.value)} />
                            <button type="button" onClick={handleVerifyEmailOtp} className={`btn btn-sm ${emailStatus === 'verified' ? 'btn-success' : 'btn-secondary'}`} disabled={emailStatus === 'verifying' || emailStatus === 'verified'}>
                              {emailStatus === 'verifying' ? 'Verifying...' : emailStatus === 'verified' ? 'Verified ✅' : 'Verify OTP'}
                            </button>
                          </div>
                          <div className="d-flex justify-content-between align-items-center mt-1">
                            {cooldown > 0 ? (
                              <span className="text-muted small">Resend available in {cooldown}s</span>
                            ) : (
                              <button type="button" className="btn btn-link btn-sm p-0" onClick={handleSendEmailOtp}> 🔁 Resend OTP
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  {emailVerified && <p className="text-success small mt-1">✅ Email Verified</p>}
                </div>

                <div className="mb-4">
                  <label className="form-label">Feedback</label>
                  <textarea className="form-control" rows={4} value={feedback} onChange={e => setFeedback(e.target.value)} required />
                </div>
                <div className="d-grid">
                  <button type="submit" className="btn btn-warning fw-bold" disabled={!isFormVerified || submitting}>
                    {submitting ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFeedbackForm;
