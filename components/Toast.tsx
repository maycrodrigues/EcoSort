
import React, { useEffect } from 'react';
import { XCircleIcon, InformationCircleIcon } from './Icons';

interface ToastProps {
  message: string;
  type: 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Desaparece automaticamente após 5 segundos

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  const Icon = type === 'error' ? XCircleIcon : InformationCircleIcon;

  return (
    <div 
        className={`fixed top-5 right-5 z-50 flex items-center p-4 mb-4 text-white rounded-lg shadow-lg ${bgColor} animate-slide-in-right`}
        role="alert"
    >
      <Icon className="w-6 h-6 mr-3" />
      <span className="sr-only">{type === 'error' ? 'Erro' : 'Info'}</span>
      <div className="text-sm font-medium">{message}</div>
      <button
        type="button"
        className="ml-4 -mx-1.5 -my-1.5 bg-white/20 text-white rounded-lg focus:ring-2 focus:ring-white/50 p-1.5 hover:bg-white/30 inline-flex items-center justify-center h-8 w-8"
        onClick={onClose}
        aria-label="Fechar"
      >
        <span className="sr-only">Fechar</span>
        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
        </svg>
      </button>
    </div>
  );
};
