import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Offer, OfferService, OfferRequest } from '../../services/offer.service';

@Component({
  selector: 'app-offer-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './offer-management.component.html',
  styleUrl: './offer-management.component.css'
})
export class OfferManagementComponent implements OnInit {
  @Input() applicationId!: number;
  @Input() candidateName!: string;
  @Input() jobTitle!: string;
  
  offers: Offer[] = [];
  showCreateForm = false;
  
  offerForm: OfferRequest = {
    applicationId: 0,
    salary: 0,
    positionTitle: '',
    startDate: '',
    offerExpiryDate: '',
    benefits: '',
    terms: ''
  };
  
  loading = false;
  error = '';

  constructor(private offerService: OfferService) {}

  ngOnInit() {
    this.loadOffers();
  }

  loadOffers() {
    this.offerService.getOffersByApplication(this.applicationId).subscribe({
      next: (offers) => {
        this.offers = offers;
      },
      error: (error) => {
        this.error = 'Failed to load offers';
      }
    });
  }

  openCreateForm() {
    this.offerForm.applicationId = this.applicationId;
    this.offerForm.positionTitle = this.jobTitle;
    this.showCreateForm = true;
  }

  closeCreateForm() {
    this.showCreateForm = false;
    this.resetForm();
  }

  createOffer() {
    if (!this.offerForm.salary || !this.offerForm.startDate || !this.offerForm.offerExpiryDate) {
      this.error = 'Please fill all required fields';
      return;
    }

    this.loading = true;
    this.offerService.createOffer(this.offerForm).subscribe({
      next: (offer) => {
        this.offers.push(offer);
        this.closeCreateForm();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to create offer';
        this.loading = false;
      }
    });
  }

  updateOfferStatus(offer: Offer, status: string) {
    this.offerService.updateOfferStatus(offer.id!, status).subscribe({
      next: (updatedOffer) => {
        const index = this.offers.findIndex(o => o.id === updatedOffer.id);
        if (index !== -1) {
          this.offers[index] = updatedOffer;
        }
      },
      error: (error) => {
        this.error = 'Failed to update offer status';
      }
    });
  }

  deleteOffer(offerId: number) {
    if (confirm('Are you sure you want to delete this offer?')) {
      this.offerService.deleteOffer(offerId).subscribe({
        next: () => {
          this.offers = this.offers.filter(o => o.id !== offerId);
        },
        error: (error) => {
          this.error = 'Failed to delete offer';
        }
      });
    }
  }

  private resetForm() {
    this.offerForm = {
      applicationId: this.applicationId,
      salary: 0,
      positionTitle: this.jobTitle,
      startDate: '',
      offerExpiryDate: '',
      benefits: '',
      terms: ''
    };
    this.error = '';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'ACCEPTED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'EXPIRED': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }
}