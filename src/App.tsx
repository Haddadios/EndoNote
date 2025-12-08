import { NoteProvider } from './context/NoteContext';
import { Header } from './components/layout';
import {
  PatientInfo,
  SubjectiveSection,
  ObjectiveSection,
  AssessmentSection,
  PlanSection,
} from './components/forms';
import { NoteOutput, TemplateManager } from './components/output';

function App() {
  return (
    <NoteProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Form Sections */}
            <div className="space-y-6">
              <PatientInfo />
              <SubjectiveSection />
              <ObjectiveSection />
              <AssessmentSection />
              <PlanSection />
            </div>

            {/* Right Column - Output and Templates */}
            <div className="space-y-6">
              <div className="lg:sticky lg:top-8">
                <NoteOutput />
                <div className="mt-6">
                  <TemplateManager />
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="bg-white border-t border-gray-200 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-center text-sm text-gray-500">
              EndoNote - Endodontic Chart Note Generator
            </p>
          </div>
        </footer>
      </div>
    </NoteProvider>
  );
}

export default App;
