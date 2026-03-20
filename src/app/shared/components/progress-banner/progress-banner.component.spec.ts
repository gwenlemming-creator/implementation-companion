import { PlanSection, SectionStatus } from '../../../core/models/plan.model';

function makeSection(status: SectionStatus, order: number, slug: string): PlanSection {
  return { slug, title: slug, order, status, optional: false, enabled: true, inputMethod: null, draftData: null, completedAt: null, inputMethodAtCompletion: null };
}

describe('ProgressBanner logic', () => {
  function computeProgress(sections: PlanSection[]) {
    const total = sections.length;
    const complete = sections.filter(s => s.status === 'complete').length;
    const pct = total > 0 ? Math.round((complete / total) * 100) : 0;
    return { total, complete, pct };
  }

  function computeNextUp(sections: PlanSection[], currentSlug: string | null): string | null {
    const incomplete = sections
      .filter(s => s.status !== 'complete')
      .sort((a, b) => a.order - b.order);
    if (incomplete.length === 0) return null;
    if (incomplete.length === 1 && incomplete[0].slug === currentSlug) return null;
    const next = incomplete.find(s => s.slug !== currentSlug) ?? incomplete[0];
    return next.title;
  }

  it('calculates 0% when no sections complete', () => {
    const sections = [makeSection('not_started', 1, 'a'), makeSection('not_started', 2, 'b')];
    expect(computeProgress(sections)).toEqual({ total: 2, complete: 0, pct: 0 });
  });

  it('calculates 50% when half complete', () => {
    const sections = [makeSection('complete', 1, 'a'), makeSection('not_started', 2, 'b')];
    expect(computeProgress(sections)).toEqual({ total: 2, complete: 1, pct: 50 });
  });

  it('calculates 100% when all complete', () => {
    const sections = [makeSection('complete', 1, 'a'), makeSection('complete', 2, 'b')];
    expect(computeProgress(sections)).toEqual({ total: 2, complete: 2, pct: 100 });
  });

  it('rounds percentage', () => {
    const sections = [makeSection('complete', 1, 'a'), makeSection('not_started', 2, 'b'), makeSection('not_started', 3, 'c')];
    expect(computeProgress(sections).pct).toBe(33);
  });

  it('returns next incomplete section title', () => {
    const sections = [makeSection('complete', 1, 'a'), makeSection('not_started', 2, 'b')];
    expect(computeNextUp(sections, 'a')).toBe('b');
  });

  it('skips current section and returns next incomplete by order', () => {
    const sections = [
      makeSection('not_started', 1, 'a'),
      makeSection('in_progress', 2, 'b'),
      makeSection('not_started', 3, 'c')
    ];
    expect(computeNextUp(sections, 'b')).toBe('a');
  });

  it('returns null when only the current section is incomplete', () => {
    const sections = [makeSection('complete', 1, 'a'), makeSection('in_progress', 2, 'b')];
    expect(computeNextUp(sections, 'b')).toBeNull();
  });

  it('returns null when all complete', () => {
    const sections = [makeSection('complete', 1, 'a'), makeSection('complete', 2, 'b')];
    expect(computeNextUp(sections, null)).toBeNull();
  });

  it('returns first incomplete when currentSlug is null', () => {
    const sections = [makeSection('complete', 1, 'a'), makeSection('not_started', 2, 'b'), makeSection('not_started', 3, 'c')];
    expect(computeNextUp(sections, null)).toBe('b');
  });
});
