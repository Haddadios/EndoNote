import { useState } from 'react';
import type { SelectOption, SelectOptionGroup } from '../../types';

interface CheckboxGroupProps {
  label: string;
  sectionLabel?: boolean;
  options?: SelectOption[];
  mainOptions?: SelectOption[];
  moreOptions?: SelectOption[];
  groups?: SelectOptionGroup[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  columns?: 1 | 2 | 3 | 4;
  inlineTextInputs?: {
    [optionValue: string]: {
      value: string;
      onChange: (value: string) => void;
      placeholder?: string;
    };
  };
}

export function CheckboxGroup({
  label,
  sectionLabel = false,
  options,
  mainOptions,
  moreOptions,
  groups,
  selectedValues,
  onChange,
  columns = 2,
  inlineTextInputs,
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

  const renderCheckbox = (option: SelectOption) => {
    const hasInlineInput = inlineTextInputs && inlineTextInputs[option.value];
    const isChecked = selectedValues.includes(option.value);

    return (
      <div key={option.value} className="flex items-center gap-2">
        <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => handleToggle(option.value)}
            className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
        </label>
        {hasInlineInput && isChecked && (
          <input
            type="text"
            value={hasInlineInput.value}
            onChange={(e) => hasInlineInput.onChange(e.target.value)}
            placeholder={hasInlineInput.placeholder || ''}
            className="ml-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ width: '250px' }}
          />
        )}
      </div>
    );
  };

  return (
    <div className={`mb-4${sectionLabel ? ' border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden' : ''}`}>
      {sectionLabel ? (
        <div className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <span className="text-xs font-semibold tracking-wide text-gray-700 dark:text-gray-200 uppercase">
            {label}
          </span>
        </div>
      ) : (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className={sectionLabel ? 'p-3' : ''}>
      {useGrouped ? (
        <div className={`grid ${gridCols[columns]} gap-3`}>
          {groups!.map((group) => (
            <div
              key={group.label}
              className={`border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden bg-white dark:bg-gray-800 ${groupSpans[group.colSpan || 1]}`}
            >
              <div className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <span className="text-xs font-semibold tracking-wide text-gray-700 dark:text-gray-200 uppercase">
                  {group.label}
                </span>
              </div>
              <div className="p-3">
                <div className={`${groupCols[group.columns || 1]}`}>
                  {group.options.map(renderCheckbox)}
                </div>
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
    </div>
  );
}
