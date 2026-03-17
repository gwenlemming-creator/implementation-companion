import { buildDefaultSections } from '../../../../core/models/plan.model';

function spConfigFilledCount(config: Record<string, unknown>): number {
  return [
    config['employer'], config['wcPolicy'], config['billingTemplate'], config['glTemplate'],
    config['billingFormat'], config['achDetailType'], config['payrollRep'], config['statusDate'],
    config['payCode1'], config['payCode2'], config['payCode3']
  ].filter(Boolean).length;
}

describe('SectionNav spConfigFilledCount', () => {
  it('returns 0 for empty config', () => {
    expect(spConfigFilledCount({})).toBe(0);
  });
  it('returns 3 when 3 fields filled', () => {
    expect(spConfigFilledCount({ employer: 'A', wcPolicy: 'B', billingTemplate: 'C' })).toBe(3);
  });
  it('returns 11 when all fields filled', () => {
    const full = {
      employer: 'A', wcPolicy: 'B', billingTemplate: 'C', glTemplate: 'D',
      billingFormat: 'E', achDetailType: 'F', payrollRep: 'G', statusDate: '2026-01-01',
      payCode1: 'P1', payCode2: 'P2', payCode3: 'P3'
    };
    expect(spConfigFilledCount(full)).toBe(11);
  });
});

describe('SectionNav sections', () => {
  it('buildDefaultSections returns 7 core sections', () => {
    const sections = buildDefaultSections({ timeOff: false, benefits: false, orgLevels: false });
    expect(sections.length).toBe(7);
  });
});
