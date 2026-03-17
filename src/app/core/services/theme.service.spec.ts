import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  it('should set --primary CSS property to specified color', () => {
    const service = new ThemeService();
    service.applyTheme('#ff0000');

    expect(document.documentElement.style.getPropertyValue('--primary')).toBe('#ff0000');
  });

  it('should default to #0f5cf5 when no color is provided', () => {
    const service = new ThemeService();
    service.applyTheme();

    expect(document.documentElement.style.getPropertyValue('--primary')).toBe('#0f5cf5');
  });
});
