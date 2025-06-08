// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const itemsPerPage = 6;

  const performLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
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

  const paginatedForms = forms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(forms.length / itemsPerPage);

  return (
    <div className="dashboard container-fluid bg-light min-vh-100 py-4 px-3 px-md-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-dark text-white p-3 rounded shadow-sm">
        <h1 className="h4 m-0">🎓 Admin Dashboard</h1>
        <button className="btn btn-warning text-dark fw-semibold" onClick={handleLogoutClick}>
          Logout
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 shadow border-0">
              <div className="modal-header bg-dark text-white rounded-top-4">
                <h5 className="modal-title">Confirm Logout</h5>
              </div>
              <div className="modal-body text-dark">
                Are you sure you want to logout?
              </div>
              <div className="modal-footer d-flex justify-content-end gap-2">
                <button className="btn btn-sm btn-outline-secondary" onClick={handleCancelLogout}>
                  Cancel
                </button>
                <button className="btn btn-sm btn-warning fw-semibold text-dark" onClick={performLogout}>
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
            <h2 className="h5 fw-bold text-dark mb-2 mb-md-0">All Workshops</h2>
            <Link to="/dashboard/create" className="btn btn-dark text-warning fw-semibold">
              + Create New Form
            </Link>
          </div>

          {loading ? (
            <div className="d-flex justify-content-center align-items-center py-5">
              <Loader />
            </div>
          ) : forms.length === 0 ? (
            <div className="text-center text-muted py-4">
              No forms created yet. Start by clicking <strong>“Create New Form”</strong>.
            </div>
          ) : (
            <>
              <div className="row">
                {paginatedForms.map((form) => (
                  <div className="col-12 col-md-6 col-lg-4 mb-4" key={form.id}>
                    <div className="card h-100 shadow-sm border-start border-4 border-warning">
                      <div className="card-body">
                        <h5 className="card-title text-dark">{form.workshopName}</h5>
                        <p className="mb-1"><strong>College:</strong> {form.collegeName}</p>
                        <p className="mb-2"><strong>Date & Time:</strong> {form.dateTime}</p>
                        <Link
                          to={`/dashboard/form/${form.id}`}
                          className="btn btn-sm btn-outline-warning fw-semibold"
                        >
                          View Responses
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {forms.length > itemsPerPage && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
