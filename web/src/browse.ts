import { PANELS } from '../../src/core/panels.ts';
import type { Db, ModelGroup } from '../../src/core/types.ts';
import { groupLabel } from './check.ts';
import { panelName, t } from './i18n.ts';
import { fmt, type State } from './state.ts';
import { esc } from './util.ts';

// Range bars share one µm scale so models can be compared at a glance.
const SCALE_MIN = 50;
const SCALE_MAX = 250;
const TICKS = [50, 100, 150, 200, 250];
const pct = (v: number) =>
  `${(((Math.min(Math.max(v, SCALE_MIN), SCALE_MAX) - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100).toFixed(1)}%`;

function bar(p10: number, median: number, p90: number): string {
  return `<span class="range" aria-hidden="true">
    ${TICKS.map((v) => `<i class="grid" style="left:${pct(v)}"></i>`).join('')}
    <span class="range-band" style="left:${pct(p10)};right:calc(100% - ${pct(p90)})"></span>
    <span class="range-median" style="left:${pct(median)}"></span>
  </span>`;
}

function axis(state: State): string {
  return `<div class="axis" aria-hidden="true">
    ${TICKS.map((v, i) => `<span style="left:${pct(v)}">${fmt(v, state.unit, i === TICKS.length - 1)}</span>`).join('')}
  </div>`;
}

function card(g: ModelGroup, state: State): string {
  const u = (v: number) => fmt(v, state.unit);
  const rows = PANELS.filter((p) => g.panels[p])
    .map((p) => {
      const s = g.panels[p]!;
      return `<tr><td>${panelName(p)}</td><td class="num">${u(s.median)}</td>
        <td class="num muted">${fmt(s.p10, state.unit, false)}–${fmt(s.p90, state.unit, false)}</td>
        <td class="bar-cell">${bar(s.p10, s.median, s.p90)}</td><td class="num muted">n=${s.n}</td></tr>`;
    })
    .join('');

  return `<details class="model">
    <summary>
      <div class="model-name">
        <strong>${esc(g.makeName)} ${esc(g.model)}</strong>
        <span class="mono muted">${esc(groupLabel(g).slice(`${g.makeName} ${g.model}`.length).trim())}</span>
        ${g.demo ? `<span class="tape small demo">${t('badge.demo')}</span>` : ''}
      </div>
      <div class="model-meta mono">
        <span>${t('browse.vehicles', { n: g.vehicles })}</span>
        <span>${t('browse.median', { v: u(g.overall.median) })}</span>
      </div>
      ${bar(g.overall.p10, g.overall.median, g.overall.p90)}
    </summary>
    <div class="model-body">
      <div class="table-wrap"><table class="compact"><tbody>${rows}</tbody></table></div>
      <button class="btn" data-use="${esc(g.id)}">${t('browse.use')} →</button>
    </div>
  </details>`;
}

export function renderBrowse(root: HTMLElement, db: Db, state: State, useAsReference: (id: string) => void) {
  root.innerHTML = `<section class="sheet">
    <header class="sheet-head"><span class="tape">02 · ${t('tape.browse')}</span><h2>${t('browse.title')}</h2></header>
    <p class="note mono">${t('browse.stats', { groups: db.groups.length, records: db.realRecords })}</p>
    ${db.realRecords === 0 ? `<p class="notice">${t('browse.demo.notice')}</p>` : ''}
    <input type="search" id="q" class="search" placeholder="${esc(t('browse.search'))}" autocomplete="off">
    <div class="models">
      <div class="models-head">${axis(state)}</div>
      <div id="groups"></div>
    </div>
  </section>`;

  const list = root.querySelector<HTMLElement>('#groups')!;
  const draw = (q: string) => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const hits = db.groups.filter((g) => {
      const hay = `${g.makeName} ${g.make} ${g.model} ${g.generation ?? ''} ${g.years.join(' ')}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
    list.innerHTML = hits.length ? hits.map((g) => card(g, state)).join('') : `<p class="note">${t('browse.none')}</p>`;
  };

  root.querySelector<HTMLInputElement>('#q')!.addEventListener('input', (e) => draw((e.target as HTMLInputElement).value));
  list.addEventListener('click', (e) => {
    const id = (e.target as Element).closest<HTMLElement>('[data-use]')?.dataset.use;
    if (id) useAsReference(id);
  });
  draw('');
}
