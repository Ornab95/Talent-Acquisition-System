import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavbarComponent } from '../navbar/navbar.component';
import { JobService } from '../../services/job.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { ApplicationService } from '../../services/application.service';

@Component({
  selector: 'app-main-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './main-dashboard.component.html',
  styleUrls: ['./main-dashboard.component.css']
})
export class MainDashboardComponent implements OnInit {
  currentView = 'jobs';
  applications: any[] = [];
  userRole = '';
  jobs: any[] = [];
  selectedJob: any = null;
  showJobDetails = false;
  showJobForm = false;
  editingJob: any = null;
  isDarkMode = false;
  showApplicationForm = false;
  selectedFile: File | null = null;
  applicationForm = {
    coverLetter: ''
  };
  
  jobForm = {
    title: '',
    description: '',
    requirements: '',
    location: '',
    department: '',
    minSalary: 0,
    maxSalary: 0,
    deadline: '',
    active: true
  };

  constructor(
    private jobService: JobService,
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService,
    private applicationService: ApplicationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadUserRole();
    this.loadJobs();
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }

  loadUserRole() {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      this.userRole = userData.role;
    }
  }

  isHR(): boolean {
    return this.userRole === 'HR_ADMIN' || this.userRole === 'RECRUITER' || this.userRole === 'HIRING_MANAGER';
  }

  loadJobs() {
    this.jobService.getAllJobs().subscribe({
      next: (jobs) => {
        if (this.isHR()) {
          this.jobs = jobs;
        } else {
          this.jobs = jobs.filter(job => job.active);
        }
      },
      error: (error) => console.error('Error loading jobs:', error)
    });
  }

  // Job Management (HR)
  openJobForm() {
    this.showJobForm = true;
    this.editingJob = null;
    this.resetForm();
  }

  editJob(job: any) {
    this.showJobForm = true;
    this.editingJob = job;
    this.jobForm = { ...job };
  }

  saveJob() {
    const jobData: any = { ...this.jobForm };
    if (!jobData.deadline || jobData.deadline === '') {
      jobData.deadline = null;
    } else {
      jobData.deadline = jobData.deadline + 'T23:59:59';
    }
    
    if (this.editingJob) {
      this.jobService.updateJob(this.editingJob.id, jobData).subscribe({
        next: () => {
          this.loadJobs();
          this.closeJobForm();
        },
        error: (error) => console.error('Error updating job:', error)
      });
    } else {
      this.jobService.createJob(jobData).subscribe({
        next: () => {
          this.loadJobs();
          this.closeJobForm();
        },
        error: (error) => console.error('Error creating job:', error)
      });
    }
  }

  deleteJob(id: number) {
    if (confirm('Are you sure you want to delete this job?')) {
      this.jobService.deleteJob(id).subscribe({
        next: () => this.loadJobs(),
        error: (error) => console.error('Error deleting job:', error)
      });
    }
  }

  closeJobForm() {
    this.showJobForm = false;
    this.editingJob = null;
    this.resetForm();
  }

  resetForm() {
    this.jobForm = {
      title: '',
      description: '',
      requirements: '',
      location: '',
      department: '',
      minSalary: 0,
      maxSalary: 0,
      deadline: '',
      active: true
    };
  }

  // Job Viewing (Applicant)
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
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      this.snackBar.open('Only PDF files are allowed', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      event.target.value = '';
      return;
    }
    
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.snackBar.open('File size must be less than 10MB', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      event.target.value = '';
      return;
    }
    
    // Validate filename
    if (!file.name || file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
      this.snackBar.open('Invalid filename', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      event.target.value = '';
      return;
    }
    
    this.selectedFile = file;
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
    const candidateId = user.id || 1; // Fallback to 1 if no ID found

    this.applicationService.submitApplication(
      this.selectedJob.id,
      candidateId,
      this.applicationForm.coverLetter,
      this.selectedFile
    ).subscribe({
      next: () => {
        this.snackBar.open('Application submitted successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.closeApplicationForm();
        this.closeJobDetails();
      },
      error: (error) => {
        this.snackBar.open('Error submitting application: ' + (error.error || 'Unknown error'), 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  closeApplicationForm() {
    this.showApplicationForm = false;
    this.selectedFile = null;
    this.applicationForm.coverLetter = '';
  }

  viewApplications(jobId: number) {
    this.applicationService.getApplicationsByJob(jobId).subscribe({
      next: (applications) => {
        this.applications = applications;
        this.currentView = 'applications';
      },
      error: (error) => console.error('Error loading applications:', error)
    });
  }

  backToJobs() {
    this.currentView = 'jobs';
    this.applications = [];
  }
}