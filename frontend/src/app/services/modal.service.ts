import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private passwordModalSubject = new Subject<boolean>();
  
  passwordModal$ = this.passwordModalSubject.asObservable();
  
  openPasswordModal() {
    this.passwordModalSubject.next(true);
  }
}