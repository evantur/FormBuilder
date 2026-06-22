import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.css';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="notfound-page">
      <div className="notfound-inner">
        <h1 className="notfound-code">404</h1>
        <p className="notfound-message">Page not found</p>
        <button onClick={() => navigate('/')} className="btn-primary notfound-btn">
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFound;