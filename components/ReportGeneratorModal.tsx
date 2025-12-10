import React, { useState } from 'react';
import { Project } from '../types';
import { REGIONS } from '../constants';
import { generateRegionalReport } from '../services/geminiService';

interface ReportGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
}

const ReportGeneratorModal: React.FC<ReportGeneratorModalProps> = ({ isOpen, onClose, projects }) => {
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0]);
  const [reportContent, setReportContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    setError("");
    setReportContent("");
    
    // Filter projects for the selected region
    const regionProjects = projects.filter(p => p.region === selectedRegion);
    
    if (regionProjects.length === 0) {
        setError(`No projects found for ${selectedRegion}. Cannot generate report.`);
        setIsLoading(false);
        return;
    }

    const result = await generateRegionalReport(selectedRegion, regionProjects);
    setReportContent(result);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-slate-700 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
             </div>
             <div>
                <h3 className="text-xl font-bold">Generate Regional Report</h3>
                <p className="text-slate-400 text-sm">AI-Powered Executive Summary</p>
             </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Controls */}
        <div className="p-6 bg-slate-50 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Select Region</label>
                    <select 
                        value={selectedRegion} 
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-500 focus:outline-none"
                    >
                        {REGIONS.map(r => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                </div>
                <button 
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Generating...
                        </>
                    ) : (
                        <>
                           <span>Generate Report</span>
                        </>
                    )}
                </button>
            </div>
            {error && (
                <div className="mt-3 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </div>
            )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[300px] bg-white">
            {!reportContent && !isLoading && !error && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mb-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <p>Select a region and click Generate to see the report.</p>
                </div>
            )}
            
            {isLoading && (
                 <div className="h-full flex flex-col items-center justify-center space-y-4">
                    <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">Analyzing project data...</p>
                 </div>
            )}

            {reportContent && (
                <div className="prose prose-slate prose-sm max-w-none">
                    {/* Simple rendering for markdown-like text */}
                    {reportContent.split('\n').map((line, i) => {
                        if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold mt-4 mb-2 text-slate-800">{line.replace('### ', '')}</h3>
                        if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mt-6 mb-3 text-slate-900 border-b pb-1">{line.replace('## ', '')}</h2>
                        if (line.startsWith('**') && line.endsWith('**')) return <strong key={i} className="block mt-2 mb-1">{line.replace(/\*\*/g, '')}</strong>
                        if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc text-slate-700">{line.replace('- ', '')}</li>
                        if (line.match(/^\d\./)) return <div key={i} className="font-semibold mt-2 text-slate-800">{line}</div>
                        return <p key={i} className="mb-2 text-slate-600 leading-relaxed">{line}</p>
                    })}
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors">
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default ReportGeneratorModal;