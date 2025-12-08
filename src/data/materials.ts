import type { SelectOption } from '../types';

// Anesthesia Types (updated: added Marcaine, removed Septocaine)
export const anesthesiaTypes: SelectOption[] = [
  { value: 'lidocaine_epi', label: 'Lidocaine 2% w/ 1:100,000 epi' },
  { value: 'lidocaine_no_epi', label: 'Lidocaine 2% plain' },
  { value: 'articaine_epi', label: 'Articaine 4% w/ 1:100,000 epi' },
  { value: 'articaine_200', label: 'Articaine 4% w/ 1:200,000 epi' },
  { value: 'mepivacaine_epi', label: 'Mepivacaine 2% w/ 1:20,000 levo' },
  { value: 'mepivacaine_plain', label: 'Mepivacaine 3% plain' },
  { value: 'bupivacaine', label: 'Bupivacaine 0.5% w/ 1:200,000 epi' },
  { value: 'marcaine', label: 'Marcaine 0.5% w/ 1:50,000 epi' },
];

// Anesthesia amounts (updated: up to 11 carpules)
export const anesthesiaAmounts: SelectOption[] = [
  { value: '0.5', label: '0.5 carpule' },
  { value: '1', label: '1 carpule' },
  { value: '1.5', label: '1.5 carpules' },
  { value: '2', label: '2 carpules' },
  { value: '2.5', label: '2.5 carpules' },
  { value: '3', label: '3 carpules' },
  { value: '3.5', label: '3.5 carpules' },
  { value: '4', label: '4 carpules' },
  { value: '4.5', label: '4.5 carpules' },
  { value: '5', label: '5 carpules' },
  { value: '5.5', label: '5.5 carpules' },
  { value: '6', label: '6 carpules' },
  { value: '6.5', label: '6.5 carpules' },
  { value: '7', label: '7 carpules' },
  { value: '7.5', label: '7.5 carpules' },
  { value: '8', label: '8 carpules' },
  { value: '8.5', label: '8.5 carpules' },
  { value: '9', label: '9 carpules' },
  { value: '9.5', label: '9.5 carpules' },
  { value: '10', label: '10 carpules' },
  { value: '10.5', label: '10.5 carpules' },
  { value: '11', label: '11 carpules' },
];

export const anesthesiaLocations: SelectOption[] = [
  { value: 'infiltration', label: 'Local infiltration' },
  { value: 'ian_block', label: 'IAN block' },
  { value: 'psa', label: 'PSA block' },
  { value: 'msa', label: 'MSA block' },
  { value: 'asa', label: 'ASA block' },
  { value: 'gow_gates', label: 'Gow-Gates block' },
  { value: 'akinosi', label: 'Akinosi block' },
  { value: 'mental', label: 'Mental nerve block' },
  { value: 'incisive', label: 'Incisive nerve block' },
  { value: 'nasopalatine', label: 'Nasopalatine block' },
  { value: 'greater_palatine', label: 'Greater palatine block' },
  { value: 'intrapulpal', label: 'Intrapulpal' },
  { value: 'intraligamentary', label: 'Intraligamentary (PDL)' },
  { value: 'intraosseous', label: 'Intraosseous' },
];

// Isolation Methods
export const isolationMethods: SelectOption[] = [
  { value: 'rubber_dam', label: 'Rubber dam isolation' },
  { value: 'isolite', label: 'Isolite system' },
  { value: 'dryshield', label: 'DryShield' },
  { value: 'cotton_rolls', label: 'Cotton roll isolation' },
];

// Working Length Methods
export const workingLengthMethods: SelectOption[] = [
  { value: 'apex_locator', label: 'Apex locator' },
  { value: 'radiographic', label: 'Radiographic' },
  { value: 'tactile', label: 'Tactile' },
  { value: 'paper_point', label: 'Paper point' },
];

// Instrumentation Systems (updated: removed Profile, GT Files, added Edge X7, Edge One)
export const instrumentationSystems: SelectOption[] = [
  { value: 'protaper_gold', label: 'ProTaper Gold' },
  { value: 'protaper_ultimate', label: 'ProTaper Ultimate' },
  { value: 'protaper_next', label: 'ProTaper Next' },
  { value: 'waveone_gold', label: 'WaveOne Gold' },
  { value: 'reciproc_blue', label: 'Reciproc Blue' },
  { value: 'vortex_blue', label: 'Vortex Blue' },
  { value: 'twisted_file', label: 'Twisted File' },
  { value: 'hyflex_edm', label: 'HyFlex EDM' },
  { value: 'hyflex_cm', label: 'HyFlex CM' },
  { value: 'xp_endo_shaper', label: 'XP-endo Shaper' },
  { value: 'k_files', label: 'Hand K-files' },
  { value: 'h_files', label: 'Hand H-files' },
  { value: 'edge_file', label: 'EdgeFile' },
  { value: 'edge_x7', label: 'Edge X7' },
  { value: 'edge_one', label: 'Edge One' },
  { value: 'trushape', label: 'TruShape' },
];

// MAF Sizes
export const mafSizes: SelectOption[] = [
  { value: '15', label: '#15' },
  { value: '20', label: '#20' },
  { value: '25', label: '#25' },
  { value: '30', label: '#30' },
  { value: '35', label: '#35' },
  { value: '40', label: '#40' },
  { value: '45', label: '#45' },
  { value: '50', label: '#50' },
  { value: '55', label: '#55' },
  { value: '60', label: '#60' },
  { value: 'f1', label: 'F1' },
  { value: 'f2', label: 'F2' },
  { value: 'f3', label: 'F3' },
  { value: 'f4', label: 'F4' },
  { value: 'f5', label: 'F5' },
  { value: 'small', label: 'Small' },
  { value: 'primary', label: 'Primary' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

// MAF Tapers
export const mafTapers: SelectOption[] = [
  { value: '0.04', label: '0.04 taper' },
  { value: '0.06', label: '0.06 taper' },
];

// Irrigation Solutions (updated: added NaOCl 8.25%)
export const irrigationSolutions: SelectOption[] = [
  { value: 'naocl_8.25', label: 'NaOCl 8.25%' },
  { value: 'naocl_6', label: 'NaOCl 6%' },
  { value: 'naocl_5.25', label: 'NaOCl 5.25%' },
  { value: 'naocl_3', label: 'NaOCl 3%' },
  { value: 'naocl_2.5', label: 'NaOCl 2.5%' },
  { value: 'naocl_1', label: 'NaOCl 1%' },
  { value: 'edta_17', label: 'EDTA 17%' },
  { value: 'chx_2', label: 'CHX 2%' },
  { value: 'saline', label: 'Sterile saline' },
  { value: 'qmix', label: 'QMix' },
  { value: 'mtad', label: 'MTAD' },
  { value: 'citric_acid', label: 'Citric acid' },
];

export const irrigationTechniques: SelectOption[] = [
  { value: 'passive', label: 'Passive irrigation' },
  { value: 'manual_agitation', label: 'Manual dynamic agitation' },
  { value: 'eddy', label: 'EDDY sonic activation' },
  { value: 'pui', label: 'Passive ultrasonic irrigation (PUI)' },
  { value: 'gentlewave', label: 'GentleWave' },
  { value: 'endoactivator', label: 'EndoActivator' },
  { value: 'xp_endo_finisher', label: 'XP-endo Finisher' },
];

// Intracanal Medicaments
export const medicaments: SelectOption[] = [
  { value: 'none', label: 'None' },
  { value: 'caoh', label: 'Calcium hydroxide' },
  { value: 'ledermix', label: 'Ledermix' },
  { value: 'odontopaste', label: 'Odontopaste' },
  { value: 'triple_antibiotic', label: 'Triple antibiotic paste' },
  { value: 'formocresol', label: 'Formocresol' },
  { value: 'mta', label: 'MTA' },
];

// Obturation Techniques (updated: added MTA options)
export const obturationTechniques: SelectOption[] = [
  { value: 'single_cone', label: 'Single cone' },
  { value: 'lateral_condensation', label: 'Lateral condensation' },
  { value: 'warm_vertical', label: 'Warm vertical condensation' },
  { value: 'continuous_wave', label: 'Continuous wave' },
  { value: 'thermafil', label: 'Thermafil/GuttaCore' },
  { value: 'system_b', label: 'System B + backfill' },
  { value: 'calamus', label: 'Calamus' },
  { value: 'elements', label: 'Elements obturation' },
  { value: 'mta_apical_plug', label: 'MTA Apical Plug' },
  { value: 'mta_obturation', label: 'MTA obturation' },
];

// Obturation Materials
export const obturationMaterials: SelectOption[] = [
  { value: 'gp', label: 'Gutta-percha' },
  { value: 'ah_plus', label: 'AH Plus sealer' },
  { value: 'ah_plus_bioceramic', label: 'AH Plus Bioceramic' },
  { value: 'bc_sealer', label: 'BC Sealer (Endosequence)' },
  { value: 'ceraseal', label: 'CeraSeal' },
  { value: 'bioroot', label: 'BioRoot RCS' },
  { value: 'pulp_canal_sealer', label: 'Pulp Canal Sealer' },
  { value: 'sealapex', label: 'Sealapex' },
  { value: 'mta_fillapex', label: 'MTA Fillapex' },
  { value: 'resilon', label: 'Resilon' },
];

// Restoration Types
export const restorationTypes: SelectOption[] = [
  { value: 'temp_cavit', label: 'Cavit temporary' },
  { value: 'temp_irm', label: 'IRM temporary' },
  { value: 'temp_term', label: 'TERM temporary' },
  { value: 'composite', label: 'Composite restoration' },
  { value: 'amalgam', label: 'Amalgam restoration' },
  { value: 'glass_ionomer', label: 'Glass ionomer' },
  { value: 'resin_modified_gi', label: 'Resin-modified glass ionomer' },
  { value: 'core_buildup', label: 'Core buildup' },
  { value: 'crown', label: 'Crown recommended' },
  { value: 'post_core', label: 'Post and core' },
];

// Canal Configurations with individual canal names for per-canal MAF
export const canalConfigurations: SelectOption[] = [
  { value: 'single', label: 'Single canal' },
  { value: '1_buccal_1_lingual', label: '1 buccal, 1 lingual' },
  { value: '1_buccal_1_palatal', label: '1 buccal, 1 palatal' },
  { value: '2_buccal_1_palatal', label: '2 buccal, 1 palatal' },
  { value: 'mb_db_p', label: 'MB, DB, P' },
  { value: 'mb1_mb2_db_p', label: 'MB1, MB2, DB, P' },
  { value: 'ml_dl', label: 'ML, DL' },
  { value: 'm_d', label: 'M, D' },
  { value: 'mb_ml_d', label: 'MB, ML, D' },
  { value: '3_canals', label: '3 canals' },
  { value: '4_canals', label: '4 canals' },
  { value: 'c_shaped', label: 'C-shaped' },
  { value: 'other', label: 'Other (custom)' },
];

// Map canal configurations to individual canal names
export const canalConfigurationToCanals: Record<string, string[]> = {
  single: ['Single'],
  '1_buccal_1_lingual': ['Buccal', 'Lingual'],
  '1_buccal_1_palatal': ['Buccal', 'Palatal'],
  '2_buccal_1_palatal': ['MB', 'DB', 'P'],
  mb_db_p: ['MB', 'DB', 'P'],
  mb1_mb2_db_p: ['MB1', 'MB2', 'DB', 'P'],
  ml_dl: ['ML', 'DL'],
  m_d: ['M', 'D'],
  mb_ml_d: ['MB', 'ML', 'D'],
  '3_canals': ['Canal 1', 'Canal 2', 'Canal 3'],
  '4_canals': ['Canal 1', 'Canal 2', 'Canal 3', 'Canal 4'],
  c_shaped: ['C-shaped'],
};
