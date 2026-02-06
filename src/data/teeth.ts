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

// Map tooth number to type (handles both universal and FDI notation)
export function getToothType(toothNumber: string): ToothType {
  const num = parseInt(toothNumber, 10);

  // Universal notation (1-32)
  const universalAnteriors = [6, 7, 8, 9, 10, 11, 22, 23, 24, 25, 26, 27];
  const universalPremolars = [4, 5, 12, 13, 20, 21, 28, 29];
  const universalMolars = [1, 2, 3, 14, 15, 16, 17, 18, 19, 30, 31, 32];

  // FDI notation (11-48)
  const fdiAnteriors = [11, 12, 13, 21, 22, 23, 31, 32, 33, 41, 42, 43];
  const fdiPremolars = [14, 15, 24, 25, 34, 35, 44, 45];
  const fdiMolars = [16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48];

  // Check Universal notation first
  if (universalAnteriors.includes(num)) return 'anterior';
  if (universalPremolars.includes(num)) return 'premolar';
  if (universalMolars.includes(num)) return 'molar';

  // Check FDI notation
  if (fdiAnteriors.includes(num)) return 'anterior';
  if (fdiPremolars.includes(num)) return 'premolar';
  if (fdiMolars.includes(num)) return 'molar';

  return 'molar'; // default
}

export const toothTypeLabels: Record<ToothType, string> = {
  anterior: 'Anterior',
  premolar: 'Premolar',
  molar: 'Molar',
};

// Mapping from Universal to FDI notation
const universalToFdiMap: Record<string, string> = {
  '1': '18', '2': '17', '3': '16', '4': '15', '5': '14', '6': '13', '7': '12', '8': '11',
  '9': '21', '10': '22', '11': '23', '12': '24', '13': '25', '14': '26', '15': '27', '16': '28',
  '17': '38', '18': '37', '19': '36', '20': '35', '21': '34', '22': '33', '23': '32', '24': '31',
  '25': '41', '26': '42', '27': '43', '28': '44', '29': '45', '30': '46', '31': '47', '32': '48',
};

// Mapping from FDI to Universal notation
const fdiToUniversalMap: Record<string, string> = {
  '18': '1', '17': '2', '16': '3', '15': '4', '14': '5', '13': '6', '12': '7', '11': '8',
  '21': '9', '22': '10', '23': '11', '24': '12', '25': '13', '26': '14', '27': '15', '28': '16',
  '38': '17', '37': '18', '36': '19', '35': '20', '34': '21', '33': '22', '32': '23', '31': '24',
  '41': '25', '42': '26', '43': '27', '44': '28', '45': '29', '46': '30', '47': '31', '48': '32',
};

// Convert tooth number from one notation to another
export function convertToothNumber(
  toothNumber: string,
  fromNotation: 'universal' | 'fdi',
  toNotation: 'universal' | 'fdi'
): string {
  if (!toothNumber || fromNotation === toNotation) return toothNumber;

  if (fromNotation === 'universal' && toNotation === 'fdi') {
    return universalToFdiMap[toothNumber] || toothNumber;
  } else if (fromNotation === 'fdi' && toNotation === 'universal') {
    return fdiToUniversalMap[toothNumber] || toothNumber;
  }

  return toothNumber;
}
