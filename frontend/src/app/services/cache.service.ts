import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  clearAllCaches(): Promise<void> {
    return new Promise((resolve) => {
      // Chrome-specific cache clearing
      if ('caches' in window) {
        caches.keys().then(keys => {
          Promise.all(keys.map(key => caches.delete(key)))
            .then(() => {
              // Force Chrome to clear memory cache
              if (navigator.userAgent.includes('Chrome')) {
                window.location.href = window.location.href + '?t=' + Date.now();
              }
              console.log('All caches cleared');
              resolve();
            });
        });
      } else {
        resolve();
      }
    });
  }

  clearStorage(preserveAuth: boolean = true): void {
    if (typeof Storage !== 'undefined') {
      const token = preserveAuth ? localStorage.getItem('token') : null;
      const user = preserveAuth ? localStorage.getItem('user') : null;
      
      localStorage.clear();
      sessionStorage.clear();
      
      if (preserveAuth && token) localStorage.setItem('token', token);
      if (preserveAuth && user) localStorage.setItem('user', user);
    }
  }

  forceReload(): void {
    if (navigator.userAgent.includes('Chrome')) {
      window.location.href = window.location.href + '?cacheBust=' + Date.now();
    } else {
      window.location.reload();
    }
  }
}