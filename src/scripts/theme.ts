export type Theme = 'light' | 'dark';

const STORAGE_KEY = '2600th-theme';

export function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark';
}

export function getInitialTheme(stored: string | null, prefersDark: boolean): Theme {
  if (isTheme(stored)) return stored;
  return prefersDark ? 'dark' : 'light';
}

export function nextTheme(theme: Theme): Theme {
  return theme === 'light' ? 'dark' : 'light';
}

function updateControls(theme: Theme) {
  document.querySelectorAll<HTMLButtonElement>('[data-theme-control]').forEach((control) => {
    const target = nextTheme(theme);
    control.dataset.theme = theme;
    control.setAttribute('aria-label', `Switch to ${target} mode`);
    control.setAttribute('title', `Switch to ${target} mode`);
    control.setAttribute('aria-pressed', String(theme === 'dark'));
  });
}

export function applyTheme(theme: Theme, persist = true) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  if (persist) localStorage.setItem(STORAGE_KEY, theme);
  updateControls(theme);
  window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
}

export function initThemeControls() {
  const stored = localStorage.getItem(STORAGE_KEY);
  const current = getInitialTheme(
    isTheme(document.documentElement.dataset.theme ?? null)
      ? document.documentElement.dataset.theme ?? null
      : stored,
    matchMedia('(prefers-color-scheme: dark)').matches,
  );
  applyTheme(current, false);

  document.querySelectorAll<HTMLButtonElement>('[data-theme-control]').forEach((control) => {
    if (control.dataset.bound === 'true') return;
    control.dataset.bound = 'true';
    control.addEventListener('click', () => {
      const active = isTheme(document.documentElement.dataset.theme ?? null)
        ? (document.documentElement.dataset.theme as Theme)
        : current;
      applyTheme(nextTheme(active));
    });
  });
}
