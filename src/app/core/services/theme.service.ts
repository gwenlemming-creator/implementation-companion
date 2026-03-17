import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  applyTheme(primaryColor = '#0f5cf5'): void {
    document.documentElement.style.setProperty('--primary', primaryColor);
  }
}
