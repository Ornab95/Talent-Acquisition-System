import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BrowserDetectionService {

  isChrome(): boolean {
    return navigator.userAgent.includes('Chrome') && !navigator.userAgent.includes('Edge');
  }

  isEdge(): boolean {
    return navigator.userAgent.includes('Edge') || navigator.userAgent.includes('Edg');
  }

  handleChromeSpecificIssues(): void {
    if (this.isChrome()) {
      // Disable Chrome's aggressive caching
      const timestamp = Date.now();
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('_t', timestamp.toString());
      
      if (currentUrl.href !== window.location.href) {
        window.history.replaceState({}, '', currentUrl.href);
      }
    }
  }
}