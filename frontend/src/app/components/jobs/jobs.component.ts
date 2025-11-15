import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { JobService } from '../../services/job.service';
import { AuthService } from '../../services/auth.service';
import { Job } from '../../models/job.model';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.css']
})
export class JobsComponent implements OnInit {
  jobs: Job[] = [];
  filteredJobs: Job[] = [];
  loading = false;
  currentView = 'browse';
  savedJobs: Job[] = [];
  appliedJobs: Job[] = [];
  
  searchTerm = '';
  selectedDepartment = '';
  selectedLocation = '';

  constructor(
    private jobService: JobService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadJobs();
    
    // Handle route changes
    this.route.url.subscribe(segments => {
      const lastSegment = segments[segments.length - 1]?.path;
      switch (lastSegment) {
        case 'browse':
          this.currentView = 'browse';
          break;
        case 'saved':
          this.currentView = 'saved';
          this.loadSavedJobs();
          break;
        case 'applied':
          this.currentView = 'applied';
          this.loadAppliedJobs();
          break;
        default:
          this.currentView = 'browse';
      }
    });
  }

  loadJobs(): void {
    this.loading = true;
    this.jobService.getAllJobs().subscribe({
      next: (jobs) => {
        this.jobs = jobs;
        this.filteredJobs = jobs;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading jobs:', err);
        this.loading = false;
      }
    });
  }

  filterJobs(): void {
    this.filteredJobs = this.jobs.filter(job => {
      const matchesSearch = !this.searchTerm || 
        job.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesDepartment = !this.selectedDepartment || 
        job.department === this.selectedDepartment;
      
      const matchesLocation = !this.selectedLocation || 
        job.location === this.selectedLocation;

      return matchesSearch && matchesDepartment && matchesLocation;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedDepartment = '';
    this.selectedLocation = '';
    this.filteredJobs = this.jobs;
  }

  switchView(view: string): void {
    switch (view) {
      case 'browse':
        this.router.navigate(['/jobs/browse']);
        break;
      case 'saved':
        this.router.navigate(['/jobs/saved']);
        break;
      case 'applied':
        this.router.navigate(['/jobs/applied']);
        break;
    }
  }

  loadSavedJobs(): void {
    // Load saved jobs logic here
    this.savedJobs = [];
  }

  loadAppliedJobs(): void {
    // Load applied jobs logic here
    this.appliedJobs = [];
  }

  viewJob(job: Job): void {
    // Navigate to job details or open modal
    console.log('View job:', job);
  }

  openCreateModal(): void {
    // Open create job modal
    console.log('Open create job modal');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}