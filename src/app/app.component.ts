import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html'
})
export class AppComponent {
  private authService = inject(AuthService);
  currentRole = this.authService.currentRole;

  toggleRole(): void {
    this.authService.setRole(
      this.authService.isWsm() ? 'service_provider' : 'worksite_manager'
    );
  }
}
