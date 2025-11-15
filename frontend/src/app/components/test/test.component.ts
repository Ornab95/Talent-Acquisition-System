import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8">
      <h1 class="text-2xl font-bold mb-4">API Test</h1>
      <button (click)="testAPI()" class="bg-blue-500 text-white px-4 py-2 rounded mr-2">Test Backend</button>
      <button (click)="testLogin()" class="bg-green-500 text-white px-4 py-2 rounded">Test Login</button>
      
      <div class="mt-4">
        <h2 class="text-lg font-semibold">Results:</h2>
        <pre class="bg-gray-100 p-4 rounded mt-2">{{ result | json }}</pre>
      </div>
    </div>
  `
})
export class TestComponent {
  result: any = {};

  constructor(private http: HttpClient) {}

  testAPI() {
    this.http.get('http://localhost:8080/api/test/count').subscribe({
      next: (data) => {
        this.result = { success: true, data };
        console.log('API Test Success:', data);
      },
      error: (err) => {
        this.result = { success: false, error: err };
        console.error('API Test Error:', err);
      }
    });
  }

  testLogin() {
    // Remove hardcoded credentials for security
    this.result = { success: false, error: 'Test login disabled for security' };
  }
}