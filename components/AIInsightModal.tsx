import React from 'react';

interface AIInsightModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: string;
  projectName: string;
  isLoading: boolean;
}

const AIInsightModal: React.FC<AIInsightModalProps> = ({ isOpen, onClose, analysis, projectName, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 animate-pulse">
                <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM6 20.25a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0v-.75a.75.75 0 01.75-.75zm17.625-2.625a.75.75 0 00-1.061 0l-.75.75a.75.75 0 101.06 1.06l.75-.75a.75.75 0 000-1.06zm-17.625-15a.75.75 0 000 1.061l.75.75a.75.75 0 001.061-1.06l-.75-.75a.75.75 0 00-1.061 0z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-bold">Gemini AI Risk Assessment</h3>
          </div>
          <p className="text-purple-100 text-sm">Analyzing: {projectName}</p>
        </div>
        
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
               <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
               <p className="text-slate-500 text-sm">Consulting Gemini models...</p>
            </div>
          ) : (
            <div className="prose prose-sm prose-slate max-w-none">
                <p className="whitespace-pre-line text-slate-700 leading-relaxed">
                    {analysis}
                </p>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 transition-colors">
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIInsightModal;
