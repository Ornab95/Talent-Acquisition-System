import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { JobService } from '../../services/job.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { ApplicationService } from '../../services/application.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-applicant-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './applicant-dashboard.component.html',
  styleUrls: ['./applicant-dashboard.component.css']
})
export class ApplicantDashboardComponent implements OnInit {
  jobs: any[] = [];
  filteredJobs: any[] = [];
  selectedJob: any = null;
  showJobDetails = false;
  showProfile = false;
  userName = '';
  userDetails: any = {};
  isDarkMode = false;
  showApplicationForm = false;
  selectedFile: File | null = null;
  applicationForm = {
    coverLetter: ''
  };
  editMode = false;
  editForm = {
    firstName: '',
    lastName: '',
    phone: ''
  };

  // Filter properties
  filters = {
    search: '',
    fresher: false,
    salaryRange: { min: 0, max: 200000 },
    experienceRange: { min: 0, max: 20 },
    departments: [] as string[],
    locations: [] as string[]
  };

  expandedSections = {
    quickFilter: true,
    salary: false,
    experience: false,
    department: false,
    location: false
  };

  departments: string[] = [];
  locations: string[] = [];

  constructor(
    private jobService: JobService,
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService,
    private applicationService: ApplicationService,
    private snackBar: MatSnackBar
  ) {
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }

  ngOnInit() {
    this.loadJobs();
    this.loadUserName();
    // Set up global function for navbar profile access
    (window as any).applicantShowProfile = (user: any) => {
      this.openProfile();
    };
  }

  loadUserName() {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      this.userName = `${userData.firstName} ${userData.lastName}`;
      this.userDetails = userData;
    }
  }

  openProfile() {
    this.showProfile = true;
  }

  closeProfile() {
    this.showProfile = false;
    this.editMode = false;
  }

  enableEditMode() {
    this.editMode = true;
    this.editForm = {
      firstName: this.userDetails.firstName || '',
      lastName: this.userDetails.lastName || '',
      phone: this.userDetails.phone || ''
    };
  }

  cancelEdit() {
    this.editMode = false;
    this.editForm = {
      firstName: '',
      lastName: '',
      phone: ''
    };
  }

  saveProfile() {
    // Update user details
    this.userDetails.firstName = this.editForm.firstName;
    this.userDetails.lastName = this.editForm.lastName;
    this.userDetails.phone = this.editForm.phone;
    
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(this.userDetails));
    
    // Update userName for display
    this.userName = `${this.userDetails.firstName} ${this.userDetails.lastName}`;
    
    this.snackBar.open('Profile updated successfully!', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
    
    this.editMode = false;
  }

  loadJobs() {
    this.jobService.getAllJobs().subscribe({
      next: (jobs) => {
        this.jobs = jobs.filter(job => job.active);
        this.filteredJobs = [...this.jobs];
        this.extractFilterOptions();
      },
      error: (error) => console.error('Error loading jobs:', error)
    });
  }

  extractFilterOptions() {
    this.departments = [...new Set(this.jobs.map(job => job.department).filter(Boolean))];
    this.locations = [...new Set(this.jobs.map(job => job.location).filter(Boolean))];
  }

  toggleSection(section: string) {
    this.expandedSections[section as keyof typeof this.expandedSections] = 
      !this.expandedSections[section as keyof typeof this.expandedSections];
  }

  toggleDepartment(dept: string) {
    const index = this.filters.departments.indexOf(dept);
    if (index > -1) {
      this.filters.departments.splice(index, 1);
    } else {
      this.filters.departments.push(dept);
    }
    this.applyFilters();
  }

  toggleLocation(loc: string) {
    const index = this.filters.locations.indexOf(loc);
    if (index > -1) {
      this.filters.locations.splice(index, 1);
    } else {
      this.filters.locations.push(loc);
    }
    this.applyFilters();
  }

  applyFilters() {
    this.filteredJobs = this.jobs.filter(job => {
      // Search filter
      if (this.filters.search && !job.title.toLowerCase().includes(this.filters.search.toLowerCase()) &&
          !job.description.toLowerCase().includes(this.filters.search.toLowerCase())) {
        return false;
      }

      // Fresher filter
      if (this.filters.fresher && !job.title.toLowerCase().includes('fresher') &&
          !job.description.toLowerCase().includes('fresher') &&
          !job.requirements.toLowerCase().includes('fresher')) {
        return false;
      }

      // Salary range filter
      if (job.minSalary < this.filters.salaryRange.min || job.maxSalary > this.filters.salaryRange.max) {
        return false;
      }

      // Department filter
      if (this.filters.departments.length > 0 && !this.filters.departments.includes(job.department)) {
        return false;
      }

      // Location filter
      if (this.filters.locations.length > 0 && !this.filters.locations.includes(job.location)) {
        return false;
      }

      return true;
    });
  }

  clearAllFilters() {
    this.filters = {
      search: '',
      fresher: false,
      salaryRange: { min: 0, max: 200000 },
      experienceRange: { min: 0, max: 20 },
      departments: [],
      locations: []
    };
    this.filteredJobs = [...this.jobs];
  }

  viewJobDetails(job: any) {
    this.selectedJob = job;
    this.showJobDetails = true;
  }

  closeJobDetails() {
    this.showJobDetails = false;
    this.selectedJob = null;
  }

  applyForJob(jobId: number) {
    this.showApplicationForm = true;
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  submitApplication() {
    if (!this.selectedFile || !this.applicationForm.coverLetter) {
      this.snackBar.open('Please fill all fields and select a resume', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const candidateId = user.id || 1;

    this.applicationService.submitApplication(
      this.selectedJob.id,
      candidateId,
      this.applicationForm.coverLetter,
      this.selectedFile
    ).subscribe({
      next: (response) => {
        console.log('Application response:', response);
        this.snackBar.open('Application submitted successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.closeApplicationForm();
        this.closeJobDetails();
      },
      error: (error) => {
        console.error('Application error:', error);
        console.error('Error details:', error.error);
        if (error.status === 200 || error.status === 201) {
          this.snackBar.open('Application submitted successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.closeApplicationForm();
          this.closeJobDetails();
        } else {
          const errorMsg = error.error?.message || error.error || error.message || 'Unknown error';
          this.snackBar.open('Error: ' + errorMsg, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      }
    });
  }

  closeApplicationForm() {
    this.showApplicationForm = false;
    this.selectedFile = null;
    this.applicationForm.coverLetter = '';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}