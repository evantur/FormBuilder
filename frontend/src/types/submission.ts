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

// The backend returns a flat array of submissions — no pagination wrapper.
export type SubmissionListResponse = Submission[];