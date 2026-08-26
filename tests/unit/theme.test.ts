import { describe, expect, it } from 'vitest';
import { getInitialTheme, nextTheme } from '../../src/scripts/theme';

describe('theme preference', () => {
  it('uses a valid stored preference before the system preference', () => {
    expect(getInitialTheme('light', true)).toBe('light');
    expect(getInitialTheme('dark', false)).toBe('dark');
  });

  it('uses the system preference when storage is empty or invalid', () => {
    expect(getInitialTheme(null, true)).toBe('dark');
    expect(getInitialTheme(null, false)).toBe('light');
    expect(getInitialTheme('sepia', true)).toBe('dark');
  });

  it('always toggles to the opposite exposure', () => {
    expect(nextTheme('light')).toBe('dark');
    expect(nextTheme('dark')).toBe('light');
  });
});
