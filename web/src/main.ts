import type { Db } from '../../src/core/types.ts';
import { renderBrowse } from './browse.ts';
import { renderCheck, SAMPLE } from './check.ts';
import { LANGS, setLang, t, type Key, type Lang } from './i18n.ts';
import { convertInputs, fmt, loadState, saveState, type Unit } from './state.ts';
import { REPO_URL } from './util.ts';
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/jetbrains-mono/index.css';
import './styles.css';

type View = 'check' | 'browse' | 'about';
const VIEWS: View[] = ['check', 'browse', 'about'];

const state = loadState();
const app = document.querySelector<HTMLElement>('#app')!;

// ?example opens the checker with the example car filled in (used by links in the README).
if (new URLSearchParams(location.search).has('example')) {
  state.inputs = Object.fromEntries(
    Object.entries(SAMPLE).map(([p, spots]) => [p, spots.map((v) => fmt(v, state.unit, false)).join(' ')]),
  );
}

const EMPTY_DB: Db = { schema: 1, generated: '', records: 0, realRecords: 0, makes: [], groups: [] };

async function loadDb(): Promise<Db> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}db.json`);
    if (!res.ok) throw new Error(String(res.status));
    return (await res.json()) as Db;
  } catch {
    return EMPTY_DB;
  }
}

function currentView(): View {
  const v = location.hash.slice(1) as View;
  return VIEWS.includes(v) ? v : 'check';
}

function renderAbout(root: HTMLElement) {
  const sections: [Key, Key][] = [
    ['about.how.title', 'about.how'],
    ['about.data.title', 'about.data'],
    ['about.privacy.title', 'about.privacy'],
  ];
  root.innerHTML = `<section class="sheet prose">
    <header class="sheet-head"><span class="tape">03 · ${t('tape.about')}</span><h2>${t('about.title')}</h2></header>
    <p class="lede">${t('about.what')}</p>
    <ol class="numbered">
      ${sections.map(([h, p]) => `<li><h3>${t(h)}</h3><p>${t(p)}</p></li>`).join('')}
    </ol>
    <p><a class="btn primary" href="${REPO_URL}" target="_blank" rel="noopener">${t('about.repo')} ↗</a></p>
  </section>`;
}

function render(db: Db) {
  setLang(state.lang);
  const view = currentView();
  const langOptions = (Object.keys(LANGS) as Lang[])
    .map((l) => `<option value="${l}" ${l === state.lang ? 'selected' : ''}>${l.toUpperCase()}</option>`)
    .join('');

  app.innerHTML = `
    <header class="masthead">
      <a class="brand" href="#check" aria-label="OpenPaintDepth">
        <img src="${import.meta.env.BASE_URL}icon.svg" alt="" width="40" height="40">
        <span class="wordmark">Open<b>Paint</b>Depth</span>
      </a>
      <nav class="tabs">
        ${VIEWS.map(
          (v, i) => `<a href="#${v}" aria-current="${v === view ? 'page' : 'false'}"><span class="idx">0${i + 1}</span>${t(`nav.${v}`)}</a>`,
        ).join('')}
      </nav>
      <div class="prefs">
        <div class="seg" role="group" aria-label="${t('unit.label')}">
          ${(['um', 'mil'] as Unit[])
            .map((u) => `<button data-unit="${u}" aria-pressed="${state.unit === u}">${u === 'um' ? 'µm' : 'mil'}</button>`)
            .join('')}
        </div>
        <select id="lang" class="lang" aria-label="Language">${langOptions}</select>
      </div>
    </header>
    <main id="view"></main>
    <footer class="colophon">
      <img src="${import.meta.env.BASE_URL}icon.svg" alt="" width="28" height="28">
      <p>${t('footer.made')}</p>
      <p class="mono"><a href="${REPO_URL}" target="_blank" rel="noopener">GitHub</a> · Code MIT · Data ODbL 1.0</p>
    </footer>`;

  const main = app.querySelector<HTMLElement>('#view')!;
  if (view === 'check') renderCheck(main, db, state);
  else if (view === 'browse')
    renderBrowse(main, db, state, (id) => {
      state.refId = id;
      saveState(state);
      location.hash = 'check';
    });
  else renderAbout(main);

  app.querySelector('#lang')!.addEventListener('change', (e) => {
    state.lang = (e.target as HTMLSelectElement).value as Lang;
    saveState(state);
    render(db);
  });
  app.querySelectorAll<HTMLButtonElement>('[data-unit]').forEach((b) =>
    b.addEventListener('click', () => {
      const unit = b.dataset.unit as Unit;
      state.inputs = convertInputs(state.inputs, state.unit, unit);
      state.unit = unit;
      saveState(state);
      render(db);
    }),
  );
}

loadDb().then((db) => {
  render(db);
  window.addEventListener('hashchange', () => {
    render(db);
    window.scrollTo(0, 0);
  });
});

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
}
