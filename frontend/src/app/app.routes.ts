import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { JobsComponent } from './components/jobs/jobs.component';
import { TestComponent } from './components/test/test.component';
import { RegisterComponent } from './components/register/register.component';
import { RecruiterComponent } from './components/recruiter/recruiter.component';
import { ApplicantDashboardComponent } from './components/applicant-dashboard/applicant-dashboard.component';
import { HrDashboardComponent } from './components/hr-dashboard/hr-dashboard.component';
import { MainDashboardComponent } from './components/main-dashboard/main-dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { GuestGuard } from './guards/guest.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [GuestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [GuestGuard] },
  { path: 'forgot-password', component: ForgotPasswordComponent, canActivate: [GuestGuard] },
  { 
    path: 'applicant-dashboard', 
    component: ApplicantDashboardComponent, 
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['CANDIDATE'] }
  },
  { 
    path: 'hr-dashboard', 
    component: HrDashboardComponent, 
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['HR_ADMIN', 'RECRUITER', 'HIRING_MANAGER'] },
    children: [
      { path: '', redirectTo: 'jobs', pathMatch: 'full' },
      { path: 'jobs', component: HrDashboardComponent },
      { path: 'applications', component: HrDashboardComponent },
      { path: 'analytics', component: HrDashboardComponent },
      { path: 'interviews', component: HrDashboardComponent },
      { path: 'offers', component: HrDashboardComponent }
    ]
  },
  { 
    path: 'system-admin-dashboard', 
    component: AdminDashboardComponent, 
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['SYSTEM_ADMIN'] }
  },
  { 
    path: 'system-admin-dashboard/user', 
    component: AdminDashboardComponent, 
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['SYSTEM_ADMIN'] }
  },
  { 
    path: 'system-admin-dashboard/job', 
    component: AdminDashboardComponent, 
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['SYSTEM_ADMIN'] }
  },
  { 
    path: 'system-admin-dashboard/application', 
    component: AdminDashboardComponent, 
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['SYSTEM_ADMIN'] }
  },
  { 
    path: 'system-admin-dashboard/setting', 
    component: AdminDashboardComponent, 
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['SYSTEM_ADMIN'] }
  },
  { 
    path: 'profile', 
    component: ProfileComponent, 
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'info', pathMatch: 'full' },
      { path: 'info', component: ProfileComponent },
      { path: 'application', component: ProfileComponent }
    ]
  },
  { 
    path: 'jobs', 
    component: JobsComponent, 
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'browse', pathMatch: 'full' },
      { path: 'browse', component: JobsComponent },
      { path: 'saved', component: JobsComponent },
      { path: 'applied', component: JobsComponent }
    ]
  },
  { 
    path: 'settings', 
    component: SettingsComponent, 
    canActivate: [AuthGuard]
  },
  { path: 'test', component: TestComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/login' }
  // { path: 'main-dashboard', component: MainDashboardComponent, canActivate: [AuthGuard] }
];
