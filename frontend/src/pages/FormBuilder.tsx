import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../services/api';
import { FieldType, FormField } from '../types/form';
import './FormBuilder.css';

const FIELD_TYPES: { type: FieldType; label: string; icon: string }[] = [
  { type: 'text',     label: 'Text',      icon: '𝐓' },
  { type: 'email',    label: 'Email',     icon: '✉' },
  { type: 'number',   label: 'Number',    icon: '#' },
  { type: 'textarea', label: 'Long Text', icon: '¶' },
  { type: 'select',   label: 'Dropdown',  icon: '▾' },
  { type: 'radio',    label: 'Radio',     icon: '◉' },
  { type: 'checkbox', label: 'Checkbox',  icon: '☑' },
  { type: 'date',     label: 'Date',      icon: '📅' },
];

const fieldTypeLabel = (type: FieldType) =>
  FIELD_TYPES.find(f => f.type === type)?.label ?? type;

const makeField = (type: FieldType, order: number): FormField => ({
  id: `field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  type,
  label: `${fieldTypeLabel(type)} field`,
  required: false,
  placeholder: '',
  options: ['select', 'radio', 'checkbox'].includes(type) ? ['Option 1'] : undefined,
  order,
  validation: {},
});

// ─── Wire-format helpers ──────────────────────────────────
const toWireFields = (fields: FormField[]): any[] =>
  fields.map(f => ({
    ...f,
    options: f.options
      ? f.options.map(opt => ({ label: opt, value: opt.toLowerCase().replace(/\s+/g, '_') }))
      : undefined,
  }));

const fromWireFields = (rawFields: any[]): FormField[] =>
  (rawFields ?? []).map(f => ({
    ...f,
    options: Array.isArray(f.options)
      ? f.options.map((o: any) => (typeof o === 'string' ? o : o.label ?? o.value ?? ''))
      : undefined,
  }));

// ─── Field Editor ─────────────────────────────────────────
interface FieldEditorProps {
  field: FormField;
  onChange: (updated: FormField) => void;
  onDelete: () => void;
}

const FieldEditor: React.FC<FieldEditorProps> = ({ field, onChange, onDelete }) => {
  const hasOptions = ['select', 'radio', 'checkbox'].includes(field.type);

  const addOption = () => {
    const n = (field.options?.length ?? 0) + 1;
    onChange({ ...field, options: [...(field.options ?? []), `Option ${n}`] });
  };

  const updateOption = (i: number, value: string) => {
    const opts = [...(field.options ?? [])];
    opts[i] = value;
    onChange({ ...field, options: opts });
  };

  const removeOption = (i: number) => {
    const opts = [...(field.options ?? [])];
    opts.splice(i, 1);
    onChange({ ...field, options: opts });
  };

  return (
    <div className="field-editor">
      <div>
        <label className="field-editor-label">Label</label>
        <input
          className="field-editor-input"
          value={field.label}
          onChange={e => onChange({ ...field, label: e.target.value })}
        />
      </div>
      {field.type !== 'checkbox' && field.type !== 'radio' && (
        <div>
          <label className="field-editor-label">Placeholder</label>
          <input
            className="field-editor-input"
            value={field.placeholder ?? ''}
            onChange={e => onChange({ ...field, placeholder: e.target.value })}
          />
        </div>
      )}
      <div className="field-editor-row">
        <input
          type="checkbox"
          id={`req-${field.id}`}
          checked={field.required}
          onChange={e => onChange({ ...field, required: e.target.checked })}
          className="rounded border-gray-300 text-blue-600"
        />
        <label htmlFor={`req-${field.id}`} className="field-editor-checkbox-label">Required</label>
      </div>
      {hasOptions && (
        <div>
          <label className="field-editor-label">Options</label>
          <div className="options-list">
            {field.options?.map((opt, i) => (
              <div key={i} className="option-row">
                <input
                  className="option-input"
                  value={opt}
                  onChange={e => updateOption(i, e.target.value)}
                />
                <button onClick={() => removeOption(i)} className="option-remove-btn">×</button>
              </div>
            ))}
            <button onClick={addOption} className="option-add-btn">+ Add option</button>
          </div>
        </div>
      )}
      <button onClick={onDelete} className="field-remove-btn">Remove field</button>
    </div>
  );
};

// ─── Field Preview ────────────────────────────────────────
const FieldPreview: React.FC<{ field: FormField }> = ({ field }) => {
  switch (field.type) {
    case 'textarea':
      return <textarea className="preview-input resize-none" rows={3} placeholder={field.placeholder || 'Long text…'} disabled />;
    case 'select':
      return (
        <select className="preview-input" disabled>
          <option>{field.placeholder || 'Select an option…'}</option>
          {field.options?.map((o, i) => <option key={i}>{o}</option>)}
        </select>
      );
    case 'radio':
      return (
        <div className="space-y-1">
          {field.options?.map((o, i) => (
            <label key={i} className="preview-option-label"><input type="radio" disabled /> {o}</label>
          ))}
        </div>
      );
    case 'checkbox':
      return (
        <div className="space-y-1">
          {field.options?.map((o, i) => (
            <label key={i} className="preview-option-label"><input type="checkbox" disabled /> {o}</label>
          ))}
        </div>
      );
    case 'date':
      return <input type="date" className="preview-input" disabled />;
    default:
      return <input type={field.type} className="preview-input" placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}…`} disabled />;
  }
};

// ─── Main Component ───────────────────────────────────────
const FormBuilder: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [title, setTitle] = useState('Untitled Form');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<'draft' | 'published' | ''>('');

  useEffect(() => {
    if (!id) return;
    apiClient.getFormById(id)
      .then(form => {
        setTitle(form.title);
        setDescription(form.description ?? '');
        setFields(fromWireFields(form.fields as any));
        setCurrentStatus(form.status as 'draft' | 'published');
      })
      .catch(() => setError('Failed to load form'))
      .finally(() => setLoading(false));
  }, [id]);

  const dragType    = useRef<FieldType | null>(null);
  const dragFieldId = useRef<string | null>(null);

  const onPaletteDragStart = (type: FieldType) => { dragType.current = type; dragFieldId.current = null; };
  const onFieldDragStart   = (fieldId: string)  => { dragFieldId.current = fieldId; dragType.current = null; };

  const onDropOnField = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragType.current) {
      const targetIdx = fields.findIndex(f => f.id === targetId);
      const newField = makeField(dragType.current, targetIdx);
      const next = [...fields];
      next.splice(targetIdx, 0, newField);
      setFields(next.map((f, i) => ({ ...f, order: i })));
      setSelectedFieldId(newField.id);
    } else if (dragFieldId.current && dragFieldId.current !== targetId) {
      const fromIdx = fields.findIndex(f => f.id === dragFieldId.current);
      const toIdx   = fields.findIndex(f => f.id === targetId);
      const next = [...fields];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      setFields(next.map((f, i) => ({ ...f, order: i })));
    }
    dragType.current = null;
    dragFieldId.current = null;
  };

  const onDropOnCanvas = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragType.current) {
      const newField = makeField(dragType.current, fields.length);
      setFields(prev => [...prev, newField]);
      setSelectedFieldId(newField.id);
      dragType.current = null;
    }
  };

  const updateField = (updated: FormField) =>
    setFields(prev => prev.map(f => f.id === updated.id ? updated : f));

  const deleteField = (fieldId: string) => {
    setFields(prev => prev.filter(f => f.id !== fieldId).map((f, i) => ({ ...f, order: i })));
    if (selectedFieldId === fieldId) setSelectedFieldId(null);
  };

  const handleSave = async (status: 'draft' | 'published') => {
    if (!title.trim()) { setError('Form title is required'); return; }
    setSaving(true);
    setError(null);
    try {
      const wireFields = toWireFields(fields);
      if (isEdit && id) {
        await apiClient.updateForm(id, { title, description, fields: wireFields, status } as any);
        navigate('/forms');
        return;
      }
      const created = await apiClient.createForm({ title, description, fields: wireFields } as any);
      if (status === 'published') {
        navigate(`/forms/${created.id}/edit`, { replace: true });
        await apiClient.updateForm(created.id, { title, description, fields: wireFields, status: 'published' } as any);
      }
      navigate('/forms');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save form');
    } finally {
      setSaving(false);
    }
  };

  const selectedField = fields.find(f => f.id === selectedFieldId) ?? null;

  if (loading) {
    return <div className="builder-loading"><div className="builder-loading-text">Loading form…</div></div>;
  }

  return (
    <div className="builder-page">
      <header className="builder-header">
        <div className="builder-header-left">
          <button onClick={() => navigate('/forms')} className="builder-back-btn">← Back</button>
          <span className="builder-mode-label">{isEdit ? 'Editing' : 'New Form'}</span>
        </div>
        <div className="builder-header-right">
          {error && <span className="builder-error-text">{error}</span>}
          {currentStatus !== 'published' && (
            <button onClick={() => handleSave('draft')}      disabled={saving} className="builder-btn-draft">Save Draft</button>
          )}
          <button onClick={() => handleSave('published')}  disabled={saving} className="builder-btn-publish">
            {saving ? 'Saving…' : 'Publish'}
          </button>
        </div>
      </header>

      <div className="builder-layout">
        {/* Palette */}
        <aside className="palette-panel">
          <p className="palette-label">Field Types</p>
          <p className="palette-hint">Drag onto the canvas →</p>
          <div className="palette-list">
            {FIELD_TYPES.map(ft => (
              <div
                key={ft.type}
                draggable
                onDragStart={() => onPaletteDragStart(ft.type)}
                className="palette-item"
              >
                <span className="palette-icon">{ft.icon}</span>
                {ft.label}
              </div>
            ))}
          </div>
        </aside>

        {/* Canvas */}
        <main className="builder-canvas" onDragOver={e => e.preventDefault()} onDrop={onDropOnCanvas}>
          <div className="builder-canvas-inner">
            <div className="canvas-meta-card">
              <input className="canvas-title-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Form title" />
              <input className="canvas-desc-input"  value={description} onChange={e => setDescription(e.target.value)} placeholder="Form description (optional)" />
            </div>

            {fields.map(field => (
              <div
                key={field.id}
                draggable
                onDragStart={() => onFieldDragStart(field.id)}
                onDragOver={e => e.preventDefault()}
                onDrop={e => onDropOnField(e, field.id)}
                onClick={() => setSelectedFieldId(field.id)}
                className={selectedFieldId === field.id ? 'field-card-selected' : 'field-card'}
              >
                <div className="field-card-header">
                  <span className="field-card-label">
                    {field.label}
                    {field.required && <span className="field-required">*</span>}
                  </span>
                  <span className="field-drag-handle">⠿ drag</span>
                </div>
                <FieldPreview field={field} />
              </div>
            ))}

            {fields.length === 0 && (
              <div className="drop-zone-empty" onDragOver={e => e.preventDefault()} onDrop={onDropOnCanvas}>
                <p className="text-lg mb-1">Drop fields here</p>
                <p className="text-sm">Drag field types from the left panel</p>
              </div>
            )}

            {fields.length > 0 && (
              <div className="drop-zone-end" onDragOver={e => e.preventDefault()} onDrop={onDropOnCanvas}>
                Drop here to add at end
              </div>
            )}
          </div>
        </main>

        {/* Editor */}
        <aside className="editor-panel">
          {selectedField ? (
            <>
              <p className="editor-label">Edit Field</p>
              <FieldEditor field={selectedField} onChange={updateField} onDelete={() => deleteField(selectedField.id)} />
            </>
          ) : (
            <p className="editor-empty-hint">Click a field to edit it</p>
          )}
        </aside>
      </div>
    </div>
  );
};

export default FormBuilder;