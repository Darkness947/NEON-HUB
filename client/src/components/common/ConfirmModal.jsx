import React from 'react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmStyle = 'danger' }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1051 }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-bg-elevated)', borderRadius: 'var(--radius-lg)' }}>
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose} aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <p>{message}</p>
            </div>
            <div className="modal-footer border-0 pt-0">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className={`btn btn-${confirmStyle}`} onClick={onConfirm}>
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmModal;
