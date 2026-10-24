import { analyze, type Analysis, type Verdict } from '../../src/core/analysis.ts';
import { PANELS, type Panel } from '../../src/core/panels.ts';
import { recordToYaml } from '../../src/core/record-yaml.ts';
import { slugify } from '../../src/core/slug.ts';
import { PAINT_TYPES, type Db, type MeasurementRecord, type ModelGroup } from '../../src/core/types.ts';
import { carSvg } from './car.ts';
import { GAUGE_ORDER, gaugeSvg } from './gauge.ts';
import { panelName, panelShortName, reasonKey, t, verdictName, type Key } from './i18n.ts';
import { fmt, parseSpots, saveState, type State } from './state.ts';
import { esc, REPO_URL } from './util.ts';

const GROUPS: { key: Key; panels: Panel[] }[] = [
  { key: 'group.left', panels: ['fender_fl', 'pillar_l', 'door_fl', 'door_rl', 'sill_l', 'quarter_rl'] },
  { key: 'group.center', panels: ['hood', 'roof', 'trunk'] },
  { key: 'group.right', panels: ['fender_fr', 'pillar_r', 'door_fr', 'door_rr', 'sill_r', 'quarter_rr'] },
];

/** The order a detailer walks around the car: front, down the right side, rear, up the left, roof last. */
const WALK: Panel[] = [
  'hood', 'fender_fr', 'pillar_r', 'door_fr', 'door_rr', 'sill_r', 'quarter_rr', 'trunk',
  'quarter_rl', 'sill_l', 'door_rl', 'door_fl', 'pillar_l', 'fender_fl', 'roof',
];

const SEVERITY: Verdict[] = ['filler', 'repaint', 'thin', 'attention', 'ok'];

export const SAMPLE: Partial<Record<Panel, number[]>> = {
  hood: [118, 121, 116],
  roof: [112, 114],
  trunk: [117, 119],
  fender_fl: [124, 122],
  fender_fr: [186, 192, 189],
  door_fl: [126, 124],
  door_fr: [131, 128],
  door_rl: [122, 124],
  door_rr: [125, 123],
  quarter_rl: [120, 118],
  quarter_rr: [340, 410, 280],
  pillar_l: [108],
  pillar_r: [110],
  sill_l: [96, 101],
  sill_r: [99],
};

export function groupLabel(g: ModelGroup): string {
  const years = g.years[0] === g.years[1] ? `${g.years[0]}` : `${g.years[0]}–${g.years[1]}`;
  return `${g.makeName} ${g.model}${g.generation ? ` ${g.generation}` : ''} (${years})`;
}

function readings(state: State): Partial<Record<Panel, number[]>> {
  const out: Partial<Record<Panel, number[]>> = {};
  for (const p of PANELS) {
    const spots = parseSpots(state.inputs[p], state.unit);
    if (spots.length) out[p] = spots;
  }
  return out;
}

const PANEL_NAMES = () => Object.fromEntries(PANELS.map((p) => [p, panelName(p)])) as Record<Panel, string>;

/** Colours the car drawing and writes each panel's median into it. */
function paintCar(svg: Element, a: Analysis, state: State) {
  const results = new Map(a.panels.map((r) => [r.panel, r]));
  for (const p of PANELS) {
    const r = results.get(p);
    svg.querySelector(`[data-panel="${p}"]`)!.setAttribute('data-verdict', r?.verdict ?? 'none');
    svg.querySelector(`[data-label="${p}"]`)!.textContent = r ? fmt(r.median, state.unit, false) : '';
  }
}

function field(key: Key, name: keyof State['contrib'], value: string, attrs = '', required = false): string {
  return `<label class="field"><span>${t(key)}${required ? ' <b class="req">*</b>' : ''}</span>
    <input name="${name}" value="${esc(value)}" ${attrs}></label>`;
}

function sheetHead(n: string, key: Key, title: string, actions = ''): string {
  return `<header class="sheet-head">
    <span class="tape">${n} · ${t(key)}</span>
    <h2>${title}</h2>
    ${actions ? `<div class="sheet-actions">${actions}</div>` : ''}
  </header>`;
}

function hero(db: Db): string {
  return `<section class="hero">
    <div class="hero-text">
      <p class="eyebrow">${t('hero.eyebrow')}</p>
      <h1>${t('hero.l1')}<br>${t('hero.l2')}<br><span class="marked">${t('hero.l3')}</span></h1>
      <p class="lede">${t('hero.lede')}</p>
    </div>
    <dl class="stats">
      <div><dt>${t('stats.models')}</dt><dd>${db.groups.length}</dd></div>
      <div><dt>${t('stats.real')}</dt><dd>${db.realRecords}</dd></div>
      <div><dt>${t('stats.panels')}</dt><dd>${PANELS.length}</dd></div>
    </dl>
  </section>`;
}

function contribSection(db: Db, c: State['contrib']): string {
  const steps = ([1, 2, 3] as const)
    .map(
      (n) => `<li><b>${n}</b><div><strong>${t(`contrib.steps.${n}.t`)}</strong><span>${t(`contrib.steps.${n}.d`)}</span></div></li>`,
    )
    .join('');

  return `<section class="sheet" id="contrib-sheet">
    <details id="contrib">
      <summary>${sheetHead('03', 'sheet.contrib', t('contrib.title'), '<span class="toggle" aria-hidden="true"></span>')}</summary>
      <p class="lede small-lede">${t('contrib.intro')}</p>
      <ol class="steps">${steps}</ol>

      <div class="faq">
        <details><summary>${t('contrib.faq.github.q')}</summary>
          <p>${t('contrib.faq.github.a')} <a href="https://github.com/signup" target="_blank" rel="noopener">${t('contrib.faq.github.link')} ↗</a></p>
        </details>
        <details><summary>${t('contrib.faq.shared.q')}</summary><p>${t('contrib.faq.shared.a')}</p></details>
      </div>

      <h3 class="form-title"><span>1</span>${t('contrib.section.car')}</h3>
      <div class="form-grid">
        <label class="field"><span>${t('contrib.make')} <b class="req">*</b></span>
          <select name="make"><option value="">${t('contrib.make.pick')}</option>${db.makes
            .map((m) => `<option value="${m.slug}" ${m.slug === c.make ? 'selected' : ''}>${esc(m.name)}</option>`)
            .join('')}</select></label>
        ${field('contrib.model', 'model', c.model, 'list="models" maxlength="60"', true)}
        ${field('contrib.year', 'year', c.year, 'type="number" min="1950" max="2100" inputmode="numeric"', true)}
      </div>
      <datalist id="models"></datalist>

      <fieldset class="field history"><legend>${t('contrib.section.history')}</legend>
        ${(['unknown', 'factory'] as const)
          .map(
            (v) => `<label class="radio"><input type="radio" name="condition" value="${v}" ${c.condition === v ? 'checked' : ''}> ${t(`contrib.condition.${v}`)}</label>`,
          )
          .join('')}
      </fieldset>

      <details class="optional">
        <summary>${t('contrib.section.optional')}</summary>
        <div class="form-grid">
          ${field('contrib.generation', 'generation', c.generation, `maxlength="30" placeholder="${esc(t('contrib.generation.hint'))}"`)}
          <label class="field"><span>${t('contrib.paint_type')}</span>
            <select name="paint_type"><option value=""></option>${PAINT_TYPES.map(
              (p) => `<option ${p === c.paint_type ? 'selected' : ''}>${p}</option>`,
            ).join('')}</select></label>
          ${field('contrib.color', 'color', c.color, 'maxlength="60"')}
          ${field('contrib.paint_code', 'paint_code', c.paint_code, 'maxlength="20"')}
          ${field('contrib.market', 'market', c.market, 'maxlength="30" placeholder="EU, US, JP…"')}
          ${field('contrib.gauge_brand', 'gauge_brand', c.gauge_brand, 'maxlength="40"')}
          ${field('contrib.gauge_model', 'gauge_model', c.gauge_model, 'maxlength="40"')}
          ${field('contrib.measured_on', 'measured_on', c.measured_on, 'type="date"')}
        </div>
        <fieldset class="field"><legend>${t('contrib.repaired')}
          <button type="button" class="btn small ghost" id="suggest">${t('contrib.repaired.suggest')}</button></legend>
          <p class="note">${t('contrib.repaired.help')}</p>
          <div class="chips">${PANELS.map(
            (p) => `<label class="chip"><input type="checkbox" name="repaired" value="${p}" ${c.repaired.includes(p) ? 'checked' : ''}> ${panelName(p)}</label>`,
          ).join('')}</div>
        </fieldset>
        <label class="field"><span>${t('contrib.notes')}</span>
          <textarea name="notes" maxlength="1000" rows="2">${esc(c.notes)}</textarea></label>
      </details>

      <h3 class="form-title"><span>2</span>${t('contrib.steps.2.t')}</h3>
      <p class="missing" id="missing"></p>
      <div class="actions">
        <a class="btn primary big" id="submit" target="_blank" rel="noopener">${t('contrib.submit')} ↗</a>
        <span class="note">${t('contrib.opens')}</span>
      </div>

      <details class="tech">
        <summary>${t('contrib.tech')}</summary>
        <pre class="yaml" id="yaml"></pre>
        <div class="actions">
          <button class="btn ghost small" id="copy">${t('contrib.copy')}</button>
          <button class="btn ghost small" id="download">${t('contrib.download')}</button>
        </div>
      </details>
    </details>
  </section>`;
}

export function renderCheck(root: HTMLElement, db: Db, state: State) {
  const group = () => db.groups.find((g) => g.id === state.refId) ?? null;
  const c = state.contrib;
  const unitLabel = state.unit === 'mil' ? 'mil' : 'µm';

  const makes = [...new Set(db.groups.map((g) => g.make))];
  const options = makes
    .map((make) => {
      const gs = db.groups.filter((g) => g.make === make);
      return `<optgroup label="${esc(gs[0]!.makeName)}">${gs
        .map(
          (g) =>
            `<option value="${esc(g.id)}" ${g.id === state.refId ? 'selected' : ''}>${esc(groupLabel(g))} · ${t('browse.vehicles', { n: g.vehicles })}${g.demo ? ` · ${t('badge.demo')}` : ''}</option>`,
        )
        .join('')}</optgroup>`;
    })
    .join('');

  const rows = (panels: Panel[]) =>
    panels
      .map(
        (p) => `<label class="row" data-panel="${p}">
          <span class="sw"></span>
          <span class="name">${panelShortName(p)}</span>
          <input class="val" inputmode="decimal" enterkeyhint="next" autocomplete="off" spellcheck="false"
            data-input="${p}" aria-label="${esc(panelName(p))}" value="${esc(state.inputs[p] ?? '')}">
          <span class="unit">${unitLabel}</span>
        </label>`,
      )
      .join('');

  root.innerHTML = `
  ${hero(db)}
  <section class="sheet" id="measure">
    ${sheetHead('01', 'sheet.measure', t('check.title'), `
      <button class="btn" id="walk">${t('check.walk')}</button>
      <button class="btn ghost" id="sample">${t('check.sample')}</button>
      <button class="btn ghost" id="clear">${t('check.clear')}</button>`)}
    <p class="note">${t('check.intro')} ${t('check.walk.hint')}</p>
    <label class="field ref"><span>${t('check.reference')}</span>
      <select id="ref"><option value="">${t('check.reference.none')}</option>${options}</select>
    </label>
    <div class="measure">
      <figure class="car-wrap">
        ${carSvg(PANEL_NAMES())}
        <figcaption class="legend">
          <span class="legend-title">${t('legend.title')}</span>
          <ol>${GAUGE_ORDER.map((v) => `<li data-verdict="${v}"><i></i>${verdictName(v)}</li>`).join('')}</ol>
        </figcaption>
      </figure>
      <div class="protocol">
        ${GROUPS.map((g) => `<div class="pgroup pgroup-${g.key.split('.')[1]}"><h3>${t(g.key)}</h3>${rows(g.panels)}</div>`).join('')}
      </div>
    </div>
  </section>

  <section class="sheet" id="result-sheet">
    ${sheetHead('02', 'sheet.result', t('result.eyebrow'), `<button class="btn" id="print">${t('check.print')}</button>`)}
    <div id="result" aria-live="polite"></div>
  </section>

  ${contribSection(db, c)}

  <article class="report-doc" id="report-doc"></article>`;

  const $ = <T extends Element>(sel: string) => root.querySelector<T>(sel)!;
  const svg = $<SVGSVGElement>('svg.car');
  const inputOf = (p: Panel) => root.querySelector<HTMLInputElement>(`[data-input="${p}"]`)!;
  let analysis: Analysis = analyze({});

  const buildRecord = (): { record: MeasurementRecord; missing: string[] } => {
    const missing: string[] = [];
    if (!c.make) missing.push(t('contrib.make'));
    if (!c.model.trim()) missing.push(t('contrib.model'));
    const year = Number.parseInt(c.year, 10);
    if (!(year >= 1950 && year <= 2100)) missing.push(t('contrib.year'));
    const r = readings(state);
    if (Object.keys(r).length < 3) missing.push('≥ 3 ' + t('check.table.panel'));
    const record: MeasurementRecord = {
      schema: 1,
      vehicle: {
        make: c.make || '?',
        model: c.model.trim() || '?',
        ...(c.generation.trim() ? { generation: c.generation.trim() } : {}),
        year: Number.isFinite(year) ? year : 0,
        ...(c.paint_type ? { paint_type: c.paint_type } : {}),
        ...(c.color.trim() ? { color: c.color.trim() } : {}),
        ...(c.paint_code.trim() ? { paint_code: c.paint_code.trim() } : {}),
        ...(c.market.trim() ? { market: c.market.trim() } : {}),
      },
      condition: c.condition,
      ...(c.repaired.length ? { repaired_panels: PANELS.filter((p) => c.repaired.includes(p)) } : {}),
      ...(c.gauge_brand.trim() || c.gauge_model.trim()
        ? {
            gauge: {
              ...(c.gauge_brand.trim() ? { brand: c.gauge_brand.trim() } : {}),
              ...(c.gauge_model.trim() ? { model: c.gauge_model.trim() } : {}),
            },
          }
        : {}),
      ...(c.measured_on ? { measured_on: c.measured_on } : {}),
      ...(c.notes.trim() ? { notes: c.notes.trim() } : {}),
      readings: r,
    };
    return { record, missing };
  };

  const updateContrib = () => {
    const models = [...new Set(db.groups.filter((g) => g.make === c.make).map((g) => g.model))];
    $('#models').innerHTML = models.map((m) => `<option value="${esc(m)}">`).join('');

    const { record, missing } = buildRecord();
    const yaml = recordToYaml(record);
    $('#yaml').textContent = yaml;
    $('#missing').textContent = missing.length ? t('contrib.missing', { fields: missing.join(', ') }) : '';

    const submit = $<HTMLAnchorElement>('#submit');
    const v = record.vehicle;
    const title = `Measurement: ${db.makes.find((m) => m.slug === v.make)?.name ?? v.make} ${v.model}${v.generation ? ` ${v.generation}` : ''} ${v.year}`;
    const body = [
      '<!-- openpaintdepth:submission -->',
      `Submitted with the OpenPaintDepth web app. A bot validates this and opens a pull request.`,
      '',
      '```yaml',
      yaml.trimEnd(),
      '```',
    ].join('\n');
    submit.href = `${REPO_URL}/issues/new?${new URLSearchParams({ title, body, labels: 'submission' })}`;
    submit.classList.toggle('disabled', missing.length > 0);
    submit.setAttribute('aria-disabled', String(missing.length > 0));
    submit.dataset.file = `${v.year}-${slugify(v.model)}.yaml`;
  };

  const update = () => {
    const ref = group();
    analysis = analyze(readings(state), ref);
    paintCar(svg, analysis, state);
    const verdicts = new Map(analysis.panels.map((r) => [r.panel, r.verdict]));
    for (const p of PANELS) {
      root.querySelector(`.row[data-panel="${p}"]`)!.setAttribute('data-verdict', verdicts.get(p) ?? 'none');
    }
    $('#result').innerHTML = renderResult(analysis, ref, state);
    $('#print').toggleAttribute('disabled', analysis.panels.length < 2);
    updateContrib();
    saveState(state);
  };

  // --- events ---------------------------------------------------------------

  const setFocus = (p: Panel | null) => {
    svg.querySelectorAll('.panel.focus').forEach((el) => el.classList.remove('focus'));
    if (p) svg.querySelector(`[data-panel="${p}"]`)!.classList.add('focus');
  };

  root.querySelectorAll<HTMLInputElement>('[data-input]').forEach((input) => {
    const panel = input.dataset.input as Panel;
    input.addEventListener('input', () => {
      state.inputs[panel] = input.value;
      update();
    });
    input.addEventListener('focus', () => setFocus(panel));
    input.addEventListener('blur', () => setFocus(null));
    input.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      const next = WALK[WALK.indexOf(panel) + 1];
      if (next) inputOf(next).focus();
      else input.blur();
    });
  });

  svg.addEventListener('click', (e) => {
    const g = (e.target as Element).closest('[data-panel]');
    if (g) inputOf(g.getAttribute('data-panel') as Panel).focus();
  });

  $('#walk').addEventListener('click', () => {
    const first = WALK.find((p) => !state.inputs[p]?.trim()) ?? WALK[0]!;
    inputOf(first).focus();
  });

  $('#print').addEventListener('click', () => {
    // The report is only built on demand; it is a separate A4 layout that only exists in print.
    $('#report-doc').innerHTML = renderReport(analysis, group(), state, db);
    paintCar($('#report-doc svg.car'), analysis, state);
    window.print();
  });

  $<HTMLSelectElement>('#ref').addEventListener('change', (e) => {
    state.refId = (e.target as HTMLSelectElement).value;
    const g = group();
    // Pre-fill the contribution form from the chosen reference, without overwriting user input.
    if (g && !c.make && !c.model) {
      c.make = g.make;
      c.model = g.model;
      c.generation = g.generation ?? '';
      root.querySelector<HTMLSelectElement>('[name="make"]')!.value = c.make;
      root.querySelector<HTMLInputElement>('[name="model"]')!.value = c.model;
      root.querySelector<HTMLInputElement>('[name="generation"]')!.value = c.generation;
    }
    update();
  });

  const fillInputs = (values: Partial<Record<Panel, number[]>>) => {
    state.inputs = {};
    for (const p of PANELS) {
      const spots = values[p];
      if (spots) state.inputs[p] = spots.map((v) => fmt(v, state.unit, false)).join(' ');
      inputOf(p).value = state.inputs[p] ?? '';
    }
    update();
  };
  $('#sample').addEventListener('click', () => fillInputs(SAMPLE));
  $('#clear').addEventListener('click', () => fillInputs({}));

  const form = $<HTMLDetailsElement>('#contrib');
  form.addEventListener('input', (e) => {
    const el = e.target as HTMLInputElement;
    if (!el.name) return;
    if (el.name === 'repaired') {
      c.repaired = [...form.querySelectorAll<HTMLInputElement>('[name="repaired"]:checked')].map((x) => x.value as Panel);
    } else if (el.name === 'condition') {
      c.condition = el.value as State['contrib']['condition'];
    } else {
      (c as unknown as Record<string, string>)[el.name] = el.value;
    }
    updateContrib();
    saveState(state);
  });

  $('#suggest').addEventListener('click', () => {
    const flagged: Verdict[] = ['repaint', 'filler'];
    c.repaired = analysis.panels.filter((r) => flagged.includes(r.verdict)).map((r) => r.panel);
    form.querySelectorAll<HTMLInputElement>('[name="repaired"]').forEach((x) => {
      x.checked = c.repaired.includes(x.value as Panel);
    });
    updateContrib();
    saveState(state);
  });

  $('#submit').addEventListener('click', (e) => {
    if ((e.currentTarget as HTMLElement).classList.contains('disabled')) e.preventDefault();
  });

  $('#copy').addEventListener('click', async (e) => {
    const btn = e.currentTarget as HTMLButtonElement;
    try {
      await navigator.clipboard.writeText($('#yaml').textContent ?? '');
      btn.textContent = t('contrib.copied');
      setTimeout(() => (btn.textContent = t('contrib.copy')), 1500);
    } catch {
      // Clipboard blocked: the YAML is visible in the preview and can be selected by hand.
    }
  });

  $('#download').addEventListener('click', () => {
    const blob = new Blob([$('#yaml').textContent ?? ''], { type: 'text/yaml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = $<HTMLAnchorElement>('#submit').dataset.file ?? 'measurement.yaml';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  update();
}

// --- findings -----------------------------------------------------------------

type PanelResult = Analysis['panels'][number];

const bySeverity = (a: Analysis) =>
  [...a.panels].sort((x, y) => SEVERITY.indexOf(x.verdict) - SEVERITY.indexOf(y.verdict));

/** Only the reasons behind the panel's final verdict; the milder ones are just noise next to them. */
function reasonTexts(r: PanelResult, state: State): string[] {
  const u = (v: number) => fmt(v, state.unit);
  return r.reasons
    .filter((x) => x.verdict === r.verdict)
    .map((x) =>
      t(reasonKey(x.code), {
        v: u(r.median),
        ref: x.ref === undefined ? '' : u(x.ref),
        partner: x.partner ? panelName(x.partner) : '',
      }),
    );
}

function summaryText(a: Analysis): string {
  const flagged = bySeverity(a).filter((r) => r.verdict !== 'ok');
  if (flagged.length === 0) return t('result.summary.none', { n: a.panels.length });
  const list = flagged.map((r) => `${panelName(r.panel)} (${verdictName(r.verdict)})`).join(', ');
  return t('result.summary.some', { k: flagged.length, n: a.panels.length, list });
}

function counts(a: Analysis): string {
  return SEVERITY.filter((v) => a.counts[v] > 0)
    .map((v) => `<li data-verdict="${v}"><i></i><b>${a.counts[v]}</b> ${verdictName(v)}</li>`)
    .join('');
}

function readingsTable(a: Analysis, ref: ModelGroup | null, state: State, withReasons: boolean): string {
  const unit = state.unit === 'mil' ? 'mil' : 'µm';
  const rows = bySeverity(a)
    .map((r) => {
      const pr = ref?.panels[r.panel];
      const why = withReasons ? reasonTexts(r, state) : [];
      return `<tr data-verdict="${r.verdict}">
        <td class="panel-cell"><span class="sw"></span>${panelName(r.panel)}</td>
        <td class="num spots-cell">${r.spots.map((s) => fmt(s, state.unit, false)).join(' · ')}</td>
        <td class="num strong">${fmt(r.median, state.unit, false)}</td>
        ${ref ? `<td class="num muted">${pr ? `${fmt(pr.p10, state.unit, false)}–${fmt(pr.p90, state.unit, false)}` : '—'}</td>` : ''}
        <td><span class="verdict-label">${verdictName(r.verdict)}</span>${why.length ? `<ul class="reasons">${why.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}</td>
      </tr>`;
    })
    .join('');
  return `<table class="report">
    <thead><tr>
      <th>${t('check.table.panel')}</th>
      <th class="num">${t('report.spots')} <span class="keep-case">(${unit})</span></th>
      <th class="num">${t('report.median')}</th>
      ${ref ? `<th class="num">${t('check.table.reference')}</th>` : ''}
      <th>${t('check.table.result')}</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function renderResult(a: Analysis, ref: ModelGroup | null, state: State): string {
  if (a.panels.length < 2) {
    return `<div class="verdict-hero idle">${gaugeSvg(null)}<p class="note">${t('check.empty')}</p></div>`;
  }
  const u = (v: number) => fmt(v, state.unit);
  const flagged = bySeverity(a).filter((r) => r.verdict !== 'ok');

  const cards = flagged
    .map(
      (r) => `<article class="finding" data-verdict="${r.verdict}">
        <header>
          <span class="verdict-label">${verdictName(r.verdict)}</span>
          <h4>${panelName(r.panel)}</h4>
          <span class="finding-value">${u(r.median)}</span>
        </header>
        <ul class="reasons">${reasonTexts(r, state).map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
        <p class="explain"><b>${t('explain.label')}</b> ${t(`explain.${r.verdict as Exclude<Verdict, 'ok'>}`)}</p>
      </article>`,
    )
    .join('');

  return `
    <div class="verdict-hero" data-verdict="${a.worst}">
      ${gaugeSvg(a.worst)}
      <div class="verdict-text">
        <p class="eyebrow">${t('result.counts', { n: a.panels.length })}</p>
        <h3>${t(`headline.${a.worst}`)}</h3>
        <p class="summary">${esc(summaryText(a))}</p>
        <ul class="counts">${counts(a)}</ul>
      </div>
    </div>
    ${flagged.length ? `<h3 class="block-title">${t('result.flagged')}</h3><div class="findings">${cards}</div>` : ''}
    <details class="all-readings" ${flagged.length ? '' : 'open'}>
      <summary class="block-title">${t('result.all')} <span class="mono muted">(${a.panels.length})</span></summary>
      ${a.baseline !== null ? `<p class="note">${t(a.baselineSource === 'car' ? 'check.baseline.car' : 'check.baseline.reference', { v: u(a.baseline) })}</p>` : ''}
      <div class="table-wrap">${readingsTable(a, ref, state, false)}</div>
    </details>
    ${a.thinnest ? `<p class="tip"><span class="tape small">${t('tip.label')}</span> ${esc(t('check.tip.thinnest', { v: u(a.thinnest.value), panel: panelName(a.thinnest.panel) }))}</p>` : ''}
    <p class="fineprint">${t('check.disclaimer')}</p>`;
}

// --- printable report -----------------------------------------------------------

function renderReport(a: Analysis, ref: ModelGroup | null, state: State, db: Db): string {
  const c = state.contrib;
  const make = db.makes.find((m) => m.slug === c.make)?.name ?? '';
  const vehicle = [make, c.model.trim(), c.generation.trim()].filter(Boolean).join(' ');
  const paint = [c.color.trim(), c.paint_code.trim()].filter(Boolean).join(' / ');
  const gauge = [c.gauge_brand.trim(), c.gauge_model.trim()].filter(Boolean).join(' ');
  const date = c.measured_on || new Date().toLocaleDateString('sv-SE');
  // Empty values become a writing line, so the sheet can be completed by hand.
  const value = (v: string) => (v ? esc(v) : '<span class="blank"></span>');
  const facts: [Key, string][] = [
    ['report.vehicle', vehicle],
    ['report.year', c.year],
    ['report.paint', paint],
    ['report.gauge', gauge],
    ['report.reference', ref ? groupLabel(ref) : ''],
    ['report.unit', state.unit === 'mil' ? 'mil (1 mil = 25.4 µm)' : 'µm'],
  ];

  return `
    <header class="rd-head">
      <img src="${import.meta.env.BASE_URL}icon.svg" alt="" width="44" height="44">
      <div>
        <h1>${t('report.title')}</h1>
        <p class="mono">OpenPaintDepth</p>
      </div>
      <dl class="rd-date"><dt>${t('report.date')}</dt><dd>${esc(date)}</dd></dl>
    </header>
    <dl class="rd-facts">${facts.map(([k, v]) => `<div><dt>${t(k)}</dt><dd>${value(v)}</dd></div>`).join('')}</dl>
    <section class="rd-main">
      <figure>${carSvg(PANEL_NAMES())}
        <figcaption class="legend"><ol>${GAUGE_ORDER.map((v) => `<li data-verdict="${v}"><i></i>${verdictName(v)}</li>`).join('')}</ol></figcaption>
      </figure>
      <div class="rd-verdict" data-verdict="${a.worst}">
        ${gaugeSvg(a.worst)}
        <h2>${t(`headline.${a.worst}`)}</h2>
        <p>${esc(summaryText(a))}</p>
        <ul class="counts">${counts(a)}</ul>
        ${a.baseline !== null ? `<p class="small">${t(a.baselineSource === 'car' ? 'check.baseline.car' : 'check.baseline.reference', { v: fmt(a.baseline, state.unit) })}</p>` : ''}
      </div>
    </section>
    ${readingsTable(a, ref, state, true)}
    <dl class="rd-sign">
      <div class="rd-notes"><dt>${t('report.notes')}</dt><dd>${c.notes.trim() ? esc(c.notes.trim()) : ''}</dd></div>
      <div><dt>${t('report.inspector')}</dt><dd><span class="blank"></span></dd></div>
      <div><dt>${t('report.signature')}</dt><dd><span class="blank"></span></dd></div>
    </dl>
    <footer class="rd-foot">
      <p>${t('check.disclaimer')}</p>
      <p class="mono">${t('report.footer')} ${REPO_URL.replace('https://', '')}</p>
    </footer>`;
}
