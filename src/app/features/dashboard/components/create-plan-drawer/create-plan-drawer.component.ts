import { Component, inject, signal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Plan } from '../../../../core/models/plan.model';
import { PlanService } from '../../../../core/services/plan.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-plan-drawer',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-plan-drawer.component.html'
})
export class CreatePlanDrawerComponent {
  private planService = inject(PlanService);
  private router = inject(Router);

  planCreated = output<Plan>();
  closed = output<void>();

  clientName = signal('');
  modules = signal({ timeOff: false, benefits: false, orgLevels: false });

  get isValid(): boolean { return this.clientName().trim().length > 0; }

  toggleModule(key: keyof typeof this.modules, value: boolean): void {
    this.modules.update(m => ({ ...m, [key]: value }));
  }

  submit(): void {
    if (!this.isValid) return;
    const plan = this.planService.createPlan(this.clientName().trim(), this.modules());
    this.planCreated.emit(plan);
    this.router.navigate(['/plans', plan.id]);
  }
}
