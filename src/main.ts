import concernsData from '@data/concerns.json';
import ingredients from '@data/ingredients.json';
import products from '@data/products.json';
import { filterAndSortSensitive } from './lib/sensitive.ts';
import { parseState, serializeState } from './lib/url-state.ts';
import { renderQuestionForm, renderResults } from './ui.ts';
import './style.css';

const concerns = [...concernsData].sort((a, b) => a.order - b.order);
let state = parseState(window.location.search);
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = renderQuestionForm(concerns, state);
const form = document.querySelector<HTMLFormElement>('#concern-form')!;
const questionSection = document.querySelector<HTMLElement>('#question-section')!;
const results = document.querySelector<HTMLElement>('#results')!;

function syncUrl(): void {
  history.replaceState(null, '', `${window.location.pathname}${serializeState(state)}${window.location.hash}`);
}

function updateResults(moveFocus = false): void {
  const concern = concerns.find((item) => item.id === state.concern);
  if (!concern) {
    questionSection.hidden = false;
    results.hidden = true;
    return;
  }
  const focusId = document.activeElement?.id;
  const selected = products.filter((product) => product.concern_id === concern.id && (state.shop === 'all' || product.shop === state.shop));
  const visible = filterAndSortSensitive(selected, state.sensitive, state.sort);
  results.innerHTML = renderResults(concern, visible, ingredients, state, selected.length);
  questionSection.hidden = true;
  results.hidden = false;
  if (moveFocus) document.querySelector<HTMLElement>('#results-heading')?.focus();
  else if (focusId) document.getElementById(focusId)?.focus({ preventScroll: true });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const fields = new FormData(form);
  const query = new URLSearchParams({ concern: String(fields.get('concern') ?? ''), shop: String(fields.get('shop') ?? 'all'), skin: String(fields.get('skin') ?? ''), sort: state.sort, sensitive: state.sensitive ? '1' : '0' });
  state = parseState(query.toString());
  syncUrl();
  updateResults(true);
});

results.addEventListener('change', (event) => {
  const target = event.target;
  if (target instanceof HTMLSelectElement && target.id === 'sort') state.sort = target.value === 'unit' || target.value === 'price' ? target.value : 'rank';
  else if (target instanceof HTMLSelectElement && target.id === 'result-shop') state.shop = target.value === 'daiso' ? 'daiso' : 'all';
  else if (target instanceof HTMLInputElement && target.id === 'sensitive-filter') state.sensitive = target.checked;
  else return;
  syncUrl();
  updateResults();
});

results.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (target.closest('#edit-conditions')) {
    questionSection.hidden = false;
    results.hidden = true;
    const concernInput = form.querySelector<HTMLInputElement>(`input[name="concern"][value="${state.concern}"]`);
    if (concernInput) concernInput.checked = true;
    form.querySelector<HTMLSelectElement>('#skin')!.value = state.skin ?? '';
    form.querySelector<HTMLInputElement>(`input[name="shop"][value="${state.shop}"]`)!.checked = true;
    concernInput?.focus();
  } else if (target.closest('#reset-filters')) {
    state.shop = 'all';
    state.sensitive = false;
    syncUrl();
    updateResults(true);
  }
});

window.addEventListener('popstate', () => {
  state = parseState(window.location.search);
  updateResults();
});

type Theme = 'light' | 'dark' | 'system';
const themeKey = 'gomin-pick-theme';
const media = window.matchMedia('(prefers-color-scheme: dark)');
let theme: Theme = 'system';
try {
  const stored = localStorage.getItem(themeKey);
  if (stored === 'dark' || stored === 'light') theme = stored;
} catch { /* Theme remains usable when storage is unavailable. */ }
const themeToggle = document.querySelector<HTMLButtonElement>('#theme-toggle')!;
const themeReset = document.querySelector<HTMLButtonElement>('#theme-reset')!;

function applyTheme(): void {
  const dark = theme === 'dark' || (theme === 'system' && media.matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  themeToggle.textContent = dark ? '라이트 모드' : '다크 모드';
  themeToggle.setAttribute('aria-label', `${dark ? '라이트' : '다크'} 모드로 전환`);
  themeToggle.setAttribute('aria-pressed', String(dark));
  themeReset.hidden = theme === 'system';
  themeReset.setAttribute('aria-label', '시스템 화면 모드 사용');
}

function storeTheme(): void {
  try { localStorage.setItem(themeKey, theme); } catch { /* In-memory preference still works. */ }
  applyTheme();
}

themeToggle.addEventListener('click', () => {
  theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  storeTheme();
});
themeReset.addEventListener('click', () => { theme = 'system'; storeTheme(); });
media.addEventListener('change', applyTheme);
applyTheme();
if (window.location.search) syncUrl();
updateResults();
