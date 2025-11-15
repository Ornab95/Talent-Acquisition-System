import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  isDarkMode = false;
  isAuthenticated = false;
  userName = '';
  userProfilePicture = '';
  showProfileMenu = false;

  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    private router: Router
  ) {
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
    
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
      this.userName = user ? `${user.firstName} ${user.lastName}` : 'User';
      this.userProfilePicture = (user as any)?.profilePicture || '';
      // Ensure profile picture URL is complete
      if (this.userProfilePicture && !this.userProfilePicture.startsWith('http')) {
        this.userProfilePicture = `http://localhost:8080${this.userProfilePicture}`;
      }
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

  openProfile(): void {
    console.log('Profile clicked - navigating to /profile');
    this.showProfileMenu = false;
    this.router.navigate(['/profile']).then(success => {
      console.log('Navigation result:', success);
    }).catch(error => {
      console.error('Navigation error:', error);
    });
  }



  goHome(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role;
    
    switch(role) {
      case 'SYSTEM_ADMIN':
        this.router.navigate(['/system-admin-dashboard']);
        break;
      case 'HR_ADMIN':
      case 'RECRUITER':
      case 'HIRING_MANAGER':
        this.router.navigate(['/hr-dashboard']);
        break;
      case 'CANDIDATE':
        this.router.navigate(['/applicant-dashboard']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}