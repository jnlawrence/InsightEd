import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus } from '../types';
import { generateSmartRemarks } from '../services/geminiService';

interface EditProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProject: Project) => void;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ project, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Project | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({ ...project });
    }
  }, [project]);

  if (!isOpen || !formData) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: parseFloat(value) || 0 } : null);
  };

  const handleGenerateRemarks = async () => {
      if(!formData) return;
      setIsGenerating(true);
      const remark = await generateSmartRemarks(formData);
      if(remark) {
          setFormData(prev => prev ? { ...prev, otherRemarks: remark } : null);
      }
      setIsGenerating(false);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave(formData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-slate-800">Update Project: {formData.projectName}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Basic Info */}
          <div className="lg:col-span-3 pb-2 border-b border-slate-100 mb-2">
            <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Basic Information</h3>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Region</label>
             <input type="text" name="region" value={formData.region} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Division</label>
             <input type="text" name="division" value={formData.division} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">School Name</label>
             <input type="text" name="schoolName" value={formData.schoolName} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          
          {/* Status & Progress */}
           <div className="lg:col-span-3 pb-2 border-b border-slate-100 mt-4 mb-2">
            <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Progress & Status</h3>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
             <select name="status" value={formData.status} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm bg-white">
                {Object.values(ProjectStatus).map(s => (
                    <option key={s} value={s}>{s}</option>
                ))}
             </select>
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Accomplishment (%)</label>
             <input type="number" name="accomplishmentPercentage" value={formData.accomplishmentPercentage} onChange={handleNumberChange} min="0" max="100" className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Status As Of</label>
             <input type="date" name="statusAsOfDate" value={formData.statusAsOfDate} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" />
          </div>

           {/* Dates */}
           <div className="lg:col-span-3 pb-2 border-b border-slate-100 mt-4 mb-2">
            <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Timelines</h3>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Target Completion</label>
             <input type="date" name="targetCompletionDate" value={formData.targetCompletionDate} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Actual Completion</label>
             <input type="date" name="actualCompletionDate" value={formData.actualCompletionDate || ''} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Notice To Proceed</label>
             <input type="date" name="noticeToProceed" value={formData.noticeToProceed || ''} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" />
          </div>

          {/* Financials & Contractor */}
          <div className="lg:col-span-3 pb-2 border-b border-slate-100 mt-4 mb-2">
            <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Contract & Funds</h3>
          </div>

           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Contractor</label>
             <input type="text" name="contractorName" value={formData.contractorName} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Project Allocation</label>
             <input type="number" name="projectAllocation" value={formData.projectAllocation} onChange={handleNumberChange} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Batch of Funds</label>
             <input type="text" name="batchOfFunds" value={formData.batchOfFunds} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" />
          </div>

          <div className="lg:col-span-3">
             <div className="flex justify-between items-center mb-1">
                 <label className="block text-sm font-medium text-slate-700">Other Remarks</label>
                 <button 
                    type="button" 
                    onClick={handleGenerateRemarks}
                    disabled={isGenerating}
                    className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
                 >
                     {isGenerating ? (
                         <span className="animate-pulse">Generating...</span>
                     ) : (
                         <>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM6 20.25a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0v-.75a.75.75 0 01.75-.75zm17.625-2.625a.75.75 0 00-1.061 0l-.75.75a.75.75 0 101.06 1.06l.75-.75a.75.75 0 000-1.06zm-17.625-15a.75.75 0 000 1.061l.75.75a.75.75 0 001.061-1.06l-.75-.75a.75.75 0 00-1.061 0z" clipRule="evenodd" />
                            </svg>
                            Auto-Generate with AI
                         </>
                     )}
                 </button>
             </div>
             <textarea name="otherRemarks" value={formData.otherRemarks || ''} onChange={handleChange} rows={3} className="w-full border rounded px-3 py-2 text-sm" />
          </div>

        </form>

        <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 rounded-b-lg">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProjectModal;
