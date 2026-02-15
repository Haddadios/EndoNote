import { useMemo, useState } from 'react';
import { useNote } from '../../context/NoteContext';
import type { Template, TemplateScope, VisitType, ToothType } from '../../types';
import { buildTemplateData, templateScopeLabels } from '../../utils/templateUtils';
import { treatmentOptionsOffered as treatmentOptionsOfferedData } from '../../data';

export function TemplateDropdown() {
  const { noteData, templates, saveTemplate, loadTemplate, deleteTemplate, renameTemplate } = useNote();
  const [isOpen, setIsOpen] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<TemplateScope[]>(['all']);
  const [templateVisitType, setTemplateVisitType] = useState<VisitType | 'any'>(noteData.visitType);
  const [templateToothType, setTemplateToothType] = useState<ToothType | 'any'>('any');
  const [templateProcedureTypes, setTemplateProcedureTypes] = useState<string[] | 'any'>('any');
  const [pendingOverwrite, setPendingOverwrite] = useState<Template | null>(null);
  const [showAllTemplates, setShowAllTemplates] = useState(false);
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
      toothType: templateToothType,
      procedureTypes: templateProcedureTypes,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };

    saveTemplate(template);
    setTemplateName('');
    setSelectedScopes(['all']);
    setTemplateVisitType(noteData.visitType);
    setTemplateToothType('any');
    setTemplateProcedureTypes('any');
    setPendingOverwrite(null);
    setShowSaveDialog(false);
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

  const visibleTemplates = useMemo(() => {
    if (showAllTemplates) return templates;
    return templates.filter((template) => {
      const visitMatch = template.visitType === 'any' || template.visitType === noteData.visitType;
      const toothMatch = !template.toothType || template.toothType === 'any' ||
        template.toothType === noteData.toothType;
      const procMatch = !template.procedureTypes || template.procedureTypes === 'any' ||
        (Array.isArray(template.procedureTypes) &&
          template.procedureTypes.some((p) =>
            noteData.toothTreatmentPlans.some((plan) => (plan.treatmentPerformed ?? []).includes(p))
          ));
      return visitMatch && toothMatch && procMatch;
    });
  }, [templates, showAllTemplates, noteData.visitType, noteData.toothType, noteData.toothTreatmentPlans]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Templates ({templates.length})
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => {
              setIsOpen(false);
              setShowSaveDialog(false);
              setPendingOverwrite(null);
            }}
          />
          <div className="absolute right-0 mt-2 w-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 max-h-[600px] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Templates
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowSaveDialog(!showSaveDialog);
                  if (!showSaveDialog) {
                    setTemplateName('');
                    setSelectedScopes(['all']);
                    setTemplateVisitType(noteData.visitType);
                    setTemplateToothType(noteData.toothType ?? 'any');
                    setTemplateProcedureTypes(
                      noteData.toothTreatmentPlans.flatMap((p) => p.treatmentPerformed ?? []).length > 0
                        ? noteData.toothTreatmentPlans.flatMap((p) => p.treatmentPerformed ?? [])
                        : 'any'
                    );
                    setPendingOverwrite(null);
                  }
                }}
                className="mt-2 w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
              >
                {showSaveDialog ? 'Cancel' : 'Save as Template'}
              </button>
            </div>

            {showSaveDialog && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => {
                    setTemplateName(e.target.value);
                    setPendingOverwrite(null);
                  }}
                  placeholder="Enter template name..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />

                {pendingOverwrite && (
                  <div className="mt-3 flex flex-col gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-100">
                    <span>
                      A template named "{pendingOverwrite.name}" already exists. Overwrite it?
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSave(true)}
                        className="px-3 py-1 rounded-md bg-amber-600 text-white hover:bg-amber-700 text-xs"
                      >
                        Overwrite
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingOverwrite(null)}
                        className="px-3 py-1 rounded-md border border-amber-300 text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-100 dark:hover:bg-amber-900/40 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                    Sections to Save
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(templateScopeLabels) as TemplateScope[]).map((scope) => (
                      <button
                        key={scope}
                        type="button"
                        onClick={() => handleScopeToggle(scope)}
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${
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

                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                    Visit Type Tag
                  </label>
                  <div className="flex gap-2">
                    {(['any', 'first_visit', 'continuing_treatment'] as const).map((visit) => (
                      <button
                        key={visit}
                        type="button"
                        onClick={() => setTemplateVisitType(visit)}
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          templateVisitType === visit
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600'
                        }`}
                      >
                        {visit === 'any'
                          ? 'Any'
                          : visit === 'first_visit'
                            ? 'First Visit'
                            : 'Continuing'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                    Tooth Type Tag
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {(['any', 'anterior', 'premolar', 'molar'] as const).map((tt) => (
                      <button
                        key={tt}
                        type="button"
                        onClick={() => setTemplateToothType(tt)}
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          templateToothType === tt
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600'
                        }`}
                      >
                        {tt === 'any' ? 'Any Tooth' : tt.charAt(0).toUpperCase() + tt.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                    Procedure Types Tag
                  </label>
                  <div className="flex gap-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setTemplateProcedureTypes('any')}
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        templateProcedureTypes === 'any'
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600'
                      }`}
                    >
                      Any
                    </button>
                    {treatmentOptionsOfferedData.map((opt) => {
                      const isSelected = Array.isArray(templateProcedureTypes) && templateProcedureTypes.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            if (templateProcedureTypes === 'any') {
                              setTemplateProcedureTypes([opt.value]);
                            } else if (Array.isArray(templateProcedureTypes)) {
                              const next = isSelected
                                ? templateProcedureTypes.filter((v) => v !== opt.value)
                                : [...templateProcedureTypes, opt.value];
                              setTemplateProcedureTypes(next.length > 0 ? next : 'any');
                            }
                          }}
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${
                            isSelected
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={!templateName.trim()}
                  className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Template
                </button>
              </div>
            )}

            <div className="p-4">
              {templates.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      Saved Templates
                    </span>
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
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      No templates match the current visit type. Toggle "Show all" to view everything.
                    </p>
                  ) : null}

                  <div className="space-y-2">
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
                          className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                          {isRenaming ? (
                            <div className="flex flex-col gap-2">
                              <input
                                type="text"
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-md"
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
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {template.name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(template.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1 mb-2">
                                <span className="px-2 py-0.5 text-[10px] rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
                                  {template.visitType === 'any'
                                    ? 'Any Visit'
                                    : template.visitType === 'first_visit'
                                      ? 'First Visit'
                                      : 'Continuing'}
                                </span>
                                {template.toothType && template.toothType !== 'any' && (
                                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200">
                                    {template.toothType.charAt(0).toUpperCase() + template.toothType.slice(1)}
                                  </span>
                                )}
                                {Array.isArray(template.procedureTypes) && template.procedureTypes.length > 0 && (
                                  template.procedureTypes.map((pt) => {
                                    const label = treatmentOptionsOfferedData.find((o) => o.value === pt)?.label ?? pt;
                                    return (
                                      <span key={pt} className="px-2 py-0.5 text-[10px] rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200">
                                        {label}
                                      </span>
                                    );
                                  })
                                )}
                                {template.scope.map((scope) => (
                                  <span
                                    key={scope}
                                    className="px-2 py-0.5 text-[10px] rounded-full bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200"
                                  >
                                    {templateScopeLabels[scope]}
                                  </span>
                                ))}
                              </div>
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    loadTemplate(template);
                                    setIsOpen(false);
                                  }}
                                  className="flex-1 px-2 py-1 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-700"
                                >
                                  Load
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRenameTargetId(template.id);
                                    setRenameValue(template.name);
                                  }}
                                  className="px-2 py-1 text-xs font-medium rounded bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200"
                                >
                                  Rename
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteTemplate(template.id)}
                                  className="px-2 py-1 text-xs font-medium rounded text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                                  title="Delete template"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  No templates saved yet. Click "Save as Template" to save your current selections.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
