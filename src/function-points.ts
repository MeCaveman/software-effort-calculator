import {
  bindNumberInputGuards,
  clamp,
  formatCurrency,
  formatNumber,
  initTheme,
  numberValue,
  setText
} from './common';
import { languageFactors } from './language-data';

type Complexity = 'simple' | 'average' | 'complex';
type CountMode = 'orp' | 'direct';

type Parameter = {
  id: string;
  label: string;
  short: string;
  weights: Record<Complexity, number>;
};

const parameters: Parameter[] = [
  { id: 'inputs', label: 'User inputs', short: 'EI', weights: { simple: 3, average: 4, complex: 6 } },
  { id: 'outputs', label: 'User outputs', short: 'EO', weights: { simple: 4, average: 5, complex: 7 } },
  { id: 'inquiries', label: 'User inquiries', short: 'EQ', weights: { simple: 3, average: 4, complex: 6 } },
  { id: 'files', label: 'Internal files', short: 'ILF', weights: { simple: 7, average: 10, complex: 15 } },
  { id: 'interfaces', label: 'External interfaces', short: 'EIF', weights: { simple: 5, average: 7, complex: 10 } }
];

const gscQuestions = [
  'Does the system require reliable backup and recovery?',
  'Are data communications required?',
  'Are there distributed processing functions?',
  'Is performance critical?',
  'Will the system run in an existing, heavily utilized operational environment?',
  'Does the system require on-line data entry?',
  'Does on-line data entry require the input transaction to be built over multiple screens or operations?',
  'Are there master files updated on-line?',
  'Are the inputs, outputs, files, or inquiries complex?',
  'Is the internal processing complex?',
  'Is the code designed to be reusable?',
  'Are conversion and installation included in the design?',
  'Is the system designed for multiple installations in different organizations?',
  'Is the application designed to facilitate change and ease of use by the user?'
];

const examples = {
  exercise1: {
    mode: 'orp' as CountMode,
    rows: {
      inputs: [18, 22, 28, 'average'],
      outputs: [14, 17, 24, 'average'],
      inquiries: [14, 20, 26, 'average'],
      files: [6, 6, 7, 'average'],
      interfaces: [4, 4, 5, 'average']
    },
    twf: 50,
    productivity: 7,
    laborRate: 4000,
    language: 'java'
  },
  exercise2: {
    mode: 'orp' as CountMode,
    rows: {
      inputs: [20, 24, 30, 'average'],
      outputs: [12, 15, 28, 'average'],
      inquiries: [16, 22, 28, 'average'],
      files: [4, 4, 5, 'average'],
      interfaces: [2, 2, 3, 'average']
    },
    twf: 52,
    productivity: 6.5,
    laborRate: 8000,
    language: 'java'
  },
  exercise3: {
    mode: 'direct' as CountMode,
    rows: {
      inputs: [25, 0, 0, 'average'],
      outputs: [15, 0, 0, 'average'],
      inquiries: [10, 0, 0, 'average'],
      files: [20, 0, 0, 'average'],
      interfaces: [5, 0, 0, 'average']
    },
    twf: 50,
    productivity: 0,
    laborRate: 0,
    language: 'java'
  }
};

function rowMarkup(parameter: Parameter): string {
  return `
    <tr data-parameter="${parameter.id}">
      <th scope="row">
        <span class="parameter-name">${parameter.label}</span>
        <span class="parameter-code">${parameter.short}</span>
      </th>
      <td class="orp-cell"><input class="table-input" data-field="o" type="number" min="0" step="1" value="0" aria-label="${parameter.label} optimistic count"></td>
      <td class="orp-cell"><input class="table-input" data-field="r" type="number" min="0" step="1" value="0" aria-label="${parameter.label} realistic count"></td>
      <td class="orp-cell"><input class="table-input" data-field="p" type="number" min="0" step="1" value="0" aria-label="${parameter.label} pessimistic count"></td>
      <td class="direct-cell" hidden><input class="table-input" data-field="count" type="number" min="0" step="1" value="0" aria-label="${parameter.label} count"></td>
      <td><span class="calculated-cell" data-field="estimated">0</span></td>
      <td>
        <select class="table-select" data-field="complexity" aria-label="${parameter.label} complexity">
          <option value="simple">Simple · ${parameter.weights.simple}</option>
          <option value="average" selected>Average · ${parameter.weights.average}</option>
          <option value="complex">Complex · ${parameter.weights.complex}</option>
        </select>
      </td>
      <td><span class="calculated-cell strong" data-field="subtotal">0</span></td>
    </tr>`;
}

function gscMarkup(): string {
  return gscQuestions.map((question, index) => `
    <div class="gsc-row">
      <div class="gsc-question"><span>${index + 1}</span><p>${question}</p></div>
      <div class="score-control">
        <input type="range" min="0" max="5" step="1" value="0" data-gsc="${index}" aria-label="Question ${index + 1} degree of influence">
        <output data-gsc-output="${index}">0</output>
      </div>
    </div>`).join('');
}

function init(): void {
  initTheme();

  const body = document.querySelector<HTMLTableSectionElement>('#measurement-body');
  if (body) body.innerHTML = parameters.map(rowMarkup).join('');

  const gscList = document.querySelector<HTMLElement>('#gsc-list');
  if (gscList) gscList.innerHTML = gscMarkup();

  const languageSelect = document.querySelector<HTMLSelectElement>('#language');
  if (languageSelect) {
    languageSelect.innerHTML = languageFactors.map((language) =>
      `<option value="${language.id}">${language.name}${language.locPerFp === null ? '' : ` · ${language.locPerFp} LOC/FP`}</option>`
    ).join('');
    languageSelect.value = 'javascript';
  }

  bindNumberInputGuards();
  bindEvents();
  updateLanguageFactor();
  calculate();
}

function bindEvents(): void {
  document.querySelectorAll<HTMLInputElement>('input[name="count-mode"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      updateCountMode();
      calculate();
    });
  });

  document.querySelectorAll<HTMLInputElement>('input[name="gsc-mode"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      updateGscMode();
      calculate();
    });
  });

  document.querySelectorAll<HTMLInputElement | HTMLSelectElement>('#measurement-body input, #measurement-body select, #twf-direct, #productivity, #labor-rate, #currency, #loc-factor, #rounding-mode')
    .forEach((element) => element.addEventListener('input', calculate));

  document.querySelectorAll<HTMLInputElement>('[data-gsc]').forEach((input) => {
    input.addEventListener('input', () => {
      const output = document.querySelector<HTMLOutputElement>(`[data-gsc-output="${input.dataset.gsc}"]`);
      if (output) output.value = input.value;
      calculate();
    });
  });

  document.querySelector<HTMLSelectElement>('#language')?.addEventListener('change', () => {
    updateLanguageFactor();
    calculate();
  });

  document.querySelector<HTMLButtonElement>('#reset-button')?.addEventListener('click', resetAll);

  document.querySelector<HTMLSelectElement>('#example-select')?.addEventListener('change', (event) => {
    const select = event.currentTarget as HTMLSelectElement;
    if (select.value) loadExample(select.value as keyof typeof examples);
    select.value = '';
  });
}

function currentCountMode(): CountMode {
  return (document.querySelector<HTMLInputElement>('input[name="count-mode"]:checked')?.value ?? 'orp') as CountMode;
}

function updateCountMode(): void {
  const mode = currentCountMode();
  document.querySelectorAll<HTMLElement>('.orp-cell').forEach((cell) => { cell.hidden = mode !== 'orp'; });
  document.querySelectorAll<HTMLElement>('.direct-cell').forEach((cell) => { cell.hidden = mode !== 'direct'; });
  setText('#estimated-header', mode === 'orp' ? 'Estimated count' : 'Count');
  setText('#count-mode-note', mode === 'orp'
    ? 'Estimated count = (Optimistic + 4 × Realistic + Pessimistic) / 6'
    : 'Enter the known count directly, as in the lecture’s direct-count example.');
}

function updateGscMode(): void {
  const mode = document.querySelector<HTMLInputElement>('input[name="gsc-mode"]:checked')?.value ?? 'direct';
  const direct = document.querySelector<HTMLElement>('#gsc-direct-panel');
  const detailed = document.querySelector<HTMLElement>('#gsc-detailed-panel');
  if (direct) direct.hidden = mode !== 'direct';
  if (detailed) detailed.hidden = mode !== 'detailed';
}

function getTwf(): number {
  const mode = document.querySelector<HTMLInputElement>('input[name="gsc-mode"]:checked')?.value ?? 'direct';
  if (mode === 'direct') {
    return clamp(numberValue(document.querySelector<HTMLInputElement>('#twf-direct')), 0, 70);
  }
  return [...document.querySelectorAll<HTMLInputElement>('[data-gsc]')]
    .reduce((sum, input) => sum + clamp(numberValue(input), 0, 5), 0);
}

function calculate(): void {
  const mode = currentCountMode();
  let ufc = 0;

  parameters.forEach((parameter) => {
    const row = document.querySelector<HTMLTableRowElement>(`[data-parameter="${parameter.id}"]`);
    if (!row) return;

    let count = 0;
    if (mode === 'orp') {
      const optimistic = numberValue(row.querySelector<HTMLInputElement>('[data-field="o"]'));
      const realistic = numberValue(row.querySelector<HTMLInputElement>('[data-field="r"]'));
      const pessimistic = numberValue(row.querySelector<HTMLInputElement>('[data-field="p"]'));
      count = (optimistic + (4 * realistic) + pessimistic) / 6;
    } else {
      count = numberValue(row.querySelector<HTMLInputElement>('[data-field="count"]'));
    }

    const complexity = (row.querySelector<HTMLSelectElement>('[data-field="complexity"]')?.value ?? 'average') as Complexity;
    const weight = parameter.weights[complexity];
    const subtotal = count * weight;
    ufc += subtotal;

    const estimated = row.querySelector<HTMLElement>('[data-field="estimated"]');
    const subtotalElement = row.querySelector<HTMLElement>('[data-field="subtotal"]');
    if (estimated) estimated.textContent = formatNumber(count, 2);
    if (subtotalElement) subtotalElement.textContent = formatNumber(subtotal, 2);
  });

  const twf = getTwf();
  const tcf = 0.65 + (0.01 * twf);
  const roundingMode = document.querySelector<HTMLSelectElement>('#rounding-mode')?.value ?? 'precise';
  const ufcForFp = roundingMode === 'lecture' ? Math.round(ufc) : ufc;
  const fp = ufcForFp * tcf;

  const factor = Math.max(0, numberValue(document.querySelector<HTMLInputElement>('#loc-factor')));
  const loc = fp * factor;

  const productivity = Math.max(0, numberValue(document.querySelector<HTMLInputElement>('#productivity')));
  const laborRate = Math.max(0, numberValue(document.querySelector<HTMLInputElement>('#labor-rate')));
  const currency = document.querySelector<HTMLSelectElement>('#currency')?.value ?? 'USD';

  const effort = productivity > 0 ? fp / productivity : NaN;
  const costPerFp = productivity > 0 && laborRate > 0 ? laborRate / productivity : NaN;
  const totalCost = Number.isFinite(costPerFp) ? costPerFp * fp : NaN;

  setText('#ufc-value', formatNumber(ufc, 2));
  setText('#twf-value', formatNumber(twf, 0));
  setText('#tcf-value', formatNumber(tcf, 2));
  setText('#fp-value', formatNumber(fp, 2));
  setText('#loc-value', formatNumber(loc, 0));
  setText('#effort-value', Number.isFinite(effort) ? `${formatNumber(effort, 2)} person-months` : 'Add productivity');
  setText('#cost-per-fp-value', Number.isFinite(costPerFp) ? formatCurrency(costPerFp, currency) : 'Add productivity + rate');
  setText('#total-cost-value', Number.isFinite(totalCost) ? formatCurrency(totalCost, currency) : 'Add productivity + rate');
  setText('#formula-fp', `${formatNumber(ufcForFp, 2)} × (0.65 + 0.01 × ${formatNumber(twf, 0)}) = ${formatNumber(fp, 2)} FP`);
  setText('#formula-loc', `${formatNumber(fp, 2)} × ${formatNumber(factor, 2)} = ${formatNumber(loc, 0)} LOC`);
}

function updateLanguageFactor(): void {
  const select = document.querySelector<HTMLSelectElement>('#language');
  const factorInput = document.querySelector<HTMLInputElement>('#loc-factor');
  const sourceLink = document.querySelector<HTMLAnchorElement>('#factor-source');
  const factorNote = document.querySelector<HTMLElement>('#factor-note');
  if (!select || !factorInput || !sourceLink || !factorNote) return;

  const language = languageFactors.find((item) => item.id === select.value) ?? languageFactors[0];
  if (language.locPerFp !== null) factorInput.value = String(language.locPerFp);
  else factorInput.value = '';

  sourceLink.textContent = language.source;
  sourceLink.href = language.sourceUrl || '#';
  sourceLink.hidden = language.sourceUrl === '';
  factorNote.textContent = language.note ?? 'Industry gearing factors vary by organization and code-counting rules; this value is editable.';
}

function loadExample(key: keyof typeof examples): void {
  const example = examples[key];
  const modeRadio = document.querySelector<HTMLInputElement>(`input[name="count-mode"][value="${example.mode}"]`);
  if (modeRadio) modeRadio.checked = true;
  updateCountMode();

  Object.entries(example.rows).forEach(([id, values]) => {
    const row = document.querySelector<HTMLTableRowElement>(`[data-parameter="${id}"]`);
    if (!row) return;
    const [a, b, c, complexity] = values as [number, number, number, string];
    if (example.mode === 'orp') {
      const o = row.querySelector<HTMLInputElement>('[data-field="o"]');
      const r = row.querySelector<HTMLInputElement>('[data-field="r"]');
      const p = row.querySelector<HTMLInputElement>('[data-field="p"]');
      if (o) o.value = String(a);
      if (r) r.value = String(b);
      if (p) p.value = String(c);
    } else {
      const count = row.querySelector<HTMLInputElement>('[data-field="count"]');
      if (count) count.value = String(a);
    }
    const complexitySelect = row.querySelector<HTMLSelectElement>('[data-field="complexity"]');
    if (complexitySelect) complexitySelect.value = complexity;
  });

  const directMode = document.querySelector<HTMLInputElement>('input[name="gsc-mode"][value="direct"]');
  if (directMode) directMode.checked = true;
  updateGscMode();

  const twf = document.querySelector<HTMLInputElement>('#twf-direct');
  const productivity = document.querySelector<HTMLInputElement>('#productivity');
  const laborRate = document.querySelector<HTMLInputElement>('#labor-rate');
  const language = document.querySelector<HTMLSelectElement>('#language');
  if (twf) twf.value = String(example.twf);
  if (productivity) productivity.value = example.productivity ? String(example.productivity) : '';
  if (laborRate) laborRate.value = example.laborRate ? String(example.laborRate) : '';
  if (language) language.value = example.language;
  updateLanguageFactor();
  calculate();
}

function resetAll(): void {
  document.querySelectorAll<HTMLInputElement>('#measurement-body input').forEach((input) => { input.value = '0'; });
  document.querySelectorAll<HTMLSelectElement>('#measurement-body select').forEach((select) => { select.value = 'average'; });
  document.querySelectorAll<HTMLInputElement>('[data-gsc]').forEach((input) => { input.value = '0'; });
  document.querySelectorAll<HTMLOutputElement>('[data-gsc-output]').forEach((output) => { output.value = '0'; });

  const twf = document.querySelector<HTMLInputElement>('#twf-direct');
  const productivity = document.querySelector<HTMLInputElement>('#productivity');
  const laborRate = document.querySelector<HTMLInputElement>('#labor-rate');
  const language = document.querySelector<HTMLSelectElement>('#language');
  const rounding = document.querySelector<HTMLSelectElement>('#rounding-mode');
  if (twf) twf.value = '0';
  if (productivity) productivity.value = '';
  if (laborRate) laborRate.value = '';
  if (language) language.value = 'javascript';
  if (rounding) rounding.value = 'precise';
  updateLanguageFactor();
  calculate();
}

init();
