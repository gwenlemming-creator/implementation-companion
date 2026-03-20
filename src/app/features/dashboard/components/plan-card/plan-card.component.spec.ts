import { buildDefaultSections, Plan, computeSpConfigComplete } from '../../../../core/models/plan.model';

function makeEmptySpConfig() {
  return {
    employer: '', wcPolicy: '', billingTemplate: '', glTemplate: '',
    billingFormat: '', achDetailType: '', payrollRep: '', statusDate: null,
    payCode1: '', payCode2: '', payCode3: '',
    billingRules: [], sutaBilling: [], savedAt: null
  };
}

function progressPct(plan: Plan): number {
  const sections = plan.sections.filter(s => s.enabled);
  if (!sections.length) return 0;
  const complete = sections.filter(s => s.status === 'complete').length;
  return Math.round((complete / sections.length) * 100);
}

describe('PlanCard progressPct', () => {
  it('returns 0% when no sections complete', () => {
    const sections = buildDefaultSections({ timeOff: false, benefits: false, orgLevels: false });
    const plan = { sections, spConfig: makeEmptySpConfig() } as unknown as Plan;
    expect(progressPct(plan)).toBe(0);
  });

  it('returns 14% when 1 of 7 sections complete', () => {
    const sections = buildDefaultSections({ timeOff: false, benefits: false, orgLevels: false });
    sections[0] = { ...sections[0], status: 'complete' };
    const plan = { sections, spConfig: makeEmptySpConfig() } as unknown as Plan;
    expect(progressPct(plan)).toBe(14);
  });

  it('returns 100% when all sections complete', () => {
    const sections = buildDefaultSections({ timeOff: false, benefits: false, orgLevels: false })
      .map(s => ({ ...s, status: 'complete' as const }));
    const plan = { sections, spConfig: makeEmptySpConfig() } as unknown as Plan;
    expect(progressPct(plan)).toBe(100);
  });
});
