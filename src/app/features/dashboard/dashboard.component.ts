import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlanService } from '../../core/services/plan.service';
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

  plans = signal<Plan[]>(this.planService.getPlans());
  searchQuery = signal('');
  showCreateDrawer = signal(false);

  filteredPlans = () => {
    const q = this.searchQuery().toLowerCase();
    return this.plans().filter(p => p.clientName.toLowerCase().includes(q));
  };

  onPlanCreated(plan: Plan): void {
    this.plans.set(this.planService.getPlans());
    this.showCreateDrawer.set(false);
  }
}
