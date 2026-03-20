import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PlanSection } from '../../../../core/models/plan.model';
import { StatusDotComponent } from '../../../../shared/components/status-dot/status-dot.component';

@Component({
  selector: 'app-section-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, StatusDotComponent],
  templateUrl: './section-nav.component.html'
})
export class SectionNavComponent {
  sections = input.required<PlanSection[]>();
  planId = input.required<string>();
  spConfigComplete = input.required<boolean>();
  spConfigFilledCount = input.required<number>();
  configSelected = output<void>();
  role = input<string>('service_provider');
}
