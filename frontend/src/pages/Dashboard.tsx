import React from 'react';
import { useAuth } from '../hooks';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, tenant, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Form Builder</h1>
            <p className="text-sm text-gray-600 mt-1">{tenant?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Welcome Card */}
          <div className="bg-white rounded-lg shadow p-6 md:col-span-3">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome, {user?.email}!
            </h2>
            <p className="text-gray-600">
              You are logged in as <strong>{user?.role}</strong> in {tenant?.name}
            </p>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <nav className="space-y-3">
              <button
                onClick={() => navigate('/forms')}
                className="w-full text-left px-4 py-2 text-sm font-medium text-blue-600 hover:bg-gray-50 rounded-md"
              >
                View Forms →
              </button>
              {user?.role !== 'respondent' && (
                <>
                  <button
                    onClick={() => navigate('/forms/new')}
                    className="w-full text-left px-4 py-2 text-sm font-medium text-blue-600 hover:bg-gray-50 rounded-md"
                  >
                    Create Form →
                  </button>
                  <button
                    onClick={() => navigate('/submissions')}
                    className="w-full text-left px-4 py-2 text-sm font-medium text-blue-600 hover:bg-gray-50 rounded-md"
                  >
                    View Submissions →
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* Info Cards */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Info</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Role</dt>
                <dd className="mt-1 text-sm text-gray-900 capitalize">{user?.role}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Organization</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Tenant</dt>
                <dd className="mt-1 text-sm text-gray-900">{tenant?.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Domain</dt>
                <dd className="mt-1 text-sm text-gray-900">{tenant?.domain || 'N/A'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
