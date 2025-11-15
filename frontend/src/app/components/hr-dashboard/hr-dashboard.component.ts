import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { JobService } from '../../services/job.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { ApplicationService } from '../../services/application.service';
import { AdminService } from '../../services/admin.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { InterviewManagementComponent } from '../interview-management/interview-management.component';
import { ApplicationPipelineComponent } from '../application-pipeline/application-pipeline.component';
import { AnalyticsDashboardComponent } from '../analytics-dashboard/analytics-dashboard.component';
import { OfferManagementComponent } from '../offer-management/offer-management.component';

@Component({
  selector: 'app-hr-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, InterviewManagementComponent, ApplicationPipelineComponent, AnalyticsDashboardComponent, OfferManagementComponent],
  templateUrl: './hr-dashboard.component.html',
  styleUrls: ['./hr-dashboard.component.css']
})
export class HrDashboardComponent implements OnInit {
  jobs: any[] = [];
  showJobForm = false;
  editingJob: any = null;
  showProfile = false;
  userName = '';
  userDetails: any = {};
  isDarkMode = false;
  currentView = 'jobs';
  applications: any[] = [];
  selectedJobTitle = '';
  selectedJobId: number = 0;
  showPipeline = false;
  showAnalytics = false;
  showCoverLetter = false;
  selectedApplication: any = null;
  showEmailModal = false;
  emailForm = {
    subject: '',
    body: ''
  };

  
  jobForm = {
    title: '',
    description: '',
    requirements: '',
    location: '',
    department: '',
    companyName: '',
    minSalary: 0,
    maxSalary: 0,
    deadline: '',
    active: true
  };

  constructor(
    private jobService: JobService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private themeService: ThemeService,
    private applicationService: ApplicationService,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private adminService: AdminService
  ) {
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }

  ngOnInit() {
    this.loadJobs();
    this.loadUserName();
    // Set up global function for navbar profile access
    (window as any).hrShowProfile = (user: any) => {
      this.openProfile();
    };
    
    // Handle route changes
    this.route.url.subscribe(segments => {
      const lastSegment = segments[segments.length - 1]?.path;
      switch (lastSegment) {
        case 'jobs':
          this.currentView = 'jobs';
          break;
        case 'applications':
          this.currentView = 'applications';
          break;
        case 'analytics':
          this.currentView = 'analytics';
          this.showAnalytics = true;
          break;
        case 'interviews':
          this.currentView = 'interviews';
          break;
        case 'offers':
          this.currentView = 'offers';
          break;
        default:
          this.currentView = 'jobs';
      }
    });
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
  }

  loadJobs() {
    this.jobService.getMyJobs().subscribe({
      next: (jobs) => this.jobs = jobs,
      error: (error) => console.error('Error loading jobs:', error)
    });
  }

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
    // Prepare job data - convert date format for backend
    const jobData: any = { ...this.jobForm };
    if (!jobData.deadline || jobData.deadline === '') {
      jobData.deadline = null;
    } else {
      // Convert date string to LocalDateTime format (add time)
      jobData.deadline = jobData.deadline + 'T23:59:59';
    }
    
    if (this.editingJob) {
      this.jobService.updateJob(this.editingJob.id, jobData).subscribe({
        next: () => {
          this.loadJobs();
          this.closeJobForm();
        },
        error: (error) => {
          console.error('Error updating job:', error);
          this.snackBar.open('Error updating job: ' + (error.error?.message || error.message), 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      this.jobService.createJob(jobData).subscribe({
        next: () => {
          this.loadJobs();
          this.closeJobForm();
          this.snackBar.open('Job posted successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          console.error('Error creating job:', error);
          this.snackBar.open('Error creating job: ' + (error.error?.message || error.message), 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
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
      companyName: '',
      minSalary: 0,
      maxSalary: 0,
      deadline: '',
      active: true
    };
  }

  viewApplications(job: any) {
    this.applicationService.getApplicationsByJob(job.id).subscribe({
      next: (applications) => {
        this.applications = applications;
        this.selectedJobTitle = job.title;
        this.selectedJobId = job.id;
        this.router.navigate(['/hr-dashboard/applications']);
        this.showPipeline = false;
      },
      error: (error) => console.error('Error loading applications:', error)
    });
  }

  togglePipelineView() {
    this.showPipeline = !this.showPipeline;
  }

  toggleAnalytics() {
    this.showAnalytics = !this.showAnalytics;
    if (this.showAnalytics) {
      this.router.navigate(['/hr-dashboard/analytics']);
    } else {
      this.router.navigate(['/hr-dashboard/jobs']);
    }
  }

  updateApplicationStatus(applicationId: number, status: string) {
    const app = this.applications.find(a => a.id === applicationId);
    const oldStatus = app?.status;
    
    this.applicationService.updateApplicationStatus(applicationId, status).subscribe({
      next: (response) => {
        if (app) {
          app.status = status;
        }
        
        // Send email if status changed to SHORTLISTED
        if (status === 'SHORTLISTED' && oldStatus !== 'SHORTLISTED' && app) {
          this.sendShortlistEmail(app);
        }
        
        this.snackBar.open('Application status updated successfully!', 'Close', {
          duration: 2000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        if (error.status === 200 || error.status === 201) {
          if (app) {
            app.status = status;
          }
          
          // Send email if status changed to SHORTLISTED
          if (status === 'SHORTLISTED' && oldStatus !== 'SHORTLISTED' && app) {
            this.sendShortlistEmail(app);
          }
          
          this.snackBar.open('Application status updated successfully!', 'Close', {
            duration: 2000,
            panelClass: ['success-snackbar']
          });
        } else {
          this.snackBar.open('Error updating status: ' + (error.error?.message || error.message || 'Unknown error'), 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      }
    });
  }

  sendShortlistEmail(application: any) {
    const emailData = {
      to: application.candidate?.email,
      candidateName: `${application.candidate?.firstName} ${application.candidate?.lastName}`,
      jobTitle: this.selectedJobTitle,
      companyName: 'TechAB'
    };

    this.http.post('http://localhost:8080/api/email/shortlist', emailData, {
      headers: { 'Authorization': `Bearer ${this.authService.getToken()}` }
    }).subscribe({
      next: () => {
        this.snackBar.open('Shortlist email sent successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Error sending email:', error);
        this.snackBar.open('Status updated but email failed to send', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  backToJobs() {
    this.router.navigate(['/hr-dashboard/jobs']);
    this.applications = [];
    this.selectedJobTitle = '';
  }

  viewCoverLetter(application: any) {
    this.selectedApplication = application;
    this.showCoverLetter = true;
  }

  closeCoverLetter() {
    this.showCoverLetter = false;
    this.selectedApplication = null;
  }

  openEmailModal(application: any) {
    this.selectedApplication = application;
    this.emailForm.subject = `Congratulations! You've been shortlisted for ${this.selectedJobTitle}`;
    this.emailForm.body = `Dear ${application.candidate?.firstName} ${application.candidate?.lastName},\n\nCongratulations! We are pleased to inform you that you have been shortlisted for the position of ${this.selectedJobTitle}.\n\nWe will contact you soon with further details about the next steps in the selection process.\n\nBest regards,\nTAS Company`;
    this.showEmailModal = true;
  }

  closeEmailModal() {
    this.showEmailModal = false;
    this.selectedApplication = null;
    this.emailForm = { subject: '', body: '' };
  }

  sendEmail() {
    const emailData = {
      to: this.selectedApplication.candidate?.email,
      subject: this.emailForm.subject,
      body: this.emailForm.body
    };

    this.http.post('http://localhost:8080/api/email/send', emailData, {
      headers: { 'Authorization': `Bearer ${this.authService.getToken()}`, 'Content-Type': 'application/json' }
    }).subscribe({
      next: () => {
        this.snackBar.open('Email sent successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.closeEmailModal();
      },
      error: (error) => {
        if (error.status === 200 || error.status === 201) {
          this.snackBar.open('Email sent successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.closeEmailModal();
        } else {
          this.snackBar.open('Failed to send email', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      }
    });
  }

  downloadResume(filename: string) {
    const token = this.authService.getToken();
    
    this.http.get(`http://localhost:8080/api/files/resume/${filename}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: (error) => {
        this.snackBar.open('Error viewing resume', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}