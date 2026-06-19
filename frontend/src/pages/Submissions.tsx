import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import { Form } from '../types/form';

const Submissions: React.FC = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  useEffect(() => {
    apiClient.getForms()
      .then(setForms)
      .catch(() => setError('Failed to load forms'))
      .finally(() => setIsLoading(false));
  }, []);

  const loadSubmissions = async (formId: string) => {
    setSelectedForm(formId);
    setLoadingSubs(true);
    try {
      const data = await apiClient.getFormSubmissions(formId);
      setSubmissions(data.submissions ?? data ?? []);
    } catch {
      setSubmissions([]);
    } finally {
      setLoadingSubs(false);
    }
  };

  const selectedFormObj = forms.find(f => f.id === selectedForm);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Submissions</h1>
            <p className="text-sm text-gray-600 mt-1">View responses to your forms</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 flex gap-6">
        {/* Form list */}
        <div className="w-64 flex-shrink-0">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Forms</h2>
          {isLoading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : forms.length === 0 ? (
            <p className="text-sm text-gray-400">No forms yet.</p>
          ) : (
            <div className="space-y-1">
              {forms.map(form => (
                <button
                  key={form.id}
                  onClick={() => loadSubmissions(form.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedForm === form.id
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {form.title}
                  <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                    form.status === 'published'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>{form.status}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Submissions panel */}
        <div className="flex-1">
          {!selectedForm ? (
            <div className="bg-white rounded-lg border-2 border-dashed border-gray-200 p-16 text-center text-gray-400">
              <p className="text-lg">Select a form to view submissions</p>
            </div>
          ) : loadingSubs ? (
            <p className="text-gray-500 text-sm">Loading submissions…</p>
          ) : submissions.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
              <p className="text-gray-500">No submissions yet for <strong>{selectedFormObj?.title}</strong>.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {selectedFormObj?.title} — {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
              </h2>
              {submissions.map((sub, i) => (
                <div key={sub.id ?? i} className="bg-white rounded-lg border border-gray-200 p-5">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      {sub.submitted_by || 'Anonymous'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {sub.submitted_at ? new Date(sub.submitted_at).toLocaleString() : ''}
                    </span>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {Object.entries(sub.data ?? {}).map(([key, val]) => (
                      <div key={key}>
                        <dt className="text-xs font-medium text-gray-400">{key}</dt>
                        <dd className="text-sm text-gray-800">{String(val)}</dd>
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
