import { useNote } from '../../context/NoteContext';
import { Dropdown, CheckboxGroup, TextInput } from '../common';
import {
  anesthesiaTypes,
  anesthesiaAmounts,
  anesthesiaLocations,
  isolationMethods,
  workingLengthMethods,
  instrumentationSystems,
  mafSizes,
  mafTapers,
  irrigationSolutions,
  irrigationTechniques,
  medicaments,
  obturationTechniques,
  obturationMaterials,
  restorationTypes,
  canalConfigurations,
  canalConfigurationToCanals,
  complications,
  postOpInstructions,
  followUpOptions,
  referralOptions,
} from '../../data';

export function PlanSection() {
  const { noteData, updateField, updateCanalMAF } = useNote();

  // Get canal names based on selected configuration
  const getSelectedCanals = (): string[] => {
    const canals: string[] = [];
    noteData.canalConfiguration.forEach((config) => {
      if (config === 'other') {
        // Use custom canal names
        noteData.customCanalNames.forEach((canal) => {
          if (canal.trim() && !canals.includes(canal.trim())) {
            canals.push(canal.trim());
          }
        });
      } else {
        const configCanals = canalConfigurationToCanals[config];
        if (configCanals) {
          configCanals.forEach((canal) => {
            if (!canals.includes(canal)) {
              canals.push(canal);
            }
          });
        }
      }
    });
    return canals;
  };

  const selectedCanals = getSelectedCanals();

  // Combine irrigation solutions and techniques for the checkbox group
  const irrigationOptions = [
    ...irrigationSolutions,
    ...irrigationTechniques.map((t) => ({ ...t, value: `tech_${t.value}` })),
  ];

  // Get MAF for a specific canal
  const getCanalMAF = (canal: string) => {
    return noteData.canalMAFs.find((m) => m.canal === canal) || {
      canal,
      fileSystem: '',
      size: '',
      taper: '',
      obturationTechnique: '',
      obturationMaterial: '',
      obturationSealer: ''
    };
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Plan / Treatment</h2>

      {/* Anesthesia */}
      <h3 className="text-md font-medium text-gray-700 mt-2 mb-2">Anesthesia</h3>
      <CheckboxGroup
        label="Anesthesia Type"
        options={anesthesiaTypes}
        selectedValues={noteData.anesthesiaType}
        onChange={(values) => updateField('anesthesiaType', values)}
        columns={2}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Dropdown
          label="Amount"
          value={noteData.anesthesiaAmount}
          options={anesthesiaAmounts}
          onChange={(value) => updateField('anesthesiaAmount', value)}
          placeholder="Select amount..."
        />
      </div>

      <CheckboxGroup
        label="Location/Technique"
        options={anesthesiaLocations}
        selectedValues={noteData.anesthesiaLocations}
        onChange={(values) => updateField('anesthesiaLocations', values)}
        columns={2}
      />

      {/* Isolation */}
      <Dropdown
        label="Isolation"
        value={noteData.isolation}
        options={isolationMethods}
        onChange={(value) => updateField('isolation', value)}
        placeholder="Select isolation method..."
      />

      {/* Canal Configuration */}
      <CheckboxGroup
        label="Canal Configuration"
        options={canalConfigurations}
        selectedValues={noteData.canalConfiguration}
        onChange={(values) => updateField('canalConfiguration', values)}
        columns={2}
      />

      {/* Custom Canal Names Input */}
      {noteData.canalConfiguration.includes('other') && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Canal Names
          </label>
          <p className="text-xs text-gray-600 mb-2">
            Enter canal names separated by commas (e.g., "MB, DB, P" or "Canal 1, Canal 2, Canal 3")
          </p>
          <input
            type="text"
            value={noteData.customCanalNames.join(', ')}
            onChange={(e) => {
              const names = e.target.value.split(',').map(name => name.trim());
              updateField('customCanalNames', names);
            }}
            placeholder="e.g., MB, DB, P"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}

      {/* Working Length */}
      <h3 className="text-md font-medium text-gray-700 mt-4 mb-2">Working Length</h3>
      <CheckboxGroup
        label="Method"
        options={workingLengthMethods}
        selectedValues={noteData.workingLengthMethod}
        onChange={(values) => updateField('workingLengthMethod', values)}
        columns={2}
      />

      <TextInput
        label="Measurements"
        value={noteData.workingLengthMeasurements}
        onChange={(value) => updateField('workingLengthMeasurements', value)}
        placeholder="e.g., MB: 21mm, DB: 20mm, P: 22mm"
      />

      {/* Per-Canal Instrumentation Setup */}
      {selectedCanals.length > 0 && (
        <div className="mt-4">
          <h3 className="text-md font-medium text-gray-700 mb-3">Instrumentation & Obturation (per canal)</h3>
          <div className="space-y-4">
            {selectedCanals.map((canal) => {
              const maf = getCanalMAF(canal);
              return (
                <div key={canal} className="p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="font-medium text-gray-700 mb-3">{canal}</div>

                  {/* Instrumentation */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">File System</label>
                      <select
                        value={maf.fileSystem}
                        onChange={(e) => updateCanalMAF(canal, 'fileSystem', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select...</option>
                        {instrumentationSystems.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Size</label>
                      <select
                        value={maf.size}
                        onChange={(e) => updateCanalMAF(canal, 'size', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select...</option>
                        {mafSizes.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Taper</label>
                      <select
                        value={maf.taper}
                        onChange={(e) => updateCanalMAF(canal, 'taper', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select...</option>
                        {mafTapers.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Obturation */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Obturation Technique</label>
                      <select
                        value={maf.obturationTechnique}
                        onChange={(e) => updateCanalMAF(canal, 'obturationTechnique', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select...</option>
                        {obturationTechniques.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Material</label>
                      <select
                        value={maf.obturationMaterial}
                        onChange={(e) => updateCanalMAF(canal, 'obturationMaterial', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select...</option>
                        {obturationMaterials.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Sealer</label>
                      <select
                        value={maf.obturationSealer}
                        onChange={(e) => updateCanalMAF(canal, 'obturationSealer', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select...</option>
                        {obturationMaterials.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Irrigation */}
      <CheckboxGroup
        label="Irrigation Protocol"
        options={irrigationOptions}
        selectedValues={noteData.irrigationProtocol}
        onChange={(values) => updateField('irrigationProtocol', values)}
        columns={2}
      />

      {/* Medicament */}
      <Dropdown
        label="Intracanal Medicament"
        value={noteData.medicament}
        options={medicaments}
        onChange={(value) => updateField('medicament', value)}
        placeholder="Select medicament..."
      />

      {/* Restoration */}
      <Dropdown
        label="Restoration"
        value={noteData.restoration}
        options={restorationTypes}
        onChange={(value) => updateField('restoration', value)}
        placeholder="Select restoration..."
      />

      {/* Complications */}
      <CheckboxGroup
        label="Complications"
        options={complications}
        selectedValues={noteData.complications}
        onChange={(values) => updateField('complications', values)}
        columns={2}
      />

      {/* Post-op Instructions */}
      <CheckboxGroup
        label="Post-op Instructions"
        options={postOpInstructions}
        selectedValues={noteData.postOpInstructions}
        onChange={(values) => updateField('postOpInstructions', values)}
        columns={2}
      />

      {/* Follow-up */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Dropdown
          label="Follow-up"
          value={noteData.followUp}
          options={followUpOptions}
          onChange={(value) => updateField('followUp', value)}
          placeholder="Select follow-up..."
        />

        <Dropdown
          label="Referral"
          value={noteData.referral}
          options={referralOptions}
          onChange={(value) => updateField('referral', value)}
          placeholder="Select referral..."
        />
      </div>
    </div>
  );
}
