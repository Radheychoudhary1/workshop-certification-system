import { signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';
import { auth, db } from '../firebase';

interface FormData {
  id: string;
  collegeName: string;
  workshopName: string;
  dateTime: string;
  active: boolean;
  linkId: string;
  responsesCount: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 6;
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);

  const performLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleLogoutClick = () => setShowLogoutConfirm(true);
  const handleCancelLogout = () => setShowLogoutConfirm(false);

  const handleCopyLink = (link: string, id?: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLinkId(id || null);
    toast.success('Feedback link copied!');
    setTimeout(() => setCopiedLinkId(null), 2000);
  };

  const exportToCSV = async (formId: string) => {
  try {
    setExportingId(formId);
    console.log('Fetching responses for formId:', formId);

    const responsesRef = collection(db, 'workshops', formId, 'responses');
    const snapshot = await getDocs(responsesRef);

    if (snapshot.empty) {
      toast.info('No submissions to export.');
      console.warn('No documents found in responses.');
      return;
    }

    const csvRows: string[] = [];
    const headers = ['Rating', 'Suggestion', 'Submitted At'];
    csvRows.push(headers.join(','));

    snapshot.forEach((doc) => {
      const data = doc.data();
      const row = [
        `"${data.rating || ''}"`,
        `"${data.suggestion || ''}"`,
        `"${data.submittedAt?.toDate?.().toLocaleString() || ''}"`,
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `workshop_${formId}_responses.csv`;

    // Fix for some browsers (append + click + remove)
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('CSV download triggered.');
  } catch (error) {
    console.error('Error exporting CSV:', error);
    toast.error('Failed to export CSV.');
  } finally {
    setExportingId(null);
  }
};


  useEffect(() => {
    const fetchWorkshopsWithCounts = async () => {
      try {
        const workshopsSnapshot = await getDocs(collection(db, 'workshops'));
        const submissionsSnapshot = await getDocs(collection(db, 'submissions'));

        const responseCountMap: Record<string, number> = {};
        submissionsSnapshot.forEach((doc) => {
          const data = doc.data();
          const fid = data.formId;
          if (fid) {
            responseCountMap[fid] = (responseCountMap[fid] || 0) + 1;
          }
        });

        const workshopsWithCount: FormData[] = workshopsSnapshot.docs.map((doc) => {
          const data = doc.data();
          const id = doc.id;
          return {
            id,
            collegeName: data.collegeName,
            workshopName: data.workshopName,
            dateTime: data.dateTime,
            active: data.active,
            linkId: data.linkId,
            responsesCount: responseCountMap[id] || 0,
          };
        });

        setForms(workshopsWithCount);
      } catch (err) {
        console.error('Error fetching workshops or responses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshopsWithCounts();
  }, []);

  const filteredForms = forms.filter((form) =>
    form.workshopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    form.collegeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedForms = filteredForms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredForms.length / itemsPerPage);

  return (
    <div className="dashboard container-fluid bg-light min-vh-100 py-4 px-3 px-md-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-dark text-white p-3 rounded shadow-sm">
        <h1 className="h4 m-0">🎓 Admin Dashboard</h1>
        <button className="btn btn-warning text-dark fw-semibold" onClick={handleLogoutClick}>
          Logout
        </button>
      </div>

      {/* Logout Modal */}
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

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
            <h2 className="h5 fw-bold text-dark mb-0">All Workshops</h2>
            <Link to="/dashboard/create" className="btn btn-dark text-warning fw-semibold">
              + Create New Form
            </Link>
          </div>

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search by workshop or college..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Cards */}
          {loading ? (
            <div className="d-flex justify-content-center align-items-center py-5">
              <Loader />
            </div>
          ) : filteredForms.length === 0 ? (
            <div className="text-center text-muted py-4">
              No matching workshops found.
            </div>
          ) : (
            <>
              <div className="row">
                {paginatedForms.map((form) => (
                  <div className="col-12 col-md-6 col-lg-4 mb-4" key={form.id}>
                    <div className="card h-100 shadow-sm border-start border-4 border-warning">
                      <div className="card-body d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="card-title text-dark mb-0">{form.workshopName}</h5>
                          <span className={`badge rounded-pill ${form.active ? 'bg-success' : 'bg-secondary'}`}>
                            {form.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="mb-1"><strong>College:</strong> {form.collegeName}</p>
                        <p className="mb-1"><strong>Date & Time:</strong> {form.dateTime}</p>
                        <p className="mb-2"><strong>Responses:</strong> {form.responsesCount}</p>

                        {form.active && form.linkId ? (
                          <div className="input-group input-group-sm mb-2">
                            <input
                              type="text"
                              className="form-control"
                              readOnly
                              value={`${window.location.origin}/form/${form.id}`}
                            />
                            <button
                              className="btn btn-outline-dark"
                              onClick={() => handleCopyLink(`${window.location.origin}/form/${form.id}`, form.id)}
                            >
                              {copiedLinkId === form.id ? 'Copied' : 'Copy Link'}
                            </button>
                          </div>
                        ) : (
                          <p className="text-muted small mb-2">Link not available (Inactive)</p>
                        )}

                        <div className="d-flex gap-2 mt-auto">
                          <Link
                            to={`/dashboard/form/${form.id}`}
                            className="btn btn-sm btn-primary fw-semibold w-100"
                          >
                            View Responses
                          </Link>
                          <button
                            className="btn btn-sm btn-outline-primary w-100"
                            disabled={exportingId === form.id || form.responsesCount === 0}
                            onClick={() => exportToCSV(form.id)}
                          >
                            {exportingId === form.id ? 'Exporting...' : 'Export CSV'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredForms.length > itemsPerPage && (
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
