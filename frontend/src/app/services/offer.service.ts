import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Offer {
  id?: number;
  application: any;
  salary: number;
  positionTitle: string;
  startDate: string;
  offerExpiryDate: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  benefits?: string;
  terms?: string;
  createdAt?: string;
  respondedAt?: string;
}

export interface OfferRequest {
  applicationId: number;
  salary: number;
  positionTitle: string;
  startDate: string;
  offerExpiryDate: string;
  benefits?: string;
  terms?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OfferService {
  private apiUrl = 'http://localhost:8080/api/offers';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  createOffer(request: OfferRequest): Observable<Offer> {
    return this.http.post<Offer>(`${this.apiUrl}/create`, request, { headers: this.getHeaders() });
  }

  getOffersByApplication(applicationId: number): Observable<Offer[]> {
    return this.http.get<Offer[]>(`${this.apiUrl}/application/${applicationId}`, { headers: this.getHeaders() });
  }

  getAllOffers(): Observable<Offer[]> {
    return this.http.get<Offer[]>(`${this.apiUrl}/all`, { headers: this.getHeaders() });
  }

  updateOfferStatus(offerId: number, status: string): Observable<Offer> {
    return this.http.put<Offer>(`${this.apiUrl}/${offerId}/status`, status, { headers: this.getHeaders() });
  }

  getOffer(offerId: number): Observable<Offer> {
    return this.http.get<Offer>(`${this.apiUrl}/${offerId}`, { headers: this.getHeaders() });
  }

  deleteOffer(offerId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${offerId}`, { headers: this.getHeaders() });
  }
}