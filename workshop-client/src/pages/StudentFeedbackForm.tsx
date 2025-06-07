import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
// import OtpInput from '../components/OtpInput'; // ⛔ Commented out OTP input

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

  const [name, setName] = useState('');
  const [course, setCourse] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');

  // const [emailVerified, setEmailVerified] = useState(false);
  // const [phoneVerified, setPhoneVerified] = useState(false);
  // const [otpError, setOtpError] = useState('');
  // const [otpLoading, setOtpLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // if (!emailVerified || !phoneVerified) {
    //   return alert('Please verify both email and phone number before submitting.');
    // }

    try {
      const submissionRef = doc(db, 'submissions', `${formId}_${email}`);
      const existing = await getDoc(submissionRef);
      if (existing.exists()) {
        return alert('You have already submitted feedback.');
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

      setFormSubmitted(true);
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border" role="status" />
    </div>
  );

  if (!formDetails) return (
    <div className="alert alert-danger text-center mt-5">
      Invalid or inactive form link.
    </div>
  );

  if (formSubmitted) return (
    <div className="alert alert-success text-center mt-5">
      ✅ Thank you! Your feedback has been submitted.
    </div>
  );

  return (
    <div className="container py-5">
      <div id="recaptcha-container" />
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="card shadow-lg border-0">
            <div className="card-body p-4">
              <h3 className="card-title text-center mb-3">{formDetails.workshopName}</h3>
              <p><strong>College:</strong> {formDetails.collegeName}</p>
              <p><strong>Date & Time:</strong> {formDetails.dateTime}</p>
              <div className="alert alert-info">{formDetails.instructions}</div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="mb-3">
                  <label className="form-label">Course</label>
                  <input type="text" className="form-control" value={course} onChange={(e) => setCourse(e.target.value)} required />
                </div>

                <div className="mb-3">
                  <label className="form-label">Phone (+91XXXXXXXXXX)</label>
                  <input type="tel" className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div className="mb-3">
                  <label className="form-label">Feedback</label>
                  <textarea className="form-control" rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} required />
                </div>

                {/* {otpError && <div className="alert alert-danger">{otpError}</div>} */}

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    // disabled={!emailVerified || !phoneVerified || otpLoading}
                  >
                    Submit Feedback
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
