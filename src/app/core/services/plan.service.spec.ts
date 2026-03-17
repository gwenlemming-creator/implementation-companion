import { PlanService } from './plan.service';

describe('PlanService', () => {
  let service: PlanService;

  beforeEach(() => {
    service = new PlanService();
  });

  it('createPlan returns a plan with correct clientName', () => {
    const plan = service.createPlan('Acme Corp', { timeOff: false, benefits: false, orgLevels: false });
    expect(plan.clientName).toBe('Acme Corp');
  });

  it('createPlan generates unique ids', () => {
    const a = service.createPlan('A', { timeOff: false, benefits: false, orgLevels: false });
    const b = service.createPlan('B', { timeOff: false, benefits: false, orgLevels: false });
    expect(a.id).not.toBe(b.id);
  });

  it('getPlans returns all created plans', () => {
    service.createPlan('X', { timeOff: false, benefits: false, orgLevels: false });
    service.createPlan('Y', { timeOff: false, benefits: false, orgLevels: false });
    expect(service.getPlans().length).toBeGreaterThanOrEqual(2);
  });

  it('getPlan returns the correct plan by id', () => {
    const created = service.createPlan('Acme', { timeOff: false, benefits: false, orgLevels: false });
    const fetched = service.getPlan(created.id);
    expect(fetched?.id).toBe(created.id);
  });

  it('getPlan returns undefined for unknown id', () => {
    expect(service.getPlan('nonexistent')).toBeUndefined();
  });

  it('updatePlan mutates the stored plan', () => {
    const plan = service.createPlan('Old', { timeOff: false, benefits: false, orgLevels: false });
    service.updatePlan(plan.id, { clientName: 'New' });
    expect(service.getPlan(plan.id)?.clientName).toBe('New');
  });

  it('updateSection mutates section status', () => {
    const plan = service.createPlan('Acme', { timeOff: false, benefits: false, orgLevels: false });
    const slug = plan.sections[0].slug;
    service.updateSection(plan.id, slug, { status: 'in_progress' });
    expect(service.getPlan(plan.id)?.sections[0].status).toBe('in_progress');
  });

  it('getPlans returns a copy, not the internal array', () => {
    service.createPlan('A', { timeOff: false, benefits: false, orgLevels: false });
    const plans1 = service.getPlans();
    plans1.push({} as any);
    expect(service.getPlans().length).toBe(1);
  });

  it('toggleModule re-enable restores prior section data rather than creating a new default', () => {
    const plan = service.createPlan('Acme', { timeOff: false, benefits: true, orgLevels: false });
    const benefitsSlug = 'benefits';
    service.updateSection(plan.id, benefitsSlug, { status: 'in_progress' });
    // Disable benefits
    service.toggleModule(plan.id, 'benefits', false);
    expect(service.getPlan(plan.id)?.sections.find(s => s.slug === benefitsSlug)).toBeUndefined();
    // Re-enable benefits — prior status should be restored
    service.toggleModule(plan.id, 'benefits', true);
    const restored = service.getPlan(plan.id)?.sections.find(s => s.slug === benefitsSlug);
    expect(restored?.status).toBe('in_progress');
  });
});
