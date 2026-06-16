import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForms, useAuth } from '../hooks';

const FormsList: React.FC = () => {
  const { forms, isLoading, error } = useForms();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading forms...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Forms</h1>
            <p className="text-sm text-gray-600 mt-1">Manage and respond to forms</p>
          </div>
          <div className="space-x-2">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Back to Dashboard
            </button>
            {user?.role !== 'respondent' && (
              <button
                onClick={() => navigate('/forms/new')}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                New Form
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="text-sm font-medium text-red-800">{error}</div>
          </div>
        )}

        {forms.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-600">No forms available yet.</p>
            {user?.role !== 'respondent' && (
              <button
                onClick={() => navigate('/forms/new')}
                className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Create the first form
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <div
                key={form.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  if (user?.role === 'respondent') {
                    navigate(`/forms/${form.id}/fill`);
                  } else {
                    navigate(`/forms/${form.id}`);
                  }
                }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {form.title}
                      </h3>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {form.description || 'No description'}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        form.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {form.status}
                    </span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{form.fields.length} fields</span>
                      <span>
                        Created {new Date(form.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {user?.role !== 'respondent' && (
                    <div className="mt-4 space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/forms/${form.id}/edit`);
                        }}
                        className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/forms/${form.id}/submissions`);
                        }}
                        className="px-3 py-1 text-sm font-medium text-green-600 hover:text-green-800"
                      >
                        Submissions
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default FormsList;
