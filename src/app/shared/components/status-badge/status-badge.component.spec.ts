import { SectionStatus } from '../../../core/models/plan.model';

function getLabel(status: SectionStatus): string {
  const map: Record<string, string> = {
    not_started: 'Not Started',
    in_progress: 'In Progress',
    complete: 'Complete'
  };
  return map[status] ?? status;
}

function getCssClass(status: SectionStatus): string {
  return `badge badge--${status.replace(/_/g, '-')}`;
}

describe('StatusBadge helpers', () => {
  it('maps not_started to Not Started', () => {
    expect(getLabel('not_started')).toBe('Not Started');
  });
  it('maps in_progress to In Progress', () => {
    expect(getLabel('in_progress')).toBe('In Progress');
  });
  it('maps complete to Complete', () => {
    expect(getLabel('complete')).toBe('Complete');
  });
  it('cssClass for complete is badge--complete', () => {
    expect(getCssClass('complete')).toBe('badge badge--complete');
  });
  it('cssClass for not_started is badge--not-started', () => {
    expect(getCssClass('not_started')).toBe('badge badge--not-started');
  });
});
