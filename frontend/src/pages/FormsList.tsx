import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForms, useAuth } from '../hooks';
import { apiClient } from '../services/api';
import { Form } from '../types/form';
import './FormsList.css';

const FormsList: React.FC = () => {
  const { forms, isLoading, error } = useForms();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [localForms, setLocalForms] = useState<Form[]>([]);
  const [archivedForms, setArchivedForms] = useState<Form[]>([]);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loadingArchived, setLoadingArchived] = useState(false);

  useEffect(() => { setLocalForms(forms); }, [forms]);

  const loadArchived = async () => {
    if (archivedForms.length > 0) return; // already loaded
    setLoadingArchived(true);
    try {
      const data = await apiClient.getArchivedForms();
      setArchivedForms(data);
    } catch {
      setActionError('Failed to load archived forms');
    } finally {
      setLoadingArchived(false);
    }
  };

  const toggleArchiveSection = () => {
    if (!archiveOpen) loadArchived();
    setArchiveOpen(prev => !prev);
  };

  const handleCardClick = (form: Form) => {
    if (user?.role === 'respondent') {
      navigate(`/forms/${form.id}/fill`);
    } else {
      navigate(`/forms/${form.id}/edit`);
    }
  };

  const handleArchive = async (e: React.MouseEvent, form: Form) => {
    e.stopPropagation();
    setArchivingId(form.id);
    setActionError(null);
    try {
      await apiClient.archiveForm(form.id);
      setLocalForms(prev => prev.filter(f => f.id !== form.id));
      // Reset archived list so it reloads next time the section is opened
      setArchivedForms([]);
    } catch (err: any) {
      setActionError(err.response?.data?.error || 'Failed to archive form');
    } finally {
      setArchivingId(null);
    }
  };

  const handleUnarchive = async (e: React.MouseEvent, form: Form) => {
    e.stopPropagation();
    setArchivingId(form.id);
    setActionError(null);
    try {
      const updated = await apiClient.unarchiveForm(form.id);
      setArchivedForms(prev => prev.filter(f => f.id !== form.id));
      setLocalForms(prev => [...prev, updated]);
    } catch (err: any) {
      setActionError(err.response?.data?.error || 'Failed to unarchive form');
    } finally {
      setArchivingId(null);
    }
  };

  const handleDelete = async (e: React.MouseEvent, form: Form) => {
    e.stopPropagation();
    if (form.submission_count > 0) return;
    if (!window.confirm(`Delete "${form.title}"? This cannot be undone.`)) return;
    setDeletingId(form.id);
    setActionError(null);
    try {
      await apiClient.deleteForm(form.id);
      setLocalForms(prev => prev.filter(f => f.id !== form.id));
    } catch (err: any) {
      setActionError(err.response?.data?.error || 'Failed to delete form');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return <div className="loading-screen"><div className="loading-text">Loading forms...</div></div>;
  }

  const renderFormCard = (form: Form, archived = false) => {
    const isLocked = (form.submission_count ?? 0) > 0;
    return (
      <div
        key={form.id}
        className={`form-card ${archived ? 'form-card-archived' : ''}`}
        onClick={() => !archived && handleCardClick(form)}
      >
        <div className="form-card-inner">
          <div className="form-card-header">
            <div>
              <h3 className="form-card-title">{form.title}</h3>
              <p className="form-card-desc">{form.description || 'No description'}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={form.status === 'published' ? 'badge-published' : 'badge-draft'}>
                {form.status}
              </span>
              {isLocked && !archived && (
                <span className="badge bg-gray-100 text-gray-500">🔒 locked</span>
              )}
              {archived && (
                <span className="badge bg-gray-100 text-gray-400">archived</span>
              )}
            </div>
          </div>

          <div className="form-card-meta">
            <span>{form.fields.length} fields</span>
            <span>Created {new Date(form.created_at).toLocaleDateString()}</span>
          </div>

          {user?.role !== 'respondent' && (
            <div className="form-card-actions">
              {archived ? (
                <button
                  onClick={e => handleUnarchive(e, form)}
                  disabled={archivingId === form.id}
                  className="btn-link-blue"
                >
                  {archivingId === form.id ? 'Restoring…' : 'Unarchive'}
                </button>
              ) : (
                <>
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/forms/${form.id}/edit`); }}
                    className={isLocked ? 'btn-link-red opacity-40 cursor-not-allowed' : 'btn-link-blue'}
                    disabled={isLocked}
                    title={isLocked ? 'Form is locked — has submissions' : undefined}
                  >Edit</button>
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/forms/${form.id}/submissions`); }}
                    className="btn-link-green"
                  >Submissions</button>
                  <button
                    onClick={e => handleArchive(e, form)}
                    disabled={archivingId === form.id}
                    className="btn-link-red"
                  >
                    {archivingId === form.id ? 'Archiving…' : 'Archive'}
                  </button>
                  <button
                    onClick={e => handleDelete(e, form)}
                    disabled={deletingId === form.id || isLocked}
                    className={isLocked ? 'btn-link-red opacity-40 cursor-not-allowed' : 'btn-link-red'}
                    title={isLocked ? 'Cannot delete — form has submissions' : undefined}
                  >{deletingId === form.id ? 'Deleting…' : 'Delete'}</button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="page-header-title">Forms</h1>
            <p className="page-header-subtitle">Manage and respond to forms</p>
          </div>
          <div className="space-x-2">
            <button onClick={() => navigate('/')} className="btn-secondary">Back to Dashboard</button>
            {user?.role !== 'respondent' && (
              <button onClick={() => navigate('/forms/new')} className="btn-primary">New Form</button>
            )}
          </div>
        </div>
      </header>

      <main className="page-main">
        {actionError && <div className="error-banner"><div className="error-banner-text">{actionError}</div></div>}
        {error && <div className="error-banner"><div className="error-banner-text">{error}</div></div>}

        {localForms.length === 0 ? (
          <div className="forms-empty">
            <p className="forms-empty-text">No forms available yet.</p>
            {user?.role !== 'respondent' && (
              <button onClick={() => navigate('/forms/new')} className="btn-primary mt-4">
                Create the first form
              </button>
            )}
          </div>
        ) : (
          <div className="forms-grid">
            {localForms.map(form => renderFormCard(form, false))}
          </div>
        )}

        {/* Archived section — admins and form_builders only */}
        {user?.role !== 'respondent' && (
          <div className="archived-section">
            <button className="archived-toggle" onClick={toggleArchiveSection}>
              <span>{archiveOpen ? '▾' : '▸'} Archived Forms</span>
            </button>

            {archiveOpen && (
              <div className="archived-content">
                {loadingArchived ? (
                  <p className="text-sm text-gray-400 mt-4">Loading archived forms…</p>
                ) : archivedForms.length === 0 ? (
                  <p className="text-sm text-gray-400 mt-4">No archived forms.</p>
                ) : (
                  <div className="forms-grid mt-4">
                    {archivedForms.map(form => renderFormCard(form, true))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default FormsList;