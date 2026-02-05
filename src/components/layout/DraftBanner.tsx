import { useNote } from '../../context/NoteContext';

export function DraftBanner() {
  const { hasPendingDraft, restoreDraft, discardDraft } = useNote();

  if (!hasPendingDraft) {
    return null;
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
            We found a saved draft from your last session.
          </p>
          <p className="text-xs text-amber-800 dark:text-amber-200">
            Restoring will replace the current form values.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={restoreDraft}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-amber-600 text-white hover:bg-amber-700"
          >
            Restore Draft
          </button>
          <button
            type="button"
            onClick={discardDraft}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-white text-amber-800 border border-amber-300 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-100 dark:border-amber-800 dark:hover:bg-amber-900/40"
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  );
}
