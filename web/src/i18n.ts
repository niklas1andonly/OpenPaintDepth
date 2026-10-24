import type { Panel } from '../../src/core/panels.ts';
import type { ReasonCode, Verdict } from '../../src/core/analysis.ts';

// Adding a language: copy `en`, translate the values, add it to LANGS. That's all.

const en = {
  'app.tagline': 'Open factory paint thickness data — and a repaint checker that runs in your pocket.',
  'hero.eyebrow': 'Open data for detailers & car buyers',
  'hero.l1': 'Measure paint.',
  'hero.l2': 'Spot repaints.',
  'hero.l3': 'Share what you know.',
  'hero.lede':
    'The open database of factory paint thickness — per model and per panel. With a repaint checker that works offline, right in the garage.',
  'stats.models': 'Model groups',
  'stats.real': 'Real measurements',
  'stats.panels': 'Panels per car',
  'sheet.measure': 'Measurement',
  'sheet.result': 'Findings',
  'sheet.contrib': 'Contribute',
  'group.center': 'Centre',
  'group.left': 'Left side',
  'group.right': 'Right side',
  'check.walk': 'Start walk-around',
  'check.walk.hint': 'Press Enter to jump to the next panel — once around the car.',
  'check.print': 'Print / save as PDF',
  'result.eyebrow': 'Overall',
  'result.counts': '{n} panels measured',
  'tip.label': 'Tip',
  'legend.title': 'Paint thickness',
  'print.title': 'Paint inspection report',
  'print.date': 'Date',
  'print.vehicle': 'Vehicle',
  'print.reference': 'Reference',
  'footer.made': 'Built by the detailing community, for the detailing community.',
  'tape.browse': 'Open data',
  'tape.about': 'Project',

  'result.summary.none': 'All {n} measured panels are consistent with factory paint.',
  'result.summary.some': '{k} of {n} panels stand out: {list}.',
  'result.flagged': 'Panels that stand out',
  'result.all': 'All readings',
  'explain.label': 'What this means',
  'explain.attention': 'Slightly different from the rest of the car. Measure a few more spots before you judge it.',
  'explain.thin':
    'Little paint left, often from heavy polishing in the past. Use only a gentle polish here, or none at all.',
  'explain.repaint':
    'This panel was most likely repainted, for example after a scratch or minor damage. When buying, ask about it.',
  'explain.filler':
    'There is very likely body filler under the paint, which points to a repaired dent or accident damage. Do not machine-polish hard here. When buying, ask about it.',

  'report.title': 'Paint inspection report',
  'report.vehicle': 'Vehicle',
  'report.year': 'Model year',
  'report.paint': 'Colour / paint code',
  'report.gauge': 'Gauge',
  'report.reference': 'Compared with',
  'report.unit': 'Unit',
  'report.spots': 'Spots',
  'report.median': 'Median',
  'report.notes': 'Notes',
  'report.inspector': 'Checked by',
  'report.signature': 'Signature',
  'report.date': 'Date',
  'report.footer': 'Created with OpenPaintDepth — free, open-source paint thickness checker.',

  'contrib.steps.1.t': 'Describe the car',
  'contrib.steps.1.d': 'Make, model and year are enough. Everything else is optional.',
  'contrib.steps.2.t': 'Press “Send via GitHub”',
  'contrib.steps.2.d': 'GitHub opens in a new tab with everything already filled in.',
  'contrib.steps.3.t': 'Click “Create”',
  'contrib.steps.3.d': 'Done! A bot checks the numbers, and once approved they are part of the database.',
  'contrib.faq.github.q': 'What is GitHub?',
  'contrib.faq.github.a':
    'GitHub is the free website where OpenPaintDepth and all its data are stored openly, a bit like a public archive. To send a measurement you need a free account (takes about a minute).',
  'contrib.faq.github.link': 'Create a free GitHub account',
  'contrib.faq.shared.q': 'What exactly is shared?',
  'contrib.faq.shared.a':
    'Only the car model, year, the paint details you enter and the readings. Never a VIN, plate number, your name or your location. Your GitHub username is shown as the contributor.',
  'contrib.section.car': 'The car',
  'contrib.section.optional': 'Optional — makes the data more precise',
  'contrib.section.history': 'Paint history',
  'contrib.repaired.help':
    'Do you know (or suspect) that a panel was repainted? Tick it, so it is not counted as factory paint.',
  'contrib.tech': 'Technical preview (for developers)',
  'contrib.opens': 'Opens github.com in a new tab.',
  'nav.check': 'Check a car',
  'nav.browse': 'Database',
  'nav.about': 'About',
  'unit.label': 'Unit',

  'check.title': 'Check a car',
  'check.intro':
    'Enter your gauge readings per panel. Several spots per panel? Separate them with spaces: "118 121 116". Everything is computed on your device.',
  'check.reference': 'Compare with',
  'check.reference.none': 'No reference — compare the car with itself',
  'check.sample': 'Load example',
  'check.clear': 'Clear',
  'check.empty': 'Enter readings on at least two panels to get a result.',
  'check.baseline.car': 'This car’s baseline (median of all panels): {v}',
  'check.baseline.reference': 'Baseline from the reference model: {v}',
  'check.table.panel': 'Panel',
  'check.table.value': 'Reading',
  'check.table.reference': 'Reference p10–p90',
  'check.table.result': 'Result',
  'check.tip.thinnest':
    'The thinnest spot is {v} ({panel}). Clear coat is usually only about 30–50 µm of the total — polish thin panels with a gentle combo.',
  'check.disclaimer':
    'Heuristics, not a verdict. Factory paint varies by plant, colour and year; aluminium and plastic panels need the right gauge mode. See “About” for the rules.',

  'headline.ok': 'Paint looks original',
  'headline.attention': 'Mostly original — some panels need a closer look',
  'headline.thin': 'Thin paint found — be careful with machine polishing',
  'headline.repaint': 'Repainted panels found',
  'headline.filler': 'Body filler likely',

  'verdict.ok': 'OK',
  'verdict.attention': 'Check closer',
  'verdict.thin': 'Thin',
  'verdict.repaint': 'Repainted',
  'verdict.filler': 'Filler',

  'reason.filler': '≥ {ref} — almost certainly filler under the paint',
  'reason.repaint_rel': '{v} vs. car baseline {ref} — refinished',
  'reason.repaint_ref': '{v} vs. {ref} (p90 of this model) — refinished',
  'reason.high_rel': '{v} vs. car baseline {ref} — thicker than the rest',
  'reason.asym': '{v} vs. {partner} {ref} — left/right mismatch',
  'reason.spread': 'spots differ by {ref} — blending or spot repair',
  'reason.thin_rel': '{v} vs. car baseline {ref} — thin, probably polished a lot',
  'reason.thin_abs': '{v} is below {ref} — very thin paint',
  'reason.thin_ref': '{v} vs. {ref} (p10 of this model) — thinner than usual',

  'contrib.title': 'Add this car to the open database',
  'contrib.intro':
    'Your readings help every detailer and car buyer get better reference values. It takes about two minutes, and no technical knowledge is needed.',
  'contrib.make': 'Make',
  'contrib.make.pick': 'Choose…',
  'contrib.model': 'Model',
  'contrib.generation': 'Generation / chassis code',
  'contrib.generation.hint': 'e.g. Mk7, F30, E210 (optional)',
  'contrib.year': 'Model year',
  'contrib.paint_type': 'Paint type',
  'contrib.color': 'Colour',
  'contrib.paint_code': 'Paint code',
  'contrib.market': 'Market',
  'contrib.condition': 'Paint history',
  'contrib.condition.factory': 'I know the paint is original (new car or documented history)',
  'contrib.condition.unknown': 'I don’t know the car’s history (that’s fine!)',
  'contrib.repaired': 'Panels you know or suspect were repainted',
  'contrib.repaired.suggest': 'Use checker results',
  'contrib.gauge_brand': 'Gauge brand',
  'contrib.gauge_model': 'Gauge model',
  'contrib.measured_on': 'Measured on',
  'contrib.notes': 'Notes',
  'contrib.preview': 'Preview of the data file',
  'contrib.submit': 'Send via GitHub',
  'contrib.copy': 'Copy YAML',
  'contrib.copied': 'Copied!',
  'contrib.download': 'Download .yaml',
  'contrib.missing': 'To send, please fill in: {fields}',

  'browse.title': 'Database',
  'browse.search': 'Search make, model or chassis code…',
  'browse.stats': '{groups} model groups · {records} cars measured',
  'browse.demo.notice':
    'There are no real measurements yet — the entries below are clearly marked example data so you can see how it works. Be the first to contribute!',
  'browse.vehicles': '{n} cars',
  'browse.median': 'median {v}',
  'browse.range': 'p10–p90: {a}–{b}',
  'browse.use': 'Use as reference',
  'browse.none': 'Nothing found.',
  'badge.demo': 'Example data',

  'about.title': 'About OpenPaintDepth',
  'about.what':
    'OpenPaintDepth is an open, community-built database of factory paint thickness for cars — per make, model, generation and panel. It helps detailers decide how much paint correction is safe, and helps buyers spot repaints and body filler on used cars.',
  'about.how.title': 'How the checker decides',
  'about.how':
    'The checker first compares a car with itself: the median of all panels is its baseline. Panels far above it were most likely refinished, readings above 300 µm almost always mean filler, big left/right differences and big spreads on one panel hint at blending. When a reference model is selected, readings are also compared with what the community measured on the same model.',
  'about.data.title': 'Open data',
  'about.data':
    'Every measurement is a small YAML file in the GitHub repository. Contributions are pull requests, checked automatically. The data is licensed under ODbL 1.0, the code under MIT — use it, build on it, keep it open.',
  'about.privacy.title': 'Privacy',
  'about.privacy':
    'The app runs entirely in your browser and works offline. Nothing is sent anywhere unless you choose to submit a measurement on GitHub.',
  'about.repo': 'Source code & data on GitHub',
} as const;

export type Key = keyof typeof en;
type Dict = Record<Key, string>;

const de: Dict = {
  'app.tagline': 'Offene Werkslack-Schichtdicken – und ein Nachlack-Check für die Hosentasche.',
  'hero.eyebrow': 'Offene Daten für Detailer & Autokäufer',
  'hero.l1': 'Lack messen.',
  'hero.l2': 'Nachlack erkennen.',
  'hero.l3': 'Wissen teilen.',
  'hero.lede':
    'Die offene Datenbank für Werkslack-Schichtdicken – pro Modell und Bauteil. Mit einem Nachlack-Check, der auch offline in der Garage läuft.',
  'stats.models': 'Modellgruppen',
  'stats.real': 'Echte Messungen',
  'stats.panels': 'Bauteile pro Auto',
  'sheet.measure': 'Messung',
  'sheet.result': 'Befund',
  'sheet.contrib': 'Beitragen',
  'group.center': 'Mitte',
  'group.left': 'Linke Seite',
  'group.right': 'Rechte Seite',
  'check.walk': 'Rundgang starten',
  'check.walk.hint': 'Enter springt zum nächsten Bauteil – einmal ums Auto.',
  'check.print': 'Drucken / als PDF',
  'result.eyebrow': 'Gesamturteil',
  'result.counts': '{n} Bauteile gemessen',
  'tip.label': 'Tipp',
  'legend.title': 'Schichtdicke',
  'print.title': 'Lackmessprotokoll',
  'print.date': 'Datum',
  'print.vehicle': 'Fahrzeug',
  'print.reference': 'Referenz',
  'footer.made': 'Von der Detailing-Community, für die Detailing-Community.',
  'tape.browse': 'Offene Daten',
  'tape.about': 'Projekt',

  'result.summary.none': 'Alle {n} gemessenen Bauteile passen zu Werkslack.',
  'result.summary.some': '{k} von {n} Bauteilen fallen auf: {list}.',
  'result.flagged': 'Auffällige Bauteile',
  'result.all': 'Alle Messwerte',
  'explain.label': 'Was heißt das?',
  'explain.attention': 'Etwas anders als der Rest des Autos. Miss noch ein paar Stellen nach, bevor du urteilst.',
  'explain.thin':
    'Hier ist wenig Lack übrig, oft durch starkes Polieren in der Vergangenheit. Nur sehr mild polieren, oder gar nicht.',
  'explain.repaint':
    'Dieses Teil wurde sehr wahrscheinlich neu lackiert, zum Beispiel nach einem Kratzer oder kleinen Schaden. Beim Autokauf nachfragen.',
  'explain.filler':
    'Unter dem Lack liegt sehr wahrscheinlich Spachtelmasse. Das deutet auf eine reparierte Delle oder einen Unfallschaden hin. Hier nicht stark maschinell polieren. Beim Autokauf genau nachfragen.',

  'report.title': 'Lackmessprotokoll',
  'report.vehicle': 'Fahrzeug',
  'report.year': 'Modelljahr',
  'report.paint': 'Farbe / Farbcode',
  'report.gauge': 'Messgerät',
  'report.reference': 'Verglichen mit',
  'report.unit': 'Einheit',
  'report.spots': 'Messpunkte',
  'report.median': 'Median',
  'report.notes': 'Notizen',
  'report.inspector': 'Geprüft von',
  'report.signature': 'Unterschrift',
  'report.date': 'Datum',
  'report.footer': 'Erstellt mit OpenPaintDepth – kostenloser, offener Lackschicht-Check.',

  'contrib.steps.1.t': 'Auto beschreiben',
  'contrib.steps.1.d': 'Marke, Modell und Baujahr reichen. Alles andere ist freiwillig.',
  'contrib.steps.2.t': 'Auf „Über GitHub senden“ tippen',
  'contrib.steps.2.d': 'GitHub öffnet sich in einem neuen Tab, alles ist schon ausgefüllt.',
  'contrib.steps.3.t': 'Auf „Create“ klicken',
  'contrib.steps.3.d': 'Fertig! Ein Bot prüft die Werte, und nach der Freigabe sind sie Teil der Datenbank.',
  'contrib.faq.github.q': 'Was ist GitHub?',
  'contrib.faq.github.a':
    'GitHub ist die kostenlose Website, auf der OpenPaintDepth mit allen Daten offen gespeichert wird, ähnlich wie ein öffentliches Archiv. Zum Senden brauchst du ein kostenloses Konto (dauert etwa eine Minute).',
  'contrib.faq.github.link': 'Kostenloses GitHub-Konto erstellen',
  'contrib.faq.shared.q': 'Was genau wird geteilt?',
  'contrib.faq.shared.a':
    'Nur Automodell, Baujahr, die Lackangaben, die du einträgst, und die Messwerte. Niemals FIN, Kennzeichen, dein Name oder dein Standort. Dein GitHub-Benutzername wird als Beitragende*r angezeigt.',
  'contrib.section.car': 'Das Auto',
  'contrib.section.optional': 'Optional – macht die Daten genauer',
  'contrib.section.history': 'Lack-Historie',
  'contrib.repaired.help':
    'Weißt du (oder vermutest du), dass ein Teil nachlackiert ist? Dann hak es an, damit es nicht als Werkslack zählt.',
  'contrib.tech': 'Technische Vorschau (für Entwickler)',
  'contrib.opens': 'Öffnet github.com in einem neuen Tab.',
  'nav.check': 'Auto prüfen',
  'nav.browse': 'Datenbank',
  'nav.about': 'Über',
  'unit.label': 'Einheit',

  'check.title': 'Auto prüfen',
  'check.intro':
    'Trag deine Messwerte pro Bauteil ein. Mehrere Messpunkte pro Bauteil? Einfach mit Leerzeichen trennen: „118 121 116“. Alles wird auf deinem Gerät berechnet.',
  'check.reference': 'Vergleichen mit',
  'check.reference.none': 'Keine Referenz – Auto mit sich selbst vergleichen',
  'check.sample': 'Beispiel laden',
  'check.clear': 'Leeren',
  'check.empty': 'Trag Werte auf mindestens zwei Bauteilen ein, um ein Ergebnis zu sehen.',
  'check.baseline.car': 'Grundwert dieses Autos (Median aller Bauteile): {v}',
  'check.baseline.reference': 'Grundwert aus dem Referenzmodell: {v}',
  'check.table.panel': 'Bauteil',
  'check.table.value': 'Messwert',
  'check.table.reference': 'Referenz p10–p90',
  'check.table.result': 'Ergebnis',
  'check.tip.thinnest':
    'Die dünnste Stelle hat {v} ({panel}). Der Klarlack macht meist nur etwa 30–50 µm des Gesamtaufbaus aus – dünne Bauteile nur mit milder Kombination polieren.',
  'check.disclaimer':
    'Faustregeln, kein Gutachten. Werkslack schwankt je nach Werk, Farbe und Baujahr; Alu- und Kunststoffteile brauchen den passenden Messmodus. Die Regeln stehen unter „Über“.',

  'headline.ok': 'Lack wirkt original',
  'headline.attention': 'Weitgehend original – einige Bauteile genauer ansehen',
  'headline.thin': 'Dünner Lack gefunden – vorsichtig polieren',
  'headline.repaint': 'Nachlackierte Bauteile gefunden',
  'headline.filler': 'Wahrscheinlich gespachtelt',

  'verdict.ok': 'OK',
  'verdict.attention': 'Genauer prüfen',
  'verdict.thin': 'Dünn',
  'verdict.repaint': 'Nachlackiert',
  'verdict.filler': 'Spachtel',

  'reason.filler': '≥ {ref} – fast sicher Spachtel unter dem Lack',
  'reason.repaint_rel': '{v} vs. Grundwert {ref} – nachlackiert',
  'reason.repaint_ref': '{v} vs. {ref} (p90 dieses Modells) – nachlackiert',
  'reason.high_rel': '{v} vs. Grundwert {ref} – dicker als der Rest',
  'reason.asym': '{v} vs. {partner} {ref} – links/rechts unterschiedlich',
  'reason.spread': 'Messpunkte weichen um {ref} ab – Beilackierung oder Smart-Repair',
  'reason.thin_rel': '{v} vs. Grundwert {ref} – dünn, vermutlich stark poliert',
  'reason.thin_abs': '{v} liegt unter {ref} – sehr dünner Lack',
  'reason.thin_ref': '{v} vs. {ref} (p10 dieses Modells) – dünner als üblich',

  'contrib.title': 'Dieses Auto zur offenen Datenbank hinzufügen',
  'contrib.intro':
    'Deine Messwerte helfen allen Detailern und Autokäufern zu besseren Vergleichswerten. Dauert etwa zwei Minuten, technisches Wissen brauchst du nicht.',
  'contrib.make': 'Marke',
  'contrib.make.pick': 'Auswählen…',
  'contrib.model': 'Modell',
  'contrib.generation': 'Generation / Baureihe',
  'contrib.generation.hint': 'z. B. Mk7, F30, E210 (optional)',
  'contrib.year': 'Modelljahr',
  'contrib.paint_type': 'Lackart',
  'contrib.color': 'Farbe',
  'contrib.paint_code': 'Farbcode',
  'contrib.market': 'Markt',
  'contrib.condition': 'Lack-Historie',
  'contrib.condition.factory': 'Ich weiß, dass der Lack original ist (Neuwagen oder belegte Historie)',
  'contrib.condition.unknown': 'Ich kenne die Historie nicht (kein Problem!)',
  'contrib.repaired': 'Bauteile, die (vermutlich) nachlackiert sind',
  'contrib.repaired.suggest': 'Aus dem Check übernehmen',
  'contrib.gauge_brand': 'Messgerät Marke',
  'contrib.gauge_model': 'Messgerät Modell',
  'contrib.measured_on': 'Gemessen am',
  'contrib.notes': 'Notizen',
  'contrib.preview': 'Vorschau der Datendatei',
  'contrib.submit': 'Über GitHub senden',
  'contrib.copy': 'YAML kopieren',
  'contrib.copied': 'Kopiert!',
  'contrib.download': '.yaml herunterladen',
  'contrib.missing': 'Zum Senden bitte noch ausfüllen: {fields}',

  'browse.title': 'Datenbank',
  'browse.search': 'Marke, Modell oder Baureihe suchen…',
  'browse.stats': '{groups} Modellgruppen · {records} Autos gemessen',
  'browse.demo.notice':
    'Es gibt noch keine echten Messungen – die Einträge unten sind klar markierte Beispieldaten, damit du siehst, wie es funktioniert. Sei die erste Person, die beiträgt!',
  'browse.vehicles': '{n} Autos',
  'browse.median': 'Median {v}',
  'browse.range': 'p10–p90: {a}–{b}',
  'browse.use': 'Als Referenz nutzen',
  'browse.none': 'Nichts gefunden.',
  'badge.demo': 'Beispieldaten',

  'about.title': 'Über OpenPaintDepth',
  'about.what':
    'OpenPaintDepth ist eine offene, von der Community gepflegte Datenbank mit Werkslack-Schichtdicken – pro Marke, Modell, Generation und Bauteil. Detailer sehen, wie viel Lackkorrektur sicher ist, und Gebrauchtwagenkäufer erkennen Nachlackierungen und Spachtel.',
  'about.how.title': 'So entscheidet der Check',
  'about.how':
    'Der Check vergleicht ein Auto zuerst mit sich selbst: Der Median aller Bauteile ist sein Grundwert. Bauteile deutlich darüber sind meist nachlackiert, Werte über 300 µm bedeuten fast immer Spachtel, große Links/Rechts-Unterschiede und starke Streuung auf einem Bauteil deuten auf Beilackierung hin. Mit einem Referenzmodell werden die Werte zusätzlich mit den Messungen der Community am gleichen Modell verglichen.',
  'about.data.title': 'Offene Daten',
  'about.data':
    'Jede Messung ist eine kleine YAML-Datei im GitHub-Repository. Beiträge sind Pull Requests und werden automatisch geprüft. Die Daten stehen unter ODbL 1.0, der Code unter MIT – nutzen, darauf aufbauen, offen halten.',
  'about.privacy.title': 'Datenschutz',
  'about.privacy':
    'Die App läuft komplett in deinem Browser und funktioniert offline. Es wird nichts verschickt, außer du reichst selbst eine Messung auf GitHub ein.',
  'about.repo': 'Quellcode & Daten auf GitHub',
};

const PANEL_NAMES: Record<Lang, Record<Panel, string>> = {
  en: {
    hood: 'Hood',
    roof: 'Roof',
    trunk: 'Trunk / tailgate',
    fender_fl: 'Front fender L',
    fender_fr: 'Front fender R',
    door_fl: 'Front door L',
    door_fr: 'Front door R',
    door_rl: 'Rear door L',
    door_rr: 'Rear door R',
    quarter_rl: 'Rear quarter L',
    quarter_rr: 'Rear quarter R',
    pillar_l: 'A-pillar L',
    pillar_r: 'A-pillar R',
    sill_l: 'Sill L',
    sill_r: 'Sill R',
  },
  de: {
    hood: 'Motorhaube',
    roof: 'Dach',
    trunk: 'Heckklappe',
    fender_fl: 'Kotflügel vorn L',
    fender_fr: 'Kotflügel vorn R',
    door_fl: 'Tür vorn L',
    door_fr: 'Tür vorn R',
    door_rl: 'Tür hinten L',
    door_rr: 'Tür hinten R',
    quarter_rl: 'Seitenwand hinten L',
    quarter_rr: 'Seitenwand hinten R',
    pillar_l: 'A-Säule L',
    pillar_r: 'A-Säule R',
    sill_l: 'Schweller L',
    sill_r: 'Schweller R',
  },
};

export const LANGS = { en, de } as const;
export type Lang = keyof typeof LANGS;

let current: Lang = 'en';

export function detectLang(): Lang {
  const preferred = navigator.languages ?? [navigator.language];
  for (const l of preferred) {
    const code = l.slice(0, 2).toLowerCase();
    if (code in LANGS) return code as Lang;
  }
  return 'en';
}

export function setLang(lang: Lang) {
  current = lang;
  document.documentElement.lang = lang;
}

export function getLang(): Lang {
  return current;
}

export function t(key: Key, params: Record<string, string | number> = {}): string {
  const template: string = LANGS[current][key] ?? en[key];
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(params[k] ?? `{${k}}`));
}

export const panelName = (p: Panel) => PANEL_NAMES[current][p];
/** Panel name without the side suffix, for lists that are already grouped by side. */
export const panelShortName = (p: Panel) => PANEL_NAMES[current][p].replace(/ [LR]$/, '');
export const verdictName = (v: Verdict) => t(`verdict.${v}`);
export const reasonKey = (code: ReasonCode): Key => `reason.${code}`;
