import type { SelectOption, SelectOptionGroup } from '../types';

// Updated Pulpal Diagnoses
export const pulpalDiagnoses: SelectOption[] = [
  { value: 'normal_pulp', label: 'Normal Pulp' },
  { value: 'dentinal_hypersensitivity', label: 'Dentinal Hypersensitivity' },
  { value: 'reversible_pulpitis', label: 'Reversible Pulpitis' },
  { value: 'symptomatic_irreversible_pulpitis', label: 'Symptomatic Irreversible Pulpitis' },
  { value: 'asymptomatic_irreversible_pulpitis', label: 'Asymptomatic Irreversible Pulpitis' },
  { value: 'pulp_necrosis', label: 'Pulp Necrosis' },
  { value: 'previously_initiated_rct', label: 'Previously Initiated RCT' },
  { value: 'previously_treated', label: 'Previously Treated' },
  { value: 'uncertain_pulpal_diagnosis', label: 'Uncertain Pulpal Diagnosis' },
  { value: 'dental_trauma', label: 'Dental Trauma' },
];

// Updated Periapical Diagnoses
export const periapicalDiagnoses: SelectOption[] = [
  { value: 'normal_apical_tissues', label: 'Normal Apical Tissues' },
  { value: 'symptomatic_ap', label: 'Symptomatic Apical Periodontitis' },
  { value: 'asymptomatic_ap', label: 'Asymptomatic Apical Periodontitis' },
  { value: 'chronic_apical_abscess', label: 'Chronic Apical Abscess' },
  { value: 'acute_apical_abscess', label: 'Acute Apical Abscess' },
  { value: 'condensing_osteitis', label: 'Condensing Osteitis' },
  { value: 'dental_trauma', label: 'Dental Trauma' },
];

// Vitality Test Results
export const vitalityResults: SelectOption[] = [
  { value: 'positive', label: 'Positive' },
  { value: 'negative', label: 'Negative (no response)' },
  { value: 'exaggerated', label: 'Exaggerated/lingering' },
  { value: 'diminished', label: 'Diminished' },
  { value: 'inconclusive', label: 'Inconclusive' },
  { value: 'not_tested', label: 'Not tested' },
];

// Percussion/Palpation Results
export const percussionPalpationResults: SelectOption[] = [
  { value: 'wnl', label: 'WNL (within normal limits)' },
  { value: 'positive', label: 'Positive/Tender' },
  { value: 'negative', label: 'Negative' },
  { value: 'severe', label: 'Severe pain' },
];

// Mobility Grades
export const mobilityGrades: SelectOption[] = [
  { value: '0', label: 'Grade 0 - Normal' },
  { value: '1', label: 'Grade I - Slight (<1mm horizontal)' },
  { value: '2', label: 'Grade II - Moderate (>1mm horizontal)' },
  { value: '3', label: 'Grade III - Severe (horizontal + vertical)' },
];

// Swelling Options
export const swellingOptions: SelectOption[] = [
  { value: 'none', label: 'None' },
  { value: 'localized', label: 'Localized' },
  { value: 'diffuse', label: 'Diffuse' },
  { value: 'fluctuant', label: 'Fluctuant' },
  { value: 'firm', label: 'Firm' },
  { value: 'buccal', label: 'Buccal' },
  { value: 'lingual', label: 'Lingual' },
  { value: 'palatal', label: 'Palatal' },
  { value: 'sinus_tract', label: 'Sinus tract present' },
  { value: 'drainage_sulcus', label: 'Drainage through gingival sulcus' },
];

export const swellingGroups: SelectOptionGroup[] = [
  {
    label: 'Extent',
    options: [
      { value: 'none', label: 'None' },
      { value: 'localized', label: 'Localized' },
      { value: 'diffuse', label: 'Diffuse' },
    ],
  },
  {
    label: 'Consistency',
    options: [
      { value: 'fluctuant', label: 'Fluctuant' },
      { value: 'firm', label: 'Firm' },
    ],
  },
  {
    label: 'Location',
    options: [
      { value: 'buccal', label: 'Buccal' },
      { value: 'lingual', label: 'Lingual' },
      { value: 'palatal', label: 'Palatal' },
    ],
  },
  {
    label: 'Additional',
    options: [
      { value: 'sinus_tract', label: 'Sinus tract present' },
      { value: 'drainage_sulcus', label: 'Drainage through gingival sulcus' },
    ],
  },
];

// Radiographic Findings — flat array used by soapGenerator for label resolution
export const radiographicFindings: SelectOption[] = [
  // Periapical Status
  { value: 'wnl', label: 'WNL - no periapical pathology' },
  { value: 'parl', label: 'Periapical radiolucency (PARL)' },
  { value: 'widened_pdl', label: 'Widened PDL space' },
  { value: 'loss_lamina_dura', label: 'Loss of lamina dura' },
  { value: 'periapical_sclerosis', label: 'Periapical sclerosis / condensing osteitis' },
  { value: 'hypercementosis', label: 'Hypercementosis' },
  { value: 'apical_root_resorption', label: 'Apical root resorption' },
  // Canal / Pulp Space
  { value: 'calcified_canals', label: 'Calcified canals' },
  { value: 'obliterated_canals', label: 'Obliterated canals' },
  { value: 'internal_resorption', label: 'Internal resorption' },
  { value: 'pulp_stones', label: 'Pulp stones / calcifications' },
  { value: 'canal_curvature', label: 'Significant canal curvature' },
  { value: 'open_apex', label: 'Open/immature apex' },
  { value: 'dens_invaginatus', label: 'Dens invaginatus' },
  // Root Structure
  { value: 'external_resorption', label: 'External resorption' },
  { value: 'vertical_root_fracture', label: 'Possible vertical root fracture' },
  { value: 'root_dilaceration', label: 'Root dilaceration' },
  { value: 'root_resorption_unspecified', label: 'Root resorption – unspecified location' },
  { value: 'fused_roots', label: 'Fused roots / taurodontism' },
  { value: 'accessory_root', label: 'Accessory/supernumerary root' },
  // Bone / Alveolar
  { value: 'periapical_lesion', label: 'Periapical lesion' },
  { value: 'furcation_bone_loss', label: 'Furcation bone loss' },
  { value: 'alveolar_bone_loss', label: 'Generalized alveolar bone loss' },
  { value: 'sinus_proximity', label: 'Proximity to maxillary sinus' },
  { value: 'through_and_through', label: 'Through-and-through lesion' },
  // Prior Treatment
  { value: 'previous_rct', label: 'Previous RCT present' },
  { value: 'short_fill', label: 'Short fill (previous RCT)' },
  { value: 'overfill', label: 'Overfill/overextension (previous RCT)' },
  { value: 'missed_canal', label: 'Possible missed canal' },
  { value: 'separated_instrument', label: 'Separated instrument' },
  { value: 'perforation', label: 'Perforation' },
  { value: 'post_present', label: 'Post / post-and-core present' },
  { value: 'ledge_transport', label: 'Ledge / canal transportation' },
  { value: 'bioceramic_mta_present', label: 'Bioceramic/MTA repair material present' },
];

export const radiographicFindingsGroups: SelectOptionGroup[] = [
  {
    label: 'Periapical Status',
    colSpan: 2,
    columns: 2,
    options: [
      { value: 'wnl', label: 'WNL - no periapical pathology' },
      { value: 'parl', label: 'Periapical radiolucency (PARL)' },
      { value: 'widened_pdl', label: 'Widened PDL space' },
      { value: 'loss_lamina_dura', label: 'Loss of lamina dura' },
      { value: 'periapical_sclerosis', label: 'Periapical sclerosis / condensing osteitis' },
      { value: 'hypercementosis', label: 'Hypercementosis' },
      { value: 'apical_root_resorption', label: 'Apical root resorption' },
    ],
  },
  {
    label: 'Canal / Pulp Space',
    colSpan: 2,
    columns: 2,
    options: [
      { value: 'calcified_canals', label: 'Calcified canals' },
      { value: 'obliterated_canals', label: 'Obliterated canals' },
      { value: 'internal_resorption', label: 'Internal resorption' },
      { value: 'pulp_stones', label: 'Pulp stones / calcifications' },
      { value: 'canal_curvature', label: 'Significant canal curvature' },
      { value: 'open_apex', label: 'Open/immature apex' },
      { value: 'dens_invaginatus', label: 'Dens invaginatus' },
    ],
  },
  {
    label: 'Root Structure',
    colSpan: 2,
    columns: 2,
    options: [
      { value: 'external_resorption', label: 'External resorption' },
      { value: 'vertical_root_fracture', label: 'Possible vertical root fracture' },
      { value: 'root_dilaceration', label: 'Root dilaceration' },
      { value: 'root_resorption_unspecified', label: 'Root resorption – unspecified location' },
      { value: 'fused_roots', label: 'Fused roots / taurodontism' },
      { value: 'accessory_root', label: 'Accessory/supernumerary root' },
    ],
  },
  {
    label: 'Bone / Alveolar',
    colSpan: 2,
    columns: 2,
    options: [
      { value: 'periapical_lesion', label: 'Periapical lesion' },
      { value: 'furcation_bone_loss', label: 'Furcation bone loss' },
      { value: 'alveolar_bone_loss', label: 'Generalized alveolar bone loss' },
      { value: 'sinus_proximity', label: 'Proximity to maxillary sinus' },
      { value: 'through_and_through', label: 'Through-and-through lesion' },
    ],
  },
  {
    label: 'Prior Treatment',
    colSpan: 4,
    columns: 3,
    options: [
      { value: 'previous_rct', label: 'Previous RCT present' },
      { value: 'short_fill', label: 'Short fill (previous RCT)' },
      { value: 'overfill', label: 'Overfill/overextension (previous RCT)' },
      { value: 'missed_canal', label: 'Possible missed canal' },
      { value: 'separated_instrument', label: 'Separated instrument' },
      { value: 'perforation', label: 'Perforation' },
      { value: 'post_present', label: 'Post / post-and-core present' },
      { value: 'ledge_transport', label: 'Ledge / canal transportation' },
      { value: 'bioceramic_mta_present', label: 'Bioceramic/MTA repair material present' },
    ],
  },
];

// Prognosis Options
export const prognosisOptions: SelectOption[] = [
  { value: 'favorable', label: 'Favorable' },
  { value: 'guarded', label: 'Guarded' },
  { value: 'unfavorable', label: 'Unfavorable' },
];
