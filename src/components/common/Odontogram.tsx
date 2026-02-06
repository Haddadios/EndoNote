import { useState } from 'react';

interface OdontogramProps {
  selectedTeeth: string[];
  onToothSelect: (toothNumber: string) => void;
  notation?: 'universal' | 'fdi';
}

// Import tooth images dynamically
const toothImages = import.meta.glob('../../assets/Odontogram No Numbers/*.png', { eager: true, import: 'default' });

// Helper to get tooth image path
const getToothImagePath = (toothNumber: string): string => {
  const key = `../../assets/Odontogram No Numbers/${toothNumber}.png`;
  return (toothImages[key] as string) || '';
};

export function Odontogram({ selectedTeeth, onToothSelect, notation = 'universal' }: OdontogramProps) {
  const [hoveredTooth, setHoveredTooth] = useState<string | null>(null);

  // Universal notation: 1-32
  const upperTeeth = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'];
  const lowerTeeth = ['32', '31', '30', '29', '28', '27', '26', '25', '24', '23', '22', '21', '20', '19', '18', '17'];

  // FDI notation mapping (if needed in future)
  const universalToFDI: Record<string, string> = {
    '1': '18', '2': '17', '3': '16', '4': '15', '5': '14', '6': '13', '7': '12', '8': '11',
    '9': '21', '10': '22', '11': '23', '12': '24', '13': '25', '14': '26', '15': '27', '16': '28',
    '17': '38', '18': '37', '19': '36', '20': '35', '21': '34', '22': '33', '23': '32', '24': '31',
    '25': '41', '26': '42', '27': '43', '28': '44', '29': '45', '30': '46', '31': '47', '32': '48',
  };

  const getDisplayNumber = (universalNum: string): string => {
    return notation === 'fdi' ? universalToFDI[universalNum] : universalNum;
  };

  const isSelected = (toothNumber: string): boolean => {
    return selectedTeeth.includes(toothNumber);
  };

  // Map tooth numbers to their full names
  const toothNames: Record<string, string> = {
    '1': 'UR 3rd Molar',
    '2': 'UR 2nd Molar',
    '3': 'UR 1st Molar',
    '4': 'UR 2nd Premolar',
    '5': 'UR 1st Premolar',
    '6': 'UR Canine',
    '7': 'UR Lateral Incisor',
    '8': 'UR Central Incisor',
    '9': 'UL Central Incisor',
    '10': 'UL Lateral Incisor',
    '11': 'UL Canine',
    '12': 'UL 1st Premolar',
    '13': 'UL 2nd Premolar',
    '14': 'UL 1st Molar',
    '15': 'UL 2nd Molar',
    '16': 'UL 3rd Molar',
    '17': 'LL 3rd Molar',
    '18': 'LL 2nd Molar',
    '19': 'LL 1st Molar',
    '20': 'LL 2nd Premolar',
    '21': 'LL 1st Premolar',
    '22': 'LL Canine',
    '23': 'LL Lateral Incisor',
    '24': 'LL Central Incisor',
    '25': 'LR Central Incisor',
    '26': 'LR Lateral Incisor',
    '27': 'LR Canine',
    '28': 'LR 1st Premolar',
    '29': 'LR 2nd Premolar',
    '30': 'LR 1st Molar',
    '31': 'LR 2nd Molar',
    '32': 'LR 3rd Molar',
  };

  const getToothName = (toothNum: string): string => {
    return toothNames[toothNum] || `Tooth ${toothNum}`;
  };

  const ToothButton = ({ toothNumber }: { toothNumber: string }) => {
    const displayNum = getDisplayNumber(toothNumber);
    const selected = isSelected(displayNum);
    const hovered = hoveredTooth === toothNumber;
    const toothName = getToothName(toothNumber);
    const imagePath = getToothImagePath(toothNumber);

    return (
      <div className="flex flex-col items-center space-y-1">
        {/* Tooth number */}
        <div className={`text-xs font-medium ${selected ? 'text-blue-600' : 'text-gray-500'}`}>
          {displayNum}
        </div>

        {/* Tooth visual with actual image */}
        <button
          onClick={() => onToothSelect(displayNum)}
          onMouseEnter={() => setHoveredTooth(toothNumber)}
          onMouseLeave={() => setHoveredTooth(null)}
          className={`
            relative w-14 h-20 rounded-sm transition-all duration-200 bg-white
            ${selected 
              ? 'ring-4 ring-blue-500 shadow-lg' 
              : 'ring-2 ring-gray-300 dark:ring-gray-500 hover:ring-gray-400 dark:hover:ring-gray-400'
            }
            ${hovered ? 'scale-110 shadow-xl z-10' : ''}
          `}
          title={`#${displayNum} - ${toothName}`}
        >
          {/* Tooth image */}
          <img 
            src={imagePath} 
            alt={`Tooth ${displayNum}`}
            className="w-full h-full object-contain rounded-sm"
          />
          
          {/* Checkbox indicator */}
          {selected && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </button>

        {/* Tooth name below */}
        <div className="text-[9px] text-gray-500 font-medium text-center leading-tight max-w-[56px]">
          {toothName}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="text-center mb-4">
        <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100">Select Teeth</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Click on teeth to select/deselect</p>
      </div>

      {/* Odontogram - now with plenty of space */}
      <div>
        {/* Upper arch */}
        <div className="mb-8">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-3 text-center">Upper Arch</div>
          <div className="flex justify-center gap-1.5 mb-2">
            {upperTeeth.map((tooth) => (
              <ToothButton key={tooth} toothNumber={tooth} />
            ))}
          </div>
          <div className="h-px bg-gray-300 my-6" />
        </div>

        {/* Lower arch */}
        <div>
          <div className="h-px bg-gray-300 mb-6" />
          <div className="flex justify-center gap-1.5 mb-2">
            {lowerTeeth.map((tooth) => (
              <ToothButton key={tooth} toothNumber={tooth} />
            ))}
          </div>
          <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-3 text-center">Lower Arch</div>
        </div>
      </div>

      {/* Selection summary */}
      {selectedTeeth.length > 0 && (
        <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded">
          <div className="text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">Selected teeth:</div>
          <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
            {selectedTeeth.sort((a, b) => parseInt(a) - parseInt(b)).map(t => `#${getDisplayNumber(t)}`).join(', ')}
          </div>
        </div>
      )}
    </div>
  );
}

