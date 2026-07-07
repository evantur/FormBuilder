import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../services/api';
import { Form } from '../types/form';
import './Submissions.css';

const Submissions: React.FC = () => {
  const navigate = useNavigate();
  const { id: formIdParam } = useParams<{ id?: string }>();

  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  const loadSubmissions = async (formId: string) => {
    setSelectedForm(formId);
    setLoadingSubs(true);
    try {
      const data = await apiClient.getFormSubmissions(formId);
      setSubmissions(data ?? []);
    } catch {
      setSubmissions([]);
    } finally {
      setLoadingSubs(false);
    }
  };

  useEffect(() => {
    apiClient.getForms()
      .then(data => {
        setForms(data);
        if (formIdParam) loadSubmissions(formIdParam);
      })
      .catch(() => setError('Failed to load forms'))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formIdParam]);

  const selectedFormObj = forms.find(f => f.id === selectedForm);

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="page-header-title">Submissions</h1>
            <p className="page-header-subtitle">View responses to your forms</p>
          </div>
          <button onClick={() => navigate('/')} className="btn-secondary">Back to Dashboard</button>
        </div>
      </header>

      <main className="submissions-main">
        <div className="submissions-sidebar">
          <h2 className="submissions-sidebar-label">Forms</h2>
          {isLoading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : forms.length === 0 ? (
            <p className="text-sm text-gray-400">No forms yet.</p>
          ) : (
            <div className="submissions-form-list">
              {forms.map(form => (
                <button
                  key={form.id}
                  onClick={() => loadSubmissions(form.id)}
                  className={selectedForm === form.id ? 'submissions-form-btn-active' : 'submissions-form-btn'}
                >
                  {form.title}
                  <span className={form.status === 'published' ? 'badge-sm-published' : 'badge-sm-draft'}>
                    {form.status}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="submissions-content">
          {!selectedForm ? (
            <div className="submissions-empty-prompt">
              <p className="submissions-empty-prompt-text">Select a form to view submissions</p>
            </div>
          ) : loadingSubs ? (
            <p className="text-gray-500 text-sm">Loading submissions…</p>
          ) : submissions.length === 0 ? (
            <div className="submissions-none">
              <p className="submissions-none-text">No submissions yet for <strong>{selectedFormObj?.title}</strong>.</p>
            </div>
          ) : (
            <div className="submissions-list">
              <h2 className="submissions-heading">
                {selectedFormObj?.title} — {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
              </h2>
              {submissions.map((sub, i) => (
                <div key={sub.id ?? i} className="submission-card">
                  <div className="submission-card-header">
                    <span className="submission-by">{sub.submitted_by || 'Anonymous'}</span>
                    <span className="submission-date">
                      {sub.submitted_at ? new Date(sub.submitted_at).toLocaleString() : ''}
                    </span>
                  </div>
                  <dl className="submission-data">
                    {Object.entries(sub.data ?? {}).map(([key, val]) => (
                      <div key={key}>
                        <dt className="submission-dt">{key}</dt>
                        <dd className="submission-dd">{String(val)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Submissions;