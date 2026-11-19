export type UserRole = 'citizen' | 'officer' | 'admin';

export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Rejected'
  | 'Reopened';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: UserRole;
  city: string;
  address?: string;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  head_name: string;
  contact_email: string;
  contact_phone: string;
  is_active: boolean;
  created_at: string;
}

export interface Officer {
  id: string;
  profile_id: string;
  department_id: string;
  designation: string;
  badge_number: string;
  is_available: boolean;
  created_at: string;
  // Joined fields
  profile?: Profile;
  department?: Department;
  assigned_count?: number;
}

export interface ComplaintCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  default_department_id: string;
  default_priority: ComplaintPriority;
  sla_hours: number;
  is_active: boolean;
}

export interface Complaint {
  id: string;
  complaint_number: string; // e.g. SC-2026-0001
  citizen_id: string;
  category_id: string;
  assigned_department_id?: string;
  assigned_officer_id?: string;
  title: string;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  address: string;
  ward_or_area: string;
  latitude: number;
  longitude: number;
  image_urls: string[];
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  // Joined helper fields
  citizen?: Profile;
  category?: ComplaintCategory;
  department?: Department;
  officer?: Officer;
  feedback?: Feedback;
}

export interface ComplaintAssignment {
  id: string;
  complaint_id: string;
  department_id: string;
  officer_id?: string;
  assigned_by: string;
  notes?: string;
  created_at: string;
}

export interface ComplaintUpdate {
  id: string;
  complaint_id: string;
  updated_by: string;
  updated_by_name?: string;
  from_status: ComplaintStatus;
  to_status: ComplaintStatus;
  remarks: string;
  proof_images?: string[];
  created_at: string;
}

export interface Feedback {
  id: string;
  complaint_id: string;
  citizen_id: string;
  rating: number; // 1-5
  comments: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  complaint_id?: string;
  complaint_number?: string;
  title: string;
  message: string;
  type: 'status_change' | 'assignment' | 'feedback_request' | 'system';
  is_read: boolean;
  created_at: string;
}
