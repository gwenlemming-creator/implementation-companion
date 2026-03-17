import {
  buildDefaultSections, computePlanStatus, computeSpConfigComplete,
  Plan, SpConfig
} from './plan.model';

describe('buildDefaultSections', () => {
  it('returns 7 sections when no optional modules enabled', () => {
    const sections = buildDefaultSections({ timeOff: false, benefits: false, orgLevels: false });
    expect(sections.length).toBe(7);
  });

  it('returns 10 sections when all optional modules enabled', () => {
    const sections = buildDefaultSections({ timeOff: true, benefits: true, orgLevels: true });
    expect(sections.length).toBe(10);
  });

  it('all sections start as not_started', () => {
    const sections = buildDefaultSections({ timeOff: false, benefits: false, orgLevels: false });
    expect(sections.every(s => s.status === 'not_started')).toBe(true);
  });

  it('includes only the time-off section when only timeOff module is enabled', () => {
    const sections = buildDefaultSections({ timeOff: true, benefits: false, orgLevels: false });
    expect(sections.length).toBe(8);
    expect(sections.some(s => s.slug === 'time-off')).toBe(true);
    expect(sections.some(s => s.slug === 'benefits')).toBe(false);
    expect(sections.some(s => s.slug === 'org-levels')).toBe(false);
  });
});

describe('computePlanStatus', () => {
  const basePlan = (overrides: Partial<Plan['sections'][0]>[] = []): Plan => {
    const sections = buildDefaultSections({ timeOff: false, benefits: false, orgLevels: false })
      .map((s, i) => ({ ...s, ...(overrides[i] ?? {}) }));
    return { sections } as Plan;
  };

  it('returns not_started when all sections not started', () => {
    expect(computePlanStatus(basePlan())).toBe('not_started');
  });

  it('returns in_progress when at least one section is in_progress', () => {
    const plan = basePlan([{ status: 'in_progress' }]);
    expect(computePlanStatus(plan)).toBe('in_progress');
  });

  it('returns complete when all sections complete', () => {
    const sections = buildDefaultSections({ timeOff: false, benefits: false, orgLevels: false })
      .map(s => ({ ...s, status: 'complete' as const }));
    expect(computePlanStatus({ sections } as Plan)).toBe('complete');
  });
});

describe('computeSpConfigComplete', () => {
  const fullConfig: SpConfig = {
    employer: 'Acme', wcPolicy: 'P1', billingTemplate: 'BT1',
    glTemplate: 'GL1', billingFormat: 'BF1', achDetailType: 'ACH1',
    payrollRep: 'Rep1', statusDate: '2026-01-01',
    payCode1: 'PC1', payCode2: 'PC2', payCode3: 'PC3',
    billingRules: [], sutaBilling: [], savedAt: '2026-01-01T00:00:00Z'
  };

  it('returns true when all 11 fields filled and savedAt set', () => {
    expect(computeSpConfigComplete(fullConfig)).toBe(true);
  });

  it('returns false when savedAt is null', () => {
    expect(computeSpConfigComplete({ ...fullConfig, savedAt: null })).toBe(false);
  });

  it('returns false when any required field is empty', () => {
    expect(computeSpConfigComplete({ ...fullConfig, employer: '' })).toBe(false);
  });
});
