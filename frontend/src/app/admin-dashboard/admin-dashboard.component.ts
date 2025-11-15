import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../services/admin.service';
import { ThemeService } from '../services/theme.service';
import { NavbarComponent } from '../components/navbar/navbar.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  isDarkMode = false;
  currentView = 'dashboard';
  showUserProfile = false;
  showMobileMenu = false;
  selectedUserProfile: any = null;
  userApplications: any[] = [];
  jobs: any[] = [];
  allApplications: any[] = [];
  
  // Dashboard stats
  stats = {
    totalUsers: 0,
    totalJobs: 0,
    totalApplications: 0,
    newUsersThisMonth: 0
  };
  
  // Users management
  users: any[] = [];
  selectedUser: any = null;
  showUserForm = false;
  userForm = {
    firstName: '',
    lastName: '',
    email: '',
    role: 'CANDIDATE',
    department: '',
    password: '',
    active: true
  };
  
  // Site settings
  settings: any[] = [];
  showSettingForm = false;
  settingForm = {
    key: '',
    value: '',
    category: 'GENERAL'
  };
  
  constructor(
    private adminService: AdminService,
    private themeService: ThemeService,
    private snackBar: MatSnackBar,
    public router: Router,
    private route: ActivatedRoute
  ) {
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }
  
  ngOnInit() {
    this.loadDashboardStats();
    // Set up global function for navbar profile access
    (window as any).adminShowProfile = (user: any) => {
      this.viewUserProfile(user);
    };
    
    // Handle route changes based on URL
    const currentUrl = this.router.url;
    if (currentUrl.includes('/user')) {
      this.currentView = 'users';
      this.loadUsers();
    } else if (currentUrl.includes('/job')) {
      this.currentView = 'jobs';
      this.loadJobs();
    } else if (currentUrl.includes('/application')) {
      this.currentView = 'applications';
      this.loadApplications();
    } else if (currentUrl.includes('/setting')) {
      this.currentView = 'settings';
      this.loadSettings();
    } else {
      // Default to dashboard view
      this.currentView = 'dashboard';
    }
  }
  
  loadDashboardStats() {
    this.adminService.getDashboardStats().subscribe({
      next: (stats) => this.stats = stats,
      error: (error) => console.error('Error loading stats:', error)
    });
  }
  
  loadUsers() {
    this.adminService.getUsers().subscribe({
      next: (users) => this.users = users,
      error: (error) => console.error('Error loading users:', error)
    });
  }
  
  loadSettings() {
    this.adminService.getSettings().subscribe({
      next: (settings) => this.settings = settings,
      error: (error) => console.error('Error loading settings:', error)
    });
  }
  
  switchView(view: string) {
    this.currentView = view;
    switch (view) {
      case 'dashboard':
        this.router.navigate(['/system-admin-dashboard'], { replaceUrl: true });
        break;
      case 'users':
        this.router.navigate(['/system-admin-dashboard/user'], { replaceUrl: true });
        break;
      case 'jobs':
        this.router.navigate(['/system-admin-dashboard/job'], { replaceUrl: true });
        break;
      case 'applications':
        this.router.navigate(['/system-admin-dashboard/application'], { replaceUrl: true });
        break;
      case 'settings':
        this.router.navigate(['/system-admin-dashboard/setting'], { replaceUrl: true });
        break;
    }
  }

  loadJobs() {
    this.adminService.getJobs().subscribe({
      next: (jobs) => {
        console.log('Jobs loaded:', jobs);
        this.jobs = jobs;
      },
      error: (error) => console.error('Error loading jobs:', error)
    });
  }

  loadApplications() {
    this.adminService.getApplications().subscribe({
      next: (applications) => {
        console.log('Applications loaded:', applications);
        this.allApplications = applications;
      },
      error: (error) => console.error('Error loading applications:', error)
    });
  }

  viewUserProfile(user: any) {
    this.selectedUserProfile = user;
    this.showUserProfile = true;
    if (user.role === 'CANDIDATE') {
      this.loadUserApplications(user.id);
    }
  }

  loadUserApplications(userId: number) {
    this.adminService.getUserApplications(userId).subscribe({
      next: (applications) => this.userApplications = applications,
      error: (error) => console.error('Error loading user applications:', error)
    });
  }

  closeUserProfile() {
    this.showUserProfile = false;
    this.selectedUserProfile = null;
    this.userApplications = [];
  }
  
  // User management
  openUserForm(user?: any) {
    this.showUserForm = true;
    this.selectedUser = user;
    if (user) {
      this.userForm = { ...user };
    } else {
      this.userForm = {
        firstName: '',
        lastName: '',
        email: '',
        role: 'CANDIDATE',
        department: '',
        password: '',
        active: true
      };
    }
  }
  
  saveUser() {
    // Remove empty password field for updates
    const userData: any = { ...this.userForm };
    if (this.selectedUser && (!userData.password || userData.password.trim() === '')) {
      delete userData.password;
    }
    
    const request = this.selectedUser 
      ? this.adminService.updateUser(this.selectedUser.id, userData)
      : this.adminService.createUser(userData);
      
    request.subscribe({
      next: () => {
        this.loadUsers();
        this.closeUserForm();
        this.snackBar.open('User saved successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Error saving user:', error);
        this.snackBar.open('Error saving user: ' + (error.error?.message || error.message || 'Please try again.'), 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
  
  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.adminService.deleteUser(id).subscribe({
        next: () => this.loadUsers(),
        error: (error) => console.error('Error deleting user:', error)
      });
    }
  }
  
  closeUserForm() {
    this.showUserForm = false;
    this.selectedUser = null;
  }
  
  // Settings management
  openSettingForm(setting?: any) {
    this.showSettingForm = true;
    if (setting) {
      this.settingForm = { 
        key: setting.settingKey || setting.key,
        value: setting.settingValue || setting.value,
        category: setting.category || 'GENERAL'
      };
    } else {
      this.settingForm = {
        key: '',
        value: '',
        category: 'GENERAL'
      };
    }
  }
  
  saveSetting() {
    this.adminService.createSetting(this.settingForm).subscribe({
      next: () => {
        this.loadSettings();
        this.closeSettingForm();
        this.snackBar.open('Setting saved successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Error saving setting:', error);
        this.snackBar.open('Error saving setting. Please try again.', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
  
  deleteSetting(key: string) {
    if (confirm('Are you sure you want to delete this setting?')) {
      this.adminService.deleteSetting(key).subscribe({
        next: () => this.loadSettings(),
        error: (error) => console.error('Error deleting setting:', error)
      });
    }
  }
  
  closeSettingForm() {
    this.showSettingForm = false;
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }
}