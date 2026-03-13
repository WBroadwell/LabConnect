import { type User } from "@/types"
import { RPI_DEPARTMENTS } from "@/lib/constants"

export interface Department {
  name: string;
  description: string;
  professor_count: number;
}

export interface DepartmentData {
  name: string;
  description: string;
  professors: User[];
}

export type RPIDepartment = (typeof RPI_DEPARTMENTS)[number];