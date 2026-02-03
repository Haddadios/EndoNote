import { useState } from 'react';
import type { SelectOption, SelectOptionGroup } from '../../types';

interface CheckboxGroupProps {
  label: string;
  options?: SelectOption[];
  mainOptions?: SelectOption[];
  moreOptions?: SelectOption[];
  groups?: SelectOptionGroup[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  columns?: 1 | 2 | 3 | 4;
}

export function CheckboxGroup({
  label,
  options,
  mainOptions,
  moreOptions,
  groups,
  selectedValues,
  onChange,
  columns = 2,
}: CheckboxGroupProps) {
  const [showMore, setShowMore] = useState(false);

  const handleToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
  };

  const groupCols = {
    1: 'space-y-1',
    2: 'grid grid-cols-2 gap-2',
    3: 'grid grid-cols-3 gap-2',
    4: 'grid grid-cols-4 gap-2',
  };

  const groupSpans = {
    1: '',
    2: 'sm:col-span-2 lg:col-span-2',
    3: 'sm:col-span-2 lg:col-span-3',
    4: 'sm:col-span-2 lg:col-span-4',
  };

  // If mainOptions and moreOptions are provided, use the split view
  // Otherwise, use the regular options array
  const useGrouped = Array.isArray(groups) && groups.length > 0;
  const useMainMoreSplit = !useGrouped && mainOptions && moreOptions;
  const displayOptions = useMainMoreSplit
    ? [...mainOptions, ...(showMore ? moreOptions : [])]
    : options || [];

  const renderCheckbox = (option: SelectOption) => (
    <label
      key={option.value}
      className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
    >
      <input
        type="checkbox"
        checked={selectedValues.includes(option.value)}
        onChange={() => handleToggle(option.value)}
        className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
      />
      <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
    </label>
  );

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      {useGrouped ? (
        <div className={`grid ${gridCols[columns]} gap-3`}>
          {groups!.map((group) => (
            <div
              key={group.label}
              className={`border border-gray-200 dark:border-gray-700 rounded-md p-3 bg-white dark:bg-gray-800 ${groupSpans[group.colSpan || 1]}`}
            >
              <div className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 uppercase">
                {group.label}
              </div>
              <div className={`mt-2 ${groupCols[group.columns || 1]}`}>
                {group.options.map(renderCheckbox)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className={`grid ${gridCols[columns]} gap-2`}>
            {displayOptions.map(renderCheckbox)}
          </div>
          {useMainMoreSplit && moreOptions!.length > 0 && (
            <button
              type="button"
              onClick={() => setShowMore(!showMore)}
              className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
            >
              {showMore ? '- Show less options' : '+ Show more options'}
            </button>
          )}
        </>
      )}
    </div>
  );
}
