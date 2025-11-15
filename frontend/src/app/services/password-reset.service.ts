import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PasswordResetService {
  private apiUrl = 'http://localhost:8080/api/password-reset';

  constructor(private http: HttpClient) {}

  initiatePasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/initiate`, { email });
  }

  resetPassword(code: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset`, { code, newPassword });
  }

  adminResetPassword(userId: number, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin-reset/${userId}`, { newPassword });
  }
}