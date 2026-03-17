import { Component, input, output } from '@angular/core';
import { Plan } from '../../../../core/models/plan.model';
@Component({ selector: 'app-edit-plan-drawer', standalone: true, template: '' })
export class EditPlanDrawerComponent {
  plan = input.required<Plan>();
  closed = output<void>();
}
