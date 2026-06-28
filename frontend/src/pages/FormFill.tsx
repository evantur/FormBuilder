import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from '../hooks';
import { useAuth } from '../hooks';
import FormRenderer from '../components/FormRenderer/FormRenderer';
import { apiClient } from '../services/api';
import { Form } from '../types/form';
import './FormFill.css';

// Read-only view of an already-submitted form
const AlreadySubmitted: React.FC<{
  form: Form;
  submission: Record<string, any>;
  submittedAt: string;
}> = ({ form, submission, submittedAt }) => {
  const navigate = useNavigate();
  const date = submittedAt ? new Date(submittedAt).toLocaleString() : '';

  return (
    <div className="formfill-success-screen">
      <div className="formfill-already-card">
        <div className="formfill-already-icon">
          <svg className="formfill-success-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="formfill-success-heading">Already submitted</h1>
        <p className="formfill-already-date">Submitted {date}</p>

        <div className="formfill-already-answers">
          <h2 className="formfill-already-answers-title">Your answers</h2>
          {form.fields
            .sort((a, b) => a.order - b.order)
            .map(field => {
              const val = submission[field.id];
              if (val === undefined || val === null || val === '') return null;
              return (
                <div key={field.id} className="formfill-answer-row">
                  <dt className="formfill-answer-label">{field.label}</dt>
                  <dd className="formfill-answer-value">{String(val)}</dd>
                </div>
              );
            })}
        </div>

        <button onClick={() => navigate('/forms')} className="btn-primary">
          Back to Forms
        </button>
      </div>
    </div>
  );
};

const FormFill: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { form, isLoading, error } = useForm(id || '');
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState<Record<string, any> | null>(null);
  const [existingSubmittedAt, setExistingSubmittedAt] = useState('');
  const [checkingSubmission, setCheckingSubmission] = useState(true);
  const navigate = useNavigate();

  // Check whether the current user has already submitted this form
  useEffect(() => {
    if (!id || !user) return;
    apiClient.getMySubmission(id)
      .then((sub: any) => {
        setExistingSubmission(sub.data ?? {});
        setExistingSubmittedAt(sub.submitted_at ?? '');
      })
      .catch(() => {
        // 404 means no prior submission — that's the expected happy path
      })
      .finally(() => setCheckingSubmission(false));
  }, [id, user]);

  if (!id) {
    return (
      <div className="loading-screen">
        <div className="formfill-error-text">Invalid form ID</div>
      </div>
    );
  }

  if (isLoading || checkingSubmission) {
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

  // Already submitted — show read-only view
  if (existingSubmission !== null) {
    return <AlreadySubmitted form={form} submission={existingSubmission} submittedAt={existingSubmittedAt} />;
  }

  // Just submitted this session
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