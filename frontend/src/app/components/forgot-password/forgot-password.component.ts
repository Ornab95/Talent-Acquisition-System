import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PasswordResetService } from '../../services/password-reset.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email = '';
  code = '';
  newPassword = '';
  confirmPassword = '';
  loading = false;
  message = '';
  error = '';
  isDarkMode = false;
  step = 1; // 1: email, 2: code + password

  constructor(
    private passwordResetService: PasswordResetService,
    private router: Router,
    private themeService: ThemeService
  ) {
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }

  onSubmit() {
    if (this.step === 1) {
      this.sendCode();
    } else {
      this.resetPassword();
    }
  }

  sendCode() {
    if (!this.email) {
      this.error = 'Please enter your email address';
      return;
    }

    this.loading = true;
    this.error = '';
    this.message = '';

    this.passwordResetService.initiatePasswordReset(this.email).subscribe({
      next: (response) => {
        this.loading = false;
        this.step = 2;
        this.message = 'Verification code sent to your email!';
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.error || 'Failed to send verification code';
      }
    });
  }

  resetPassword() {
    if (!this.code || !this.newPassword || !this.confirmPassword) {
      this.error = 'Please fill all fields';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    if (this.newPassword.length < 6) {
      this.error = 'Password must be at least 6 characters';
      return;
    }

    this.loading = true;
    this.error = '';
    this.message = '';

    this.passwordResetService.resetPassword(this.code, this.newPassword).subscribe({
      next: (response) => {
        this.loading = false;
        this.message = 'Password reset successfully! You can now login.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.error || 'Failed to reset password';
      }
    });
  }

  goBack() {
    this.step = 1;
    this.code = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.error = '';
    this.message = '';
  }
}