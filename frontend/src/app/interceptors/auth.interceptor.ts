import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    console.log('Interceptor called for:', req.url);
    const token = this.authService.getToken();
    console.log('Token:', token ? 'Present' : 'Not found');
    
    if (token) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      console.log('Added Authorization header');
      return next.handle(authReq);
    }
    
    console.log('No token, proceeding without Authorization header');
    return next.handle(req);
  }
}