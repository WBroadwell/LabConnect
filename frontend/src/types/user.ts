export interface User {
  id: number;
  name: string;
  email: string;
  role: "student" | "professor";
  is_admin: boolean;
  title?: string;
  departments: string[];
  office?: string;
  website?: string;
  research_interests: string[];
  profile_picture?: string | null;
  created_at: string;
}

export interface Professor extends User {
  role: "professor";
}

