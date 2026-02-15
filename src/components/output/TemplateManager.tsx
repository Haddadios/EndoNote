import { useMemo, useState } from 'react';
import { useNote } from '../../context/NoteContext';
import type { Template, TemplateScope, VisitType } from '../../types';
import { buildTemplateData, templateScopeLabels } from '../../utils/templateUtils';
import {
  pulpalDiagnoses,
  periapicalDiagnoses,
  treatmentOptionsOffered,
} from '../../data';

export function TemplateManager() {
  const { noteData, templates, saveTemplate, loadTemplate, deleteTemplate, resetForm, renameTemplate } = useNote();
  const [templateName, setTemplateName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [selectedScopes, setSelectedScopes] = useState<TemplateScope[]>(['all']);
  const [templateVisitType, setTemplateVisitType] = useState<VisitType | 'any'>(noteData.visitType);
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [pendingOverwrite, setPendingOverwrite] = useState<Template | null>(null);
  const [renameTargetId, setRenameTargetId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const handleSave = (forceOverwrite = false) => {
    const trimmedName = templateName.trim();
    if (!trimmedName) return;

    const existing = templates.find(
      (template) => template.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existing && !forceOverwrite) {
      setPendingOverwrite(existing);
      return;
    }

    const templateData = buildTemplateData(noteData, selectedScopes);
    const template: Template = {
      id: existing?.id ?? Date.now().toString(),
      name: trimmedName,
      data: templateData,
      scope: selectedScopes,
      visitType: templateVisitType,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };

    saveTemplate(template);
    setTemplateName('');
    setSelectedScopes(['all']);
    setTemplateVisitType(noteData.visitType);
    setPendingOverwrite(null);
    setShowSaveDialog(false);
  };

  const handleLoad = (template: Template) => {
    loadTemplate(template);
  };

  const handleScopeToggle = (scope: TemplateScope) => {
    if (scope === 'all') {
      setSelectedScopes(['all']);
      return;
    }

    setSelectedScopes((prev) => {
      const withoutAll = prev.filter((item) => item !== 'all');
      const exists = withoutAll.includes(scope);
      const next = exists ? withoutAll.filter((item) => item !== scope) : [...withoutAll, scope];
      return next.length > 0 ? next : ['all'];
    });
  };

  const getLabel = (options: { value: string; label: string }[], value?: string) =>
    options.find((option) => option.value === value)?.label;

  const getTemplateSummary = (template: Template) => {
    const data = template.data;
    const tooth =
      data.toothNumber ||
      data.toothDiagnoses?.find((diagnosis) => diagnosis.toothNumber)?.toothNumber ||
      '';
    const primaryDiagnosis = data.toothDiagnoses?.find((diagnosis) => diagnosis.toothNumber === tooth) ||
      data.toothDiagnoses?.find((diagnosis) => diagnosis.toothNumber) ||
      data.toothDiagnoses?.[0];
    const pulpal = getLabel(pulpalDiagnoses, primaryDiagnosis?.pulpalDiagnosis);
    const periapical = getLabel(periapicalDiagnoses, primaryDiagnosis?.periapicalDiagnosis);
    const offeredTreatment = getLabel(treatmentOptionsOffered, (primaryDiagnosis?.treatmentOptionsOffered ?? [])[0]);
    const performedTreatment = getLabel(treatmentOptionsOffered, data.toothTreatmentPlans?.flatMap((p) => p.treatmentPerformed ?? [])[0] ?? '');
    const treatment = offeredTreatment || performedTreatment;

    const parts = [
      tooth ? `Tooth #${tooth}` : null,
      pulpal ? `Pulpal: ${pulpal}` : null,
      periapical ? `Periapical: ${periapical}` : null,
      treatment ? `Tx: ${treatment}` : null,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(' • ') : 'No summary available';
  };

  const visibleTemplates = useMemo(() => {
    if (showAllTemplates) return templates;
    return templates.filter(
      (template) => template.visitType === 'any' || template.visitType === noteData.visitType
    );
  }, [templates, showAllTemplates, noteData.visitType]);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Templates</h2>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => {
            setTemplateName('');
            setSelectedScopes(['all']);
            setTemplateVisitType(noteData.visitType);
            setPendingOverwrite(null);
            setShowSaveDialog(true);
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
        >
          Save as Template
        </button>
        <button
          onClick={resetForm}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
        >
          Reset Form
        </button>
      </div>

      {showSaveDialog && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Template Name
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={templateName}
              onChange={(e) => {
                setTemplateName(e.target.value);
                setPendingOverwrite(null);
              }}
              placeholder="Enter template name..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <button
              onClick={() => handleSave()}
              disabled={!templateName.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
            <button
              onClick={() => {
                setShowSaveDialog(false);
                setTemplateName('');
                setSelectedScopes(['all']);
                setTemplateVisitType(noteData.visitType);
                setPendingOverwrite(null);
              }}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          </div>

          {pendingOverwrite && (
            <div className="mt-3 flex flex-col gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-100">
              <span>
                A template named "{pendingOverwrite.name}" already exists. Overwrite it?
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  className="px-3 py-1 rounded-md bg-amber-600 text-white hover:bg-amber-700"
                >
                  Overwrite
                </button>
                <button
                  type="button"
                  onClick={() => setPendingOverwrite(null)}
                  className="px-3 py-1 rounded-md border border-amber-300 text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-100 dark:hover:bg-amber-900/40"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
              Sections to Save
            </label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(templateScopeLabels) as TemplateScope[]).map((scope) => (
                <button
                  key={scope}
                  type="button"
                  onClick={() => handleScopeToggle(scope)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    selectedScopes.includes(scope)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600'
                  }`}
                >
                  {templateScopeLabels[scope]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
              Visit Type Tag
            </label>
            <div className="flex gap-2">
              {(['any', 'first_visit', 'continuing_treatment'] as const).map((visit) => (
                <button
                  key={visit}
                  type="button"
                  onClick={() => setTemplateVisitType(visit)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    templateVisitType === visit
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600'
                  }`}
                >
                  {visit === 'any'
                    ? 'Any Visit'
                    : visit === 'first_visit'
                      ? 'First Visit'
                      : 'Continuing'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {templates.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Saved Templates</h3>
            <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={showAllTemplates}
                onChange={(e) => setShowAllTemplates(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              Show all
            </label>
          </div>
          {visibleTemplates.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No templates match the current visit type. Toggle "Show all" to view everything.
            </p>
          ) : null}

          {visibleTemplates.map((template) => {
            const isRenaming = renameTargetId === template.id;
            const renameConflict = templates.some(
              (item) =>
                item.id !== template.id &&
                item.name.toLowerCase() === renameValue.trim().toLowerCase()
            );

            return (
            <div
              key={template.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div>
                {isRenaming ? (
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {renameConflict && (
                      <span className="text-xs text-red-600">Name already exists.</span>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (!renameValue.trim() || renameConflict) return;
                          renameTemplate(template.id, renameValue.trim());
                          setRenameTargetId(null);
                          setRenameValue('');
                        }}
                        disabled={!renameValue.trim() || renameConflict}
                        className="px-2 py-1 text-xs rounded-md bg-blue-600 text-white disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRenameTargetId(null);
                          setRenameValue('');
                        }}
                        className="px-2 py-1 text-xs rounded-md border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="font-medium text-gray-800 dark:text-gray-200">{template.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(template.createdAt).toLocaleDateString()}
                    </div>
                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                      {getTemplateSummary(template)}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="px-2 py-0.5 text-[10px] rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
                        {template.visitType === 'any'
                          ? 'Any Visit'
                          : template.visitType === 'first_visit'
                            ? 'First Visit'
                            : 'Continuing'}
                      </span>
                      {template.scope.map((scope) => (
                        <span
                          key={scope}
                          className="px-2 py-0.5 text-[10px] rounded-full bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200"
                        >
                          {templateScopeLabels[scope]}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleLoad(template)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  Load
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRenameTargetId(template.id);
                    setRenameValue(template.name);
                  }}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Rename
                </button>
                <button
                  onClick={() => deleteTemplate(template.id)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          )})}
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No templates saved yet. Fill out the form and click "Save as Template" to save your
          current selections.
        </p>
      )}
    </div>
  );
}
