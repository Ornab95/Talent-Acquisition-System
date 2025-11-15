import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Application } from '../models/application.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private apiUrl = 'http://localhost:8080/api/applications';

  constructor(private http: HttpClient, private authService: AuthService) {}

  submitApplication(jobId: number, candidateId: number, coverLetter: string, resume: File): Observable<any> {
    const formData = new FormData();
    formData.append('jobId', jobId.toString());
    formData.append('coverLetter', coverLetter);
    if (resume) {
      formData.append('resume', resume);
    }

    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post(this.apiUrl, formData, { headers });
  }

  getApplicationsByCandidate(candidateId: number): Observable<Application[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Application[]>(`${this.apiUrl}/candidate/${candidateId}`, { headers });
  }

  getApplicationsByJob(jobId: number): Observable<Application[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Application[]>(`${this.apiUrl}/job/${jobId}`, { headers });
  }

  getAllApplications(): Observable<Application[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Application[]>(this.apiUrl, { headers });
  }

  getMyApplications(): Observable<Application[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Application[]>(`${this.apiUrl}/my-applications`, { headers });
  }

  updateApplicationStatus(applicationId: number, status: string): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.put(`${this.apiUrl}/${applicationId}/status?status=${status}`, {}, { headers });
  }
}