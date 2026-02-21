import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { ApplicationService } from '../../services/application.service';

import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  isDarkMode = false;
  userDetails: any = {};
  applications: any[] = [];
  currentView = 'profile';
  editMode = false;
  editForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: ''
  };
  selectedFile: File | null = null;
  showApplicationDetails = false;
  selectedApplication: any = null;

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private applicationService: ApplicationService,

    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
    

  }

  ngOnInit() {
    console.log('Profile component initialized');
    this.loadUserDetails();
    console.log('User details loaded:', this.userDetails);
    if (this.userDetails.role === 'CANDIDATE') {
      this.loadApplications();
    }
    
    // Handle route changes
    this.route.url.subscribe(segments => {
      const lastSegment = segments[segments.length - 1]?.path;
      if (lastSegment === 'application') {
        this.currentView = 'applications';
      } else {
        this.currentView = 'profile';
      }
    });
  }

  loadUserDetails() {
    const user = localStorage.getItem('user');
    if (user) {
      this.userDetails = JSON.parse(user);
      // Ensure profile picture URL is complete
      if (this.userDetails.profilePicture && !this.userDetails.profilePicture.startsWith('http')) {
        this.userDetails.profilePicture = `http://localhost:8080${this.userDetails.profilePicture}`;
      }
    }
  }

  loadApplications() {
    this.applicationService.getMyApplications().subscribe({
      next: (applications) => this.applications = applications,
      error: (error) => console.error('Error loading applications:', error)
    });
  }

  switchView(view: string) {
    this.currentView = view;
    if (view === 'applications') {
      this.router.navigate(['/profile/application']);
    } else {
      this.router.navigate(['/profile/info']);
    }
  }

  getRoleDisplayName(role: string): string {
    const roleMap: { [key: string]: string } = {
      'CANDIDATE': 'Job Candidate',
      'HR_ADMIN': 'HR Administrator',
      'RECRUITER': 'Recruiter',
      'HIRING_MANAGER': 'Hiring Manager',
      'SYSTEM_ADMIN': 'System Administrator'
    };
    return roleMap[role] || role;
  }

  getMembershipDuration(): string {
    if (!this.userDetails.createdAt) return 'N/A';
    const created = new Date(this.userDetails.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays}d`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}m`;
    return `${Math.floor(diffDays / 365)}y`;
  }

  getStatusClass(status: string): string {
    const baseClasses = 'px-3 py-1 rounded-full text-sm font-semibold';
    switch (status) {
      case 'APPLIED':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'REVIEWED':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'SHORTLISTED':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'REJECTED':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'APPLIED': 'Applied',
      'REVIEWED': 'Under Review',
      'SHORTLISTED': 'Shortlisted',
      'REJECTED': 'Rejected'
    };
    return statusMap[status] || status;
  }

  toggleEditMode() {
    if (this.editMode) {
      this.cancelEdit();
    } else {
      this.enableEditMode();
    }
  }

  enableEditMode() {
    this.editMode = true;
    this.editForm = {
      firstName: this.userDetails.firstName || '',
      lastName: this.userDetails.lastName || '',
      email: this.userDetails.email || '',
      phone: this.userDetails.phone || '',
      department: this.userDetails.department || ''
    };
  }

  isFormValid(): boolean {
    if (!this.editForm.firstName?.trim()) {
      alert('First name is required');
      return false;
    }
    if (!this.editForm.lastName?.trim()) {
      alert('Last name is required');
      return false;
    }
    if (this.editForm.phone && !this.isValidPhone(this.editForm.phone)) {
      alert('Please enter a valid phone number');
      return false;
    }
    return true;
  }

  isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  cancelEdit() {
    this.editMode = false;
    this.editForm = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: ''
    };
  }

  triggerFileInput() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      console.log('File selected:', file.name);
      this.selectedFile = file;
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      const token = this.authService.getToken();
      console.log('Making API call to upload profile picture...');
      this.http.post(`http://localhost:8080/api/users/${this.userDetails.id}/profile-picture`, formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).subscribe({
        next: (response: any) => {
          console.log('Profile picture upload response:', response);
          this.userDetails.profilePicture = `http://localhost:8080${response.profilePictureUrl}`;
          localStorage.setItem('user', JSON.stringify(this.userDetails));
          this.authService.updateCurrentUser(this.userDetails);
          console.log('Profile picture updated successfully');
        },
        error: (error) => {
          console.error('Error uploading profile picture:', error);
          alert('Error uploading profile picture. Please try again.');
        }
      });
    }
  }

  saveProfile() {
    // Validate form before saving
    if (!this.isFormValid()) {
      return;
    }
    
    const token = this.authService.getToken();
    const updateData = {
      firstName: this.editForm.firstName,
      lastName: this.editForm.lastName,
      phone: this.editForm.phone,
      department: this.editForm.department
    };
    
    this.http.put(`http://localhost:8080/api/users/${this.userDetails.id}`, updateData, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (response: any) => {
        // Update user details
        this.userDetails.firstName = this.editForm.firstName;
        this.userDetails.lastName = this.editForm.lastName;
        this.userDetails.phone = this.editForm.phone;
        this.userDetails.department = this.editForm.department;
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(this.userDetails));
        
        this.editMode = false;
        console.log(response.message || 'Profile updated successfully');
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        // Fallback to local update
        this.userDetails.firstName = this.editForm.firstName;
        this.userDetails.lastName = this.editForm.lastName;
        this.userDetails.phone = this.editForm.phone;
        this.userDetails.department = this.editForm.department;
        localStorage.setItem('user', JSON.stringify(this.userDetails));
        this.editMode = false;
      }
    });
  }

  viewApplicationDetails(application: any) {
    this.selectedApplication = application;
    this.showApplicationDetails = true;
  }

  closeApplicationDetails() {
    this.showApplicationDetails = false;
    this.selectedApplication = null;
  }

}