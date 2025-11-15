import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ApplicationService } from '../../services/application.service';

interface PipelineStage {
  id: string;
  title: string;
  applications: any[];
  color: string;
}

@Component({
  selector: 'app-application-pipeline',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './application-pipeline.component.html',
  styleUrl: './application-pipeline.component.css'
})
export class ApplicationPipelineComponent implements OnInit {
  @Input() jobId!: number;
  @Input() jobTitle!: string;

  stages: PipelineStage[] = [
    { id: 'APPLIED', title: 'Applied', applications: [], color: 'bg-blue-100 border-blue-300' },
    { id: 'REVIEWED', title: 'Under Review', applications: [], color: 'bg-yellow-100 border-yellow-300' },
    { id: 'SHORTLISTED', title: 'Shortlisted', applications: [], color: 'bg-green-100 border-green-300' },
    { id: 'INTERVIEW', title: 'Interview', applications: [], color: 'bg-purple-100 border-purple-300' },
    { id: 'REJECTED', title: 'Rejected', applications: [], color: 'bg-red-100 border-red-300' }
  ];

  loading = false;
  error = '';

  constructor(private applicationService: ApplicationService) {}

  ngOnInit() {
    this.loadApplications();
  }

  loadApplications() {
    this.loading = true;
    this.applicationService.getApplicationsByJob(this.jobId).subscribe({
      next: (applications) => {
        this.organizeApplicationsByStage(applications);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load applications';
        this.loading = false;
      }
    });
  }

  organizeApplicationsByStage(applications: any[]) {
    // Clear existing applications
    this.stages.forEach(stage => stage.applications = []);
    
    // Organize applications by status
    applications.forEach(app => {
      const stage = this.stages.find(s => s.id === app.status);
      if (stage) {
        stage.applications.push(app);
      }
    });
  }

  onDrop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      // Reorder within same stage
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Move between stages
      const application = event.previousContainer.data[event.previousIndex];
      const newStatus = this.getStageIdFromContainer(event.container);
      
      // Update application status
      this.updateApplicationStatus(application.id, newStatus);
      
      // Move item in UI
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  private getStageIdFromContainer(container: any): string {
    const stageIndex = parseInt(container.id.split('-')[1]);
    return this.stages[stageIndex].id;
  }

  private updateApplicationStatus(applicationId: number, newStatus: string) {
    this.applicationService.updateApplicationStatus(applicationId, newStatus).subscribe({
      next: () => {
        // Status updated successfully
      },
      error: (error) => {
        console.error('Failed to update status:', error);
        // Reload to revert UI changes
        this.loadApplications();
      }
    });
  }

  getConnectedLists(): string[] {
    return this.stages.map((_, index) => `stage-${index}`);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getApplicationCount(stageId: string): number {
    const stage = this.stages.find(s => s.id === stageId);
    return stage ? stage.applications.length : 0;
  }

  getTotalApplications(): number {
    return this.stages.reduce((total, stage) => total + stage.applications.length, 0);
  }

  getProgressPercentage(stageId: string): number {
    const stageOrder = ['APPLIED', 'REVIEWED', 'SHORTLISTED', 'INTERVIEW', 'REJECTED'];
    const index = stageOrder.indexOf(stageId);
    return index >= 0 ? (index + 1) * 20 : 0;
  }
}