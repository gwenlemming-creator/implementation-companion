import { Injectable, signal, computed } from '@angular/core';
import { UserRole } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private role = signal<UserRole>('service_provider');

  currentRole = this.role.asReadonly();
  isWsm = computed(() => this.role() === 'worksite_manager');

  setRole(role: UserRole): void {
    this.role.set(role);
  }
}
