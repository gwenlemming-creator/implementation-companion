import { Component, input, computed } from '@angular/core';
import { PlanSection } from '../../../core/models/plan.model';

@Component({
  selector: 'app-progress-banner',
  standalone: true,
  template: `
    <div class="progress-banner">
      <div class="progress-banner__bar-row">
        <div class="progress-bar-bg progress-banner__bar">
          <div class="progress-bar-fill"
               [class.progress-bar-fill--complete]="pct() === 100"
               [style.width.%]="pct()"></div>
        </div>
        <span class="progress-banner__pct">{{ pct() }}%</span>
      </div>
      <div class="progress-banner__details">
        <span class="progress-banner__count">{{ completeCount() }} of {{ totalCount() }} sections complete</span>
        @if (nextUp()) {
          <span class="progress-banner__next">Next up: <strong>{{ nextUp() }}</strong></span>
        }
      </div>
    </div>
  `
})
export class ProgressBannerComponent {
  sections = input.required<PlanSection[]>();
  currentSlug = input<string | null>(null);

  totalCount = computed(() => this.sections().length);
  completeCount = computed(() => this.sections().filter(s => s.status === 'complete').length);
  pct = computed(() => {
    const t = this.totalCount();
    return t > 0 ? Math.round((this.completeCount() / t) * 100) : 0;
  });

  nextUp = computed(() => {
    const incomplete = this.sections()
      .filter(s => s.status !== 'complete')
      .sort((a, b) => a.order - b.order);
    if (incomplete.length === 0) return null;
    const slug = this.currentSlug();
    if (incomplete.length === 1 && incomplete[0].slug === slug) return null;
    const next = incomplete.find(s => s.slug !== slug) ?? incomplete[0];
    return next.title;
  });
}
