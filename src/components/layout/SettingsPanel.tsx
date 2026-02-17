import { useState } from 'react';
import { useNote } from '../../context/NoteContext';
import { Dropdown, CheckboxGroup } from '../common';
import type { ProcedureDefaults, CarpuleVolume } from '../../types';
import {
  isolationMethods,
  workingLengthMethods,
  instrumentationSystems,
  irrigationSolutions,
  irrigationTechniques,
  medicaments,
  obturationTechniques,
  obturationMaterials,
  obturationSealers,
  restorationTypes,
  postOpInstructions,
  followUpOptions,
  prognosisOptions,
  treatmentOptionsOffered,
} from '../../data';

const emptyProcedureDefaults: ProcedureDefaults = {
  anestheticTypes: [],
  injectionLocations: [],
  isolation: [],
  fileSystems: [],
  workingLengthMethod: [],
  obturationTechnique: '',
  obturationMaterial: '',
  obturationSealer: '',
  medicament: '',
  irrigationProtocol: [],
  temporaryRestoration: '',
  permanentRestoration: '',
  postOpInstructions: [],
  followUp: '',
  prognosis: '',
};

const irrigationOptions = [
  ...irrigationSolutions,
  ...irrigationTechniques.map((t) => ({ ...t, value: `tech_${t.value}` })),
];

interface ProcedureDefaultsFormProps {
  value: ProcedureDefaults;
  onChange: (updated: ProcedureDefaults) => void;
}

function ProcedureDefaultsForm({ value, onChange }: ProcedureDefaultsFormProps) {
  const update = <K extends keyof ProcedureDefaults>(key: K, val: ProcedureDefaults[K]) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <div className="space-y-4">
      <CheckboxGroup
        label="Isolation"
        options={isolationMethods}
        selectedValues={value.isolation}
        onChange={(v) => update('isolation', v)}
        columns={2}
      />

      <CheckboxGroup
        label="File Systems"
        options={instrumentationSystems}
        selectedValues={value.fileSystems}
        onChange={(v) => update('fileSystems', v)}
        columns={2}
      />

      <CheckboxGroup
        label="Working Length Method"
        options={workingLengthMethods}
        selectedValues={value.workingLengthMethod}
        onChange={(v) => update('workingLengthMethod', v)}
        columns={2}
      />

      <CheckboxGroup
        label="Irrigation Protocol"
        options={irrigationOptions}
        selectedValues={value.irrigationProtocol}
        onChange={(v) => update('irrigationProtocol', v)}
        columns={2}
      />

      <CheckboxGroup
        label="Post-op Instructions"
        options={postOpInstructions}
        selectedValues={value.postOpInstructions}
        onChange={(v) => update('postOpInstructions', v)}
        columns={2}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Dropdown
          label="Obturation Technique"
          value={value.obturationTechnique}
          options={obturationTechniques}
          onChange={(v) => update('obturationTechnique', v)}
          placeholder="Select..."
        />
        <Dropdown
          label="Obturation Material"
          value={value.obturationMaterial}
          options={obturationMaterials}
          onChange={(v) => update('obturationMaterial', v)}
          placeholder="Select..."
        />
        <Dropdown
          label="Obturation Sealer"
          value={value.obturationSealer}
          options={obturationSealers}
          onChange={(v) => update('obturationSealer', v)}
          placeholder="Select..."
        />
        <Dropdown
          label="Medicament"
          value={value.medicament}
          options={medicaments}
          onChange={(v) => update('medicament', v)}
          placeholder="Select..."
        />
        <Dropdown
          label="Temporary Restoration"
          value={value.temporaryRestoration}
          options={restorationTypes}
          onChange={(v) => update('temporaryRestoration', v)}
          placeholder="Select..."
        />
        <Dropdown
          label="Permanent Restoration"
          value={value.permanentRestoration}
          options={restorationTypes}
          onChange={(v) => update('permanentRestoration', v)}
          placeholder="Select..."
        />
        <Dropdown
          label="Follow-up"
          value={value.followUp}
          options={followUpOptions}
          onChange={(v) => update('followUp', v)}
          placeholder="Select..."
        />
        <Dropdown
          label="Prognosis"
          value={value.prognosis}
          options={prognosisOptions}
          onChange={(v) => update('prognosis', v)}
          placeholder="Select..."
        />
      </div>
    </div>
  );
}

type Tab = 'general' | 'generalDefaults' | 'procedureDefaults';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { preferences, updatePreferences } = useNote();
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [selectedProcedure, setSelectedProcedure] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCarpuleVolumeChange = (vol: CarpuleVolume) => {
    updatePreferences({ defaultCarpuleVolume: vol });
  };

  const handleGeneralDefaultsChange = (updated: ProcedureDefaults) => {
    updatePreferences({ generalDefaults: updated });
  };

  const handleProcedureDefaultsChange = (procedure: string, updated: ProcedureDefaults) => {
    updatePreferences({
      defaultsByProcedure: {
        ...preferences.defaultsByProcedure,
        [procedure]: updated,
      },
    });
  };

  const handleClearProcedureDefaults = (procedure: string) => {
    const updated = { ...preferences.defaultsByProcedure };
    delete updated[procedure];
    updatePreferences({ defaultsByProcedure: updated });
  };

  const handleResetToAppDefaults = () => {
    updatePreferences({
      defaultCarpuleVolume: '1.7',
      generalDefaults: { ...emptyProcedureDefaults },
      defaultsByProcedure: {},
    });
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'generalDefaults', label: 'General Defaults' },
    { id: 'procedureDefaults', label: 'Procedure Defaults' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex flex-col max-w-2xl w-full bg-white dark:bg-gray-800 shadow-xl border-l border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
            aria-label="Close settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* === GENERAL TAB === */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Carpule Volume */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Default Carpule Volume
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Used to calculate mL amounts in the SOAP note.
                </p>
                <div className="flex gap-3">
                  {(['1.7', '1.8', '2.2'] as CarpuleVolume[]).map((vol) => (
                    <label key={vol} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="carpuleVolume"
                        value={vol}
                        checked={(preferences.defaultCarpuleVolume ?? '1.7') === vol}
                        onChange={() => handleCarpuleVolumeChange(vol)}
                        className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{vol} mL</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tooth Notation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tooth Notation
                </label>
                <select
                  value={preferences.toothNotation}
                  onChange={(e) => updatePreferences({ toothNotation: e.target.value as 'universal' | 'fdi' })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="universal">Universal (1–32)</option>
                  <option value="fdi">FDI (11–48)</option>
                </select>
              </div>

              {/* Dark Mode */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.darkMode}
                    onChange={(e) => updatePreferences({ darkMode: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Use dark theme across the app</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* === GENERAL DEFAULTS TAB === */}
          {activeTab === 'generalDefaults' && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                These defaults are applied when you reset the note form.
              </p>
              <ProcedureDefaultsForm
                value={preferences.generalDefaults ?? emptyProcedureDefaults}
                onChange={handleGeneralDefaultsChange}
              />
            </div>
          )}

          {/* === PROCEDURE DEFAULTS TAB === */}
          {activeTab === 'procedureDefaults' && (
            <div className="flex gap-4 h-full">
              {/* Left: procedure list */}
              <div className="w-48 shrink-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Procedures
                </p>
                <div className="space-y-1">
                  {treatmentOptionsOffered.map((proc) => {
                    const hasDefaults = Boolean(preferences.defaultsByProcedure?.[proc.value]);
                    return (
                      <button
                        key={proc.value}
                        type="button"
                        onClick={() => setSelectedProcedure(proc.value)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                          selectedProcedure === proc.value
                            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span>{proc.label}</span>
                        {hasDefaults && (
                          <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-green-500 align-middle" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right: defaults form */}
              <div className="flex-1 min-w-0">
                {selectedProcedure ? (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        {treatmentOptionsOffered.find((p) => p.value === selectedProcedure)?.label}
                      </h3>
                      {preferences.defaultsByProcedure?.[selectedProcedure] && (
                        <button
                          type="button"
                          onClick={() => handleClearProcedureDefaults(selectedProcedure)}
                          className="text-xs px-2 py-1 rounded-md text-red-600 border border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <ProcedureDefaultsForm
                      value={preferences.defaultsByProcedure?.[selectedProcedure] ?? emptyProcedureDefaults}
                      onChange={(updated) => handleProcedureDefaultsChange(selectedProcedure, updated)}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 text-sm text-gray-500 dark:text-gray-400">
                    Select a procedure from the list to configure its defaults.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 dark:border-gray-700 shrink-0 bg-gray-50 dark:bg-gray-800/80">
          <button
            type="button"
            onClick={handleResetToAppDefaults}
            className="text-xs px-3 py-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            Reset to App Defaults
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
}
