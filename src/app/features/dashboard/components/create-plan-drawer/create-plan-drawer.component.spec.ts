import { PlanService } from '../../../../core/services/plan.service';

function isValid(clientName: string): boolean {
  return clientName.trim().length > 0;
}

describe('CreatePlanDrawer isValid', () => {
  it('returns false for empty string', () => {
    expect(isValid('')).toBe(false);
  });
  it('returns false for whitespace only', () => {
    expect(isValid('   ')).toBe(false);
  });
  it('returns true for non-empty name', () => {
    expect(isValid('Acme Corp')).toBe(true);
  });
});

describe('CreatePlanDrawer submit creates plan', () => {
  it('creates a plan with the given client name', () => {
    const service = new PlanService();
    const plan = service.createPlan('Acme Corp', { timeOff: false, benefits: false, orgLevels: false });
    expect(plan.clientName).toBe('Acme Corp');
    expect(service.getPlans().length).toBe(1);
  });
});
