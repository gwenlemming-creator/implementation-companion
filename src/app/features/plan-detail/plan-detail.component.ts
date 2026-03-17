import { Component, inject, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { PlanService } from '../../core/services/plan.service';
import { computeSpConfigComplete } from '../../core/models/plan.model';
import { SectionNavComponent } from './components/section-nav/section-nav.component';
import { SpConfigComponent } from './components/sp-config/sp-config.component';
import { EditPlanDrawerComponent } from './components/edit-plan-drawer/edit-plan-drawer.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-plan-detail',
  standalone: true,
  imports: [SectionNavComponent, SpConfigComponent, EditPlanDrawerComponent, StatusBadgeComponent, RouterOutlet, RouterLink],
  templateUrl: './plan-detail.component.html'
})
export class PlanDetailComponent {
  private route = inject(ActivatedRoute);
  private planService = inject(PlanService);

  planId = this.route.snapshot.paramMap.get('id')!;
  plan = computed(() => this.planService.getPlan(this.planId));
  showEditDrawer = signal(false);

  spConfigFilledCount = computed(() => {
    const c = this.plan()?.spConfig;
    if (!c) return 0;
    return [c.employer, c.wcPolicy, c.billingTemplate, c.glTemplate,
            c.billingFormat, c.achDetailType, c.payrollRep, c.statusDate,
            c.payCode1, c.payCode2, c.payCode3].filter(Boolean).length;
  });

  spConfigComplete = computed(() =>
    !!this.plan() && computeSpConfigComplete(this.plan()!.spConfig)
  );
}
