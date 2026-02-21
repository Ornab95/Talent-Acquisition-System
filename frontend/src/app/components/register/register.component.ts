import { Component, AfterViewInit, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
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
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, AfterViewInit {
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
    private route: ActivatedRoute,
    private themeService: ThemeService,
    private http: HttpClient,
    private elementRef: ElementRef
  ) {
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }

  ngOnInit(): void {
    this.route.url.subscribe(segments => {
      const lastSegment = segments[segments.length - 1]?.path;
      if (lastSegment === 'recruiter') {
        this.registrationType = 'recruiter';
      } else {
        this.registrationType = 'applicant';
      }
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
    this.router.navigate(['/register', type]);
    this.setFocus();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleAdminPasswordVisibility(): void {
    this.showAdminPassword = !this.showAdminPassword;
  }

  isApplicantFormValid(): boolean {
    if (!this.user.firstName?.trim()) return false;
    if (!this.user.lastName?.trim()) return false;
    if (!this.user.email?.trim() || !this.isValidEmail(this.user.email)) return false;
    if (!this.user.phone?.trim() || !this.isValidPhone(this.user.phone)) return false;
    if (!this.user.department?.trim()) return false;
    if (!this.password?.trim() || this.password.length < 6) return false;
    return true;
  }

  isRecruiterFormValid(): boolean {
    if (!this.companyData.companyName?.trim()) return false;
    if (!this.companyData.companyEmail?.trim() || !this.isValidEmail(this.companyData.companyEmail)) return false;
    if (!this.companyData.industry?.trim()) return false;
    if (!this.companyData.location?.trim()) return false;
    if (!this.companyData.adminFirstName?.trim()) return false;
    if (!this.companyData.adminLastName?.trim()) return false;
    if (!this.companyData.adminEmail?.trim() || !this.isValidEmail(this.companyData.adminEmail)) return false;
    if (!this.companyData.adminPassword?.trim() || this.companyData.adminPassword.length < 6) return false;
    return true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone: string): boolean {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    // Bangladesh phone formats: +8801XXXXXXXXX or 01XXXXXXXXX
    const bangladeshRegex = /^(\+?880|0)1[3-9]\d{8}$/;
    return bangladeshRegex.test(cleanPhone);
  }

  onSubmit(): void {
    this.loading = true;
    this.error = '';

    if (this.registrationType === 'applicant') {
      if (!this.isApplicantFormValid()) {
        this.loading = false;
        this.error = this.getApplicantValidationError();
        return;
      }
      const registerData = { ...this.user, password: this.password };
      this.authService.register(registerData).subscribe({
        next: (response: any) => {
          this.loading = false;
          this.success = response.message || 'Registration successful! Redirecting to login...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.loading = false;
          this.error = error.error?.error || error.error?.message || 'Registration failed';
        }
      });
    } else {
      if (!this.isRecruiterFormValid()) {
        this.loading = false;
        this.error = this.getRecruiterValidationError();
        return;
      }
      this.http.post('http://localhost:8080/api/company/register', this.companyData).subscribe({
        next: (response: any) => {
          this.loading = false;
          this.success = response.message || 'Company registered successfully! Redirecting to login...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.loading = false;
          this.error = error.error?.error || error.error?.message || 'Registration failed';
        }
      });
    }
  }

  getApplicantValidationError(): string {
    if (!this.user.firstName?.trim()) return 'First name is required';
    if (!this.user.lastName?.trim()) return 'Last name is required';
    if (!this.user.email?.trim()) return 'Email is required';
    if (!this.isValidEmail(this.user.email)) return 'Please enter a valid email address';
    if (!this.user.phone?.trim()) return 'Phone number is required';
    if (!this.isValidPhone(this.user.phone)) return 'Please enter a valid phone number';
    if (!this.user.department?.trim()) return 'Please select a department';
    if (!this.password?.trim()) return 'Password is required';
    if (this.password.length < 6) return 'Password must be at least 6 characters long';
    return 'Please fill all required fields correctly';
  }

  getRecruiterValidationError(): string {
    if (!this.companyData.companyName?.trim()) return 'Company name is required';
    if (!this.companyData.companyEmail?.trim()) return 'Company email is required';
    if (!this.isValidEmail(this.companyData.companyEmail)) return 'Please enter a valid company email';
    if (!this.companyData.industry?.trim()) return 'Please select an industry';
    if (!this.companyData.location?.trim()) return 'Company location is required';
    if (!this.companyData.adminFirstName?.trim()) return 'Admin first name is required';
    if (!this.companyData.adminLastName?.trim()) return 'Admin last name is required';
    if (!this.companyData.adminEmail?.trim()) return 'Admin email is required';
    if (!this.isValidEmail(this.companyData.adminEmail)) return 'Please enter a valid admin email';
    if (!this.companyData.adminPassword?.trim()) return 'Admin password is required';
    if (this.companyData.adminPassword.length < 6) return 'Admin password must be at least 6 characters long';
    return 'Please fill all required fields correctly';
  }
}