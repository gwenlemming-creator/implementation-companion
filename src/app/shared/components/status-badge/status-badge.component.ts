import { Component, input, computed } from '@angular/core';
import { PlanStatus, SectionStatus } from '../../../core/models/plan.model';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [NgClass],
  templateUrl: './status-badge.component.html'
})
export class StatusBadgeComponent {
  status = input.required<PlanStatus | SectionStatus>();

  label = computed(() => {
    const map: Record<string, string> = {
      not_started: 'Not Started',
      in_progress: 'In Progress',
      complete: 'Complete'
    };
    return map[this.status()] ?? this.status();
  });

  cssClass = computed(() => `badge badge--${this.status().replace(/_/g, '-')}`);
}
