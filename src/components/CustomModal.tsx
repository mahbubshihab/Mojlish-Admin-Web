'use client';

import React from 'react';

interface CustomModalProps {
  isOpen: boolean;
  type?: 'success' | 'confirm' | 'error' | 'info';
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export default function CustomModal({
  isOpen,
  type = 'success',
  title,
  message,
  confirmText = 'ঠিক আছে',
  cancelText = 'বাতিল',
  onConfirm,
  onCancel
}: CustomModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <i className="fa-solid fa-circle-check" style={{ color: '#10B981', fontSize: '36px' }} />;
      case 'confirm':
        return <i className="fa-solid fa-triangle-exclamation" style={{ color: '#EAB308', fontSize: '36px' }} />;
      case 'error':
        return <i className="fa-solid fa-circle-xmark" style={{ color: '#EF4444', fontSize: '36px' }} />;
      default:
        return <i className="fa-solid fa-circle-info" style={{ color: '#0EA5E9', fontSize: '36px' }} />;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case 'success':
        return 'rgba(16, 185, 129, 0.12)';
      case 'confirm':
        return 'rgba(234, 179, 8, 0.12)';
      case 'error':
        return 'rgba(239, 68, 68, 0.12)';
      default:
        return 'rgba(14, 165, 233, 0.12)';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(7, 10, 18, 0.75)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '20px'
    }}>
      <div style={{
        background: '#0F172A',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(16, 185, 129, 0.1)',
        borderRadius: '24px',
        padding: '32px 28px',
        maxWidth: '440px',
        width: '100%',
        textAlign: 'center',
        animation: 'modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative'
      }}>
        {/* Icon Header */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: getIconBg(),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {getIcon()}
        </div>

        <h3 style={{ color: '#F8FAFC', fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
          {title}
        </h3>

        <p style={{ color: '#94A3B8', fontSize: '14px', lineHeight: '1.6', marginBottom: '28px' }}>
          {message}
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          {onCancel && (
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#F8FAFC',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {cancelText}
            </button>
          )}

          <button
            onClick={onConfirm}
            className="btn btn-primary"
            style={{
              flex: 1,
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: 'bold',
              height: '46px'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes modalPop {
          0% {
            opacity: 0;
            transform: scale(0.92) translateY(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
