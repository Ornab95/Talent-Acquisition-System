import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService, AnalyticsData } from '../../services/analytics.service';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics-dashboard.component.html',
  styleUrl: './analytics-dashboard.component.css'
})
export class AnalyticsDashboardComponent implements OnInit {
  analytics: AnalyticsData | null = null;
  loading = false;
  error = '';

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit() {
    this.loadAnalytics();
  }

  loadAnalytics() {
    this.loading = true;
    this.analyticsService.getAnalytics().subscribe({
      next: (data) => {
        this.analytics = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load analytics data';
        this.loading = false;
      }
    });
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'APPLIED': 'bg-blue-500',
      'REVIEWED': 'bg-yellow-500',
      'SHORTLISTED': 'bg-green-500',
      'REJECTED': 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  }

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }

  getObjectValues(obj: any): number[] {
    return Object.values(obj || {});
  }

  getMaxValue(obj: any): number {
    const values = this.getObjectValues(obj);
    return Math.max(...values, 1);
  }

  getPercentage(value: number, max: number): number {
    return (value / max) * 100;
  }
}