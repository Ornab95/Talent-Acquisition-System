export interface Application {
  id?: number;
  jobId: number;
  candidateId: number;
  coverLetter: string;
  resumeFileName?: string;
  resumeFilePath?: string;
  status?: string;
  appliedAt?: string;
}

export interface ApplicationRequest {
  jobId: number;
  candidateId: number;
  coverLetter: string;
  resume: File;
}