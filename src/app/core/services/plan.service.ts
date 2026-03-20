import { Injectable } from '@angular/core';
import { Plan, PlanSection, buildDefaultSections, computePlanStatus } from '../models/plan.model';

@Injectable({ providedIn: 'root' })
export class PlanService {
  private plans: Plan[] = [];
  private removedSections: Map<string, PlanSection[]> = new Map();

  createPlan(clientName: string, modules: Plan['modules'], worksiteManagerId: string | null = null): Plan {
    const plan: Plan = {
      id: crypto.randomUUID(),
      clientName,
      status: 'not_started',
      worksiteManagerId,
      modules,
      spConfig: {
        employer: '', wcPolicy: '', billingTemplate: '', glTemplate: '',
        billingFormat: '', achDetailType: '', payrollRep: '', statusDate: null,
        payCode1: '', payCode2: '', payCode3: '',
        billingRules: [], sutaBilling: [], savedAt: null
      },
      sections: buildDefaultSections(modules),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      closedAt: null,
      closedBy: null,
    };
    this.plans.push(plan);
    return plan;
  }

  getPlans(): Plan[] {
    return [...this.plans];
  }

  getPlan(id: string): Plan | undefined {
    return this.plans.find(p => p.id === id);
  }

  updatePlan(id: string, changes: Partial<Omit<Plan, 'id' | 'sections' | 'spConfig'>>): void {
    const plan = this.getPlan(id);
    if (!plan) return;
    Object.assign(plan, changes, { updatedAt: new Date().toISOString() });
    plan.status = computePlanStatus(plan);
  }

  updateSection(planId: string, slug: string, changes: Partial<PlanSection>): void {
    const plan = this.getPlan(planId);
    if (!plan) return;
    const section = plan.sections.find(s => s.slug === slug);
    if (!section) return;
    Object.assign(section, changes);
    plan.status = computePlanStatus(plan);
    plan.updatedAt = new Date().toISOString();
  }

  updateSpConfig(planId: string, config: Partial<Plan['spConfig']>): void {
    const plan = this.getPlan(planId);
    if (!plan) return;
    Object.assign(plan.spConfig, config);
    plan.updatedAt = new Date().toISOString();
  }

  toggleModule(planId: string, module: keyof Plan['modules'], enabled: boolean): void {
    const plan = this.getPlan(planId);
    if (!plan) return;
    plan.modules[module] = enabled;
    const slugMap: Record<keyof Plan['modules'], string> = {
      timeOff: 'time-off', benefits: 'benefits', orgLevels: 'org-levels'
    };
    const slug = slugMap[module];
    if (!enabled) {
      const stash = this.removedSections.get(planId) ?? [];
      const removed = plan.sections.filter(s => s.slug === slug);
      this.removedSections.set(planId, [...stash, ...removed]);
      plan.sections = plan.sections.filter(s => s.slug !== slug);
    } else {
      const stash = this.removedSections.get(planId) ?? [];
      const prior = stash.filter(s => s.slug === slug);
      this.removedSections.set(planId, stash.filter(s => s.slug !== slug));
      if (prior.length > 0) {
        const existing = new Set(plan.sections.map(s => s.slug));
        const toAdd = prior.filter(s => !existing.has(s.slug));
        plan.sections = [...plan.sections, ...toAdd].sort((a, b) => a.order - b.order);
      } else {
        const rebuilt = buildDefaultSections(plan.modules);
        const existing = new Set(plan.sections.map(s => s.slug));
        const toAdd = rebuilt.filter(s => !existing.has(s.slug));
        plan.sections = [...plan.sections, ...toAdd].sort((a, b) => a.order - b.order);
      }
    }
    plan.status = computePlanStatus(plan);
    plan.updatedAt = new Date().toISOString();
  }

  closePlan(id: string, closedByUserId: string): void {
    const plan = this.getPlan(id);
    if (!plan) return;
    if (plan.status !== 'complete') return;
    plan.status = 'closed';
    plan.closedAt = new Date().toISOString();
    plan.closedBy = closedByUserId;
    plan.updatedAt = new Date().toISOString();
  }

  getClosedPlans(): Plan[] {
    return [...this.plans.filter(p => p.status === 'closed')];
  }

  getActivePlans(): Plan[] {
    return [...this.plans.filter(p => p.status !== 'closed')];
  }
}
