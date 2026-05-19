import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, titleKey, message, messageKey, loading = false }) => {
  const { t } = useTranslation('common');
  
  const displayTitle = titleKey ? t(titleKey, title) : (title || t('confirm', 'Confirmar'));
  const displayMessage = messageKey ? t(messageKey, message) : message;
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{displayTitle}</h3>
        <p className="text-gray-600 mb-6">{displayMessage}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            disabled={loading}
          >
            {t('cancel', 'Cancelar')}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? t('deleting', 'Eliminando...') : t('delete', 'Eliminar')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;