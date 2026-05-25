// src/components/profile/PhoneVerification.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './PhoneVerification.css';

const PhoneVerification = ({ phone, onSendCode, onVerify }) => {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSendCode = async () => {
    if (!phone) {
      setMessage(t('translation:profile.phoneRequired'));
      return;
    }

    setLoading(true);
    try {
      await onSendCode();
      setCodeSent(true);
      setMessage(t('translation:profile.codeSent'));
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setMessage(t('translation:profile.invalidCode'));
      return;
    }

    setLoading(true);
    try {
      await onVerify(code);
      setMessage(t('translation:profile.phoneVerifiedSuccess'));
      setCodeSent(false);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-white p-4 mt-4">
      <h4 className="mb-3">
        <i className="fas fa-mobile-alt me-2 text-primary"></i>
        {t('translation:profile.verifyPhone')}
      </h4>
      <p className="text-muted mb-3">
        {t('translation:profile.phoneNumber')}: <strong>{phone || t('translation:profile.notRegistered')}</strong>
      </p>
      
      {!codeSent ? (
        <button 
          className="btn-outline-global" 
          onClick={handleSendCode} 
          disabled={loading || !phone}
        >
          <i className={`fas fa-${loading ? 'spinner fa-pulse' : 'paper-plane'} me-2`}></i>
          {loading ? t('common.sending') : t('translation:profile.sendVerificationCode')}
        </button>
      ) : (
        <div className="d-flex gap-3 align-items-center flex-wrap">
          <input
            type="text"
            className="form-input"
            style={{ width: '150px' }}
            placeholder={t('translation:profile.enterCode')}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength="6"
          />
          <button className="btn-primary-global" onClick={handleVerify} disabled={loading}>
            {loading ? t('common.verifying') : t('translation:profile.verify')}
          </button>
          <button className="btn-secondary-global" onClick={() => setCodeSent(false)}>
            {t('common.cancel')}
          </button>
        </div>
      )}
      
      {message && (
        <div className={`alert alert-${message.includes('exitosamente') ? 'success' : 'warning'} mt-3`}>
          <i className={`fas fa-${message.includes('exitosamente') ? 'check-circle' : 'info-circle'} me-2`}></i>
          {message}
        </div>
      )}
    </div>
  );
};

export default PhoneVerification;