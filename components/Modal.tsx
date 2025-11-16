
import React from 'react';
import { XMarkIcon } from './icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-v2-light-card dark:bg-v2-dark-card rounded-lg shadow-xl w-full max-w-md m-4 text-v2-light-text dark:text-v2-dark-text" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-v2-light-border dark:border-v2-dark-border">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-v2-light-text-secondary dark:text-v2-dark-text-secondary hover:bg-gray-200 dark:hover:bg-gray-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};