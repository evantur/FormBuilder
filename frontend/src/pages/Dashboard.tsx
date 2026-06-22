import React from 'react';
import { useAuth } from '../hooks';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Common/Logo';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, tenant, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header-inner">
          <div className="dashboard-header-brand">
            <Logo size={40} />
            <div>
              <h1 className="page-header-title">Form Builder</h1>
              <p className="page-header-subtitle">{tenant?.name}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-secondary">Logout</button>
        </div>
      </header>

      <main className="page-main">
        <div className="dashboard-grid">
          <div className="dashboard-welcome-card">
            <h2 className="dashboard-welcome-heading">Welcome, {user?.email}!</h2>
            <p className="dashboard-welcome-text">
              You are logged in as <strong>{user?.role}</strong> in {tenant?.name}
            </p>
          </div>

          <div className="card">
            <h3 className="dashboard-card-heading">Quick Actions</h3>
            <nav className="dashboard-nav">
              <button onClick={() => navigate('/forms')} className="dashboard-nav-btn">
                View Forms →
              </button>
              {user?.role !== 'respondent' && (
                <>
                  <button onClick={() => navigate('/forms/new')} className="dashboard-nav-btn">
                    Create Form →
                  </button>
                  <button onClick={() => navigate('/submissions')} className="dashboard-nav-btn">
                    View Submissions →
                  </button>
                </>
              )}
            </nav>
          </div>

          <div className="card">
            <h3 className="dashboard-card-heading">Account Info</h3>
            <dl className="dashboard-dl">
              <div>
                <dt className="dashboard-dt">Email</dt>
                <dd className="dashboard-dd">{user?.email}</dd>
              </div>
              <div>
                <dt className="dashboard-dt">Role</dt>
                <dd className="dashboard-dd capitalize">{user?.role}</dd>
              </div>
            </dl>
          </div>

          <div className="card">
            <h3 className="dashboard-card-heading">Organization</h3>
            <dl className="dashboard-dl">
              <div>
                <dt className="dashboard-dt">Tenant</dt>
                <dd className="dashboard-dd">{tenant?.name}</dd>
              </div>
              <div>
                <dt className="dashboard-dt">Domain</dt>
                <dd className="dashboard-dd">{tenant?.domain || 'N/A'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;