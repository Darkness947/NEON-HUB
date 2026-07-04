import React, { useState, useEffect } from 'react';

const ReviewModal = ({ isOpen, onClose, onSave, initialRating, initialReview, mediaTitle }) => {
  const [rating, setRating] = useState(initialRating || '');
  const [review, setReview] = useState(initialReview || '');

  useEffect(() => {
    if (isOpen) {
      setRating(initialRating || '');
      setReview(initialReview || '');
    }
  }, [isOpen, initialRating, initialReview]);

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid #2c2c3e' }}>
            <div className="modal-header border-bottom-0">
              <h5 className="modal-title" style={{ fontFamily: 'var(--font-display)' }}>
                Review: {mediaTitle}
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label text-muted d-flex justify-content-between">
                  <span>Rating (1-10)</span>
                  <span className="text-accent-amber">★</span>
                </label>
                <input 
                  type="number" 
                  className="form-control bg-dark text-light border-0" 
                  min="1" max="10"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  placeholder="Optional rating..."
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-muted">Review</label>
                <textarea 
                  className="form-control bg-dark text-light border-0" 
                  rows="5"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Write your thoughts here..."
                  maxLength={2000}
                ></textarea>
              </div>
            </div>
            <div className="modal-footer border-top-0">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={() => onSave(rating, review)}>
                Save Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReviewModal;
