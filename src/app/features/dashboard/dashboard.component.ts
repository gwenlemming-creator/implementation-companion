import { Component, inject, signal, computed, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlanService } from '../../core/services/plan.service';
import { AuthService } from '../../core/services/auth.service';
import { Plan } from '../../core/models/plan.model';
import { PlanCardComponent } from './components/plan-card/plan-card.component';
import { CreatePlanDrawerComponent } from './components/create-plan-drawer/create-plan-drawer.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, PlanCardComponent, CreatePlanDrawerComponent],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  private planService = inject(PlanService);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    effect(() => {
      if (this.authService.isWsm()) {
        const plans = this.planService.getPlans();
        if (plans.length > 0) {
          this.router.navigate(['/plans', plans[0].id], { replaceUrl: true });
        }
      }
    });
  }

  plans = signal<Plan[]>(this.planService.getPlans());
  searchQuery = signal('');
  showCreateDrawer = signal(false);

  totalPlans     = computed(() => this.plans().length);
  inProgress     = computed(() => this.plans().filter(p => p.status === 'in_progress').length);
  completed      = computed(() => this.plans().filter(p => p.status === 'complete').length);
  notStarted     = computed(() => this.plans().filter(p => p.status === 'not_started').length);

  filteredPlans = () => {
    const q = this.searchQuery().toLowerCase();
    return this.plans().filter(p => p.clientName.toLowerCase().includes(q));
  };

  onPlanCreated(plan: Plan): void {
    this.plans.set(this.planService.getPlans());
    this.showCreateDrawer.set(false);
  }
}
