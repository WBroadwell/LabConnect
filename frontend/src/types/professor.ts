export interface User {
  id: number;
  name: string;
  email: string;
  role: "student" | "professor";
  title?: string;
  departments: string[];
  office?: string;
  website?: string;
  research_interests: string[];
  created_at: string;
}

export interface Professor extends User {
  role: "professor";
}

export const RPI_DEPARTMENTS = [
  "Biomedical Engineering",
  "Chemical and Biological Engineering",
  "Civil and Environmental Engineering",
  "Computer Science",
  "Electrical, Computer, and Systems Engineering",
  "Industrial and Systems Engineering",
  "Materials Science and Engineering",
  "Mechanical, Aerospace, and Nuclear Engineering",
  "Mathematics",
  "Physics, Applied Physics, and Astronomy",
  "Chemistry and Chemical Biology",
  "Biology",
  "Earth and Environmental Sciences",
  "Cognitive Science",
  "Economics",
  "Science and Technology Studies",
  "Architecture",
  "Arts",
  "Communication and Media",
] as const;

export type RPIDepartment = (typeof RPI_DEPARTMENTS)[number];
