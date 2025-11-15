import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly baseUrl = 'http://localhost:8080/api';
  private readonly adminUrl = `${this.baseUrl}/admin`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Dashboard stats
  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.adminUrl}/dashboard/stats`, { headers: this.getAuthHeaders() });
  }

  // User management
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.adminUrl}/users`, { headers: this.getAuthHeaders() });
  }

  createUser(userData: any): Observable<any> {
    return this.http.post(`${this.adminUrl}/users`, userData, { headers: this.getAuthHeaders() });
  }

  updateUser(id: number, userData: any): Observable<any> {
    return this.http.put(`${this.adminUrl}/users/${id}`, userData, { headers: this.getAuthHeaders() });
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.adminUrl}/users/${id}`, { headers: this.getAuthHeaders() });
  }

  // Settings management
  getSettings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.adminUrl}/settings`, { headers: this.getAuthHeaders() });
  }

  createSetting(settingInput: any): Observable<any> {
    const settingData = {
      settingKey: settingInput.key,
      settingValue: settingInput.value,
      category: settingInput.category
    };
    return this.http.post(`${this.adminUrl}/settings`, settingData, { headers: this.getAuthHeaders() });
  }

  deleteSetting(key: string): Observable<any> {
    return this.http.delete(`${this.adminUrl}/settings/${key}`, { headers: this.getAuthHeaders() });
  }

  getUserApplications(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.adminUrl}/users/${userId}/applications`, { headers: this.getAuthHeaders() });
  }

  getJobs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/jobs`, { headers: this.getAuthHeaders() });
  }

  getApplications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/applications`, { headers: this.getAuthHeaders() });
  }

  getAnalytics(): Observable<any> {
    return this.http.get(`${this.baseUrl}/analytics`, { headers: this.getAuthHeaders() });
  }
}