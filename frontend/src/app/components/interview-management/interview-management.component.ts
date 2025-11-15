import { Component, Input, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePicker } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Interview, InterviewService, InterviewRequest } from '../../services/interview.service';
import { UserService } from '../../services/user.service';
import { ThemeService } from '../../services/theme.service';


declare var Datepicker: any;

@Component({
  selector: 'app-interview-management',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePicker],
  templateUrl: './interview-management.component.html',
  styleUrl: './interview-management.component.css'
})
export class InterviewManagementComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() applicationId!: number;
  
  interviews: Interview[] = [];
  interviewers: any[] = [];
  showScheduleForm = false;
  showFeedbackModal = false;
  selectedInterview: Interview | null = null;
  isDarkMode = false;
  rangeDates: Date[] = [];
  minDate: Date = new Date();
  
  scheduleForm: InterviewRequest = {
    applicationId: 0,
    interviewerId: 0,
    scheduledAt: '',
    interviewType: 'VIDEO',
    meetingLink: ''
  };
  
  feedbackText = '';
  loading = false;
  error = '';
  constructor(
    private interviewService: InterviewService,
    private userService: UserService,
    private themeService: ThemeService
  ) {
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }

  ngOnInit() {
    this.loadInterviews();
    this.setCurrentUserAsInterviewer();
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  ngAfterViewInit() {
    // PrimeNG DatePicker handles initialization
  }

  loadInterviews() {
    this.interviewService.getInterviewsByApplication(this.applicationId).subscribe({
      next: (interviews) => {
        this.interviews = interviews;
      },
      error: (error) => {
        this.error = 'Failed to load interviews';
      }
    });
  }

  setCurrentUserAsInterviewer() {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      this.scheduleForm.interviewerId = userData.id;
    }
  }

  getCurrentUserName(): string {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      return `${userData.firstName} ${userData.lastName}`;
    }
    return 'Current User';
  }

  openScheduleForm() {
    this.scheduleForm.applicationId = this.applicationId;
    this.setCurrentUserAsInterviewer();
    this.showScheduleForm = true;
  }

  closeScheduleForm() {
    this.showScheduleForm = false;
    this.resetScheduleForm();
  }

  scheduleInterview() {
    if (!this.scheduleForm.interviewerId || !this.rangeDates || this.rangeDates.length === 0) {
      this.error = 'Please fill all required fields';
      return;
    }

    this.scheduleForm.scheduledAt = this.rangeDates[0].toISOString();

    this.loading = true;
    this.interviewService.scheduleInterview(this.scheduleForm).subscribe({
      next: (interview) => {
        this.interviews.push(interview);
        this.closeScheduleForm();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to schedule interview';
        this.loading = false;
      }
    });
  }

  openFeedbackModal(interview: Interview) {
    this.selectedInterview = interview;
    this.feedbackText = interview.feedback || '';
    this.showFeedbackModal = true;
  }

  closeFeedbackModal() {
    this.showFeedbackModal = false;
    this.selectedInterview = null;
    this.feedbackText = '';
  }

  submitFeedback() {
    if (!this.selectedInterview || !this.feedbackText.trim()) {
      this.error = 'Please enter feedback';
      return;
    }

    this.loading = true;
    this.interviewService.updateFeedback(this.selectedInterview.id!, this.feedbackText).subscribe({
      next: (updatedInterview) => {
        const index = this.interviews.findIndex(i => i.id === updatedInterview.id);
        if (index !== -1) {
          this.interviews[index] = updatedInterview;
        }
        this.closeFeedbackModal();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to update feedback';
        this.loading = false;
      }
    });
  }

  updateStatus(interview: Interview, status: string) {
    this.interviewService.updateStatus(interview.id!, status).subscribe({
      next: (updatedInterview) => {
        const index = this.interviews.findIndex(i => i.id === updatedInterview.id);
        if (index !== -1) {
          this.interviews[index] = updatedInterview;
        }
      },
      error: (error) => {
        this.error = 'Failed to update status';
      }
    });
  }

  private resetScheduleForm() {
    this.scheduleForm = {
      applicationId: this.applicationId,
      interviewerId: 0,
      scheduledAt: '',
      interviewType: 'VIDEO',
      meetingLink: ''
    };
    this.rangeDates = [];
    this.setCurrentUserAsInterviewer();
    this.error = '';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getCurrentDateTime(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }

  focusDateInput() {
    const dateInput = document.querySelector('input[type="datetime-local"]') as HTMLInputElement;
    if (dateInput) {
      dateInput.focus();
      dateInput.showPicker?.();
    }
  }

  onDateTimeInput(event: any) {
    const value = event.target.value;
    const parsedDate = this.parseCustomDateFormat(value);
    if (parsedDate) {
      this.scheduleForm.scheduledAt = parsedDate;
    }
  }

  onDateFocus() {
    // Add focus styling or behavior if needed
  }

  onDateBlur() {
    // Validate the selected date/time
    if (this.scheduleForm.scheduledAt) {
      const selectedDate = new Date(this.scheduleForm.scheduledAt);
      const now = new Date();
      
      if (selectedDate <= now) {
        this.error = 'Please select a future date and time for the interview';
      } else {
        this.error = '';
      }
    }
  }

  formatSelectedDateTime(): string {
    if (this.rangeDates && this.rangeDates.length > 0) {
      return this.rangeDates[0].toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return '';
  }

  private parseCustomDateFormat(input: string): string | null {
    // Handle formats like "19-10-2025" or "19-10-2025 14:30"
    const dateTimeRegex = /^(\d{1,2})-(\d{1,2})-(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/;
    const match = input.match(dateTimeRegex);
    
    if (match) {
      const [, day, month, year, hour = '09', minute = '00'] = match;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
      
      if (!isNaN(date.getTime())) {
        // Convert to datetime-local format
        const isoString = date.toISOString();
        return isoString.slice(0, 16); // YYYY-MM-DDTHH:MM
      }
    }
    
    return null;
  }
}