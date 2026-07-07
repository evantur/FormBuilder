import axios, { AxiosInstance } from 'axios';
import { Form, FormCreateRequest, FormUpdateRequest } from '../types/form';
import { Submission, SubmissionCreateRequest } from '../types/submission';
import { AuthResponse, LoginRequest } from '../types/user';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000');

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api`,
      timeout: API_TIMEOUT,
    });

    // Add request interceptor to attach JWT token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, clear localStorage
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          localStorage.removeItem('tenant');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  login(request: LoginRequest): Promise<AuthResponse> {
    return this.client.post('/auth/login', request).then(res => res.data);
  }

  // Tenant endpoints
  getTenant() {
    return this.client.get('/tenants/me').then(res => res.data);
  }

  // Form endpoints
  getForms(): Promise<Form[]> {
    return this.client.get('/forms').then(res => res.data);
  }

  getFormById(id: string): Promise<Form> {
    return this.client.get(`/forms/${id}`).then(res => res.data);
  }

  createForm(request: FormCreateRequest): Promise<Form> {
    return this.client.post('/forms', request).then(res => res.data);
  }

  updateForm(id: string, request: FormUpdateRequest): Promise<Form> {
    return this.client.put(`/forms/${id}`, request).then(res => res.data);
  }

  // Delete a form that doesn't have any submissions
  deleteForm(id: string): Promise<void> {
    return this.client.delete(`/forms/${id}`).then(() => undefined);
  }

  // Cascade delete form along with its submissions
  cascadeDeleteForm(id: string): Promise<void> {
    return this.client.delete(`/forms/${id}/cascade`).then(() => undefined);
  }

  getArchivedForms(): Promise<Form[]> {
    return this.client.get('/forms/archived').then(res => res.data);
  }

  archiveForm(id: string): Promise<Form> {
   return this.client.put(`/forms/${id}/archive`).then(res => res.data);
  }

  unarchiveForm(id: string): Promise<Form> {
    return this.client.put(`/forms/${id}/unarchive`).then(res => res.data);
  }

  // Submission endpoints
  submitForm(formId: string, request: SubmissionCreateRequest): Promise<Submission> {
    return this.client.post(`/forms/${formId}/submissions`, request).then(res => res.data);
  }

  getFormSubmissions(formId: string, page = 1, pageSize = 50): Promise<any> {
    return this.client.get(`/forms/${formId}/submissions`, {
      params: { page, page_size: pageSize }
    }).then(res => res.data);
  }

  getSubmissionById(formId: string, submissionId: string): Promise<Submission> {
    return this.client.get(`/forms/${formId}/submissions/${submissionId}`).then(res => res.data);
  }

  getMySubmission(formId: string): Promise<any> {
    return this.client.get(`/forms/${formId}/my-submission`).then(res => res.data);
  }
}

export const apiClient = new ApiClient();
