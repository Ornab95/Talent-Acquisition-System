import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  isDarkMode = false;
  userDetails: any = {};
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private http: HttpClient
  ) {
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }

  ngOnInit() {
    this.loadUserDetails();
  }

  loadUserDetails() {
    const user = localStorage.getItem('user');
    if (user) {
      this.userDetails = JSON.parse(user);
    }
  }

  changePassword() {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    
    if (!this.passwordForm.currentPassword || !this.passwordForm.newPassword) {
      alert('Please fill in all password fields!');
      return;
    }
    
    const token = this.authService.getToken();
    const passwordData = {
      currentPassword: this.passwordForm.currentPassword,
      newPassword: this.passwordForm.newPassword
    };
    
    this.http.put(`http://localhost:8080/api/users/${this.userDetails.id}/change-password`, passwordData, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (response: any) => {
        alert('Password changed successfully!');
        this.passwordForm = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
      },
      error: (error) => {
        console.error('Error changing password:', error);
        alert('Error changing password. Please check your current password.');
      }
    });
  }
}