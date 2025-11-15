import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAnalytics(): Observable<AnalyticsData> {
    return this.http.get<AnalyticsData>(`${this.apiUrl}/analytics`, { headers: this.getHeaders() });
  }
}