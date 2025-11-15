import { Component, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NavbarComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements AfterViewInit {
  credentials = { email: '', password: '' };
  loading = false;
  error = '';
  isDarkMode = false;
  showPassword = false;

  constructor(
    private authService: AuthService,
    public router: Router,
    private themeService: ThemeService,
    private elementRef: ElementRef
  ) {
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }

  onSubmit(): void {
    if (!this.credentials.email || !this.credentials.password) {
      this.error = 'Email and password are required';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.loading = false;
        
        switch(response.role) {
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
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Login failed. Please check your credentials.';
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const emailInput = this.elementRef.nativeElement.querySelector('input[type="email"]');
      if (emailInput) {
        emailInput.focus();
      }
    }, 100);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
