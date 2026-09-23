const THEME_KEY = 'effort-calc-theme';

export function initTheme(): void {
  const saved = localStorage.getItem(THEME_KEY);
  const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const theme = saved === 'dark' || saved === 'light' ? saved : preferred;
  document.documentElement.dataset.theme = theme;

  const button = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
  updateThemeButton(button, theme);

  button?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem(THEME_KEY, next);
    updateThemeButton(button, next);
  });
}

function updateThemeButton(button: HTMLButtonElement | null, theme: string): void {
  if (!button) return;
  button.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
  button.innerHTML = theme === 'dark'
    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>';
}

export function numberValue(input: HTMLInputElement | null, fallback = 0): number {
  if (!input) return fallback;
  const value = Number(input.value);
  return Number.isFinite(value) ? value : fallback;
}

export function formatNumber(value: number, maxFractionDigits = 2): string {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: maxFractionDigits,
    minimumFractionDigits: 0
  }).format(value);
}

export function formatCurrency(value: number, currency: string): string {
  if (!Number.isFinite(value)) return '—';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2
    }).format(value);
  } catch {
    return `${formatNumber(value, 2)} ${currency}`;
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function setText(selector: string, value: string): void {
  const element = document.querySelector<HTMLElement>(selector);
  if (element) element.textContent = value;
}

export function bindNumberInputGuards(root: ParentNode = document): void {
  root.querySelectorAll<HTMLInputElement>('input[type="number"]').forEach((input) => {
    input.addEventListener('input', () => {
      if (input.value === '') return;
      const min = input.min === '' ? undefined : Number(input.min);
      const max = input.max === '' ? undefined : Number(input.max);
      let value = Number(input.value);
      if (!Number.isFinite(value)) return;
      if (min !== undefined && value < min) value = min;
      if (max !== undefined && value > max) value = max;
      if (value !== Number(input.value)) input.value = String(value);
    });
  });
}
