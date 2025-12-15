import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className = ''
}) => {
  const modalRef = useRef(null);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && closeOnEscape && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEscape]);

  // Handle backdrop click
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget && closeOnBackdropClick) {
      onClose();
    }
  };

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    xlarge: 'max-w-4xl'
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal Container */}
      <div 
        ref={modalRef}
        className={`relative w-full ${sizeClasses[size]} bg-white rounded-lg shadow-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${className}`}
        tabIndex={-1}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {title && (
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            )}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-gray-100"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Modal Footer Component
const ModalFooter = ({ children, className = '' }) => (
  <div className={`flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200 ${className}`}>
    {children}
  </div>
);

// Modal Content Components
const ModalSection = ({ title, children, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {title && (
      <h3 className="text-sm font-medium text-gray-900">{title}</h3>
    )}
    <div>{children}</div>
  </div>
);

const ModalInfo = ({ label, value, className = '' }) => (
  <div className={`flex justify-between py-2 ${className}`}>
    <span className="text-sm text-gray-600">{label}:</span>
    <span className="text-sm font-medium text-gray-900">{value}</span>
  </div>
);

// Success Modal
const SuccessModal = ({ isOpen, onClose, title, message, onConfirm, confirmText = 'OK' }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
    <div className="text-center space-y-4">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p className="text-gray-600">{message}</p>
    </div>
    <ModalFooter>
      <Button onClick={onConfirm} className="w-full">
        {confirmText}
      </Button>
    </ModalFooter>
  </Modal>
);

// Error Modal
const ErrorModal = ({ isOpen, onClose, title, message, onConfirm, confirmText = 'OK' }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
    <div className="text-center space-y-4">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
        <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <p className="text-gray-600">{message}</p>
    </div>
    <ModalFooter>
      <Button variant="destructive" onClick={onConfirm} className="w-full">
        {confirmText}
      </Button>
    </ModalFooter>
  </Modal>
);

// Confirmation Modal
const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default'
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
    <div className="space-y-4">
      <p className="text-gray-600">{message}</p>
    </div>
    <ModalFooter>
      <Button variant="outline" onClick={onCancel}>
        {cancelText}
      </Button>
      <Button 
        variant={variant === 'danger' ? 'destructive' : 'default'}
        onClick={onConfirm}
      >
        {confirmText}
      </Button>
    </ModalFooter>
  </Modal>
);

// Form Modal
const FormModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  onSubmit, 
  onCancel,
  submitText = 'Save',
  cancelText = 'Cancel',
  isLoading = false
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="medium">
    <form onSubmit={onSubmit}>
      <div className="space-y-6">
        {children}
      </div>
      <ModalFooter>
        <Button variant="outline" onClick={onCancel} type="button" disabled={isLoading}>
          {cancelText}
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : submitText}
        </Button>
      </ModalFooter>
    </form>
  </Modal>
);

export {
  Modal,
  ModalFooter,
  ModalSection,
  ModalInfo,
  SuccessModal,
  ErrorModal,
  ConfirmationModal,
  FormModal
};
