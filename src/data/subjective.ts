import type { SelectOption } from '../types';

// Chief Complaints
export const chiefComplaints: SelectOption[] = [
  { value: 'pain', label: 'Pain/toothache' },
  { value: 'swelling', label: 'Swelling' },
  { value: 'sensitivity_cold', label: 'Sensitivity to cold' },
  { value: 'sensitivity_hot', label: 'Sensitivity to hot' },
  { value: 'sensitivity_bite', label: 'Sensitivity to biting' },
  { value: 'broken_tooth', label: 'Broken tooth' },
  { value: 'referred', label: 'Referred for RCT' },
  { value: 'retreatment', label: 'Referred for retreatment' },
  { value: 'discoloration', label: 'Tooth discoloration' },
  { value: 'abscess', label: 'Abscess/pimple on gum' },
  { value: 'trauma', label: 'Dental trauma' },
  { value: 'continued_treatment', label: 'Continued treatment' },
  { value: 'recall', label: 'Recall appointment' },
  { value: 'asymptomatic', label: 'Asymptomatic (incidental finding)' },
  { value: 'other', label: 'Other' },
];

// Pain Characteristics
export const painCharacteristics: SelectOption[] = [
  { value: 'spontaneous', label: 'Spontaneous' },
  { value: 'provoked', label: 'Provoked' },
  { value: 'constant', label: 'Constant' },
  { value: 'intermittent', label: 'Intermittent' },
  { value: 'sharp', label: 'Sharp' },
  { value: 'dull', label: 'Dull/aching' },
  { value: 'throbbing', label: 'Throbbing' },
  { value: 'radiating', label: 'Radiating' },
  { value: 'localized', label: 'Localized' },
  { value: 'diffuse', label: 'Diffuse' },
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
  { value: 'wakes_from_sleep', label: 'Wakes from sleep' },
  { value: 'worse_lying_down', label: 'Worse when lying down' },
  { value: 'relieved_cold', label: 'Relieved by cold' },
  { value: 'relieved_heat', label: 'Relieved by heat' },
  { value: 'relieved_analgesics', label: 'Relieved by analgesics' },
  { value: 'not_relieved_analgesics', label: 'Not relieved by analgesics' },
  { value: 'lingering', label: 'Lingering after stimulus removed' },
];

// Pain Duration
export const painDurations: SelectOption[] = [
  { value: 'today', label: 'Today' },
  { value: 'few_days', label: 'Few days' },
  { value: '1_week', label: '1 week' },
  { value: '2_weeks', label: '2 weeks' },
  { value: '1_month', label: '1 month' },
  { value: 'several_months', label: 'Several months' },
  { value: 'chronic', label: 'Chronic (>3 months)' },
  { value: 'unknown', label: 'Unknown/vague' },
  { value: 'na', label: 'N/A - asymptomatic' },
];

// Medical History Alerts
export const medicalHistoryAlerts: SelectOption[] = [
  { value: 'none', label: 'None significant' },
  { value: 'hypertension', label: 'Hypertension' },
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'heart_disease', label: 'Heart disease' },
  { value: 'artificial_valve', label: 'Artificial heart valve' },
  { value: 'joint_replacement', label: 'Joint replacement' },
  { value: 'anticoagulants', label: 'On anticoagulants' },
  { value: 'aspirin', label: 'Daily aspirin' },
  { value: 'bisphosphonates', label: 'Bisphosphonates (BRONJ risk)' },
  { value: 'immunocompromised', label: 'Immunocompromised' },
  { value: 'pregnancy', label: 'Pregnant' },
  { value: 'allergy_latex', label: 'Latex allergy' },
  { value: 'allergy_penicillin', label: 'Penicillin allergy' },
  { value: 'allergy_local', label: 'Local anesthetic allergy' },
  { value: 'allergy_nsaid', label: 'NSAID allergy' },
  { value: 'allergy_codeine', label: 'Codeine allergy' },
  { value: 'bleeding_disorder', label: 'Bleeding disorder' },
  { value: 'hepatitis', label: 'Hepatitis' },
  { value: 'hiv', label: 'HIV' },
  { value: 'kidney_disease', label: 'Kidney disease' },
  { value: 'liver_disease', label: 'Liver disease' },
  { value: 'asthma', label: 'Asthma' },
  { value: 'seizures', label: 'Seizure disorder' },
  { value: 'anxiety', label: 'Dental anxiety' },
  { value: 'other', label: 'Other (see notes)' },
];
