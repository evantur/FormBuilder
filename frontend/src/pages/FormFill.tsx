import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from '../hooks';
import FormRenderer from '../components/FormRenderer/FormRenderer';
import './FormFill.css';

const FormFill: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { form, isLoading, error } = useForm(id || '');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  if (!id) {
    return (
      <div className="loading-screen">
        <div className="formfill-error-text">Invalid form ID</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-text">Loading form...</div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="loading-screen">
        <div className="formfill-error-text">{error || 'Form not found'}</div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="formfill-success-screen">
        <div className="formfill-success-card">
          <div className="formfill-success-icon">
            <svg className="formfill-success-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="formfill-success-heading">Thank you!</h1>
          <p className="formfill-success-text">Your form submission has been received.</p>
          <button onClick={() => navigate('/forms')} className="btn-primary">
            Back to Forms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <div className="formfill-header-inner">
          <button onClick={() => navigate('/forms')} className="formfill-back-link">
            ← Back to Forms
          </button>
        </div>
      </header>

      <main className="formfill-main">
        <div className="formfill-card">
          <FormRenderer form={form} onSubmitSuccess={() => setSubmitted(true)} />
        </div>
      </main>
    </div>
  );
};

export default FormFill;