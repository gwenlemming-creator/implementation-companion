import { Component, inject, computed, signal, effect } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { PlanService } from '../../core/services/plan.service';
import { computeSpConfigComplete } from '../../core/models/plan.model';
import { AuthService } from '../../core/services/auth.service';
import { SectionNavComponent } from './components/section-nav/section-nav.component';
import { EditPlanDrawerComponent } from './components/edit-plan-drawer/edit-plan-drawer.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ProgressBannerComponent } from '../../shared/components/progress-banner/progress-banner.component';
import { CompletionScreenComponent } from '../../shared/components/completion-screen/completion-screen.component';

@Component({
  selector: 'app-plan-detail',
  standalone: true,
  imports: [SectionNavComponent, EditPlanDrawerComponent, StatusBadgeComponent, RouterOutlet, RouterLink, ProgressBannerComponent, CompletionScreenComponent],
  templateUrl: './plan-detail.component.html'
})
export class PlanDetailComponent {
  private route = inject(ActivatedRoute);
  private planService = inject(PlanService);
  private authService = inject(AuthService);
  private router = inject(Router);

  planId = this.route.snapshot.paramMap.get('id')!;
  plan = computed(() => this.planService.getPlan(this.planId));
  showEditDrawer = signal(false);

  isWsm = this.authService.isWsm;

  // Track the currently active section slug from the child route
  currentSlug = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.route.firstChild?.snapshot.paramMap.get('sectionSlug') ?? null)
    ),
    { initialValue: this.route.firstChild?.snapshot.paramMap.get('sectionSlug') ?? null }
  );

  showCompletion = computed(() => {
    const p = this.plan();
    if (!p) return false;
    return p.sections.every(s => s.status === 'complete') && !this.currentSlug();
  });

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

  constructor() {
    // Auto-redirect WSM to first incomplete section on plan load
    effect(() => {
      if (!this.isWsm()) return;
      const p = this.plan();
      if (!p) return;
      const slug = this.currentSlug();
      if (slug) return; // already on a section
      const firstIncomplete = [...p.sections]
        .sort((a, b) => a.order - b.order)
        .find(s => s.status !== 'complete');
      if (firstIncomplete) {
        this.router.navigate(['/plans', this.planId, 'sections', firstIncomplete.slug], { replaceUrl: true });
      }
    });
  }
}
