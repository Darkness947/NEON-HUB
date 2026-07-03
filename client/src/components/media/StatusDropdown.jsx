import { useState, useRef, useEffect } from 'react';
import { useLibrary } from '../../hooks/useLibrary';
import { getStatusColor } from '../../utils/getStatusColor';

const movieSeriesStatus = ['watching', 'completed', 'planned', 'paused', 'dropped'];
const gameStatus = ['playing', 'completed', 'backlog', 'paused', 'dropped'];

const StatusDropdown = ({ mediaType, mediaId, currentStatus, onStatusChange, onDropdownToggle }) => {
  const { updateItem, addToLibrary, removeFromLibrary, isLoading } = useLibrary();
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (onDropdownToggle) {
      onDropdownToggle(isOpen);
    }
  }, [isOpen, onDropdownToggle]);

  const statuses = mediaType === 'game' ? gameStatus : movieSeriesStatus;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = async (status) => {
    setIsOpen(false);
    setIsUpdating(true);
    try {
      if (!currentStatus) {
        await addToLibrary(mediaType, mediaId, status);
      } else {
        await updateItem(mediaType, mediaId, { status });
      }
      if (onStatusChange) onStatusChange(status);
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsOpen(false);
    setIsUpdating(true);
    try {
      await removeFromLibrary(mediaType, mediaId);
      if (onStatusChange) onStatusChange(null);
    } catch (err) {
      console.error('Failed to remove item', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const disabled = isLoading || isUpdating;
  const bgColor = currentStatus ? `var(--${getStatusColor(currentStatus)})` : 'var(--bg-secondary)';

  return (
    <div className="dropdown" ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        className="btn d-flex align-items-center justify-content-between px-3 py-1" 
        style={{ 
          backgroundColor: bgColor,
          color: currentStatus ? '#fff' : 'var(--text-primary)',
          opacity: disabled ? 0.7 : 1,
          border: currentStatus ? 'none' : '1px solid rgba(255,255,255,0.2)',
          borderRadius: '20px',
          minWidth: '130px',
          fontSize: '0.85rem',
          fontWeight: '500',
          transition: 'all 0.2s ease',
          boxShadow: currentStatus ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled) setIsOpen(!isOpen);
        }}
        disabled={disabled}
      >
        <span>
          {isUpdating ? 'Updating...' : (currentStatus ? currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1) : 'Add to Library')}
        </span>
        <span style={{ fontSize: '0.7rem', marginLeft: '8px' }}>▼</span>
      </button>

      {isOpen && (
        <ul 
          className="dropdown-menu show shadow-lg" 
          style={{ 
            position: 'absolute', 
            top: '110%', 
            left: 0, 
            zIndex: 1000, 
            backgroundColor: '#1f2229', 
            border: '1px solid rgba(255,255,255,0.1)', 
            borderRadius: '12px', 
            minWidth: '150px',
            padding: '8px 0',
            overflow: 'hidden'
          }}
        >
          {statuses.map(s => {
            const statusColor = `var(--${getStatusColor(s)})`;
            return (
              <li key={s}>
                <button 
                  className="dropdown-item d-flex align-items-center py-2 px-3" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelect(s);
                  }}
                  style={{ 
                    color: '#e2e8f0',
                    fontSize: '0.9rem',
                    backgroundColor: s === currentStatus ? 'rgba(255,255,255,0.05)' : 'transparent',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = s === currentStatus ? 'rgba(255,255,255,0.05)' : 'transparent';
                  }}
                >
                  <span 
                    style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      backgroundColor: statusColor, 
                      marginRight: '12px' 
                    }} 
                  />
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              </li>
            );
          })}
          {currentStatus && (
            <>
              <li><hr className="dropdown-divider border-secondary my-2" style={{ opacity: 0.5 }} /></li>
              <li>
                <button 
                  className="dropdown-item d-flex align-items-center py-2 px-3 text-danger" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemove();
                  }}
                  style={{ fontSize: '0.9rem' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(229,62,62,0.1)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <i className="bi bi-trash3 me-2"></i>
                  Remove
                </button>
              </li>
            </>
          )}
        </ul>
      )}
    </div>
  );
};

export default StatusDropdown;
