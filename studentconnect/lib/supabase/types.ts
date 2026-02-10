// Database types for Student Connect application

export interface profiles {
  id: string;
  role: "user" | "admin";
  created_at: string;
}

export interface job_posting {
  id: string;
  title: string;
  description: string;
  company: string;
  application_url: string;
  created_by: string;
  created_at: string;
}

export interface event_registration {
  id: string;
  event_id: string;
  user_id: string;
  created_at: string;
}

export interface events {
  id: string;
  title: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string;
  created_by: string;
  created_at: string;
}