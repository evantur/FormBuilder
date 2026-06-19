import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../services/api';
import { FormField } from '../types/form';

const FIELD_TYPES = [
  { type: 'text', label: 'Text', icon: '𝐓' },
  { type: 'email', label: 'Email', icon: '✉' },
  { type: 'number', label: 'Number', icon: '#' },
  { type: 'textarea', label: 'Long Text', icon: '¶' },
  { type: 'select', label: 'Dropdown', icon: '▾' },
  { type: 'radio', label: 'Radio', icon: '◉' },
  { type: 'checkbox', label: 'Checkbox', icon: '☑' },
  { type: 'date', label: 'Date', icon: '📅' },
];

const makeField = (type: string, order: number): FormField => ({
  id: `field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  type,
  label: `${FIELD_TYPES.find(f => f.type === type)?.label ?? type} field`,
  required: false,
  placeholder: '',
  options: ['select', 'radio', 'checkbox'].includes(type)
    ? [{ label: 'Option 1', value: 'option_1' }]
    : [],
  order,
  validation: {},
});

interface FieldEditorProps {
  field: FormField;
  onChange: (updated: FormField) => void;
  onDelete: () => void;
}

const FieldEditor: React.FC<FieldEditorProps> = ({ field, onChange, onDelete }) => {
  const hasOptions = ['select', 'radio', 'checkbox'].includes(field.type);

  const addOption = () => {
    const n = (field.options?.length ?? 0) + 1;
    onChange({
      ...field,
      options: [...(field.options ?? []), { label: `Option ${n}`, value: `option_${n}` }],
    });
  };

  const updateOption = (i: number, label: string) => {
    const opts = [...(field.options ?? [])];
    opts[i] = { label, value: label.toLowerCase().replace(/\s+/g, '_') };
    onChange({ ...field, options: opts });
  };

  const removeOption = (i: number) => {
    const opts = [...(field.options ?? [])];
    opts.splice(i, 1);
    onChange({ ...field, options: opts });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Label</label>
        <input
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={field.label}
          onChange={e => onChange({ ...field, label: e.target.value })}
        />
      </div>
      {field.type !== 'checkbox' && field.type !== 'radio' && (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Placeholder</label>
          <input
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={field.placeholder}
            onChange={e => onChange({ ...field, placeholder: e.target.value })}
          />
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`req-${field.id}`}
          checked={field.required}
          onChange={e => onChange({ ...field, required: e.target.checked })}
          className="rounded border-gray-300 text-blue-600"
        />
        <label htmlFor={`req-${field.id}`} className="text-sm text-gray-700">Required</label>
      </div>
      {hasOptions && (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Options</label>
          <div className="space-y-1.5">
            {field.options?.map((opt, i) => (
              <div key={i} className="flex gap-1">
                <input
                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={opt.label}
                  onChange={e => updateOption(i, e.target.value)}
                />
                <button
                  onClick={() => removeOption(i)}
                  className="text-red-400 hover:text-red-600 px-1 text-lg leading-none"
                >×</button>
              </div>
            ))}
            <button
              onClick={addOption}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-1"
            >+ Add option</button>
          </div>
        </div>
      )}
      <button
        onClick={onDelete}
        className="w-full mt-2 px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded hover:bg-red-50"
      >
        Remove field
      </button>
    </div>
  );
};

const FieldPreview: React.FC<{ field: FormField }> = ({ field }) => {
  const base = "w-full border border-gray-200 rounded px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed";
  switch (field.type) {
    case 'textarea':
      return <textarea className={`${base} resize-none`} rows={3} placeholder={field.placeholder || 'Long text…'} disabled />;
    case 'select':
      return (
        <select className={base} disabled>
          <option>{field.placeholder || 'Select an option…'}</option>
          {field.options?.map((o, i) => <option key={i}>{o.label}</option>)}
        </select>
      );
    case 'radio':
      return (
        <div className="space-y-1">
          {field.options?.map((o, i) => (
            <label key={i} className="flex items-center gap-2 text-sm text-gray-500">
              <input type="radio" disabled /> {o.label}
            </label>
          ))}
        </div>
      );
    case 'checkbox':
      return (
        <div className="space-y-1">
          {field.options?.map((o, i) => (
            <label key={i} className="flex items-center gap-2 text-sm text-gray-500">
              <input type="checkbox" disabled /> {o.label}
            </label>
          ))}
        </div>
      );
    case 'date':
      return <input type="date" className={base} disabled />;
    default:
      return <input type={field.type} className={base} placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}…`} disabled />;
  }
};

const FormBuilder: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [title, setTitle] = useState('Untitled Form');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Drag state
  const dragType = useRef<string | null>(null);     // dragging from palette
  const dragFieldId = useRef<string | null>(null);  // reordering existing field
  const dragOverId = useRef<string | null>(null);

  // ─── Palette drag ───────────────────────────────────────
  const onPaletteDragStart = (type: string) => {
    dragType.current = type;
    dragFieldId.current = null;
  };

  // ─── Field reorder drag ──────────────────────────────────
  const onFieldDragStart = (fieldId: string) => {
    dragFieldId.current = fieldId;
    dragType.current = null;
  };

  const onDragOver = (e: React.DragEvent, overId: string) => {
    e.preventDefault();
    dragOverId.current = overId;
  };

  const onDropOnField = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (dragType.current) {
      // Drop from palette — insert before target
      const targetIdx = fields.findIndex(f => f.id === targetId);
      const newField = makeField(dragType.current, targetIdx);
      const next = [...fields];
      next.splice(targetIdx, 0, newField);
      setFields(next.map((f, i) => ({ ...f, order: i })));
      setSelectedFieldId(newField.id);
    } else if (dragFieldId.current && dragFieldId.current !== targetId) {
      // Reorder
      const fromIdx = fields.findIndex(f => f.id === dragFieldId.current);
      const toIdx = fields.findIndex(f => f.id === targetId);
      const next = [...fields];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      setFields(next.map((f, i) => ({ ...f, order: i })));
    }
    dragType.current = null;
    dragFieldId.current = null;
    dragOverId.current = null;
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

  const updateField = (updated: FormField) => {
    setFields(prev => prev.map(f => f.id === updated.id ? updated : f));
  };

  const deleteField = (fieldId: string) => {
    setFields(prev => prev.filter(f => f.id !== fieldId).map((f, i) => ({ ...f, order: i })));
    if (selectedFieldId === fieldId) setSelectedFieldId(null);
  };

  const handleSave = async (status: 'draft' | 'published') => {
    if (!title.trim()) { setError('Form title is required'); return; }
    setSaving(true);
    setError(null);
    try {
      await apiClient.createForm({ title, description, fields, status });
      navigate('/forms');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save form');
    } finally {
      setSaving(false);
    }
  };

  const selectedField = fields.find(f => f.id === selectedFieldId) ?? null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/forms')}
            className="text-sm text-gray-500 hover:text-gray-800"
          >← Back</button>
          <input
            className="text-xl font-semibold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-1 py-0.5 min-w-[200px]"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Form title"
          />
        </div>
        <div className="flex items-center gap-2">
          {error && <span className="text-sm text-red-600">{error}</span>}
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >Save Draft</button>
          <button
            onClick={() => handleSave('published')}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >{saving ? 'Saving…' : 'Publish'}</button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Field palette */}
        <aside className="w-52 bg-white border-r border-gray-200 p-4 flex-shrink-0">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Field Types</p>
          <p className="text-xs text-gray-400 mb-3">Drag onto the canvas →</p>
          <div className="space-y-1.5">
            {FIELD_TYPES.map(ft => (
              <div
                key={ft.type}
                draggable
                onDragStart={() => onPaletteDragStart(ft.type)}
                className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 cursor-grab active:cursor-grabbing text-sm text-gray-700 select-none"
              >
                <span className="text-base w-5 text-center">{ft.icon}</span>
                {ft.label}
              </div>
            ))}
          </div>
        </aside>

        {/* Center: Canvas */}
        <main
          className="flex-1 overflow-y-auto p-8"
          onDragOver={e => e.preventDefault()}
          onDrop={onDropOnCanvas}
        >
          <div className="max-w-2xl mx-auto space-y-4">
            {/* Form meta */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-2">
              <input
                className="w-full text-2xl font-bold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none mb-2"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Form title"
              />
              <input
                className="w-full text-sm text-gray-500 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Form description (optional)"
              />
            </div>

            {/* Fields */}
            {fields.map(field => (
              <div
                key={field.id}
                draggable
                onDragStart={() => onFieldDragStart(field.id)}
                onDragOver={e => onDragOver(e, field.id)}
                onDrop={e => onDropOnField(e, field.id)}
                onClick={() => setSelectedFieldId(field.id)}
                className={`bg-white rounded-lg border-2 p-5 cursor-pointer transition-colors select-none ${
                  selectedFieldId === field.id
                    ? 'border-blue-500 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-medium text-gray-800">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </span>
                  <span className="text-xs text-gray-400 ml-2 flex-shrink-0 cursor-grab">⠿ drag</span>
                </div>
                <FieldPreview field={field} />
              </div>
            ))}

            {/* Empty drop zone */}
            {fields.length === 0 && (
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={onDropOnCanvas}
                className="border-2 border-dashed border-gray-300 rounded-lg p-16 text-center text-gray-400"
              >
                <p className="text-lg mb-1">Drop fields here</p>
                <p className="text-sm">Drag field types from the left panel</p>
              </div>
            )}

            {fields.length > 0 && (
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={onDropOnCanvas}
                className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center text-gray-300 text-sm"
              >
                Drop here to add at end
              </div>
            )}
          </div>
        </main>

        {/* Right: Field editor */}
        <aside className="w-64 bg-white border-l border-gray-200 p-4 flex-shrink-0 overflow-y-auto">
          {selectedField ? (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Edit Field
              </p>
              <FieldEditor
                field={selectedField}
                onChange={updateField}
                onDelete={() => deleteField(selectedField.id)}
              />
            </>
          ) : (
            <div className="text-sm text-gray-400 mt-8 text-center">
              <p>Click a field to edit it</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default FormBuilder;
