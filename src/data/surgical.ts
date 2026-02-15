import type { SelectOption } from '../types';

export const flapDesigns: SelectOption[] = [
  { value: 'full_thickness_rectangular', label: 'Full thickness — rectangular' },
  { value: 'full_thickness_triangular', label: 'Full thickness — triangular' },
  { value: 'envelope', label: 'Envelope flap' },
  { value: 'semilunar', label: 'Semilunar flap' },
  { value: 'submarginal', label: 'Submarginal (Ochsenbein-Luebke)' },
];

export const retroMaterials: SelectOption[] = [
  { value: 'mta_grey', label: 'MTA (grey)' },
  { value: 'mta_white', label: 'MTA (white)' },
  { value: 'biodentine', label: 'Biodentine' },
  { value: 'bc_putty', label: 'BC Putty' },
  { value: 'super_eba', label: 'Super EBA' },
  { value: 'irm', label: 'IRM' },
  { value: 'gic', label: 'Glass ionomer cement' },
  { value: 'errm', label: 'ERRM' },
];

export const graftOptions: SelectOption[] = [
  { value: 'none', label: 'None' },
  { value: 'calcium_sulfate', label: 'Calcium sulfate' },
  { value: 'bone_graft_with_membrane', label: 'Bone graft with membrane' },
  { value: 'bone_graft_without_membrane', label: 'Bone graft without membrane' },
];

export const hemostaticAgents: SelectOption[] = [
  { value: 'racellet', label: 'Racellet' },
  { value: 'ferric_sulfate', label: 'Ferric sulfate (Astringedent)' },
  { value: 'collatape', label: 'CollaTape/CollaCote' },
  { value: 'bone_wax', label: 'Bone wax' },
  { value: 'epi_cotton', label: 'Epinephrine-impregnated cotton' },
];

export const sutureMaterials: SelectOption[] = [
  { value: '4_0_silk', label: '4-0 Silk' },
  { value: '4_0_vicryl', label: '4-0 Vicryl' },
  { value: '4_0_ptfe', label: '4-0 PTFE (Gore-Tex)' },
  { value: '5_0_silk', label: '5-0 Silk' },
  { value: '5_0_chromic', label: '5-0 Chromic gut' },
  { value: '6_0_prolene', label: '6-0 Prolene (monofilament)' },
];

export const antibioticPastes: SelectOption[] = [
  { value: 'tap', label: 'Triple antibiotic paste (TAP)' },
  { value: 'dap', label: 'Double antibiotic paste (DAP)' },
  { value: 'calcium_hydroxide', label: 'Calcium hydroxide' },
  { value: 'none', label: 'None' },
];

export const regenScaffolds: SelectOption[] = [
  { value: 'blood_clot', label: 'Blood clot' },
  { value: 'prf', label: 'PRF (platelet-rich fibrin)' },
  { value: 'prf_blood', label: 'PRF + blood clot' },
  { value: 'collagen', label: 'Collagen sponge' },
];

export const storageMedia: SelectOption[] = [
  { value: 'hbss', label: "Hank's Balanced Salt Solution (HBSS)" },
  { value: 'milk', label: 'Milk' },
  { value: 'saline', label: 'Normal saline' },
  { value: 'saliva', label: 'Patient saliva (buccal vestibule)' },
  { value: 'viaspan', label: 'ViaSpan' },
];

export const pulpCapMaterials: SelectOption[] = [
  { value: 'mta', label: 'MTA' },
  { value: 'biodentine', label: 'Biodentine' },
  { value: 'ca_oh', label: 'Calcium hydroxide (Dycal)' },
  { value: 'proroot', label: 'ProRoot MTA' },
  { value: 'theracal', label: 'TheraCal LC' },
];

export const apexPlugMaterials: SelectOption[] = [
  { value: 'mta_grey', label: 'MTA (grey)' },
  { value: 'mta_white', label: 'MTA (white)' },
  { value: 'biodentine', label: 'Biodentine' },
  { value: 'cem', label: 'CEM Cement' },
];

export const rootDevStages: SelectOption[] = [
  { value: 'open_apex', label: 'Open apex (immature root)' },
  { value: 'partial', label: 'Partially developed (Cvek stage 8–9)' },
  { value: 'closed_apex', label: 'Closed apex (mature root)' },
];

export const splintTypes: SelectOption[] = [
  { value: 'none', label: 'No splint' },
  { value: 'flexible_wire', label: 'Flexible wire + composite' },
  { value: 'fiber_ribbon', label: 'Fiber-reinforced ribbon' },
  { value: 'rigid', label: 'Rigid splint' },
];

export const replantRctPlan: SelectOption[] = [
  { value: 'immediate', label: 'Immediate RCT at replantation' },
  { value: 'delayed', label: 'Delayed RCT (3–4 months)' },
  { value: 'not_required', label: 'Not required (open apex / regen planned)' },
];

export const pulpotomyLevels: SelectOption[] = [
  { value: 'partial', label: 'Partial (Cvek) pulpotomy' },
  { value: 'cervical', label: 'Cervical pulpotomy' },
  { value: 'full', label: 'Full pulpotomy' },
];
