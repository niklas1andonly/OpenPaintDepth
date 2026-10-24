// Panel keys are part of the data format — never rename one, only add new ones.
export const PANELS = [
  'hood',
  'roof',
  'trunk',
  'fender_fl',
  'fender_fr',
  'door_fl',
  'door_fr',
  'door_rl',
  'door_rr',
  'quarter_rl',
  'quarter_rr',
  'pillar_l',
  'pillar_r',
  'sill_l',
  'sill_r',
] as const;

export type Panel = (typeof PANELS)[number];

export const SUBSTRATES = ['steel', 'aluminium', 'plastic', 'composite'] as const;
export type Substrate = (typeof SUBSTRATES)[number];

/** Left/right partners. A big difference between them is a classic repair hint. */
export const MIRROR: Partial<Record<Panel, Panel>> = {
  fender_fl: 'fender_fr',
  fender_fr: 'fender_fl',
  door_fl: 'door_fr',
  door_fr: 'door_fl',
  door_rl: 'door_rr',
  door_rr: 'door_rl',
  quarter_rl: 'quarter_rr',
  quarter_rr: 'quarter_rl',
  pillar_l: 'pillar_r',
  pillar_r: 'pillar_l',
  sill_l: 'sill_r',
  sill_r: 'sill_l',
};

export function isPanel(value: string): value is Panel {
  return (PANELS as readonly string[]).includes(value);
}
