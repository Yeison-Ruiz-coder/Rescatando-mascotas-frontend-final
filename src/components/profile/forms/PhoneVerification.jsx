// src/components/profile/forms/PhoneVerification.jsx
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
      setMessage(t('profile.phoneRequired'));
      return;
    }
    setLoading(true);
    try {
      await onSendCode();
      setCodeSent(true);
      setMessage(t('profile.codeSent'));
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setMessage(t('profile.invalidCode'));
      return;
    }
    setLoading(true);
    try {
      await onVerify(code);
      setMessage(t('profile.phoneVerifiedSuccess'));
      setCodeSent(false);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="phone-verification">
      <h4><i className="fas fa-mobile-alt me-2"></i>{t('profile.verifyPhone')}</h4>
      <p>{t('profile.phoneNumber')}: <strong>{phone || t('profile.notRegistered')}</strong></p>
      
      {!codeSent ? (
        <button className="btn-outline-global btn-sm" onClick={handleSendCode} disabled={loading || !phone}>
          <i className={`fas fa-${loading ? 'spinner fa-pulse' : 'paper-plane'} me-2`}></i>
          {loading ? t('common.sending') : t('profile.sendVerificationCode')}
        </button>
      ) : (
        <div className="phone-verification-code">
          <input 
            type="text" 
            className="form-input" 
            placeholder={t('profile.enterCode')} 
            value={code} 
            onChange={(e) => setCode(e.target.value)} 
            maxLength="6" 
          />
          <button className="btn-primary-global btn-sm" onClick={handleVerify} disabled={loading}>
            {loading ? t('common.verifying') : t('profile.verify')}
          </button>
          <button className="btn-secondary-global btn-sm" onClick={() => setCodeSent(false)}>
            {t('common.cancel')}
          </button>
        </div>
      )}
      
      {message && (
        <div className={`alert alert-${message.includes('exitosamente') || message.includes('success') ? 'success' : 'warning'} mt-3`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default PhoneVerification;