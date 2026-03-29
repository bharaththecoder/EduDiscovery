import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ onClose, children, center = false }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div
        className={center ? 'modal-center' : 'modal-sheet'}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={16} />
        </button>
        {children}
      </div>
    </div>
  );
}
