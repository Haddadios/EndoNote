import type { SelectOption, ToothType } from '../types';

export const universalTeeth: SelectOption[] = [
  { value: '1', label: '#1 - UR 3rd Molar' },
  { value: '2', label: '#2 - UR 2nd Molar' },
  { value: '3', label: '#3 - UR 1st Molar' },
  { value: '4', label: '#4 - UR 2nd Premolar' },
  { value: '5', label: '#5 - UR 1st Premolar' },
  { value: '6', label: '#6 - UR Canine' },
  { value: '7', label: '#7 - UR Lateral Incisor' },
  { value: '8', label: '#8 - UR Central Incisor' },
  { value: '9', label: '#9 - UL Central Incisor' },
  { value: '10', label: '#10 - UL Lateral Incisor' },
  { value: '11', label: '#11 - UL Canine' },
  { value: '12', label: '#12 - UL 1st Premolar' },
  { value: '13', label: '#13 - UL 2nd Premolar' },
  { value: '14', label: '#14 - UL 1st Molar' },
  { value: '15', label: '#15 - UL 2nd Molar' },
  { value: '16', label: '#16 - UL 3rd Molar' },
  { value: '17', label: '#17 - LL 3rd Molar' },
  { value: '18', label: '#18 - LL 2nd Molar' },
  { value: '19', label: '#19 - LL 1st Molar' },
  { value: '20', label: '#20 - LL 2nd Premolar' },
  { value: '21', label: '#21 - LL 1st Premolar' },
  { value: '22', label: '#22 - LL Canine' },
  { value: '23', label: '#23 - LL Lateral Incisor' },
  { value: '24', label: '#24 - LL Central Incisor' },
  { value: '25', label: '#25 - LR Central Incisor' },
  { value: '26', label: '#26 - LR Lateral Incisor' },
  { value: '27', label: '#27 - LR Canine' },
  { value: '28', label: '#28 - LR 1st Premolar' },
  { value: '29', label: '#29 - LR 2nd Premolar' },
  { value: '30', label: '#30 - LR 1st Molar' },
  { value: '31', label: '#31 - LR 2nd Molar' },
  { value: '32', label: '#32 - LR 3rd Molar' },
];

export const fdiTeeth: SelectOption[] = [
  { value: '18', label: '18 - UR 3rd Molar' },
  { value: '17', label: '17 - UR 2nd Molar' },
  { value: '16', label: '16 - UR 1st Molar' },
  { value: '15', label: '15 - UR 2nd Premolar' },
  { value: '14', label: '14 - UR 1st Premolar' },
  { value: '13', label: '13 - UR Canine' },
  { value: '12', label: '12 - UR Lateral Incisor' },
  { value: '11', label: '11 - UR Central Incisor' },
  { value: '21', label: '21 - UL Central Incisor' },
  { value: '22', label: '22 - UL Lateral Incisor' },
  { value: '23', label: '23 - UL Canine' },
  { value: '24', label: '24 - UL 1st Premolar' },
  { value: '25', label: '25 - UL 2nd Premolar' },
  { value: '26', label: '26 - UL 1st Molar' },
  { value: '27', label: '27 - UL 2nd Molar' },
  { value: '28', label: '28 - UL 3rd Molar' },
  { value: '38', label: '38 - LL 3rd Molar' },
  { value: '37', label: '37 - LL 2nd Molar' },
  { value: '36', label: '36 - LL 1st Molar' },
  { value: '35', label: '35 - LL 2nd Premolar' },
  { value: '34', label: '34 - LL 1st Premolar' },
  { value: '33', label: '33 - LL Canine' },
  { value: '32', label: '32 - LL Lateral Incisor' },
  { value: '31', label: '31 - LL Central Incisor' },
  { value: '41', label: '41 - LR Central Incisor' },
  { value: '42', label: '42 - LR Lateral Incisor' },
  { value: '43', label: '43 - LR Canine' },
  { value: '44', label: '44 - LR 1st Premolar' },
  { value: '45', label: '45 - LR 2nd Premolar' },
  { value: '46', label: '46 - LR 1st Molar' },
  { value: '47', label: '47 - LR 2nd Molar' },
  { value: '48', label: '48 - LR 3rd Molar' },
];

// Map tooth number to type (universal notation)
export function getToothType(toothNumber: string): ToothType {
  const num = parseInt(toothNumber, 10);

  // Anteriors: centrals, laterals, canines
  const anteriors = [6, 7, 8, 9, 10, 11, 22, 23, 24, 25, 26, 27];
  // Premolars
  const premolars = [4, 5, 12, 13, 20, 21, 28, 29];
  // Molars
  const molars = [1, 2, 3, 14, 15, 16, 17, 18, 19, 30, 31, 32];

  if (anteriors.includes(num)) return 'anterior';
  if (premolars.includes(num)) return 'premolar';
  if (molars.includes(num)) return 'molar';

  return 'molar'; // default
}

export const toothTypeLabels: Record<ToothType, string> = {
  anterior: 'Anterior',
  premolar: 'Premolar',
  molar: 'Molar',
};
