import { PlanSection, SectionStatus } from '../../core/models/plan.model';

function makeSection(status: SectionStatus, order: number, slug: string): PlanSection {
  return { slug, title: slug, order, status, optional: false, enabled: true, inputMethod: null, draftData: null, completedAt: null, inputMethodAtCompletion: null };
}

describe('PlanDetail WSM logic', () => {
  describe('showCompletion', () => {
    function showCompletion(sections: PlanSection[], currentSlug: string | null): boolean {
      return sections.every(s => s.status === 'complete') && !currentSlug;
    }

    it('returns true when all sections complete and no section selected', () => {
      const sections = [makeSection('complete', 1, 'a'), makeSection('complete', 2, 'b')];
      expect(showCompletion(sections, null)).toBe(true);
    });

    it('returns false when not all sections are complete', () => {
      const sections = [makeSection('complete', 1, 'a'), makeSection('in_progress', 2, 'b')];
      expect(showCompletion(sections, null)).toBe(false);
    });

    it('returns false when a section is selected even if all complete', () => {
      const sections = [makeSection('complete', 1, 'a'), makeSection('complete', 2, 'b')];
      expect(showCompletion(sections, 'a')).toBe(false);
    });
  });

  describe('auto-redirect target', () => {
    function firstIncompleteSlug(sections: PlanSection[]): string | null {
      const sorted = [...sections].sort((a, b) => a.order - b.order);
      const first = sorted.find(s => s.status !== 'complete');
      return first?.slug ?? null;
    }

    it('returns first incomplete section by order', () => {
      const sections = [makeSection('complete', 1, 'a'), makeSection('not_started', 2, 'b'), makeSection('not_started', 3, 'c')];
      expect(firstIncompleteSlug(sections)).toBe('b');
    });

    it('returns null when all complete', () => {
      const sections = [makeSection('complete', 1, 'a'), makeSection('complete', 2, 'b')];
      expect(firstIncompleteSlug(sections)).toBeNull();
    });

    it('finds in_progress before not_started by order', () => {
      const sections = [makeSection('not_started', 2, 'b'), makeSection('in_progress', 1, 'a')];
      expect(firstIncompleteSlug(sections)).toBe('a');
    });
  });
});
