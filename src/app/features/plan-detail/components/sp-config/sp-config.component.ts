import { Component, inject, computed, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlanService } from '../../../../core/services/plan.service';
import { SpConfig, computeSpConfigComplete } from '../../../../core/models/plan.model';
import { BillingRulesTableComponent } from './components/billing-rules-table/billing-rules-table.component';
import { SutaBillingTableComponent } from './components/suta-billing-table/suta-billing-table.component';

@Component({
  selector: 'app-sp-config',
  standalone: true,
  imports: [FormsModule, BillingRulesTableComponent, SutaBillingTableComponent],
  templateUrl: './sp-config.component.html'
})
export class SpConfigComponent {
  private route = inject(ActivatedRoute);
  private planService = inject(PlanService);
  planId = this.route.snapshot.parent?.paramMap.get('id') ?? this.route.snapshot.paramMap.get('id')!;

  plan = computed(() => this.planService.getPlan(this.planId));
  draft = signal<Partial<SpConfig>>({});
  collapsed = signal(false);
  saved = signal(false);

  config = computed(() => ({ ...this.plan()?.spConfig, ...this.draft() } as SpConfig));

  filledCount = computed(() => {
    const c = this.config();
    return [c.employer, c.wcPolicy, c.billingTemplate, c.glTemplate,
            c.billingFormat, c.achDetailType, c.payrollRep, c.statusDate,
            c.payCode1, c.payCode2, c.payCode3].filter(Boolean).length;
  });

  isComplete = computed(() => computeSpConfigComplete(this.config()));

  updateField(field: keyof SpConfig, value: unknown): void {
    this.draft.update(d => ({ ...d, [field]: value }));
    this.saved.set(false);
  }

  saveConfig(): void {
    this.planService.updateSpConfig(this.planId, {
      ...this.config(),
      savedAt: new Date().toISOString()
    });
    this.draft.set({});
    this.saved.set(true);
    if (this.isComplete()) this.collapsed.set(true);
  }
}
