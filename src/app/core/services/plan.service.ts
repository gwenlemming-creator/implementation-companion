import { Injectable } from '@angular/core';
import { Plan, PlanSection, buildDefaultSections, computePlanStatus } from '../models/plan.model';

@Injectable({ providedIn: 'root' })
export class PlanService {
  private plans: Plan[] = [];
  private removedSections: Map<string, PlanSection[]> = new Map();

  constructor() {
    // Only seed when NOT in a test runner
    if (typeof globalThis !== 'undefined' && !(globalThis as any).__vitest_worker__) {
      this.seedDemoData();
    }
  }

  private seedDemoData(): void {
    // --- 1. Completed & Closed: Acme Corp (all modules) ---
    const acme = this.createPlan('Acme Corp', { timeOff: true, benefits: true, orgLevels: false }, 'wsm-jane-smith');
    acme.sections.forEach(s => this.updateSection(acme.id, s.slug, {
      status: 'complete',
      inputMethod: 'manual',
      inputMethodAtCompletion: 'manual',
      completedAt: '2026-02-15T10:00:00Z',
      draftData: { seeded: true },
    }));
    this.updateSpConfig(acme.id, {
      employer: 'Acme Corp', wcPolicy: 'WC-100', billingTemplate: 'Standard',
      glTemplate: 'GL-Default', billingFormat: 'Detail', achDetailType: 'PPD',
      payrollRep: 'Sarah Johnson', statusDate: '2026-02-01',
      payCode1: 'REG', payCode2: 'OT', payCode3: 'HOL',
      billingRules: [{ id: '1', description: 'Admin Fee', rate: 5.5, basedOn: 'Gross Pay' }],
      sutaBilling: [{ id: '1', state: 'CA', effectiveDate: '2026-01-01', billRate: 3.4 }],
      savedAt: '2026-02-14T16:00:00Z',
    });
    this.closePlan(acme.id, 'Sarah Johnson');
    // Backdate closure
    const acmePlan = this.getPlan(acme.id)!;
    acmePlan.closedAt = '2026-02-20T14:30:00Z';
    acmePlan.createdAt = '2026-01-10T09:00:00Z';

    // --- 2. Completed & Closed: Pinnacle Industries (no optional modules) ---
    const pinnacle = this.createPlan('Pinnacle Industries', { timeOff: false, benefits: false, orgLevels: false }, 'wsm-bob-chen');
    pinnacle.sections.forEach(s => this.updateSection(pinnacle.id, s.slug, {
      status: 'complete',
      inputMethod: 'upload',
      inputMethodAtCompletion: 'upload',
      completedAt: '2026-03-01T11:00:00Z',
      draftData: { hasFile: true },
    }));
    this.updateSpConfig(pinnacle.id, {
      employer: 'Pinnacle Industries', wcPolicy: 'WC-205', billingTemplate: 'Premium',
      glTemplate: 'GL-Custom', billingFormat: 'Summary', achDetailType: 'CCD',
      payrollRep: 'Mike Torres', statusDate: '2026-02-15',
      payCode1: 'REG', payCode2: 'OT', payCode3: 'BONUS',
      billingRules: [], sutaBilling: [],
      savedAt: '2026-03-01T09:00:00Z',
    });
    this.closePlan(pinnacle.id, 'Mike Torres');
    const pinnaclePlan = this.getPlan(pinnacle.id)!;
    pinnaclePlan.closedAt = '2026-03-05T10:00:00Z';
    pinnaclePlan.createdAt = '2026-02-01T08:00:00Z';

    // --- 3. Completed & Closed: Redwood Healthcare ---
    const redwood = this.createPlan('Redwood Healthcare', { timeOff: true, benefits: false, orgLevels: true }, 'wsm-lisa-wong');
    redwood.sections.forEach(s => this.updateSection(redwood.id, s.slug, {
      status: 'complete',
      inputMethod: 'manual',
      inputMethodAtCompletion: 'manual',
      completedAt: '2026-03-10T15:00:00Z',
      draftData: { seeded: true },
    }));
    this.updateSpConfig(redwood.id, {
      employer: 'Redwood Healthcare', wcPolicy: 'WC-310', billingTemplate: 'Healthcare',
      glTemplate: 'GL-Medical', billingFormat: 'Detail', achDetailType: 'PPD',
      payrollRep: 'Sarah Johnson', statusDate: '2026-03-01',
      payCode1: 'REG', payCode2: 'OT', payCode3: 'PTO',
      billingRules: [
        { id: '1', description: 'Admin Fee', rate: 4.0, basedOn: 'Gross Pay' },
        { id: '2', description: 'Workers Comp', rate: 2.1, basedOn: 'Gross Pay' },
      ],
      sutaBilling: [
        { id: '1', state: 'OR', effectiveDate: '2026-01-01', billRate: 2.9 },
        { id: '2', state: 'WA', effectiveDate: '2026-01-01', billRate: 3.1 },
      ],
      savedAt: '2026-03-10T14:00:00Z',
    });
    this.closePlan(redwood.id, 'Sarah Johnson');
    const redwoodPlan = this.getPlan(redwood.id)!;
    redwoodPlan.closedAt = '2026-03-12T09:00:00Z';
    redwoodPlan.createdAt = '2026-02-10T10:00:00Z';

    // --- 4. In Progress: Bright Horizons Staffing (most sections done) ---
    const bright = this.createPlan('Bright Horizons Staffing', { timeOff: true, benefits: true, orgLevels: false }, 'wsm-tom-reeves');
    const brightSections = bright.sections;
    // Complete first 5 sections
    brightSections.slice(0, 5).forEach(s => this.updateSection(bright.id, s.slug, {
      status: 'complete',
      inputMethod: 'manual',
      inputMethodAtCompletion: 'manual',
      completedAt: '2026-03-18T10:00:00Z',
      draftData: { seeded: true },
    }));
    // W/C Codes in progress
    this.updateSection(bright.id, 'wc-codes', { status: 'in_progress', inputMethod: 'manual', draftData: { code: 'WC-8810' } });
    // Rest not started
    this.updateSpConfig(bright.id, {
      employer: 'Bright Horizons', wcPolicy: 'WC-450', billingTemplate: 'Standard',
      glTemplate: 'GL-Default', billingFormat: 'Detail', achDetailType: 'PPD',
      payrollRep: 'Mike Torres', statusDate: '2026-03-15',
      payCode1: 'REG', payCode2: 'OT', payCode3: 'HOL',
      billingRules: [], sutaBilling: [],
      savedAt: '2026-03-17T11:00:00Z',
    });
    const brightPlan = this.getPlan(bright.id)!;
    brightPlan.createdAt = '2026-03-10T08:00:00Z';

    // --- 5. In Progress: Summit Construction (early stage) ---
    const summit = this.createPlan('Summit Construction LLC', { timeOff: false, benefits: false, orgLevels: true }, 'wsm-karen-diaz');
    // Only Company Info complete
    this.updateSection(summit.id, 'company-info', {
      status: 'complete',
      inputMethod: 'upload',
      inputMethodAtCompletion: 'upload',
      completedAt: '2026-03-19T09:00:00Z',
      draftData: { hasFile: true },
    });
    // FEIN in progress
    this.updateSection(summit.id, 'fein', { status: 'in_progress', inputMethod: 'manual', draftData: { federalIdNumber: '12-345' } });
    const summitPlan = this.getPlan(summit.id)!;
    summitPlan.createdAt = '2026-03-18T14:00:00Z';

    // --- 6. Not Started: Coastal Logistics ---
    const coastal = this.createPlan('Coastal Logistics', { timeOff: false, benefits: true, orgLevels: false });
    const coastalPlan = this.getPlan(coastal.id)!;
    coastalPlan.createdAt = '2026-03-20T08:00:00Z';

    // --- 7. Complete (ready to close): Maple & Oak Legal ---
    const maple = this.createPlan('Maple & Oak Legal', { timeOff: false, benefits: false, orgLevels: false }, 'wsm-david-park');
    maple.sections.forEach(s => this.updateSection(maple.id, s.slug, {
      status: 'complete',
      inputMethod: 'manual',
      inputMethodAtCompletion: 'manual',
      completedAt: '2026-03-19T16:00:00Z',
      draftData: { seeded: true },
    }));
    this.updateSpConfig(maple.id, {
      employer: 'Maple & Oak Legal', wcPolicy: 'WC-180', billingTemplate: 'Professional',
      glTemplate: 'GL-Legal', billingFormat: 'Summary', achDetailType: 'PPD',
      payrollRep: 'Sarah Johnson', statusDate: '2026-03-15',
      payCode1: 'REG', payCode2: 'OT', payCode3: 'SICK',
      billingRules: [{ id: '1', description: 'Admin Fee', rate: 6.0, basedOn: 'Gross Pay' }],
      sutaBilling: [{ id: '1', state: 'NY', effectiveDate: '2026-01-01', billRate: 4.1 }],
      savedAt: '2026-03-19T15:00:00Z',
    });
    const maplePlan = this.getPlan(maple.id)!;
    maplePlan.createdAt = '2026-03-05T09:00:00Z';
  }

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
