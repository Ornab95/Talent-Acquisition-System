import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { provideAnimations } from '@angular/platform-browser/animations';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';

import { routes } from './app.routes';

function authInterceptor(req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  // Sanitize URL for logging
  const sanitizedUrl = req.url.replace(/[\r\n\t]/g, '');
  console.log('Auth Interceptor - URL:', sanitizedUrl);
  console.log('Auth Interceptor - Token:', token ? 'Present' : 'Not found');
  
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Auth Interceptor - Added Authorization header');
    return next(authReq);
  }
  
  console.log('Auth Interceptor - No token, proceeding without Authorization header');
  return next(req);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations()
  ]
};
