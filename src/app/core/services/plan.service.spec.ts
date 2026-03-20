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

  describe('closePlan', () => {
    it('sets status to closed with closedAt and closedBy', () => {
      const plan = service.createPlan('Acme', { timeOff: false, benefits: false, orgLevels: false });
      plan.sections.forEach(s => service.updateSection(plan.id, s.slug, { status: 'complete' }));
      service.closePlan(plan.id, 'sp-user-1');
      const closed = service.getPlan(plan.id);
      expect(closed?.status).toBe('closed');
      expect(closed?.closedAt).toBeTruthy();
      expect(closed?.closedBy).toBe('sp-user-1');
    });

    it('does not close a plan that is not complete', () => {
      const plan = service.createPlan('Acme', { timeOff: false, benefits: false, orgLevels: false });
      service.closePlan(plan.id, 'sp-user-1');
      expect(service.getPlan(plan.id)?.status).toBe('not_started');
    });

    it('does not close an already closed plan', () => {
      const plan = service.createPlan('Acme', { timeOff: false, benefits: false, orgLevels: false });
      plan.sections.forEach(s => service.updateSection(plan.id, s.slug, { status: 'complete' }));
      service.closePlan(plan.id, 'sp-user-1');
      const firstClosedAt = service.getPlan(plan.id)?.closedAt;
      service.closePlan(plan.id, 'sp-user-2');
      expect(service.getPlan(plan.id)?.closedBy).toBe('sp-user-1');
      expect(service.getPlan(plan.id)?.closedAt).toBe(firstClosedAt);
    });
  });

  describe('getClosedPlans', () => {
    it('returns only closed plans', () => {
      const a = service.createPlan('A', { timeOff: false, benefits: false, orgLevels: false });
      service.createPlan('B', { timeOff: false, benefits: false, orgLevels: false });
      a.sections.forEach(s => service.updateSection(a.id, s.slug, { status: 'complete' }));
      service.closePlan(a.id, 'sp-1');
      const closed = service.getClosedPlans();
      expect(closed.length).toBe(1);
      expect(closed[0].clientName).toBe('A');
    });

    it('returns a copy, not the internal array', () => {
      const a = service.createPlan('A', { timeOff: false, benefits: false, orgLevels: false });
      a.sections.forEach(s => service.updateSection(a.id, s.slug, { status: 'complete' }));
      service.closePlan(a.id, 'sp-1');
      const result = service.getClosedPlans();
      result.push({} as any);
      expect(service.getClosedPlans().length).toBe(1);
    });
  });

  describe('getActivePlans', () => {
    it('excludes closed plans', () => {
      const a = service.createPlan('A', { timeOff: false, benefits: false, orgLevels: false });
      service.createPlan('B', { timeOff: false, benefits: false, orgLevels: false });
      a.sections.forEach(s => service.updateSection(a.id, s.slug, { status: 'complete' }));
      service.closePlan(a.id, 'sp-1');
      const active = service.getActivePlans();
      expect(active.length).toBe(1);
      expect(active[0].clientName).toBe('B');
    });
  });
});
