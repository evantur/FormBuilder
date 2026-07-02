export type FieldType = 
  | 'text' 
  | 'email' 
  | 'number' 
  | 'select' 
  | 'multiselect' 
  | 'checkbox' 
  | 'radio' 
  | 'textarea' 
  | 'date' 
  | 'file'
  | 'student_id'
  | 'grade_level';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  placeholder?: string;
  order: number;
  options?: string[]; // For select, radio, checkbox, grade_level
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
}

export interface Form {
  id: string;
  tenant_id: string;
  title: string;
  description?: string;
  fields: FormField[];
  status: 'draft' | 'published';
  created_by: string;
  created_at: string;
  updated_at: string;
  submission_count: number;
  is_archived: boolean;
}

export interface FormCreateRequest {
  title: string;
  description?: string;
  fields: FormField[];
}

export interface FormUpdateRequest {
  title?: string;
  description?: string;
  fields?: FormField[];
  status?: 'draft' | 'published';
}
