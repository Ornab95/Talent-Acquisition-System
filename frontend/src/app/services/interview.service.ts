import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Interview {
  id?: number;
  application: any;
  interviewer: any;
  scheduledAt: string;
  interviewType: 'PHONE' | 'VIDEO' | 'ONSITE';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELED';
  feedback?: string;
  meetingLink?: string;
  createdAt?: string;
}

export interface InterviewRequest {
  applicationId: number;
  interviewerId: number;
  scheduledAt: string;
  interviewType: 'PHONE' | 'VIDEO' | 'ONSITE';
  meetingLink?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InterviewService {
  private apiUrl = 'http://localhost:8080/api/interviews';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  scheduleInterview(request: InterviewRequest): Observable<Interview> {
    return this.http.post<Interview>(`${this.apiUrl}/schedule`, request, { headers: this.getHeaders() });
  }

  getInterviewsByApplication(applicationId: number): Observable<Interview[]> {
    return this.http.get<Interview[]>(`${this.apiUrl}/application/${applicationId}`, { headers: this.getHeaders() });
  }

  updateFeedback(interviewId: number, feedback: string): Observable<Interview> {
    return this.http.put<Interview>(`${this.apiUrl}/${interviewId}/feedback`, feedback, { headers: this.getHeaders() });
  }

  updateStatus(interviewId: number, status: string): Observable<Interview> {
    return this.http.put<Interview>(`${this.apiUrl}/${interviewId}/status`, status, { headers: this.getHeaders() });
  }
}