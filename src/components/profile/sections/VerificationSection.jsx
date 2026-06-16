// src/components/profile/sections/VerificationSection.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const VerificationSection = ({ profile, onSendPhoneCode, onVerifyPhone }) => {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSendCode = async () => {
    if (!profile?.telefono) {
      setMessage(t('profile.phoneRequired'));
      return;
    }
    setLoading(true);
    try {
      await onSendPhoneCode();
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
      await onVerifyPhone(code);
      setMessage(t('profile.phoneVerifiedSuccess'));
      setCodeSent(false);
      setCode('');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="profile-section">
      <div className="profile-section-header">
        <div className="profile-section-icon">
          <i className="fas fa-check-circle"></i>
        </div>
        <div>
          <h3>{t('profile.verification')}</h3>
          <p>{t('profile.verificationDescription')}</p>
        </div>
      </div>

      <div className="profile-verification-card verified">
        <div className="profile-verification-icon">
          <i className="fas fa-envelope"></i>
        </div>
        <div className="profile-verification-info">
          <h4>{t('profile.emailVerification')}</h4>
          <p>{profile?.email}</p>
        </div>
        <span className="profile-badge profile-badge-success">
          <i className="fas fa-check-circle"></i> {t('profile.verified')}
        </span>
      </div>

      <div className="profile-verification-card">
        <div className="profile-verification-icon">
          <i className="fas fa-phone"></i>
        </div>
        <div className="profile-verification-info">
          <h4>{t('profile.phoneVerification')}</h4>
          <p>{profile?.telefono || t('profile.noPhoneRegistered')}</p>
        </div>
        {profile?.telefono_verificado ? (
          <span className="profile-badge profile-badge-success">
            <i className="fas fa-check-circle"></i> {t('profile.verified')}
          </span>
        ) : (
          <div className="profile-phone-verify">
            {!codeSent ? (
              <button className="btn btn-outline" onClick={handleSendCode} disabled={loading || !profile?.telefono}>
                <i className={`fas fa-${loading ? 'spinner fa-spin' : 'paper-plane'}`}></i>
                {loading ? t('common.sending') : t('profile.sendVerificationCode')}
              </button>
            ) : (
              <div className="profile-phone-code">
                <input 
                  type="text" 
                  placeholder={t('profile.enterCode')} 
                  value={code} 
                  onChange={(e) => setCode(e.target.value)} 
                  maxLength="6" 
                />
                <button className="btn btn-primary" onClick={handleVerify} disabled={loading}>
                  {loading ? t('common.verifying') : t('profile.verify')}
                </button>
                <button className="btn btn-outline" onClick={() => setCodeSent(false)}>
                  {t('common.cancel')}
                </button>
              </div>
            )}
            {message && (
              <p className={`profile-message ${message.includes('exitosamente') ? 'success' : 'error'}`}>
                {message}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="profile-verification-card">
        <div className="profile-verification-icon">
          <i className="fas fa-id-card"></i>
        </div>
        <div className="profile-verification-info">
          <h4>{t('profile.documentVerification')}</h4>
          <p>{t('profile.documentDescription')}</p>
        </div>
        <button className="btn btn-outline">
          <i className="fas fa-upload"></i> {t('profile.uploadDocument')}
        </button>
      </div>
    </section>
  );
};

export default VerificationSection;