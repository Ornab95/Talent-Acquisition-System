import { Component, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { User } from '../../models/user.model';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements AfterViewInit {
  registrationType: 'applicant' | 'recruiter' = 'applicant';
  
  user: User = {
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'CANDIDATE',
    department: ''
  };
  password = '';
  
  companyData = {
    companyName: '',
    companyEmail: '',
    description: '',
    website: '',
    industry: '',
    location: '',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPassword: ''
  };
  
  loading = false;
  error = '';
  success = '';
  isDarkMode = false;
  showPassword = false;
  showAdminPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService,
    private http: HttpClient,
    private elementRef: ElementRef
  ) {
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }

  ngAfterViewInit(): void {
    this.setFocus();
  }

  setFocus(): void {
    setTimeout(() => {
      if (this.registrationType === 'applicant') {
        const firstNameInput = this.elementRef.nativeElement.querySelector('input[name="firstName"]');
        if (firstNameInput) {
          firstNameInput.focus();
        }
      } else {
        const companyNameInput = this.elementRef.nativeElement.querySelector('input[name="companyName"]');
        if (companyNameInput) {
          companyNameInput.focus();
        }
      }
    }, 100);
  }

  switchRegistrationType(type: 'applicant' | 'recruiter'): void {
    this.registrationType = type;
    this.error = '';
    this.success = '';
    this.setFocus();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleAdminPasswordVisibility(): void {
    this.showAdminPassword = !this.showAdminPassword;
  }

  isApplicantFormValid(): boolean {
    return !!(this.user.firstName && this.user.lastName && this.user.email && 
             this.user.phone && this.user.department && this.password && 
             this.password.length >= 6 && this.isValidEmail(this.user.email));
  }

  isRecruiterFormValid(): boolean {
    return !!(this.companyData.companyName && this.companyData.companyEmail && 
             this.companyData.industry && this.companyData.location && 
             this.companyData.adminFirstName && this.companyData.adminLastName && 
             this.companyData.adminEmail && this.companyData.adminPassword && 
             this.companyData.adminPassword.length >= 6 && 
             this.isValidEmail(this.companyData.companyEmail) && 
             this.isValidEmail(this.companyData.adminEmail));
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  onSubmit(): void {
    this.loading = true;
    this.error = '';

    if (this.registrationType === 'applicant') {
      if (!this.isApplicantFormValid()) {
        this.loading = false;
        this.error = 'Please fill all required fields correctly';
        return;
      }
      const registerData = { ...this.user, password: this.password };
      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.loading = false;
          this.success = 'Registration successful! Redirecting to login...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.loading = false;
          this.error = error.error?.message || 'Registration failed';
        }
      });
    } else {
      if (!this.isRecruiterFormValid()) {
        this.loading = false;
        this.error = 'Please fill all required fields correctly';
        return;
      }
      this.http.post('http://localhost:8080/api/company/register', this.companyData).subscribe({
        next: (response: any) => {
          this.loading = false;
          this.success = 'Company registered successfully! Redirecting to login...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.loading = false;
          this.error = error.error?.error || 'Registration failed';
        }
      });
    }
  }
}