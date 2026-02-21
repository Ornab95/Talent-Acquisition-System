import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isDarkMode = false;
  isAuthenticated = false;
  userName = '';
  userProfilePicture = '';
  showProfileMenu = false;
  showNotifications = false;
  notifications: any[] = [];
  unreadCount = 0;
  private notificationSubscription?: Subscription;

  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
    
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
      this.userName = user ? `${user.firstName} ${user.lastName}` : 'User';
      this.userProfilePicture = (user as any)?.profilePicture || '';
      // Ensure profile picture URL is complete
      if (this.userProfilePicture && !this.userProfilePicture.startsWith('http')) {
        this.userProfilePicture = `http://localhost:8080${this.userProfilePicture}`;
      }
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'CANDIDATE') {
      this.loadNotifications();
      this.notificationSubscription = interval(30000).subscribe(() => {
        this.loadNotifications();
      });
    }
  }

  ngOnDestroy(): void {
    this.notificationSubscription?.unsubscribe();
  }

  loadNotifications(): void {
    this.notificationService.getMyNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.unreadCount = notifications.filter(n => !n.read).length;
      },
      error: (error) => console.error('Error loading notifications:', error)
    });
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.showProfileMenu = false;
    }
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
    if (this.showProfileMenu) {
      this.showNotifications = false;
    }
  }

  markAsRead(notification: any): void {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          notification.read = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        },
        error: (error) => console.error('Error marking notification as read:', error)
      });
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.read = true);
        this.unreadCount = 0;
      },
      error: (error) => console.error('Error marking all as read:', error)
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const profileButton = target.closest('.profile-dropdown');
    const notificationButton = target.closest('.notification-dropdown');
    
    if (!profileButton && this.showProfileMenu) {
      this.showProfileMenu = false;
    }
    if (!notificationButton && this.showNotifications) {
      this.showNotifications = false;
    }
  }

  openProfile(): void {
    console.log('Profile clicked - navigating to /profile');
    this.showProfileMenu = false;
    this.router.navigate(['/profile']).then(success => {
      console.log('Navigation result:', success);
    }).catch(error => {
      console.error('Navigation error:', error);
    });
  }



  goHome(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role;
    
    switch(role) {
      case 'SYSTEM_ADMIN':
        this.router.navigate(['/system-admin-dashboard']);
        break;
      case 'HR_ADMIN':
      case 'RECRUITER':
      case 'HIRING_MANAGER':
        this.router.navigate(['/hr-dashboard']);
        break;
      case 'CANDIDATE':
        this.router.navigate(['/applicant-dashboard']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}