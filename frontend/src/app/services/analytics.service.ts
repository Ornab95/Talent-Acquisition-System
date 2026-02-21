import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface AnalyticsData {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  totalCandidates: number;
  averageTimeToFill: number;
  applicationsByStatus: { [key: string]: number };
  applicationsByDepartment: { [key: string]: number };
  applicationsByMonth: { [key: string]: number };
  topSourceChannels: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAnalytics(): Observable<AnalyticsData> {
    const currentUrl = window.location.pathname;
    const endpoint = (currentUrl.includes('admin-analytics') || currentUrl.includes('system-admin-dashboard'))
      ? `${this.apiUrl}/admin/analytics`
      : `${this.apiUrl}/hr/analytics`;
    
    return this.http.get<AnalyticsData>(endpoint, { headers: this.getHeaders() });
  }
}