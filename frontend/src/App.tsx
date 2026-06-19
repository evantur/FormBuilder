import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Auth/Login';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import FormsList from './pages/FormsList';
import FormFill from './pages/FormFill';
import FormBuilder from './pages/FormBuilder';
import Submissions from './pages/Submissions';
import NotFound from './pages/NotFound';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/forms" element={<ProtectedRoute><FormsList /></ProtectedRoute>} />
          <Route path="/forms/new" element={<ProtectedRoute><FormBuilder /></ProtectedRoute>} />
          <Route path="/forms/:id/edit" element={<ProtectedRoute><FormBuilder /></ProtectedRoute>} />
          <Route path="/forms/:id/fill" element={<ProtectedRoute><FormFill /></ProtectedRoute>} />
          <Route path="/submissions" element={<ProtectedRoute><Submissions /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
