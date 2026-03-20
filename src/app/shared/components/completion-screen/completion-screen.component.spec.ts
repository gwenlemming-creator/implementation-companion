import { InputMethod } from '../../../core/models/plan.model';

describe('CompletionScreen logic', () => {
  function methodLabel(method: InputMethod | null): string {
    if (method === 'upload') return 'Uploaded file';
    if (method === 'manual') return 'Manual entry';
    return '\u2014';
  }

  it('labels upload method as "Uploaded file"', () => {
    expect(methodLabel('upload')).toBe('Uploaded file');
  });

  it('labels manual method as "Manual entry"', () => {
    expect(methodLabel('manual')).toBe('Manual entry');
  });

  it('labels null method with em dash', () => {
    expect(methodLabel(null)).toBe('\u2014');
  });
});
