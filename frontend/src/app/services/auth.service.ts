import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginRequest, AuthResponse, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('token');
    if (token) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      this.currentUserSubject.next(user);
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    // Input validation
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      throw new Error('Invalid email format');
    }
    
    const headers = { 'Content-Type': 'application/json' };
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials, { headers })
      .pipe(
        tap(response => {
          // Secure token storage
          this.setSecureToken(response.token);
          this.setSecureUserData(response);
          this.currentUserSubject.next(response);
        })
      );
  }
  
  private setSecureToken(token: string): void {
    localStorage.setItem('token', token);
  }
  
  private setSecureUserData(userData: AuthResponse): void {
    const safeUserData = {
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      department: userData.department,
      profilePicture: (userData as any).profilePicture
    };
    localStorage.setItem('user', JSON.stringify(safeUserData));
  }

  register(user: User & { password: string }): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, user);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < currentTime) {
        this.logout();
        return false;
      }
      
      return true;
    } catch {
      this.logout();
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserRole(): string | null {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      return userData.role || null;
    }
    return null;
  }

  isHR(): boolean {
    const role = this.getUserRole();
    return role === 'HR_ADMIN' || role === 'RECRUITER' || role === 'HIRING_MANAGER';
  }

  updateCurrentUser(userData: any): void {
    localStorage.setItem('user', JSON.stringify(userData));
    this.currentUserSubject.next(userData);
  }
}