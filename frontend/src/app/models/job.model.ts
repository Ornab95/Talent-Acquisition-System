export interface Job {
  id?: number;
  title: string;
  description: string;
  requirements: string;
  department: string;
  location: string;
  companyName: string;
  minSalary: number;
  maxSalary: number;
  active?: boolean;
  published?: boolean;
  postedAt?: string;
  deadline?: string;
  applications?: number;
}