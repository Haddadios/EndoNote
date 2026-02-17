import { useState } from 'react';
import { useNote } from '../../context/NoteContext';
import { TextInput } from '../common';

export function ReferralSection() {
  const {
    noteData,
    updateField,
    referralTemplate,
    updateReferralTemplate,
    referralTemplates,
    activeReferralTemplateId,
    setActiveReferralTemplate,
  } = useNote();
  const [clearedState, setClearedState] = useState<{
    patientName: string;
    patientChartNumber: string;
    patientDOB: string;
    referralLetterDate: string;
    consultationDate: string;
    treatmentCompletionDate: string;
    referralComments: string;
    referralRadiographs: string[];
  } | null>(null);
  const [showUndo, setShowUndo] = useState(false);

  const handleClearSection = () => {
    setClearedState({
      patientName: noteData.patientName,
      patientChartNumber: noteData.patientChartNumber,
      patientDOB: noteData.patientDOB,
      referralLetterDate: noteData.referralLetterDate,
      consultationDate: noteData.consultationDate,
      treatmentCompletionDate: noteData.treatmentCompletionDate,
      referralComments: noteData.referralComments,
      referralRadiographs: noteData.referralRadiographs,
    });

    updateField('patientName', '');
    updateField('patientChartNumber', '');
    updateField('patientDOB', '');
    updateField('referralLetterDate', '');
    updateField('consultationDate', '');
    updateField('treatmentCompletionDate', '');
    updateField('referralComments', '');
    updateField('referralRadiographs', []);
    setShowUndo(true);
  };

  const handleUndoClear = () => {
    if (!clearedState) {
      setShowUndo(false);
      return;
    }
    updateField('patientName', clearedState.patientName);
    updateField('patientChartNumber', clearedState.patientChartNumber);
    updateField('patientDOB', clearedState.patientDOB);
    updateField('referralLetterDate', clearedState.referralLetterDate);
    updateField('consultationDate', clearedState.consultationDate);
    updateField('treatmentCompletionDate', clearedState.treatmentCompletionDate);
    updateField('referralComments', clearedState.referralComments);
    updateField('referralRadiographs', clearedState.referralRadiographs);
    setShowUndo(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Referral Letter Details</h2>
        <button
          type="button"
          onClick={handleClearSection}
          className="text-xs px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          Clear Section
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Referral Template
        </label>
        <select
          value={activeReferralTemplateId}
          onChange={(e) => setActiveReferralTemplate(e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        >
          {referralTemplates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      </div>

      {showUndo && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-100">
          <span>Referral section cleared.</span>
          <button
            type="button"
            onClick={handleUndoClear}
            className="text-xs font-medium text-amber-900 underline underline-offset-2 dark:text-amber-100"
          >
            Undo
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          label="Patient Name"
          value={noteData.patientName}
          onChange={(value) => updateField('patientName', value)}
          placeholder="Enter patient name..."
        />
        <TextInput
          label="Patient Chart Number"
          value={noteData.patientChartNumber}
          onChange={(value) => updateField('patientChartNumber', value)}
          placeholder="Enter chart number..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          label="Patient DOB"
          value={noteData.patientDOB}
          onChange={(value) => updateField('patientDOB', value)}
          type="date"
        />
        <TextInput
          label="Letter Date"
          value={noteData.referralLetterDate}
          onChange={(value) => updateField('referralLetterDate', value)}
          type="date"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          label="Consultation Date"
          value={noteData.consultationDate}
          onChange={(value) => updateField('consultationDate', value)}
          type="date"
        />
        <TextInput
          label="Treatment Completion Date"
          value={noteData.treatmentCompletionDate}
          onChange={(value) => updateField('treatmentCompletionDate', value)}
          type="date"
        />
      </div>

      <TextInput
        label="Referral Comments"
        value={noteData.referralComments}
        onChange={(value) => updateField('referralComments', value)}
        placeholder="Enter any comments for the referring provider..."
        multiline
        rows={3}
      />

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Radiographs (for referral export)
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50 cursor-pointer dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
            <span>{noteData.referralRadiographs.length > 0 ? 'Add More Radiographs' : 'Upload Radiographs'}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length === 0) return;
                Promise.all(
                  files.map(
                    (file) =>
                      new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(String(reader.result || ''));
                        reader.onerror = () => reject(reader.error);
                        reader.readAsDataURL(file);
                      })
                  )
                )
                  .then((dataUrls) => {
                    const mergedRadiographs = [...noteData.referralRadiographs, ...dataUrls];
                    updateField('referralRadiographs', mergedRadiographs);
                    if (mergedRadiographs.length > referralTemplate.radiographs.slots) {
                      updateReferralTemplate({
                        ...referralTemplate,
                        radiographs: {
                          ...referralTemplate.radiographs,
                          slots: mergedRadiographs.length,
                        },
                      });
                    }
                  })
                  .catch((err) => {
                    console.error('Failed to load radiographs', err);
                  });
              }}
              className="sr-only"
            />
          </label>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {noteData.referralRadiographs.length} image{noteData.referralRadiographs.length === 1 ? '' : 's'} added
          </span>
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Select one or more image files. Added images appear below.
        </p>

        {noteData.referralRadiographs.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            {noteData.referralRadiographs.map((img, idx) => (
              <div key={`${img}-${idx}`} className="relative border border-gray-200 dark:border-gray-700 rounded-md p-2">
                <img src={img} alt={`Radiograph ${idx + 1}`} className="w-full h-24 object-contain" />
                <button
                  type="button"
                  onClick={() =>
                    updateField(
                      'referralRadiographs',
                      noteData.referralRadiographs.filter((_, i) => i !== idx)
                    )
                  }
                  className="absolute top-1 right-1 text-xs text-red-600 bg-white dark:bg-gray-800 px-1 rounded"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
