import React, { useState } from 'react';
import { useForm as useReactHookForm, SubmitHandler } from 'react-hook-form';
import { Form, FormField } from '../../types/form';
import { apiClient } from '../../services/api';

interface FormRendererProps {
  form: Form;
  onSubmitSuccess?: () => void;
  isSubmitting?: boolean;
}

const FormRenderer: React.FC<FormRendererProps> = ({ 
  form, 
  onSubmitSuccess, 
  isSubmitting = false 
}) => {
  const { register, handleSubmit, formState: { errors } } = useReactHookForm<Record<string, any>>();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit: SubmitHandler<Record<string, any>> = async (data) => {
    setIsLoading(true);
    setSubmitError(null);

    try {
      await apiClient.submitForm(form.id, { data });
      setIsLoading(false);
      onSubmitSuccess?.();
    } catch (error: any) {
      setSubmitError(error.response?.data?.message || 'Failed to submit form');
      setIsLoading(false);
    }
  };

  const renderField = (field: FormField) => {
    const fieldProps = {
      ...register(field.id, {
        required: field.required ? `${field.label} is required` : false,
        pattern: field.validation?.pattern 
          ? { value: new RegExp(field.validation.pattern), message: `${field.label} is invalid` }
          : undefined,
        minLength: field.validation?.minLength 
          ? { value: field.validation.minLength, message: `Minimum length is ${field.validation.minLength}` }
          : undefined,
        maxLength: field.validation?.maxLength 
          ? { value: field.validation.maxLength, message: `Maximum length is ${field.validation.maxLength}` }
          : undefined,
        min: field.validation?.min 
          ? { value: field.validation.min, message: `Minimum value is ${field.validation.min}` }
          : undefined,
        max: field.validation?.max 
          ? { value: field.validation.max, message: `Maximum value is ${field.validation.max}` }
          : undefined,
      }),
    };

    const errorMessage = errors[field.id]?.message as string | undefined;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              {...fieldProps}
              type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : 'text'}
              placeholder={field.placeholder}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
            {errorMessage && <p className="mt-1 text-sm text-red-600">{errorMessage}</p>}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              {...fieldProps}
              placeholder={field.placeholder}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              rows={4}
            />
            {errorMessage && <p className="mt-1 text-sm text-red-600">{errorMessage}</p>}
          </div>
        );

      case 'select':
      case 'grade_level':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <select
              {...fieldProps}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              <option value="">Select {field.label}</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errorMessage && <p className="mt-1 text-sm text-red-600">{errorMessage}</p>}
          </div>
        );

      case 'radio':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="mt-2 space-y-2">
              {field.options?.map((option) => (
                <div key={option} className="flex items-center">
                  <input
                    {...fieldProps}
                    type="radio"
                    value={option}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label className="ml-3 text-sm text-gray-700">{option}</label>
                </div>
              ))}
            </div>
            {errorMessage && <p className="mt-1 text-sm text-red-600">{errorMessage}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="mt-2 space-y-2">
              {field.options?.map((option) => (
                <div key={option} className="flex items-center">
                  <input
                    type="checkbox"
                    value={option}
                    className="h-4 w-4 text-blue-600 rounded"
                    {...fieldProps}
                  />
                  <label className="ml-3 text-sm text-gray-700">{option}</label>
                </div>
              ))}
            </div>
            {errorMessage && <p className="mt-1 text-sm text-red-600">{errorMessage}</p>}
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              {...fieldProps}
              type="date"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
            {errorMessage && <p className="mt-1 text-sm text-red-600">{errorMessage}</p>}
          </div>
        );

      case 'student_id':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              {...fieldProps}
              type="text"
              placeholder="Alphanumeric student ID"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
            {errorMessage && <p className="mt-1 text-sm text-red-600">{errorMessage}</p>}
          </div>
        );

      case 'file':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              {...fieldProps}
              type="file"
              className="mt-1 block w-full"
            />
            {errorMessage && <p className="mt-1 text-sm text-red-600">{errorMessage}</p>}
          </div>
        );

      case 'multiselect':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <select
              {...fieldProps}
              multiple
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errorMessage && <p className="mt-1 text-sm text-red-600">{errorMessage}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{form.title}</h1>
        {form.description && (
          <p className="mt-2 text-gray-600">{form.description}</p>
        )}
      </div>

      {submitError && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm font-medium text-red-800">{submitError}</div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        {form.fields
          .sort((a, b) => a.order - b.order)
          .map((field) => renderField(field))}

        <button
          type="submit"
          disabled={isLoading || isSubmitting}
          className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50"
        >
          {isLoading || isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
};

export default FormRenderer;
