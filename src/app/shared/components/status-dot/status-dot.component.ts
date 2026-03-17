import { Component, input, computed } from '@angular/core';
import { SectionStatus } from '../../../core/models/plan.model';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-status-dot',
  standalone: true,
  imports: [NgClass],
  templateUrl: './status-dot.component.html'
})
export class StatusDotComponent {
  status = input.required<SectionStatus>();
  cssClass = computed(() => `dot dot--${this.status().replace(/_/g, '-')}`);
}
