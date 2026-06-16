import { apiClient } from './api';
import { Form, FormCreateRequest, FormUpdateRequest } from '../types/form';

export interface FormService {
  getForms(): Promise<Form[]>;
  getFormById(id: string): Promise<Form>;
  createForm(request: FormCreateRequest): Promise<Form>;
  updateForm(id: string, request: FormUpdateRequest): Promise<Form>;
  deleteForm(id: string): Promise<void>;
}

const formService: FormService = {
  async getForms(): Promise<Form[]> {
    return apiClient.getForms();
  },

  async getFormById(id: string): Promise<Form> {
    return apiClient.getFormById(id);
  },

  async createForm(request: FormCreateRequest): Promise<Form> {
    return apiClient.createForm(request);
  },

  async updateForm(id: string, request: FormUpdateRequest): Promise<Form> {
    return apiClient.updateForm(id, request);
  },

  async deleteForm(id: string): Promise<void> {
    return apiClient.deleteForm(id);
  },
};

export default formService;
