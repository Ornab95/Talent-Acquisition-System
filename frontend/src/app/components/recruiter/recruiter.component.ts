import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ThemeService } from '../../services/theme.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-recruiter',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './recruiter.component.html',
  styleUrls: ['./recruiter.component.css']
})
export class RecruiterComponent {
  isDarkMode = false;
  loading = false;
  error = '';
  success = '';

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

  constructor(
    private http: HttpClient,
    private router: Router,
    private themeService: ThemeService
  ) {
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }

  onSubmit(): void {
    this.loading = true;
    this.error = '';

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