import type { SelectOption } from '../types';

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
  { value: 'positive', label: 'Positive (normal)' },
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
  { value: 'localized_fluctuant', label: 'Localized fluctuant' },
  { value: 'localized_diffuse', label: 'Localized diffuse' },
  { value: 'extraoral', label: 'Extraoral' },
  { value: 'intraoral_buccal', label: 'Intraoral - buccal' },
  { value: 'intraoral_palatal', label: 'Intraoral - palatal/lingual' },
];

// Radiographic Findings
export const radiographicFindings: SelectOption[] = [
  { value: 'wnl', label: 'WNL - no periapical pathology' },
  { value: 'parl', label: 'Periapical radiolucency (PARL)' },
  { value: 'widened_pdl', label: 'Widened PDL space' },
  { value: 'loss_lamina_dura', label: 'Loss of lamina dura' },
  { value: 'calcified_canals', label: 'Calcified/obliterated canals' },
  { value: 'internal_resorption', label: 'Internal resorption' },
  { value: 'external_resorption', label: 'External resorption' },
  { value: 'periapical_lesion', label: 'Periapical lesion' },
  { value: 'previous_rct', label: 'Previous RCT present' },
  { value: 'short_fill', label: 'Short fill (previous RCT)' },
  { value: 'overfill', label: 'Overfill/overextension (previous RCT)' },
  { value: 'missed_canal', label: 'Possible missed canal' },
  { value: 'separated_instrument', label: 'Separated instrument' },
  { value: 'perforation', label: 'Perforation' },
  { value: 'vertical_root_fracture', label: 'Possible vertical root fracture' },
];

// Prognosis Options
export const prognosisOptions: SelectOption[] = [
  { value: 'favorable', label: 'Favorable' },
  { value: 'guarded', label: 'Guarded' },
  { value: 'unfavorable', label: 'Unfavorable' },
];
