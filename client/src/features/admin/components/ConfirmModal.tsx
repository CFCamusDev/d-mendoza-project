import React from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 border border-brand-primary/20"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        {/* Header with Visual Indicator */}
        <div className="p-6 pb-4 flex items-start gap-4">
          <div className="p-3 bg-brand-primary/10 rounded-full text-brand-accent">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 id="confirm-modal-title" className="text-xl font-bold text-brand-accent">
              {title}
            </h2>
            <p className="text-sm text-brand-text mt-2 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-brand-bg flex gap-3 justify-end border-t border-brand-primary/20">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="px-4 py-2 text-brand-text font-medium hover:bg-brand-primary/10 rounded-lg transition-all duration-200 disabled:opacity-50 text-sm cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className="bg-brand-accent hover:bg-brand-text text-white font-medium px-5 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 text-sm shadow-sm hover:shadow cursor-pointer"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
