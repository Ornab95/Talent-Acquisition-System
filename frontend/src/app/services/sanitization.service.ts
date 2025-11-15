import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SanitizationService {

  sanitizeInput(input: string): string {
    if (!input) return '';
    
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim();
  }

  sanitizeFileName(fileName: string): boolean {
    if (!fileName) return false;
    
    // Check for dangerous patterns
    const dangerousPatterns = [
      /\.\./,  // Directory traversal
      /[<>:"|?*]/,  // Invalid filename characters
      /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i,  // Windows reserved names
      /^\./,  // Hidden files
      /\.(exe|bat|cmd|scr|pif|com)$/i  // Executable files
    ];
    
    return !dangerousPatterns.some(pattern => pattern.test(fileName));
  }

  validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  }

  validateFileSize(file: File, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }
}