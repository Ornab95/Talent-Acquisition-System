import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkModeSubject = new BehaviorSubject<boolean>(false);
  public isDarkMode$ = this.isDarkModeSubject.asObservable();

  constructor() {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('darkMode');
    const isDark = savedTheme === 'true';
    this.isDarkModeSubject.next(isDark);
  }

  toggleTheme(): void {
    const currentTheme = this.isDarkModeSubject.value;
    const newTheme = !currentTheme;
    this.isDarkModeSubject.next(newTheme);
    localStorage.setItem('darkMode', newTheme.toString());
  }

  get isDarkMode(): boolean {
    return this.isDarkModeSubject.value;
  }
}