import { SpConfig, computeSpConfigComplete } from '../../../../core/models/plan.model';

function filledCount(config: Partial<SpConfig>): number {
  return [
    config.employer, config.wcPolicy, config.billingTemplate, config.glTemplate,
    config.billingFormat, config.achDetailType, config.payrollRep, config.statusDate,
    config.payCode1, config.payCode2, config.payCode3
  ].filter(Boolean).length;
}

describe('SpConfig filledCount', () => {
  it('returns 0 for empty config', () => {
    expect(filledCount({})).toBe(0);
  });
  it('returns 11 for fully filled config', () => {
    expect(filledCount({
      employer: 'A', wcPolicy: 'B', billingTemplate: 'C', glTemplate: 'D',
      billingFormat: 'E', achDetailType: 'F', payrollRep: 'G', statusDate: '2026-01-01',
      payCode1: 'P1', payCode2: 'P2', payCode3: 'P3'
    })).toBe(11);
  });
  it('computeSpConfigComplete returns false without savedAt', () => {
    const config = {
      employer: 'A', wcPolicy: 'B', billingTemplate: 'C', glTemplate: 'D',
      billingFormat: 'E', achDetailType: 'F', payrollRep: 'G', statusDate: '2026-01-01',
      payCode1: 'P1', payCode2: 'P2', payCode3: 'P3',
      billingRules: [], sutaBilling: [], savedAt: null
    };
    expect(computeSpConfigComplete(config)).toBe(false);
  });
});
