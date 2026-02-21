import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Interview, InterviewService, InterviewRequest } from '../../services/interview.service';
import { UserService } from '../../services/user.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-interview-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './interview-management.component.html',
  styleUrl: './interview-management.component.css'
})
export class InterviewManagementComponent implements OnInit {
  @Input() applicationId!: number;
  
  interviews: Interview[] = [];
  interviewers: any[] = [];
  showScheduleForm = false;
  showFeedbackModal = false;
  selectedInterview: Interview | null = null;
  isDarkMode = false;
  
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
    if (!this.scheduleForm.interviewerId || !this.scheduleForm.scheduledAt) {
      this.error = 'Please fill all required fields';
      return;
    }

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


}