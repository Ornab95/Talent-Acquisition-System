import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
  
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (!this.authService.isAuthenticated()) {
      return true;
    }
    
    const userRole = this.authService.getUserRole();
    switch(userRole) {
      case 'CANDIDATE':
        this.router.navigate(['/applicant-dashboard']);
        break;
      case 'HR_ADMIN':
      case 'RECRUITER':
      case 'HIRING_MANAGER':
        this.router.navigate(['/hr-dashboard']);
        break;
      case 'SYSTEM_ADMIN':
        this.router.navigate(['/system-admin-dashboard']);
        break;
      default:
        this.router.navigate(['/applicant-dashboard']);
    }
    
    return false;
  }
}