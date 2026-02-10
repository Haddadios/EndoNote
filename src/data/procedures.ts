import type { SelectOption, TreatmentType } from '../types';

// Updated Treatment Options
export const treatmentTypes: SelectOption[] = [
  { value: 'initial_rct', label: 'Non-Surgical Root Canal Therapy' },
  { value: 'continuing_rct', label: 'Continuing Prev. Initiated RCT' },
  { value: 'ns_rerct', label: 'Non-Surgical Root Canal Retreatment' },
  { value: 'apical_microsurgery', label: 'Apical Microsurgery' },
  { value: 'hemisection', label: 'Hemisection' },
  { value: 'root_resection', label: 'Root Resection' },
  { value: 'apexification', label: 'Apexification' },
  { value: 'apexogenesis', label: 'Apexogenesis' },
  { value: 'regenerative_endo', label: 'Regenerative Endodontics' },
  { value: 'intentional_replantation', label: 'Intentional Replantation' },
  { value: 'autotransplantation', label: 'Autotransplantation' },
  { value: 'direct_restoration', label: 'Direct Restoration' },
  { value: 'extraction', label: 'Extraction' },
  { value: 'no_treatment_monitoring', label: 'No treatment & Monitoring' },
  { value: 'no_treatment', label: 'No Treatment' },
  { value: 'trauma', label: 'Trauma Management' },
  { value: 'other', label: 'Other' },
];

export const treatmentLabels: Record<TreatmentType, string> = {
  initial_rct: 'Non-Surgical Root Canal Therapy',
  continuing_rct: 'Continuing Prev. Initiated RCT',
  ns_rerct: 'Non-Surgical Root Canal Retreatment',
  apical_microsurgery: 'Apical Microsurgery',
  hemisection: 'Hemisection',
  root_resection: 'Root Resection',
  apexification: 'Apexification',
  apexogenesis: 'Apexogenesis',
  regenerative_endo: 'Regenerative Endodontics',
  intentional_replantation: 'Intentional Replantation',
  autotransplantation: 'Autotransplantation',
  direct_restoration: 'Direct Restoration',
  extraction: 'Extraction',
  no_treatment_monitoring: 'No treatment & Monitoring',
  trauma: 'Trauma Management',
  other: 'Other',
};

// Complications
export const complications: SelectOption[] = [
  { value: 'none', label: 'None' },
  { value: 'file_separation', label: 'File separation' },
  { value: 'ledge', label: 'Ledge formation' },
  { value: 'perforation', label: 'Perforation' },
  { value: 'overfill', label: 'Overfill/overextension' },
  { value: 'short_fill', label: 'Short fill' },
  { value: 'instrument_fracture', label: 'Instrument fracture' },
  { value: 'naocl_accident', label: 'NaOCl accident' },
  { value: 'emphysema', label: 'Subcutaneous emphysema' },
  { value: 'paresthesia', label: 'Paresthesia' },
  { value: 'hemorrhage', label: 'Hemorrhage' },
  { value: 'flare_up', label: 'Flare-up' },
  { value: 'crown_fracture', label: 'Crown fracture' },
  { value: 'root_fracture', label: 'Root fracture' },
];

// Post-op Instructions
export const postOpInstructions: SelectOption[] = [
  { value: 'pain_management', label: 'Pain management instructions given' },
  { value: 'otc_analgesics', label: 'OTC analgesics as needed (Ibuprofen/Acetaminophen)' },
  { value: 'prescription_given', label: 'Prescription provided' },
  { value: 'antibiotics', label: 'Antibiotics prescribed' },
  { value: 'soft_diet', label: 'Soft diet recommended' },
  { value: 'avoid_chewing', label: 'Avoid chewing on treated tooth' },
  { value: 'swelling_expected', label: 'Some swelling may occur' },
  { value: 'ice_pack', label: 'Ice pack for swelling' },
  { value: 'salt_water_rinse', label: 'Warm salt water rinses' },
  { value: 'crown_needed', label: 'Final restoration/crown needed' },
  { value: 'return_if_severe', label: 'Return if severe pain/swelling' },
  { value: 'contact_info', label: 'Emergency contact information provided' },
];

// Follow-up Options
export const followUpOptions: SelectOption[] = [
  { value: '1_week', label: '1 week' },
  { value: '2_weeks', label: '2 weeks' },
  { value: '1_month', label: '1 month' },
  { value: '3_months', label: '3 months' },
  { value: '6_months', label: '6 months' },
  { value: '1_year', label: '1 year' },
  { value: 'prn', label: 'As needed (PRN)' },
  { value: 'refer_restorative', label: 'Referred back for restoration' },
  { value: 'refer_specialist', label: 'Referred to specialist' },
  { value: 'other', label: 'Other' },
  { value: 'none', label: 'None' },
  { value: 'NV', label: 'Next Visit to Continue Treatment' },
];

// Next Visit Options
export const nextVisitOptions: SelectOption[] = [
  { value: 'continue_treatment', label: 'Continue Treatment' },
  { value: 'follow_up_recall', label: 'Follow Up/Recall' },
  { value: 'na', label: 'N/A' },
];

// Referral Options
export const referralOptions: SelectOption[] = [
  { value: 'none', label: 'None' },
  { value: 'general_dentist', label: 'General dentist for restoration' },
  { value: 'prosthodontist', label: 'Prosthodontist' },
  { value: 'periodontist', label: 'Periodontist' },
  { value: 'oral_surgeon', label: 'Oral surgeon' },
  { value: 'endodontist', label: 'Endodontist' },
];

// Treatment Options Offered
export const treatmentOptionsOffered: SelectOption[] = [
  { value: 'initial_rct', label: 'Non-Surgical Root Canal Therapy' },
  { value: 'continuing_rct', label: 'Continuing Prev. Initiated RCT' },
  { value: 'ns_rerct', label: 'Non-Surgical Root Canal Retreatment' },
  { value: 'apical_microsurgery', label: 'Apical Microsurgery' },
  { value: 'hemisection', label: 'Hemisection' },
  { value: 'root_resection', label: 'Root Resection' },
  { value: 'apexification', label: 'Apexification' },
  { value: 'apexogenesis', label: 'Apexogenesis' },
  { value: 'regenerative_endo', label: 'Regenerative Endodontics' },
  { value: 'intentional_replantation', label: 'Intentional Replantation' },
  { value: 'autotransplantation', label: 'Autotransplantation' },
  { value: 'direct_restoration', label: 'Direct Restoration' },
  { value: 'extraction', label: 'Extraction' },
  { value: 'no_treatment_monitoring', label: 'No treatment & Monitoring' },
  { value: 'trauma', label: 'Trauma Management' },
  { value: 'no_treatment', label: 'No Treatment' },
  { value: 'other', label: 'Other' },
];
