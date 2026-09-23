import { bindNumberInputGuards, formatCurrency, formatNumber, initTheme, numberValue, setText } from './common';

type ProjectMode = 'organic' | 'semi' | 'embedded';

type ModeDefinition = {
  label: string;
  c: number;
  k: number;
  description: string;
};

const modes: Record<ProjectMode, ModeDefinition> = {
  organic: {
    label: 'Organic',
    c: 3.2,
    k: 1.05,
    description: 'Relatively small, simple projects developed by a team with good application experience.'
  },
  semi: {
    label: 'Semi-detached',
    c: 3.0,
    k: 1.12,
    description: 'Intermediate projects with mixed team experience and a mix of rigid and less-rigid requirements.'
  },
  embedded: {
    label: 'Embedded',
    c: 2.8,
    k: 1.20,
    description: 'Projects developed under tight hardware, software, or operational constraints.'
  }
};

function init(): void {
  initTheme();
  bindNumberInputGuards();

  document.querySelectorAll<HTMLInputElement>('input[name="project-mode"]').forEach((radio) => {
    radio.addEventListener('change', calculate);
  });

  document.querySelectorAll<HTMLInputElement | HTMLSelectElement>('#size, #size-unit, #labor-rate, #currency')
    .forEach((element) => element.addEventListener('input', calculate));

  document.querySelector<HTMLButtonElement>('#cocomo-example')?.addEventListener('click', () => {
    const organic = document.querySelector<HTMLInputElement>('input[name="project-mode"][value="organic"]');
    const size = document.querySelector<HTMLInputElement>('#size');
    const unit = document.querySelector<HTMLSelectElement>('#size-unit');
    if (organic) organic.checked = true;
    if (size) size.value = '4';
    if (unit) unit.value = 'kloc';
    calculate();
  });

  document.querySelector<HTMLButtonElement>('#cocomo-reset')?.addEventListener('click', () => {
    const organic = document.querySelector<HTMLInputElement>('input[name="project-mode"][value="organic"]');
    const size = document.querySelector<HTMLInputElement>('#size');
    const unit = document.querySelector<HTMLSelectElement>('#size-unit');
    const labor = document.querySelector<HTMLInputElement>('#labor-rate');
    if (organic) organic.checked = true;
    if (size) size.value = '';
    if (unit) unit.value = 'kloc';
    if (labor) labor.value = '';
    calculate();
  });

  calculate();
}

function calculate(): void {
  const selectedMode = (document.querySelector<HTMLInputElement>('input[name="project-mode"]:checked')?.value ?? 'organic') as ProjectMode;
  const mode = modes[selectedMode];
  const sizeValue = Math.max(0, numberValue(document.querySelector<HTMLInputElement>('#size')));
  const unit = document.querySelector<HTMLSelectElement>('#size-unit')?.value ?? 'kloc';
  const kloc = unit === 'loc' ? sizeValue / 1000 : sizeValue;
  const effort = kloc > 0 ? mode.c * Math.pow(kloc, mode.k) : 0;

  const laborRate = Math.max(0, numberValue(document.querySelector<HTMLInputElement>('#labor-rate')));
  const currency = document.querySelector<HTMLSelectElement>('#currency')?.value ?? 'USD';
  const cost = laborRate > 0 ? effort * laborRate : NaN;

  setText('#mode-label', mode.label);
  setText('#mode-description', mode.description);
  setText('#constant-c', formatNumber(mode.c, 2));
  setText('#constant-k', formatNumber(mode.k, 2));
  setText('#kloc-value', formatNumber(kloc, 3));
  setText('#effort-value', kloc > 0 ? `${formatNumber(effort, 2)} person-months` : 'Enter project size');
  setText('#cost-value', Number.isFinite(cost) ? formatCurrency(cost, currency) : 'Add labor rate');
  setText('#formula-value', kloc > 0
    ? `${mode.c} × (${formatNumber(kloc, 3)})^${mode.k} = ${formatNumber(effort, 2)} person-months`
    : `E = ${mode.c} × (KLOC)^${mode.k}`);
}

init();
