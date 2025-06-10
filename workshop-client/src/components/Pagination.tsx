import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const renderPages = () => {
    const pages: (number | 'ellipsis')[] = [];

    if (totalPages <= 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (totalPages >= 2) pages.push(2);

      if (currentPage > 2 && currentPage < totalPages) {
        pages.push('ellipsis');
        pages.push(currentPage);
      } else if (currentPage >= totalPages) {
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (totalPages > 3) {
        pages.push('ellipsis');
      }
    }

    return pages.map((page, index) => {
      if (page === 'ellipsis') {
        return (
          <li key={`ellipsis-${index}`} className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        );
      }

      return (
        <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(page)}>
            {page}
          </button>
        </li>
      );
    });
  };

  return (
    <nav className="pagination-wrapper d-flex justify-content-center mt-4">
      <ul className="pagination custom-pagination">
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={handlePrev}>Prev</button>
        </li>
        {renderPages()}
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button className="page-link" onClick={handleNext}>Next</button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
