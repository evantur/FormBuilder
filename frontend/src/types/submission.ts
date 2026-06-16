export interface Submission {
  id: string;
  form_id: string;
  tenant_id: string;
  data: Record<string, any>; // field_id -> answer
  submitted_at: string;
  submitted_by?: string;
}

export interface SubmissionCreateRequest {
  data: Record<string, any>;
}

export interface SubmissionListResponse {
  submissions: Submission[];
  total: number;
  page: number;
  page_size: number;
}
