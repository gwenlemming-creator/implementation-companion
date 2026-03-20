import { Component, inject, computed, signal, effect } from '@angular/core';
import { DatePipe } from '@angular/common';
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
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-plan-detail',
  standalone: true,
  imports: [SectionNavComponent, EditPlanDrawerComponent, StatusBadgeComponent, RouterOutlet, RouterLink, ProgressBannerComponent, CompletionScreenComponent, DatePipe, ConfirmDialogComponent],
  templateUrl: './plan-detail.component.html',
  styleUrl: './plan-detail.component.css'
})
export class PlanDetailComponent {
  private route = inject(ActivatedRoute);
  private planService = inject(PlanService);
  private authService = inject(AuthService);
  private router = inject(Router);

  planId = this.route.snapshot.paramMap.get('id')!;
  plan = computed(() => this.planService.getPlan(this.planId));
  showEditDrawer = signal(false);

  readOnly = signal(!!this.route.snapshot.data['readOnly']);

  showCloseConfirm = signal(false);

  canClose = computed(() => {
    const p = this.plan();
    return p?.status === 'complete' && !this.readOnly();
  });

  breadcrumbBase = computed(() =>
    this.readOnly() ? '/completed' : '/plans'
  );

  breadcrumbLabel = computed(() =>
    this.readOnly() ? 'Completed Implementations' : 'Implementation Plans'
  );

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

  closeImplementation(): void {
    // TODO: Replace 'current-sp' with actual authenticated user ID when auth is integrated
    this.planService.closePlan(this.planId, 'current-sp');
    this.router.navigate(['/completed']);
  }

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
