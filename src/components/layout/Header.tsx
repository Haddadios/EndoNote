import { useNote } from '../../context/NoteContext';

export function Header() {
  const { preferences, updatePreferences } = useNote();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">EN</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">EndoNote</h1>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <span>Tooth Notation:</span>
              <select
                value={preferences.toothNotation}
                onChange={(e) =>
                  updatePreferences({
                    toothNotation: e.target.value as 'universal' | 'fdi',
                  })
                }
                className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="universal">Universal (1-32)</option>
                <option value="fdi">FDI (11-48)</option>
              </select>
            </label>
          </div>
        </div>
      </div>
    </header>
  );
}
