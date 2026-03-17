import { Component, output } from '@angular/core';
import { Plan } from '../../../../core/models/plan.model';

@Component({
  selector: 'app-create-plan-drawer',
  standalone: true,
  template: ''
})
export class CreatePlanDrawerComponent {
  planCreated = output<Plan>();
  closed = output<void>();
}
