import { Component, input, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgStyle } from '@angular/common';
import { Plan, computeSpConfigComplete } from '../../../../core/models/plan.model';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-plan-card',
  standalone: true,
  imports: [RouterLink, NgStyle, StatusBadgeComponent],
  templateUrl: './plan-card.component.html'
})
export class PlanCardComponent {
  plan = input.required<Plan>();

  progressPct = computed(() => {
    const sections = this.plan().sections.filter(s => s.enabled);
    if (!sections.length) return 0;
    const complete = sections.filter(s => s.status === 'complete').length;
    return Math.round((complete / sections.length) * 100);
  });

  nextAction = computed(() => {
    const p = this.plan();
    if (!computeSpConfigComplete(p.spConfig)) {
      const remaining = 11 - this.spConfigFilledCount();
      return `SP configuration incomplete — ${remaining} field${remaining !== 1 ? 's' : ''} remaining`;
    }
    const next = p.sections.find(s => s.enabled && s.status !== 'complete');
    if (next) return `Worksite manager has not submitted ${next.title}`;
    return 'All sections complete — ready for PrismHR sync';
  });

  spConfigFilledCount = computed(() => {
    const c = this.plan().spConfig;
    return [c.employer, c.wcPolicy, c.billingTemplate, c.glTemplate,
            c.billingFormat, c.achDetailType, c.payrollRep, c.statusDate,
            c.payCode1, c.payCode2, c.payCode3].filter(Boolean).length;
  });

  enabledModules = computed(() => {
    const m = this.plan().modules;
    const labels: string[] = [];
    if (m.timeOff)   labels.push('Time Off');
    if (m.benefits)  labels.push('Benefits');
    if (m.orgLevels) labels.push('Org Levels');
    return labels.join(', ') || 'Core only';
  });
}
